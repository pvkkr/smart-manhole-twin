import { CircuitComponent, WireConnection } from '../types/circuit';

export const WORKBENCH_COMPONENTS: CircuitComponent[] = [
  {
    id: 'stm32',
    name: 'STM32F103C8T6 Blue Pill',
    category: 'MCU',
    modelNumber: 'ARM Cortex-M3 (72MHz, 64KB Flash, 20KB SRAM)',
    position: [-2.2, 0.25, 0],
    rotation: [0, 0, 0],
    dimensions: [2.2, 0.25, 5.2],
    color: '#0d47a1', // Classic Blue Pill PCB color
    description: 'Main supervisory MCU. Samples ADC, handles 1-Wire, I2C, and UART telemetry.',
    datasheetSnippet: 'Operating voltage: 2.0V - 3.6V. FT pins are 5V-tolerant; ADC analog pins (PA0-PA7) are STRICTLY 3.3V MAX.',
    pins: [
      { id: '3V3', name: '3.3V Out', signalType: 'POWER_3V3', voltageLevel: 3.3, positionOffset: [-0.9, 0.2, -2.2], description: 'Regulated 3.3V rail' },
      { id: 'GND_1', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [-0.9, 0.2, -1.9], description: 'System Ground' },
      { id: '5V', name: '5V (VBUS)', signalType: 'POWER_5V', voltageLevel: 5, positionOffset: [-0.9, 0.2, -1.6], description: '5V USB/External supply' },
      { id: 'PA0', name: 'PA0 (ADC1_IN0)', signalType: 'ANALOG_IN', voltageLevel: 3.3, is5VTolerant: false, positionOffset: [-0.9, 0.2, -1.0], description: 'ADC input for MQ-2 Gas sensor (3.3V max)' },
      { id: 'PA1', name: 'PA1 (TRIG)', signalType: 'GPIO_OUTPUT', voltageLevel: 3.3, positionOffset: [-0.9, 0.2, -0.7], description: 'HC-SR04 Ultrasonic Trigger pulse' },
      { id: 'PA2', name: 'PA2 (ECHO_IN)', signalType: 'GPIO_INPUT', voltageLevel: 3.3, is5VTolerant: false, positionOffset: [-0.9, 0.2, -0.4], description: 'HC-SR04 Echo return (MUST be 3.3V level)' },
      { id: 'PA9', name: 'PA9 (USART1_TX)', signalType: 'UART_TX', voltageLevel: 3.3, is5VTolerant: true, positionOffset: [0.9, 0.2, 0.2], description: 'UART1 Transmit to ESP32 RX' },
      { id: 'PA10', name: 'PA10 (USART1_RX)', signalType: 'UART_RX', voltageLevel: 3.3, is5VTolerant: true, positionOffset: [0.9, 0.2, 0.5], description: 'UART1 Receive from ESP32 TX' },
      { id: 'PB0', name: 'PB0 (BUZZER_CTRL)', signalType: 'GPIO_OUTPUT', voltageLevel: 3.3, positionOffset: [-0.9, 0.2, 0.2], description: 'PWM / Digital output for Alarm Buzzer' },
      { id: 'PB8', name: 'PB8 (I2C1_SCL)', signalType: 'I2C_SCL', voltageLevel: 3.3, is5VTolerant: true, positionOffset: [0.9, 0.2, 1.2], description: 'I2C Clock line for MPU6050 and 16x2 LCD' },
      { id: 'PB9', name: 'PB9 (I2C1_SDA)', signalType: 'I2C_SDA', voltageLevel: 3.3, is5VTolerant: true, positionOffset: [0.9, 0.2, 1.5], description: 'I2C Data line for MPU6050 and 16x2 LCD' },
      { id: 'PB12', name: 'PB12 (1-WIRE)', signalType: 'ONEWIRE', voltageLevel: 3.3, is5VTolerant: true, positionOffset: [0.9, 0.2, 1.8], description: 'DS18B20 1-Wire bus (requires 4.7k pull-up)' },
      { id: 'PB13', name: 'PB13 (REED_IN)', signalType: 'GPIO_INPUT', voltageLevel: 3.3, is5VTolerant: true, positionOffset: [0.9, 0.2, 2.1], description: 'Magnetic Reed Switch input (Internal Pull-Up)' },
    ],
  },
  {
    id: 'esp32',
    name: 'ESP32 NodeMCU DevKit',
    category: 'WIRELESS',
    modelNumber: 'ESP-WROOM-32 (240MHz Dual-Core, 2.4GHz Wi-Fi/BLE)',
    position: [2.2, 0.25, 0],
    rotation: [0, 0, 0],
    dimensions: [2.6, 0.25, 5.0],
    color: '#1e293b', // Black DevKit PCB
    description: 'Wi-Fi IoT gateway. Receives UART frames from STM32 and bridges via WebSocket.',
    datasheetSnippet: '3.3V logic level. GPIO16 (U2_RXD), GPIO17 (U2_TXD). Vin accepts 5V input.',
    pins: [
      { id: '3V3', name: '3.3V Out', signalType: 'POWER_3V3', voltageLevel: 3.3, positionOffset: [-1.1, 0.2, -2.0], description: 'ESP32 3.3V rail' },
      { id: 'GND_1', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [-1.1, 0.2, -1.7], description: 'Common Ground' },
      { id: 'VIN_5V', name: 'VIN (5V)', signalType: 'POWER_5V', voltageLevel: 5, positionOffset: [-1.1, 0.2, -1.4], description: '5V External input' },
      { id: 'GPIO16', name: 'GPIO16 (RX2)', signalType: 'UART_RX', voltageLevel: 3.3, positionOffset: [1.1, 0.2, 0.6], description: 'Hardware Serial2 RX (connect to STM32 TX)' },
      { id: 'GPIO17', name: 'GPIO17 (TX2)', signalType: 'UART_TX', voltageLevel: 3.3, positionOffset: [1.1, 0.2, 0.9], description: 'Hardware Serial2 TX (connect to STM32 RX)' },
      { id: 'GND_2', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [1.1, 0.2, -1.7], description: 'ESP32 Ground pad' },
    ],
  },
  {
    id: 'hcsr04',
    name: 'HC-SR04 Ultrasonic Sensor',
    category: 'SENSOR',
    modelNumber: 'Ultrasonic Ranging Module (2cm - 400cm, 40kHz)',
    position: [-4.6, 0.3, -3.2],
    rotation: [0, 0, 0],
    dimensions: [2.8, 0.8, 1.4],
    color: '#0284c7',
    description: 'Mounted at chamber ceiling to measure distance to water surface.',
    datasheetSnippet: 'Supply: 5V DC. Trigger input accepts 3.3V/5V. Echo output is 5V TTL (needs voltage divider for 3.3V MCUs!).',
    associatedSensorKey: 'ULTRASONIC',
    pins: [
      { id: 'VCC', name: 'VCC (5V)', signalType: 'POWER_5V', voltageLevel: 5, positionOffset: [-0.9, 0.2, 0.6], description: '5V DC Power' },
      { id: 'TRIG', name: 'TRIG', signalType: 'GPIO_INPUT', voltageLevel: 3.3, positionOffset: [-0.3, 0.2, 0.6], description: '10us trigger input' },
      { id: 'ECHO', name: 'ECHO (5V OUT)', signalType: 'GPIO_OUTPUT', voltageLevel: 5, positionOffset: [0.3, 0.2, 0.6], description: '5V pulse output proportional to distance' },
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [0.9, 0.2, 0.6], description: 'Power Ground' },
    ],
  },
  {
    id: 'divider',
    name: '1kΩ / 2kΩ Voltage Divider',
    category: 'PASSIVE',
    modelNumber: 'Resistive Level Shifter (5V -> 3.3V Step-down)',
    position: [-4.6, 0.2, -1.4],
    rotation: [0, 0, 0],
    dimensions: [1.8, 0.2, 1.0],
    color: '#475569',
    description: 'Level shifts HC-SR04 5V Echo output to 3.3V safe range for STM32 PA2 input.',
    datasheetSnippet: 'Vout = Vin * (R2 / (R1 + R2)) = 5V * (2000 / 3000) = 3.33V safe logic.',
    pins: [
      { id: 'IN', name: 'IN (5V)', signalType: 'GPIO_INPUT', voltageLevel: 5, positionOffset: [-0.6, 0.15, 0], description: 'Connect to HC-SR04 ECHO' },
      { id: 'OUT', name: 'OUT (3.3V)', signalType: 'GPIO_OUTPUT', voltageLevel: 3.3, positionOffset: [0.6, 0.15, 0], description: 'Connect to STM32 PA2' },
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [0, 0.15, 0.3], description: 'Reference Ground' },
    ],
  },
  {
    id: 'mq2',
    name: 'MQ-2 Gas / Smoke Sensor',
    category: 'SENSOR',
    modelNumber: 'Combustible Gas & Smoke Sniffer (SnO2 electrochemical)',
    position: [-4.6, 0.35, 1.0],
    rotation: [0, 0, 0],
    dimensions: [2.0, 1.2, 2.0],
    color: '#047857',
    description: 'Detects methane, LPG, propane, hydrogen, and sewer gases inside the manhole chamber.',
    datasheetSnippet: 'Internal heater requires stable 5V supply (~150mA). Analog output 0-5V or 0-3.3V conditioned.',
    associatedSensorKey: 'GAS',
    pins: [
      { id: 'VCC', name: 'VCC (5V)', signalType: 'POWER_5V', voltageLevel: 5, positionOffset: [-0.6, 0.2, 0.8], description: 'Regulated 5V for heating coil' },
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [-0.2, 0.2, 0.8], description: 'Circuit Ground' },
      { id: 'AO', name: 'AO (Analog)', signalType: 'ANALOG_OUT', voltageLevel: 3.3, positionOffset: [0.2, 0.2, 0.8], description: 'Analog voltage representing gas concentration' },
      { id: 'DO', name: 'DO (Digital)', signalType: 'GPIO_OUTPUT', voltageLevel: 3.3, positionOffset: [0.6, 0.2, 0.8], description: 'Digital threshold trigger' },
    ],
  },
  {
    id: 'ds18b20',
    name: 'DS18B20 Waterproof Probe',
    category: 'SENSOR',
    modelNumber: '1-Wire Digital Thermometer (-55°C to +125°C, ±0.5°C)',
    position: [-4.6, 0.25, 3.2],
    rotation: [0, 0, 0],
    dimensions: [2.2, 0.3, 1.2],
    color: '#334155',
    description: 'Submersible stainless-steel probe measuring underground sewage / chamber ambient temperature.',
    datasheetSnippet: '1-Wire open-drain communication. Requires 4.7kΩ pull-up resistor on the DATA line to 3.3V.',
    associatedSensorKey: 'TEMPERATURE',
    pins: [
      { id: 'VDD', name: 'VDD (3.3V)', signalType: 'POWER_3V3', voltageLevel: 3.3, positionOffset: [-0.6, 0.2, 0.4], description: 'Power line (3.0V - 5.5V)' },
      { id: 'DATA', name: 'DATA (1-Wire)', signalType: 'ONEWIRE', voltageLevel: 3.3, positionOffset: [0, 0.2, 0.4], description: 'Bidirectional One-Wire data pin' },
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [0.6, 0.2, 0.4], description: 'Ground' },
    ],
  },
  {
    id: 'pullup',
    name: '4.7kΩ Pull-Up Resistor',
    category: 'PASSIVE',
    modelNumber: 'Through-Hole Metal Film 4.7k Resistor (1-Wire Bus)',
    position: [-2.2, 0.2, 3.5],
    rotation: [0, 0, 0],
    dimensions: [1.4, 0.15, 0.6],
    color: '#b45309',
    description: 'Mandatory pull-up resistor between DS18B20 1-Wire Data line and 3.3V supply.',
    datasheetSnippet: 'Ensures idle bus pulls HIGH for open-drain 1-Wire protocol specification.',
    pins: [
      { id: 'PULLUP_VCC', name: '3.3V Rail', signalType: 'POWER_3V3', voltageLevel: 3.3, positionOffset: [-0.5, 0.1, 0], description: 'Connect to 3.3V rail' },
      { id: 'PULLUP_DATA', name: 'DATA Tap', signalType: 'ONEWIRE', voltageLevel: 3.3, positionOffset: [0.5, 0.1, 0], description: 'Connect to DS18B20 DATA & STM32 PB12' },
    ],
  },
  {
    id: 'reed',
    name: 'Magnetic Reed Switch',
    category: 'SENSOR',
    modelNumber: 'Normally Open (NO) Proximity Sensor',
    position: [0, 0.25, 4.2],
    rotation: [0, 0, 0],
    dimensions: [2.0, 0.3, 0.8],
    color: '#f8fafc',
    description: 'Mounted at rim to detect unauthorized opening or removal of the manhole cover.',
    datasheetSnippet: 'Passive dry contacts. Connects to STM32 PB13 with internal weak pull-up enabled; closes to GND.',
    associatedSensorKey: 'COVER',
    pins: [
      { id: 'PIN_A', name: 'Contact A (PB13)', signalType: 'GPIO_INPUT', voltageLevel: 3.3, positionOffset: [-0.7, 0.15, 0], description: 'Connect to STM32 PB13' },
      { id: 'PIN_B', name: 'Contact B (GND)', signalType: 'GND', voltageLevel: 0, positionOffset: [0.7, 0.15, 0], description: 'Connect to Ground' },
    ],
  },
  {
    id: 'mpu6050',
    name: 'MPU6050 (GY-521 Breakout)',
    category: 'SENSOR',
    modelNumber: '6-DoF Accelerometer & Gyroscope (I2C 0x68)',
    position: [4.6, 0.25, -3.2],
    rotation: [0, 0, 0],
    dimensions: [1.8, 0.25, 1.8],
    color: '#0d9488',
    description: 'Attached to underside of the cover to detect inclination, vehicle vibration, or tilt tampering.',
    datasheetSnippet: 'Onboard 3.3V LDO regulator. Standard I2C address 0x68. SCL/SDA lines connect to STM32 PB8/PB9.',
    associatedSensorKey: 'ACCEL',
    pins: [
      { id: 'VCC', name: 'VCC (3.3V/5V)', signalType: 'POWER_3V3', voltageLevel: 3.3, positionOffset: [-0.6, 0.2, 0.7], description: 'Power input' },
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [-0.2, 0.2, 0.7], description: 'Ground' },
      { id: 'SCL', name: 'SCL (I2C Clock)', signalType: 'I2C_SCL', voltageLevel: 3.3, positionOffset: [0.2, 0.2, 0.7], description: 'I2C Clock (STM32 PB8)' },
      { id: 'SDA', name: 'SDA (I2C Data)', signalType: 'I2C_SDA', voltageLevel: 3.3, positionOffset: [0.6, 0.2, 0.7], description: 'I2C Data (STM32 PB9)' },
    ],
  },
  {
    id: 'lcd1602',
    name: '16x2 LCD with PCF8574 Backpack',
    category: 'DISPLAY',
    modelNumber: 'HD44780 + PCF8574 I2C Expander (0x27)',
    position: [4.8, 0.4, 0.2],
    rotation: [0, 0, 0],
    dimensions: [3.4, 0.6, 1.8],
    color: '#15803d',
    description: 'Field service display for on-site municipal technician inspection.',
    datasheetSnippet: 'Requires 5V for crisp character contrast. Shares I2C bus (SCL: PB8, SDA: PB9) with MPU6050.',
    pins: [
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [-0.9, 0.25, 0.7], description: 'Ground' },
      { id: 'VCC', name: 'VCC (5V)', signalType: 'POWER_5V', voltageLevel: 5, positionOffset: [-0.3, 0.25, 0.7], description: '5V supply for display contrast' },
      { id: 'SDA', name: 'SDA (I2C Data)', signalType: 'I2C_SDA', voltageLevel: 3.3, positionOffset: [0.3, 0.25, 0.7], description: 'I2C Data (STM32 PB9)' },
      { id: 'SCL', name: 'SCL (I2C Clock)', signalType: 'I2C_SCL', voltageLevel: 3.3, positionOffset: [0.9, 0.25, 0.7], description: 'I2C Clock (STM32 PB8)' },
    ],
  },
  {
    id: 'buzzer',
    name: 'Active Piezo Alarm Buzzer',
    category: 'ACTUATOR',
    modelNumber: '5V Continuous Sounder (85dB @ 10cm)',
    position: [4.6, 0.3, 3.2],
    rotation: [0, 0, 0],
    dimensions: [1.6, 0.8, 1.6],
    color: '#1e293b',
    description: 'Local audible acoustic alarm triggered by toxic gas or cover tampering.',
    datasheetSnippet: 'Driven by NPN transistor / driver connected to STM32 PB0 control pin.',
    pins: [
      { id: 'SIG', name: 'CTRL (PB0)', signalType: 'GPIO_INPUT', voltageLevel: 3.3, positionOffset: [-0.4, 0.2, 0.6], description: 'Alarm gate signal from STM32 PB0' },
      { id: 'GND', name: 'GND', signalType: 'GND', voltageLevel: 0, positionOffset: [0.4, 0.2, 0.6], description: 'Ground' },
    ],
  },
  {
    id: 'power_rails',
    name: 'Dual Regulated Power Distribution Rails',
    category: 'POWER',
    modelNumber: 'LM1117-3.3 + Step-Down 5V Rail Module',
    position: [0, 0.1, -4.6],
    rotation: [0, 0, 0],
    dimensions: [7.2, 0.18, 1.0],
    color: '#b91c1c',
    description: 'Common bus board providing regulated 5V, 3.3V and common Ground to all sensors and MCUs.',
    datasheetSnippet: 'Provides single low-impedance ground plane to prevent ground loops and false sensor ADC readings.',
    pins: [
      { id: 'RAIL_5V', name: '5V Rail', signalType: 'POWER_5V', voltageLevel: 5, positionOffset: [-2.5, 0.1, 0], description: '5V System Bus' },
      { id: 'RAIL_3V3', name: '3.3V Rail', signalType: 'POWER_3V3', voltageLevel: 3.3, positionOffset: [0, 0.1, 0], description: '3.3V System Bus' },
      { id: 'RAIL_GND', name: 'Common GND', signalType: 'GND', voltageLevel: 0, positionOffset: [2.5, 0.1, 0], description: 'Master Common Ground' },
    ],
  },
];

