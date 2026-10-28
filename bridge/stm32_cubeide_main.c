/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Smart Manhole Telemetry Controller for STM32F103C8T6 (Blue Pill)
  *                   STM32CubeIDE HAL Implementation
  ******************************************************************************
  * Hardware Pin Connections:
  *   PA0  -> ADC1_IN0   : MQ-2 Gas Sensor Analog Output (3.3V max)
  *   PA1  -> GPIO_Output: HC-SR04 Trigger Pulse
  *   PA2  -> GPIO_Input : HC-SR04 Echo Return (MUST route through 1k/2k divider!)
  *   PA9  -> USART1_TX  : Connects to ESP32 GPIO16 (Serial2 RX)
  *   PA10 -> USART1_RX  : Connects to ESP32 GPIO17 (Serial2 TX)
  *   PB0  -> GPIO_Output: Active Piezo Alarm Buzzer Gate
  *   PB8  -> I2C1_SCL   : MPU6050 SCL & 16x2 LCD SCL
  *   PB9  -> I2C1_SDA   : MPU6050 SDA & 16x2 LCD SDA
  *   PB12 -> GPIO_Output (Open Drain): DS18B20 1-Wire Data (4.7k pull-up to 3.3V)
  *   PB13 -> GPIO_Input (Pull-Up)   : Magnetic Reed Switch (other pin to GND)
  ******************************************************************************
  */
/* USER CODE END Header */

/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include <stdio.h>
#include <string.h>
#include <math.h>

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
/* USER CODE END Includes */

/* Private variables ---------------------------------------------------------*/
ADC_HandleTypeDef hadc1;
I2C_HandleTypeDef hi2c1;
TIM_HandleTypeDef htim2; // Configured as free-running microsecond timer (Prescaler = 71 for 72MHz)
UART_HandleTypeDef huart1;

/* USER CODE BEGIN PV */
#define MPU6050_ADDR 0xD0 // 0x68 << 1
#define LCD_ADDR     0x4E // 0x27 << 1 (or 0x7E for 0x3F)

char tx_buffer[350];

// Telemetry state variables
float ultrasonic_distance_cm = 0.0f;
uint8_t distance_valid = 0;
uint16_t gas_raw_adc = 0;
uint16_t gas_mv = 0;
float temperature_c = 25.0f;
int16_t temperature_x100 = 2500;
uint8_t temp_valid = 0;
uint8_t cover_open = 0; // 0 = Closed, 1 = Open
int16_t accel_x_mg = 0;
int16_t accel_y_mg = 0;
int16_t accel_z_mg = 1000;
uint8_t accel_valid = 0;
/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_ADC1_Init(void);
static void MX_I2C1_Init(void);
static void MX_TIM2_Init(void);
static void MX_USART1_UART_Init(void);

/* USER CODE BEGIN PFP */
void delay_us(uint16_t us);
float HCSR04_ReadDistance(void);
uint8_t MPU6050_Init(void);
void MPU6050_ReadAccel(int16_t *ax, int16_t *ay, int16_t *az);
uint8_t DS18B20_Start(void);
void DS18B20_Write(uint8_t data);
uint8_t DS18B20_Read(void);
float DS18B20_GetTemp(void);
void LCD_SendCommand(uint8_t cmd);
void LCD_SendData(uint8_t data);
void LCD_Init(void);
void LCD_SendString(char *str);
/* USER CODE END PFP */

/* USER CODE BEGIN 0 */
// --- Microsecond Delay via TIM2 Counter ---
void delay_us(uint16_t us) {
    __HAL_TIM_SET_COUNTER(&htim2, 0);
    while (__HAL_TIM_GET_COUNTER(&htim2) < us);
}

