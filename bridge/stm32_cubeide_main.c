/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Smart Manhole Telemetry Controller for STM32F103C8T6 (Blue Pill)
  *                   STM32CubeIDE 1.12.1 Implementation
  ******************************************************************************
  */
/* USER CODE END Header */

/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include <stdio.h>
#include <string.h>
#include <math.h>

/* Private variables ---------------------------------------------------------*/
ADC_HandleTypeDef hadc1;
I2C_HandleTypeDef hi2c1;
TIM_HandleTypeDef htim2;
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
    uint32_t timeout = 50000;

    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_RESET);
    delay_us(2);
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_SET);
    delay_us(10);
    HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_RESET);

    __HAL_TIM_SET_COUNTER(&htim2, 0);
    while (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_2) == GPIO_PIN_RESET) {
        if (__HAL_TIM_GET_COUNTER(&htim2) > timeout) return -1.0f;
    }
    start_time = __HAL_TIM_GET_COUNTER(&htim2);

    while (HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_2) == GPIO_PIN_SET) {
        if (__HAL_TIM_GET_COUNTER(&htim2) > (start_time + timeout)) return -1.0f;
    }
    echo_time = __HAL_TIM_GET_COUNTER(&htim2) - start_time;
    return (echo_time * 0.0343f) / 2.0f;
}

// --- MPU6050 Driver ---
uint8_t MPU6050_Init(void) {
    uint8_t check, data;
    HAL_I2C_Mem_Read(&hi2c1, MPU6050_ADDR, 0x75, 1, &check, 1, 100);
    if (check == 0x68) {
        data = 0;
        HAL_I2C_Mem_Write(&hi2c1, MPU6050_ADDR, 0x6B, 1, &data, 1, 100); // Wake up
        data = 0;
        HAL_I2C_Mem_Write(&hi2c1, MPU6050_ADDR, 0x1C, 1, &data, 1, 100); // +-2g range
        return 1;
    }
    return 0;
}

void MPU6050_ReadAccel(int16_t *ax, int16_t *ay, int16_t *az) {
    uint8_t raw[6];
    if (HAL_I2C_Mem_Read(&hi2c1, MPU6050_ADDR, 0x3B, 1, raw, 6, 100) == HAL_OK) {
        int16_t rx = (int16_t)(raw[0] << 8 | raw[1]);
        int16_t ry = (int16_t)(raw[2] << 8 | raw[3]);
        int16_t rz = (int16_t)(raw[4] << 8 | raw[5]);
        *ax = (int16_t)((rx / 16384.0f) * 1000.0f);
        *ay = (int16_t)((ry / 16384.0f) * 1000.0f);
        *az = (int16_t)((rz / 16384.0f) * 1000.0f);
        accel_valid = 1;
    } else {
        accel_valid = 0;
    }
}

// --- DS18B20 1-Wire Driver on PB12 ---
static void DS18B20_SetOutput(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_12;
    GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_OD;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
    HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}

static void DS18B20_SetInput(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    GPIO_InitStruct.Pin = GPIO_PIN_12;
    GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
    GPIO_InitStruct.Pull = GPIO_PULLUP;
    HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}

uint8_t DS18B20_Start(void) {
    uint8_t res = 0;
    DS18B20_SetOutput();
    HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
    delay_us(480);
    DS18B20_SetInput();
    delay_us(80);
    if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_12) == GPIO_PIN_RESET) res = 1;
    delay_us(400);
    return res;
}

void DS18B20_Write(uint8_t data) {
    DS18B20_SetOutput();
    for (int i = 0; i < 8; i++) {
        if ((data & (1 << i)) != 0) {
            DS18B20_SetOutput();
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
            delay_us(1);
            DS18B20_SetInput();
            delay_us(60);
        } else {
            DS18B20_SetOutput();
            HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
            delay_us(60);
            DS18B20_SetInput();
            delay_us(1);
        }
    }
}

uint8_t DS18B20_Read(void) {
    uint8_t val = 0;
    for (int i = 0; i < 8; i++) {
        DS18B20_SetOutput();
        HAL_GPIO_WritePin(GPIOB, GPIO_PIN_12, GPIO_PIN_RESET);
        delay_us(2);
        DS18B20_SetInput();
        delay_us(10);
        if (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_12)) val |= 1 << i;
        delay_us(50);
    }
    return val;
}