/**
 * Preconfigured Smart Manhole Circuit matching exact specification:
 * - HC-SR04: VCC -> 5V, GND -> GND, TRIG -> STM32 PA1, ECHO -> STM32 PA2 through 1k/2k divider
 * - MQ-2: VCC -> 5V, GND -> GND, AO -> STM32 PA0
 * - DS18B20: VDD -> 3.3V, GND -> GND, DATA -> STM32 PB12 with 4.7k pull-up to 3.3V
 * - Reed Switch: Terminal A -> STM32 PB13, Terminal B -> GND
 * - MPU6050: SDA -> STM32 PB9, SCL -> STM32 PB8, VCC -> 3.3V, GND -> GND
 * - I2C LCD: SDA -> STM32 PB9, SCL -> STM32 PB8, VCC -> 5V, GND -> GND
 * - Buzzer: Control -> STM32 PB0, GND -> GND
 * - STM32-to-ESP32 UART: PA9 TX -> ESP32 GPIO16 RX2, PA10 RX <- ESP32 GPIO17 TX2, common GND
 */
export const DEFAULT_SMART_MANHOLE_WIRES: WireConnection[] = [
  // --- Power & Common Ground Distribution ---
  { id: 'w1', fromComponentId: 'power_rails', fromPinId: 'RAIL_5V', toComponentId: 'stm32', toPinId: '5V', color: '#ef4444', netName: '5V_BUS' },
  { id: 'w2', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'stm32', toPinId: 'GND_1', color: '#1e293b', netName: 'GND' },
  { id: 'w3', fromComponentId: 'power_rails', fromPinId: 'RAIL_5V', toComponentId: 'esp32', toPinId: 'VIN_5V', color: '#ef4444', netName: '5V_BUS' },
  { id: 'w4', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'esp32', toPinId: 'GND_1', color: '#1e293b', netName: 'GND' },
  { id: 'w5', fromComponentId: 'power_rails', fromPinId: 'RAIL_3V3', toComponentId: 'stm32', toPinId: '3V3', color: '#f59e0b', netName: '3V3_BUS' },

  // --- HC-SR04 Ultrasonic + Divider ---
  { id: 'w6', fromComponentId: 'power_rails', fromPinId: 'RAIL_5V', toComponentId: 'hcsr04', toPinId: 'VCC', color: '#ef4444', netName: '5V_BUS' },
  { id: 'w7', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'hcsr04', toPinId: 'GND', color: '#1e293b', netName: 'GND' },
  { id: 'w8', fromComponentId: 'stm32', fromPinId: 'PA1', toComponentId: 'hcsr04', toPinId: 'TRIG', color: '#06b6d4', netName: 'US_TRIG' },
  { id: 'w9', fromComponentId: 'hcsr04', fromPinId: 'ECHO', toComponentId: 'divider', toPinId: 'IN', color: '#8b5cf6', netName: 'US_ECHO_5V' },
  { id: 'w10', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'divider', toPinId: 'GND', color: '#1e293b', netName: 'GND' },
  { id: 'w11', fromComponentId: 'divider', fromPinId: 'OUT', toComponentId: 'stm32', toPinId: 'PA2', color: '#00f0ff', netName: 'US_ECHO_3V3' },

  // --- MQ-2 Gas Sensor ---
  { id: 'w12', fromComponentId: 'power_rails', fromPinId: 'RAIL_5V', toComponentId: 'mq2', toPinId: 'VCC', color: '#ef4444', netName: '5V_BUS' },
  { id: 'w13', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'mq2', toPinId: 'GND', color: '#1e293b', netName: 'GND' },
  { id: 'w14', fromComponentId: 'mq2', fromPinId: 'AO', toComponentId: 'stm32', toPinId: 'PA0', color: '#10b981', netName: 'GAS_ANALOG' },

  // --- DS18B20 + 4.7k Pull-up ---
  { id: 'w15', fromComponentId: 'power_rails', fromPinId: 'RAIL_3V3', toComponentId: 'ds18b20', toPinId: 'VDD', color: '#f59e0b', netName: '3V3_BUS' },
  { id: 'w16', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'ds18b20', toPinId: 'GND', color: '#1e293b', netName: 'GND' },
  { id: 'w17', fromComponentId: 'power_rails', fromPinId: 'RAIL_3V3', toComponentId: 'pullup', toPinId: 'PULLUP_VCC', color: '#f59e0b', netName: '3V3_BUS' },
  { id: 'w18', fromComponentId: 'pullup', fromPinId: 'PULLUP_DATA', toComponentId: 'ds18b20', toPinId: 'DATA', color: '#ec4899', netName: '1WIRE_BUS' },
  { id: 'w19', fromComponentId: 'ds18b20', fromPinId: 'DATA', toComponentId: 'stm32', toPinId: 'PB12', color: '#ec4899', netName: '1WIRE_BUS' },

  // --- Reed Switch ---
  { id: 'w20', fromComponentId: 'stm32', fromPinId: 'PB13', toComponentId: 'reed', toPinId: 'PIN_A', color: '#eab308', netName: 'REED_SENSE' },
  { id: 'w21', fromComponentId: 'reed', fromPinId: 'PIN_B', toComponentId: 'power_rails', toPinId: 'RAIL_GND', color: '#1e293b', netName: 'GND' },

  // --- MPU6050 I2C ---
  { id: 'w22', fromComponentId: 'power_rails', fromPinId: 'RAIL_3V3', toComponentId: 'mpu6050', toPinId: 'VCC', color: '#f59e0b', netName: '3V3_BUS' },
  { id: 'w23', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'mpu6050', toPinId: 'GND', color: '#1e293b', netName: 'GND' },
  { id: 'w24', fromComponentId: 'stm32', fromPinId: 'PB8', toComponentId: 'mpu6050', toPinId: 'SCL', color: '#3b82f6', netName: 'I2C_SCL' },
  { id: 'w25', fromComponentId: 'stm32', fromPinId: 'PB9', toComponentId: 'mpu6050', toPinId: 'SDA', color: '#14b8a6', netName: 'I2C_SDA' },

  // --- 16x2 I2C LCD ---
  { id: 'w26', fromComponentId: 'power_rails', fromPinId: 'RAIL_5V', toComponentId: 'lcd1602', toPinId: 'VCC', color: '#ef4444', netName: '5V_BUS' },
  { id: 'w27', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'lcd1602', toPinId: 'GND', color: '#1e293b', netName: 'GND' },
  { id: 'w28', fromComponentId: 'stm32', fromPinId: 'PB8', toComponentId: 'lcd1602', toPinId: 'SCL', color: '#3b82f6', netName: 'I2C_SCL' },
  { id: 'w29', fromComponentId: 'stm32', fromPinId: 'PB9', toComponentId: 'lcd1602', toPinId: 'SDA', color: '#14b8a6', netName: 'I2C_SDA' },

  // --- Buzzer ---
  { id: 'w30', fromComponentId: 'stm32', fromPinId: 'PB0', toComponentId: 'buzzer', toPinId: 'SIG', color: '#fb923c', netName: 'BUZZER_ACT' },
  { id: 'w31', fromComponentId: 'power_rails', fromPinId: 'RAIL_GND', toComponentId: 'buzzer', toPinId: 'GND', color: '#1e293b', netName: 'GND' },

  // --- STM32 to ESP32 UART Cross-Over ---
  { id: 'w32', fromComponentId: 'stm32', fromPinId: 'PA9', toComponentId: 'esp32', toPinId: 'GPIO16', color: '#a855f7', netName: 'UART_TX_RX' },
  { id: 'w33', fromComponentId: 'stm32', fromPinId: 'PA10', toComponentId: 'esp32', toPinId: 'GPIO17', color: '#6366f1', netName: 'UART_RX_TX' },
];