// --- HC-SR04 Ultrasonic Driver ---
float HCSR04_ReadDistance(void) {
    uint32_t start_time = 0;
    uint32_t echo_time = 0;
    uint32_t timeout = 60000; // ~60ms timeout

    // Send 10us Trigger Pulse
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_RESET);
    delay_us(2);
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_SET);
    delay_us(10);
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_RESET);

    // Wait for Echo Pin to go HIGH
    __HAL_TIM_SET_COUNTER(&htim2, 0);
    while (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_2) == GPIO_PIN_RESET) {
        if (__HAL_TIM_GET_COUNTER(&htim2) > timeout) return -1.0f;
    }
    start_time = __HAL_TIM_GET_COUNTER(&htim2);

    // Wait for Echo Pin to go LOW
    while (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_2) == GPIO_PIN_SET) {
        if (__HAL_TIM_GET_COUNTER(&htim2) > (start_time + timeout)) return -1.0f;
    }
    echo_time = __HAL_TIM_GET_COUNTER(&htim2) - start_time;

    // Speed of sound = 343 m/s = 0.0343 cm/us -> Distance = (time * 0.0343) / 2
    float dist = (echo_time * 0.0343f) / 2.0f;
    return dist;
}

// --- MPU6050 Driver ---
uint8_t MPU6050_Init(void) {
    uint8_t check, data;
    // Check WHO_AM_I register (0x75, should return 0x68)
    HAL_I2C_Mem_Read(&hi2c1, MPU6050_ADDR, 0x75, 1, &check, 1, 100);
    if (check == 0x68) {
        // Wake up MPU6050: write 0 to PWR_MGMT_1 (0x6B)
        data = 0;
        HAL_I2C_Mem_Write(&hi2c1, MPU6050_ADDR, 0x6B, 1, &data, 1, 100);
        // Set Accel range to +-2g (AFS_SEL = 0) in register 0x1C
        data = 0;
        HAL_I2C_Mem_Write(&hi2c1, MPU6050_ADDR, 0x1C, 1, &data, 1, 100);
        return 1;
    }
    return 0;
}

void MPU6050_ReadAccel(int16_t *ax, int16_t *ay, int16_t *az) {
    uint8_t raw[6];
    if (HAL_I2C_Mem_Read(&hi2c1, MPU6050_ADDR, 0x3B, 1, raw, 6, 100) == HAL_OK) {
        int16_t raw_x = (int16_t)(raw[0] << 8 | raw[1]);
        int16_t raw_y = (int16_t)(raw[2] << 8 | raw[3]);
        int16_t raw_z = (int16_t)(raw[4] << 8 | raw[5]);
        // Scale to milli-g: +-2g sensitivity = 16384 LSB/g
        *ax = (int16_t)((raw_x / 16384.0f) * 1000.0f);
        *ay = (int16_t)((raw_y / 16384.0f) * 1000.0f);
        *az = (int16_t)((raw_z / 16384.0f) * 1000.0f);
        accel_valid = 1;
    } else {
        accel_valid = 0;
    }
}

// --- DS18B20 1-Wire Driver on PB12 ---
static void DS18B20_SetPinOutput(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_12;
    GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_OD;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
    HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}

static void DS18B20_SetPinInput(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_12;
    GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
    GPIO_InitStruct.Pull = GPIO_PULLUP;
    HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}

uint8_t DS18B20_Start(void) {
    uint8_t response = 0;
    DS18B20_SetPinOutput();
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
    delay_us(480);

    DS18B20_SetPinInput();
    delay_us(80);
    if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_12) == GPIO_PIN_RESET) response = 1;
    delay_us(400);
    return response;
}

void DS18B20_Write(uint8_t data) {
    DS18B20_SetPinOutput();
    for (int i = 0; i < 8; i++) {
        if ((data & (1 << i)) != 0) {
            // Write 1
            DS18B20_SetPinOutput();
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
            delay_us(1);
            DS18B20_SetPinInput();
            delay_us(60);
        } else {
            // Write 0
            DS18B20_SetPinOutput();
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
            delay_us(60);
            DS18B20_SetPinInput();
            delay_us(1);
        }
    }
}