float DS18B20_GetTemp(void) {
    if (!DS18B20_Start()) return -999.0f;
    DS18B20_Write(0xCC); // Skip ROM
    DS18B20_Write(0x44); // Start conversion
    HAL_Delay(750);
    if (!DS18B20_Start()) return -999.0f;
    DS18B20_Write(0xCC);
    DS18B20_Write(0xBE); // Read Scratchpad
    uint8_t lsb = DS18B20_Read();
    uint8_t msb = DS18B20_Read();
    int16_t raw = (msb << 8) | lsb;
    return (float)raw / 16.0f;
}

// --- 16x2 I2C LCD Driver ---
void LCD_SendCommand(uint8_t cmd) {
    uint8_t buf[4] = {
        (uint8_t)((cmd & 0xF0) | 0x0C), (uint8_t)((cmd & 0xF0) | 0x08),
        (uint8_t)(((cmd << 4) & 0xF0) | 0x0C), (uint8_t)(((cmd << 4) & 0xF0) | 0x08)
    };
    HAL_I2C_Master_Transmit(&hi2c1, LCD_ADDR, buf, 4, 100);
}

void LCD_SendData(uint8_t data) {
    uint8_t buf[4] = {
        (uint8_t)((data & 0xF0) | 0x0D), (uint8_t)((data & 0xF0) | 0x09),
        (uint8_t)(((data << 4) & 0xF0) | 0x0D), (uint8_t)(((data << 4) & 0xF0) | 0x09)
    };
    HAL_I2C_Master_Transmit(&hi2c1, LCD_ADDR, buf, 4, 100);
}

void LCD_Init(void) {
    HAL_Delay(50);
    LCD_SendCommand(0x30); HAL_Delay(5);
    LCD_SendCommand(0x30); HAL_Delay(1);
    LCD_SendCommand(0x30); HAL_Delay(10);
    LCD_SendCommand(0x20); HAL_Delay(10);
    LCD_SendCommand(0x28); LCD_SendCommand(0x08);
    LCD_SendCommand(0x01); HAL_Delay(2);
    LCD_SendCommand(0x06); LCD_SendCommand(0x0C);
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
  SystemClock_Config();

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

  LCD_SendCommand(0x80);
  LCD_SendString("SMART MANHOLE");
  LCD_SendCommand(0xC0);
  LCD_SendString("SYSTEM BOOT OK");
  HAL_Delay(1500);
  LCD_SendCommand(0x01);
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* 1. HC-SR04 Ultrasonic Distance */
    ultrasonic_distance_cm = HCSR04_ReadDistance();
    if (ultrasonic_distance_cm > 2.0f && ultrasonic_distance_cm < 400.0f) {
        distance_valid = 1;
    } else {
        distance_valid = 0;
        ultrasonic_distance_cm = 0.0f;
    }

    /* 2. MQ-2 Gas Sensor on PA0 (ADC1_IN0) */
    HAL_ADC_Start(&hadc1);
    if (HAL_ADC_PollForConversion(&hadc1, 10) == HAL_OK) {
        gas_raw_adc = HAL_ADC_GetValue(&hadc1);
        gas_mv = (uint16_t)(((float)gas_raw_adc / 4095.0f) * 3300.0f);
    }
    HAL_ADC_Stop(&hadc1);

    /* 3. DS18B20 Temperature on PB12 */
    float t = DS18B20_GetTemp();
    if (t > -50.0f && t < 125.0f) {
        temperature_c = t;
        temperature_x100 = (int16_t)(t * 100.0f);
        temp_valid = 1;
    } else {
        temp_valid = 0;
    }

    /* 4. Reed Switch on PB13 (Internal Pull-Up) */
    cover_open = (HAL_GPIO_ReadPin(GPIOB, GPIO_PIN_13) == GPIO_PIN_SET) ? 1 : 0;

    /* 5. MPU6050 Tilt Accelerometer */
    MPU6050_ReadAccel(&accel_x_mg, &accel_y_mg, &accel_z_mg);

    /* 6. Local Buzzer Sounder on PB0 */
    if (cover_open || gas_raw_adc > 2200) {
        HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, GPIO_PIN_SET);
    } else {
        HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0, GPIO_PIN_RESET);
    }

    /* 7. Update Local 16x2 I2C LCD */
    char lcd_buf[17];
    LCD_SendCommand(0x80);
    snprintf(lcd_buf, sizeof(lcd_buf), "D:%.0fcm G:%d", ultrasonic_distance_cm, gas_raw_adc);
    LCD_SendString(lcd_buf);

    LCD_SendCommand(0xC0);
    snprintf(lcd_buf, sizeof(lcd_buf), "T:%.1fC %s", temperature_c, cover_open ? "OPEN!" : "SEALED");
    LCD_SendString(lcd_buf);

    /* 8. Format JSON and Transmit over USART1 (PA9) to ESP32 */
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

    HAL_UART_Transmit(&huart1, (uint8_t*)tx_buffer, strlen(tx_buffer), 100);

    HAL_Delay(1000); // 1.0Hz update rate
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration (72MHz HSE PLL)
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};
  RCC_PeriphCLKInitTypeDef PeriphClkInit = {0};

  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.HSEPredivValue = RCC_HSE_PREDIV_DIV1;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL9;
  HAL_RCC_OscConfig(&RCC_OscInitStruct);

  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
  HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2);

  PeriphClkInit.PeriphClockSelection = RCC_PERIPHCLK_ADC;
  PeriphClkInit.AdcClockSelection = RCC_ADCPCLK2_DIV6;
  HAL_RCCEx_PeriphCLKConfig(&PeriphClkInit);
}

