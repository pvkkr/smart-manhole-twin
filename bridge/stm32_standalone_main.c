/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Standalone Smart Manhole Firmware for STM32F103C8T6 (Blue Pill)
  *                   AUTOMATIC SELF-CONFIGURING CODE (NO .IOC SETUP NEEDED!)
  ******************************************************************************
  * This code configures all GPIOs, Clocks, ADC, UART, and I2C directly in C!
  * You do NOT need to click or configure anything in the .ioc file.
  * Just paste this file into Core/Src/main.c and press Ctrl + B to build!
  ******************************************************************************
  */

#include "main.h"
#include <stdio.h>
#include <string.h>
#include <stdint.h>

/* --- Pin Assignments ---
 * PA0  : MQ-2 Gas Sensor (Analog In)
 * PA1  : HC-SR04 Trigger (Output)
 * PA2  : HC-SR04 Echo (Input) -> via 1k/2k divider!
 * PA9  : USART1 TX (Output to ESP32 RX2 GPIO16)
 * PA10 : USART1 RX (Input from ESP32 TX2 GPIO17)
 * PB0  : Active Buzzer (Output)
 * PB8  : I2C SCL (MPU6050 + 16x2 LCD)
 * PB9  : I2C SDA (MPU6050 + 16x2 LCD)
 * PB12 : DS18B20 1-Wire Data (with 4.7k pull-up to 3.3V)
 * PB13 : Reed Switch (Input Pull-up, other pin to GND)
 */

#define MPU6050_ADDR 0x68
#define LCD_ADDR     0x27 // or 0x3F

// --- Microsecond Delay via DWT Cycle Counter (Standard ARM Cortex-M3) ---
static void DWT_Init(void) {
    CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
    DWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;
}

static void delay_us(uint32_t us) {
    uint32_t start = DWT->CYCCNT;
    // Assuming 72MHz (72 ticks per microsecond) or 8MHz fallback (8 ticks/us)
    uint32_t ticks = us * (SystemCoreClock / 1000000);
    while ((DWT->CYCCNT - start) < ticks);
}

static void delay_ms(uint32_t ms) {
    for (uint32_t i = 0; i < ms; i++) {
        delay_us(1000);
    }
}