uint8_t DS18B20_Read(void) {
    uint8_t value = 0;
    for (int i = 0; i < 8; i++) {
        DS18B20_SetPinOutput();
        HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
        delay_us(2);
        DS18B20_SetPinInput();
        delay_us(10);
        if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_12)) {
            value |= 1 << i;
        }
        delay_us(50);
    }
    return value;
}

float DS18B20_GetTemp(void) {
    if (!DS18B20_Start()) return -999.0f;
    DS18B20_Write(0xCC); // Skip ROM
    DS18B20_Write(0x44); // Convert T
    HAL_Delay(750);      // Wait conversion

    if (!DS18B20_Start()) return -999.0f;
    DS18B20_Write(0xCC); // Skip ROM
    DS18B20_Write(0xBE); // Read Scratchpad

    uint8_t temp_lsb = DS18B20_Read();
    uint8_t temp_msb = DS18B20_Read();
    int16_t raw_temp = (temp_msb << 8) | temp_lsb;
    return (float)raw_temp / 16.0f;
}

// --- 16x2 I2C LCD (PCF8574 Backpack) ---
void LCD_SendCommand(uint8_t cmd) {
    uint8_t u = (cmd & 0xF0) | 0x0C; // Backlight on, EN high
    uint8_t u_l = (cmd & 0xF0) | 0x08; // EN low
    uint8_t l = ((cmd << 4) & 0xF0) | 0x0C;
    uint8_t l_l = ((cmd << 4) & 0xF0) | 0x08;
    uint8_t buf[4] = {u, u_l, l, l_l};
    HAL_I2C_Master_Transmit(&hi2c1, LCD_ADDR, buf, 4, 100);
}

void LCD_SendData(uint8_t data) {
    uint8_t u = (data & 0xF0) | 0x0D; // RS high, EN high
    uint8_t u_l = (data & 0xF0) | 0x09; // EN low
    uint8_t l = ((data << 4) & 0xF0) | 0x0D;
    uint8_t l_l = ((data << 4) & 0xF0) | 0x09;
    uint8_t buf[4] = {u, u_l, l, l_l};
    HAL_I2C_Master_Transmit(&hi2c1, LCD_ADDR, buf, 4, 100);
}

void LCD_Init(void) {
    HAL_Delay(50);
    LCD_SendCommand(0x30);
    HAL_Delay(5);
    LCD_SendCommand(0x30);
    HAL_Delay(1);
    LCD_SendCommand(0x30);
    HAL_Delay(10);
    LCD_SendCommand(0x20); // 4-bit mode
    HAL_Delay(10);
    LCD_SendCommand(0x28); // 2-line, 5x8 dots
    LCD_SendCommand(0x08); // Display off
    LCD_SendCommand(0x01); // Clear display
    HAL_Delay(2);
    LCD_SendCommand(0x06); // Entry mode
    LCD_SendCommand(0x0C); // Display on, cursor off
}

