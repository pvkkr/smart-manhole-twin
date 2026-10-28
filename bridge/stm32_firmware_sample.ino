/*
 * Smart Manhole - STM32F103C8T6 (Blue Pill) Sensor Telemetry Firmware
 * ====================================================================
 * Pins:
 *   HC-SR04:   TRIG -> PA1, ECHO -> PA2 (through 1k/2k divider)
 *   MQ-2:      AO   -> PA0 (ADC1_IN0)
 *   DS18B20:   DATA -> PB12 (with 4.7k pull-up to 3.3V)
 *   Reed Sw:   PIN  -> PB13 (internal INPUT_PULLUP)
 *   MPU6050:   SCL  -> PB8, SDA -> PB9
 *   Buzzer:    CTRL -> PB0
 *   ESP32:     TX1  -> PA9, RX1 -> PA10
 */

#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// Pins
#define PIN_GAS_ADC       PA0
#define PIN_US_TRIG       PA1
#define PIN_US_ECHO       PA2
#define PIN_BUZZER        PB0
#define PIN_ONEWIRE       PB12
#define PIN_REED          PB13

OneWire oneWire(PIN_ONEWIRE);
DallasTemperature ds18b20(&oneWire);

// MPU6050 I2C Address
#define MPU_ADDR 0x68

void setup() {
  // Serial1 (PA9 TX, PA10 RX) connects to ESP32
  Serial1.begin(115200);

  pinMode(PIN_US_TRIG, OUTPUT);
  pinMode(PIN_US_ECHO, INPUT);
  pinMode(PIN_REED, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);

  // Initialize I2C for MPU6050
  Wire.begin(); // PB8 SCL, PB9 SDA
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0);    // Wake up MPU6050
  Wire.endTransmission(true);

  // Initialize Temperature Sensor
  ds18b20.begin();
}

float readUltrasonicCm() {
  digitalWrite(PIN_US_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_US_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_US_TRIG, LOW);

  long duration = pulseIn(PIN_US_ECHO, HIGH, 30000); // 30ms timeout (~5m)
  if (duration <= 0) return -1;
  return (duration * 0.0343) / 2.0;
}

void loop() {
  // 1. Ultrasonic Distance
  float dist_cm = readUltrasonicCm();
  int dist_valid = (dist_cm > 2.0 && dist_cm < 400.0) ? 1 : 0;

  // 2. Gas ADC (12-bit ADC on STM32: 0-4095)
  int gas_adc = analogRead(PIN_GAS_ADC);
  int gas_mv = (int)((gas_adc / 4095.0) * 3300);

  // 3. DS18B20 Temperature
  ds18b20.requestTemperatures();
  float tempC = ds18b20.getTempCByIndex(0);
  int temp_valid = (tempC > -50.0 && tempC < 125.0) ? 1 : 0;
  int temp_x100 = (int)(tempC * 100);

  // 4. Reed Switch (LOW when magnet close, HIGH when open)
  int reedState = digitalRead(PIN_REED);
  const char* cover_str = (reedState == HIGH) ? "COVER OPEN" : "COVER CLOSED";

  // 5. MPU6050 Accelerometer
  int16_t ax = 0, ay = 0, az = 0;
  int accel_valid = 0;
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) == 0 && Wire.requestFrom(MPU_ADDR, 6, true) == 6) {
    ax = (Wire.read() << 8) | Wire.read();
    ay = (Wire.read() << 8) | Wire.read();
    az = (Wire.read() << 8) | Wire.read();
    accel_valid = 1;
  }
  // Convert raw 16-bit (+-2g range: 16384 LSB/g) to milli-g
  int ax_mg = (int)((ax / 16384.0) * 1000);
  int ay_mg = (int)((ay / 16384.0) * 1000);
  int az_mg = (int)((az / 16384.0) * 1000);

  // Construct JSON Payload
  StaticJsonDocument<256> doc;
  doc["distance_cm"]      = dist_valid ? dist_cm : 0;
  doc["distance_valid"]   = dist_valid;
  doc["temperature_x100"] = temp_valid ? temp_x100 : 2500;
  doc["temperature_valid"]= temp_valid;
  doc["gas_adc"]          = gas_adc;
  doc["gas_mv"]           = gas_mv;
  doc["cover"]            = cover_str;
  doc["accel_valid"]      = accel_valid;
  doc["accel_x_mg"]       = ax_mg;
  doc["accel_y_mg"]       = ay_mg;
  doc["accel_z_mg"]       = az_mg;
  doc["status"]           = (reedState == HIGH || gas_adc > 2000) ? "CRITICAL" : "NORMAL";

  // Transmit over UART to ESP32
  serializeJson(doc, Serial1);
  Serial1.println();

  delay(1000); // 1.0Hz telemetry rate
}