// --- Direct Hardware Self-Configuration (NO .IOC NEEDED) ---
static void Hardware_SelfConfigure(void) {
    // 1. Enable Clocks for GPIOA, GPIOB, GPIOC, AFIO, ADC1, USART1
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN | RCC_APB2ENR_IOPBEN | RCC_APB2ENR_IOPCEN
                  | RCC_APB2ENR_AFIOEN | RCC_APB2ENR_ADC1EN | RCC_APB2ENR_USART1EN;

    // Configure PC13 as Output Push-Pull 2MHz (Blue Pill Onboard LED Heartbeat)
    GPIOC->CRH &= ~(0xF << 20);
    GPIOC->CRH |= (0x2 << 20);
    GPIOC->BSRR = (1 << 13); // Initial OFF

    // 2. Enable Serial Wire Debug (SWD on PA13/PA14 for OpenOCD) & free JTAG pins
    // This is equivalent to SYS -> Debug: Serial Wire in STM32CubeMX
    AFIO->MAPR = (AFIO->MAPR & ~AFIO_MAPR_SWJ_CFG) | AFIO_MAPR_SWJ_CFG_JTAGDISABLE;

    // 3. Configure PA0 as Analog Input (MQ-2)
    GPIOA->CRL &= ~(0xF << 0); // Mode 00, CNF 00 (Analog)

    // 3. Configure PA1 as Output Push-Pull 50MHz (HC-SR04 Trig)
    GPIOA->CRL &= ~(0xF << 4);
    GPIOA->CRL |= (0x3 << 4); // Mode 11 (50MHz Out), CNF 00 (Push-Pull)
    GPIOA->BSRR = (1 << (1 + 16)); // Set LOW

    // 4. Configure PA2 as Input Floating (HC-SR04 Echo)
    GPIOA->CRL &= ~(0xF << 8);
    GPIOA->CRL |= (0x4 << 8); // Mode 00, CNF 01 (Floating In)

    // 5. Configure PA9 as Alternate Function Output Push-Pull 50MHz (USART1 TX)
    GPIOA->CRH &= ~(0xF << 4);
    GPIOA->CRH |= (0xB << 4); // Mode 11, CNF 10 (AF Push-Pull)

    // 6. Configure PA10 as Input Floating (USART1 RX)
    GPIOA->CRH &= ~(0xF << 8);
    GPIOA->CRH |= (0x4 << 8);

    // 7. Configure PB0 as Output Push-Pull (Buzzer)
    GPIOB->CRL &= ~(0xF << 0);
    GPIOB->CRL |= (0x3 << 0);
    GPIOB->BSRR = (1 << (0 + 16)); // Set LOW

    // 8. Configure PB8, PB9 as Open-Drain Output 50MHz (Software I2C SCL, SDA)
    GPIOB->CRH &= ~(0xF << 0); // PB8
    GPIOB->CRH |= (0x7 << 0);  // Output Open-Drain 50MHz
    GPIOB->CRH &= ~(0xF << 4); // PB9
    GPIOB->CRH |= (0x7 << 4);  // Output Open-Drain 50MHz
    GPIOB->BSRR = (1 << 8) | (1 << 9); // Idle HIGH

    // 9. Configure PB12 as Open-Drain Output (DS18B20 1-Wire)
    GPIOB->CRH &= ~(0xF << 16);
    GPIOB->CRH |= (0x7 << 16);
    GPIOB->BSRR = (1 << 12); // Idle HIGH

    // 10. Configure PB13 as Input with Pull-Up (Reed Switch)
    GPIOB->CRH &= ~(0xF << 20);
    GPIOB->CRH |= (0x8 << 20); // Input with pull-up/down
    GPIOB->ODR |= (1 << 13);   // Select PULL-UP

    // 11. Configure USART1 (115200 Baud)
    uint32_t pclk2 = SystemCoreClock; // APB2 clock
    USART1->BRR = (pclk2 + 57600) / 115200; // Integer divider
    USART1->CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;

    // 12. Configure ADC1 (12-bit, Channel 0)
    ADC1->CR2 = ADC_CR2_ADON;
    delay_ms(1);
    ADC1->CR2 |= ADC_CR2_CAL;
    while (ADC1->CR2 & ADC_CR2_CAL);
}

// --- UART Transmit String ---
static void UART_SendString(const char *str) {
    while (*str) {
        while (!(USART1->SR & USART_SR_TXE));
        USART1->DR = (*str++ & 0xFF);
    }
}

// --- MQ-2 Analog Reading (0 - 4095) ---
static uint16_t Read_Gas_ADC(void) {
    ADC1->SQR3 = 0; // Channel 0 (PA0)
    ADC1->CR2 |= ADC_CR2_ADON;
    while (!(ADC1->SR & ADC_SR_EOC));
    return (uint16_t)ADC1->DR;
}

// --- HC-SR04 Ultrasonic Reading (cm) ---
static float Read_Ultrasonic_Cm(void) {
    // 10us Trigger Pulse on PA1
    GPIOA->BSRR = (1 << (1 + 16)); // Low
    delay_us(2);
    GPIOA->BSRR = (1 << 1);        // High
    delay_us(10);
    GPIOA->BSRR = (1 << (1 + 16)); // Low

    uint32_t timeout = 60000;
    uint32_t count = 0;

    // Wait for Echo (PA2) to go HIGH
    while (!(GPIOA->IDR & (1 << 2))) {
        if (++count > timeout) return -1.0f;
        delay_us(1);
    }

    // Measure duration
    uint32_t duration_us = 0;
    while (GPIOA->IDR & (1 << 2)) {
        duration_us++;
        delay_us(1);
        if (duration_us > 30000) return -1.0f; // ~5m max
    }

    return (duration_us * 0.0343f) / 2.0f;
}