void LCD_SendString(char *str) {
    while (*str) LCD_SendData((uint8_t)(*str++));
}
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* MCU Configuration--------------------------------------------------------*/
  HAL_Init();
  SystemClock_Config(); // 72MHz SYSCLK

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_ADC1_Init();
  MX_I2C1_Init();
  MX_TIM2_Init();
  MX_USART1_UART_Init();

  /* USER CODE BEGIN 2 */
  HAL_TIM_Base_Start(&htim2); // Start microsecond timer
  MPU6050_Init();
  LCD_Init();

  LCD_SendCommand(0x80); // Line 1
  LCD_SendString("SMART MANHOLE");
  LCD_SendCommand(0xC0); // Line 2
  LCD_SendString("SYSTEM BOOT OK");
  HAL_Delay(1500);
  LCD_SendCommand(0x01); // Clear
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* 1. Sample HC-SR04 Ultrasonic Distance */
    ultrasonic_distance_cm = HCSR04_ReadDistance();
    if (ultrasonic_distance_cm > 2.0f && ultrasonic_distance_cm < 400.0f) {
        distance_valid = 1;
    } else {
        distance_valid = 0;
        ultrasonic_distance_cm = 0.0f;
    }

    /* 2. Sample MQ-2 Gas Sensor on PA0 (ADC1_IN0) */
    HAL_ADC_Start(&hadc1);
    if (HAL_ADC_PollForConversion(&hadc1, 10) == HAL_OK) {
        gas_raw_adc = HAL_ADC_GetValue(&hadc1);
        // STM32 12-bit ADC -> 0 to 3300mV
        gas_mv = (uint16_t)(((float)gas_raw_adc / 4095.0f) * 3300.0f);
    }
    HAL_ADC_Stop(&hadc1);

    /* 3. Sample DS18B20 1-Wire Temperature on PB12 */
    float t = DS18B20_GetTemp();
    if (t > -50.0f && t < 125.0f) {
        temperature_c = t;
        temperature_x100 = (int16_t)(t * 100.0f);
        temp_valid = 1;
    } else {
        temp_valid = 0;
    }

    /* 4. Sample Reed Switch on PB13 (Internal Pull-Up) */
    // Pin is pulled HIGH when magnet removed (Cover Open)
    if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_13) == GPIO_PIN_SET) {
        cover_open = 1; // "COVER OPEN"
    } else {
        cover_open = 0; // "COVER CLOSED"
    }

    /* 5. Sample MPU6050 IMU Accelerometer */
    MPU6050_ReadAccel(&accel_x_mg, &accel_y_mg, &accel_z_mg);

    /* 6. Alarm Sounder Logic (PB0) */
    // Sound buzzer if cover is opened or dangerous toxic gas (>2200 ADC)
    if (cover_open || gas_raw_adc > 2200) {
        HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, GPIO_PIN_SET);
    } else {
        HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, GPIO_PIN_RESET);
    }

    /* 7. Update On-Site 16x2 LCD */
    char lcd_buf[17];
    LCD_SendCommand(0x80); // Line 1
    snprintf(lcd_buf, sizeof(lcd_buf), "D:%.0fcm G:%d", ultrasonic_distance_cm, gas_raw_adc);
    LCD_SendString(lcd_buf);

    LCD_SendCommand(0xC0); // Line 2
    snprintf(lcd_buf, sizeof(lcd_buf), "T:%.1fC %s", temperature_c, cover_open ? "OPEN!" : "SEALED");
    LCD_SendString(lcd_buf);

    /* 8. Format & Transmit JSON Telemetry Frame over USART1 (PA9) to ESP32 */
    const char *cover_str = cover_open ? "COVER OPEN" : "COVER CLOSED";
    const char *status_str = (cover_open || gas_raw_adc > 2200) ? "CRITICAL" : "NORMAL";

    snprintf(tx_buffer, sizeof(tx_buffer),
      "{\"distance_cm\":%.1f,\"distance_valid\":%d,\"temperature_x100\":%d,\"temperature_valid\":%d,\"gas_adc\":%d,\"gas_mv\":%d,\"cover\":\"%s\",\"accel_valid\":%d,\"accel_x_mg\":%d,\"accel_y_mg\":%d,\"accel_z_mg\":%d,\"status\":\"%s\"}\r\n",
      ultrasonic_distance_cm,
      distance_valid,
      temperature_x100,
      temp_valid,
      gas_raw_adc,
      gas_mv,
      cover_str,
      accel_valid,
      accel_x_mg,
      accel_y_mg,
      accel_z_mg,
      status_str
    );

    // Send frame to ESP32 over UART
    HAL_UART_Transmit(&huart1, (uint8_t*)tx_buffer, strlen(tx_buffer), 100);

    /* 1.0Hz Telemetry Rate */
    HAL_Delay(1000);
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}