/**
  * @brief ADC1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_ADC1_Init(void)
{
  ADC_ChannelConfTypeDef sConfig = {0};

  hadc1.Instance = ADC1;
  hadc1.Init.ScanConvMode = ADC_SCAN_DISABLE;
  hadc1.Init.ContinuousConvMode = DISABLE;
  hadc1.Init.DiscontinuousConvMode = DISABLE;
  hadc1.Init.ExternalTrigConv = ADC_SOFTWARE_START;
  hadc1.Init.DataAlign = ADC_DATAALIGN_RIGHT;
  hadc1.Init.NbrOfConversion = 1;
  HAL_ADC_Init(&hadc1);

  sConfig.Channel = ADC_CHANNEL_0;
  sConfig.Rank = ADC_REGULAR_RANK_1;
  sConfig.SamplingTime = ADC_SAMPLETIME_55CYCLES_5;
  HAL_ADC_ConfigChannel(&hadc1, &sConfig);
}

/**
  * @brief I2C1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_I2C1_Init(void)
{
  hi2c1.Instance = I2C1;
  hi2c1.Init.ClockSpeed = 100000;
  hi2c1.Init.DutyCycle = I2C_DUTYCYCLE_2;
  hi2c1.Init.OwnAddress1 = 0;
  hi2c1.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
  hi2c1.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE;
  hi2c1.Init.OwnAddress2 = 0;
  hi2c1.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE;
  hi2c1.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;
  HAL_I2C_Init(&hi2c1);
}

/**
  * @brief TIM2 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM2_Init(void)
{
  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};

  htim2.Instance = TIM2;
  htim2.Init.Prescaler = 71;
  htim2.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim2.Init.Period = 65535;
  htim2.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim2.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  HAL_TIM_Base_Init(&htim2);

  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  HAL_TIM_ConfigClockSource(&htim2, &sClockSourceConfig);

  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  HAL_TIMEx_MasterConfigSynchronization(&htim2, &sMasterConfig);
}

/**
  * @brief USART1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART1_UART_Init(void)
{
  huart1.Instance = USART1;
  huart1.Init.BaudRate = 115200;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_1;
  huart1.Init.Parity = UART_PARITY_NONE;
  huart1.Init.Mode = UART_MODE_TX_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  HAL_UART_Init(&huart1);
}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  __HAL_RCC_GPIOD_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_1, GPIO_PIN_RESET);
  HAL_GPIO_WritePin(GPIOB, GPIO_PIN_0|GPIO_PIN_12, GPIO_PIN_RESET);

  /*Configure GPIO pin : PA1 (US_TRIG) */
  GPIO_InitStruct.Pin = GPIO_PIN_1;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pin : PA2 (US_ECHO) */
  GPIO_InitStruct.Pin = GPIO_PIN_2;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pin : PB0 (BUZZER) */
  GPIO_InitStruct.Pin = GPIO_PIN_0;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);

  /*Configure GPIO pin : PB12 (DS18B20) */
  GPIO_InitStruct.Pin = GPIO_PIN_12;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_OD;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);

  /*Configure GPIO pin : PB13 (REED_SW) */
  GPIO_InitStruct.Pin = GPIO_PIN_13;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_PULLUP;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}