// --- Bit-Banged Reliable I2C (PB8 SCL, PB9 SDA) ---
static void I2C_SCL(uint8_t state) {
    if (state) GPIOB->BSRR = (1 << 8);
    else GPIOB->BSRR = (1 << (8 + 16));
}

static void I2C_SDA(uint8_t state) {
    if (state) GPIOB->BSRR = (1 << 9);
    else GPIOB->BSRR = (1 << (9 + 16));
}

static uint8_t I2C_ReadSDA(void) {
    return (GPIOB->IDR & (1 << 9)) ? 1 : 0;
}

static void I2C_Start(void) {
    I2C_SDA(1); I2C_SCL(1); delay_us(4);
    I2C_SDA(0); delay_us(4);
    I2C_SCL(0); delay_us(4);
}

static void I2C_Stop(void) {
    I2C_SDA(0); delay_us(4);
    I2C_SCL(1); delay_us(4);
    I2C_SDA(1); delay_us(4);
}

static uint8_t I2C_WriteByte(uint8_t byte) {
    for (uint8_t i = 0; i < 8; i++) {
        I2C_SDA((byte & 0x80) ? 1 : 0);
        delay_us(3);
        I2C_SCL(1);
        delay_us(4);
        I2C_SCL(0);
        delay_us(3);
        byte <<= 1;
    }
    I2C_SDA(1); // Release for ACK
    delay_us(3);
    I2C_SCL(1);
    delay_us(4);
    uint8_t ack = !I2C_ReadSDA();
    I2C_SCL(0);
    delay_us(3);
    return ack;
}

static uint8_t I2C_ReadByte(uint8_t ack) {
    uint8_t byte = 0;
    I2C_SDA(1); // Release line
    for (uint8_t i = 0; i < 8; i++) {
        byte <<= 1;
        I2C_SCL(1);
        delay_us(4);
        if (I2C_ReadSDA()) byte |= 1;
        I2C_SCL(0);
        delay_us(4);
    }
    I2C_SDA(ack ? 0 : 1);
    delay_us(3);
    I2C_SCL(1);
    delay_us(4);
    I2C_SCL(0);
    delay_us(3);
    I2C_SDA(1);
    return byte;
}

// --- MPU6050 Driver ---
static uint8_t MPU6050_Init_Direct(void) {
    I2C_Start();
    if (!I2C_WriteByte(MPU6050_ADDR << 1)) { I2C_Stop(); return 0; }
    I2C_WriteByte(0x6B); // PWR_MGMT_1
    I2C_WriteByte(0x00); // Wake up
    I2C_Stop();
    return 1;
}

static void MPU6050_Read_Direct(int16_t *ax, int16_t *ay, int16_t *az, uint8_t *valid) {
    I2C_Start();
    if (!I2C_WriteByte(MPU6050_ADDR << 1)) { I2C_Stop(); *valid = 0; return; }
    I2C_WriteByte(0x3B);
    I2C_Start();
    I2C_WriteByte((MPU6050_ADDR << 1) | 1);

    int16_t rx = (I2C_ReadByte(1) << 8) | I2C_ReadByte(1);
    int16_t ry = (I2C_ReadByte(1) << 8) | I2C_ReadByte(1);
    int16_t rz = (I2C_ReadByte(1) << 8) | I2C_ReadByte(0);
    I2C_Stop();

    *ax = (int16_t)((rx / 16384.0f) * 1000.0f);
    *ay = (int16_t)((ry / 16384.0f) * 1000.0f);
    *az = (int16_t)((rz / 16384.0f) * 1000.0f);
    *valid = 1;
}

// --- 16x2 I2C LCD Driver ---
static void LCD_WriteNibble(uint8_t nibble, uint8_t rs) {
    uint8_t data = (nibble & 0xF0) | (rs ? 0x01 : 0x00) | 0x08; // Backlight on
    I2C_Start();
    I2C_WriteByte(LCD_ADDR << 1);
    I2C_WriteByte(data | 0x04); // EN high
    delay_us(2);
    I2C_WriteByte(data & ~0x04); // EN low
    delay_us(40);
    I2C_Stop();
}

static void LCD_Cmd(uint8_t cmd) {
    LCD_WriteNibble(cmd & 0xF0, 0);
    LCD_WriteNibble((cmd << 4) & 0xF0, 0);
}

static void LCD_Data(uint8_t data) {
    LCD_WriteNibble(data & 0xF0, 1);
    LCD_WriteNibble((data << 4) & 0xF0, 1);
}

static void LCD_Init_Direct(void) {
    delay_ms(50);
    LCD_WriteNibble(0x30, 0); delay_ms(5);
    LCD_WriteNibble(0x30, 0); delay_ms(1);
    LCD_WriteNibble(0x30, 0); delay_ms(1);
    LCD_WriteNibble(0x20, 0); delay_ms(1); // 4-bit
    LCD_Cmd(0x28); LCD_Cmd(0x08); LCD_Cmd(0x01); delay_ms(2);
    LCD_Cmd(0x06); LCD_Cmd(0x0C);
}

static void LCD_Print(const char *str) {
    while (*str) LCD_Data((uint8_t)(*str++));
}

// --- DS18B20 1-Wire Driver on PB12 ---
static uint8_t DS18B20_Reset(void) {
    GPIOB->BSRR = (1 << (12 + 16)); // Low
    delay_us(480);
    GPIOB->BSRR = (1 << 12);        // Release
    delay_us(80);
    uint8_t present = !(GPIOB->IDR & (1 << 12));
    delay_us(400);
    return present;
}

static void DS18B20_WriteByte(uint8_t b) {
    for (uint8_t i = 0; i < 8; i++) {
        if (b & (1 << i)) {
            GPIOB->BSRR = (1 << (12 + 16)); delay_us(2);
            GPIOB->BSRR = (1 << 12);        delay_us(60);
        } else {
            GPIOB->BSRR = (1 << (12 + 16)); delay_us(60);
            GPIOB->BSRR = (1 << 12);        delay_us(2);
        }
    }
}

static uint8_t DS18B20_ReadByte(void) {
    uint8_t val = 0;
    for (uint8_t i = 0; i < 8; i++) {
        GPIOB->BSRR = (1 << (12 + 16)); delay_us(2);
        GPIOB->BSRR = (1 << 12);        delay_us(10);
        if (GPIOB->IDR & (1 << 12)) val |= (1 << i);
        delay_us(50);
    }
    return val;
}

static float DS18B20_ReadTemp(uint8_t *valid) {
    if (!DS18B20_Reset()) { *valid = 0; return 25.0f; }
    DS18B20_WriteByte(0xCC); // Skip ROM
    DS18B20_WriteByte(0x44); // Convert
    delay_ms(750);
    if (!DS18B20_Reset()) { *valid = 0; return 25.0f; }
    DS18B20_WriteByte(0xCC);
    DS18B20_WriteByte(0xBE); // Read
    uint8_t lsb = DS18B20_ReadByte();
    uint8_t msb = DS18B20_ReadByte();
    int16_t raw = (msb << 8) | lsb;
    *valid = 1;
    return (float)raw / 16.0f;
}

// --- Main Entry Point ---
int main(void)
{
    // Initialize standard CMSIS core clocks
    SystemCoreClockUpdate();
    DWT_Init();
    Hardware_SelfConfigure();

    MPU6050_Init_Direct();
    LCD_Init_Direct();

    LCD_Cmd(0x80);
    LCD_Print("SMART MANHOLE");
    LCD_Cmd(0xC0);
    LCD_Print("SELF-CONFIG OK");
    delay_ms(1500);
    LCD_Cmd(0x01);

    char tx_buffer[350];
    char lcd_buf[17];

    while (1)
    {
        // 1. HC-SR04 Ultrasonic Distance
        float dist_cm = Read_Ultrasonic_Cm();
        uint8_t dist_valid = (dist_cm > 2.0f && dist_cm <= 50.0f) ? 1 : 0;
        if (!dist_valid) dist_cm = 0.0f;

        int dist_int = (int)dist_cm;
        int dist_dec = (int)((dist_cm - (float)dist_int) * 10.0f);
        if (dist_dec < 0) dist_dec = -dist_dec;

        // 2. MQ-2 Gas Analog ADC on PA0
        uint16_t gas_adc = Read_Gas_ADC();
        uint16_t gas_mv = (uint16_t)(((float)gas_adc / 4095.0f) * 3300.0f);

        // 3. DS18B20 1-Wire Temperature on PB12
        uint8_t temp_valid = 0;
        float temp_c = DS18B20_ReadTemp(&temp_valid);
        int16_t temp_x100 = (int16_t)(temp_c * 100.0f);
        int temp_int = temp_x100 / 100;
        int temp_dec = (temp_x100 % 100) / 10;
        if (temp_dec < 0) temp_dec = -temp_dec;

        // 4. Reed Switch on PB13 (HIGH when cover opened)
        uint8_t cover_open = (GPIOB->IDR & (1 << 13)) ? 1 : 0;

        // 5. MPU6050 Accelerometer
        int16_t ax = 0, ay = 0, az = 1000;
        uint8_t accel_valid = 0;
        MPU6050_Read_Direct(&ax, &ay, &az, &accel_valid);

        // 6. Buzzer Control on PB0 (Turn on if cover open or gas critical)
        if (cover_open || gas_adc > 2200) {
            GPIOB->BSRR = (1 << 0); // Buzzer ON
        } else {
            GPIOB->BSRR = (1 << (0 + 16)); // Buzzer OFF
        }

        // 7. Update 16x2 LCD (Clean 16-character integer formatting - NO nano.specs float bug!)
        LCD_Cmd(0x80);
        snprintf(lcd_buf, sizeof(lcd_buf), "D:%3dcm  G:%-5d", dist_int, gas_adc);
        LCD_Print(lcd_buf);

        LCD_Cmd(0xC0);
        snprintf(lcd_buf, sizeof(lcd_buf), "T:%2d.%1dC  %-6s", temp_int, temp_dec, cover_open ? "OPEN!" : "SEALED");
        LCD_Print(lcd_buf);

        // 8. Stream JSON Frame over USART1 (PA9) to NodeMCU Gateway
        const char *cover_str = cover_open ? "COVER OPEN" : "COVER CLOSED";
        const char *status_str = (cover_open || gas_adc > 2200) ? "CRITICAL" : "NORMAL";

        snprintf(tx_buffer, sizeof(tx_buffer),
          "{\"distance_cm\":%d.%d,\"distance_valid\":%d,\"temperature_x100\":%d,\"temperature_valid\":%d,\"gas_adc\":%d,\"gas_mv\":%d,\"cover\":\"%s\",\"accel_valid\":%d,\"accel_x_mg\":%d,\"accel_y_mg\":%d,\"accel_z_mg\":%d,\"status\":\"%s\"}\r\n",
          dist_int, dist_dec, dist_valid,
          temp_x100, temp_valid,
          gas_adc, gas_mv, cover_str,
          accel_valid, ax, ay, az, status_str
        );

        UART_SendString(tx_buffer);

        // 9. Heartbeat: Toggle Blue Pill Onboard LED (PC13) every packet
        GPIOC->ODR ^= (1 << 13);

        delay_ms(1000); // 1.0Hz telemetry rate
    }
}
