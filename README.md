# SMART MANHOLE | DIGITAL TWIN
## Real-Time Underground Infrastructure Monitoring System & 3D Electronics Workbench

Industrial SCADA digital twin web application for underground utility and sewer inspection chambers, featuring interactive 3D simulations, real-time telemetry processing, deterministic scenario reproduction, rule-based electrical circuit validation, and an interactive 3D hardware breadboard workbench.

---

## 1. System Architecture & Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite, Tailwind CSS
- **3D Graphics & Simulation**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Telemetry Charts**: Recharts (bounded rolling 60-sample time series)
- **Icons**: Lucide React
- **Industrial Design**: Dark graphite SCADA theme (`#0a0d12` to `#1e293b`) with restrained cyan (`#00f0ff`), amber, blue, and rose alert accents.

---

## 2. Hardware Architecture & Pin Mapping

### Microcontrollers
- **STM32F103C8T6 Blue Pill**: Main supervisory controller (72MHz Cortex-M3, 3.3V logic level). Samples analog gas ADC, handles 1-Wire temperature, I2C bus sensors, trigger pulses, and serial communication.
- **ESP32 NodeMCU DevKit**: Wi-Fi IoT gateway (240MHz dual core). Receives UART frames from STM32 and bridges JSON telemetry over WebSocket.

### Sensor & Peripheral Interfaces
1. **HC-SR04 Ultrasonic Sensor**:
   - `VCC` -> Regulated `+5V`
   - `GND` -> `Common GND`
   - `TRIG` -> STM32 `PA1`
   - `ECHO` -> `1kΩ / 2kΩ Voltage Divider IN` (5V logic step-down) -> `OUT` -> STM32 `PA2` (strictly 3.3V safe).
2. **MQ-2 Gas / Smoke Sensor**:
   - `VCC` -> Regulated `+5V` (internal heater coil)
   - `GND` -> `Common GND`
   - `AO` -> STM32 `PA0` (ADC1_IN0, 0-3.3V conversion).
3. **DS18B20 Waterproof Temperature Probe**:
   - `VDD` -> `+3.3V`
   - `GND` -> `Common GND`
   - `DATA` -> STM32 `PB12` (Dallas 1-Wire protocol) + `4.7kΩ Pull-Up Resistor` between DATA and 3.3V.
4. **Magnetic Reed Switch (Cover Detection)**:
   - Terminal 1 -> STM32 `PB13` (Internal weak pull-up enabled)
   - Terminal 2 -> `Common GND`.
5. **MPU6050 6-DoF Accelerometer / Gyroscope (GY-521)**:
   - `VCC` -> `+3.3V`
   - `GND` -> `Common GND`
   - `SCL` -> STM32 `PB8` (I2C1_SCL)
   - `SDA` -> STM32 `PB9` (I2C1_SDA).
6. **16×2 I2C Alphanumeric LCD (PCF8574 Backpack)**:
   - `VCC` -> `+5V` (display contrast)
   - `GND` -> `Common GND`
   - `SCL` -> STM32 `PB8` (Shared I2C bus)
   - `SDA` -> STM32 `PB9` (Shared I2C bus).
7. **Active Piezo Alarm Buzzer**:
   - `CTRL` -> STM32 `PB0` (via NPN driver)
   - `GND` -> `Common GND`.
8. **STM32 <-> ESP32 UART Telemetry Cross-Over**:
   - STM32 `PA9` (USART1_TX) -> ESP32 `GPIO16` (Serial2 RX2)
   - STM32 `PA10` (USART1_RX) <- ESP32 `GPIO17` (Serial2 TX2)
   - STM32 `GND` <-> ESP32 `GND` (mandatory common reference ground).

---

## 3. Pages & Features

### 1. Overview Twin
- Procedural 3D underground manhole model featuring concrete shaft, asphalt road slab with lane striping, inlet/outlet sewer pipes, internal safety ladder, and cast-iron hinged lid.
- Animated dynamic water level with real-time level color changes and surface ripple.
- Real-time animated cover opening/closing and MPU6050 tilt inclination.
- Interactive 3D sensor markers and clickable callout cards (HC-SR04, MQ-2, DS18B20, Reed switch, MPU6050).
- Cutaway vs. Exterior view toggle, top-down and section view presets, and camera reset.

### 2. Live Telemetry
- Sensor KPI cards: Water depth (cm), Ultrasonic air gap (cm), MQ-2 raw ADC & mV, Temperature (°C), Cover tamper state, MPU6050 Tilt pitch/roll/magnitude (°), Connection status.
- Recharts graphs with warning and critical threshold reference lines:
  - Water Level & Flood Stage (cm)
  - Toxic / Combustible Gas (Raw ADC)
  - Sub-surface Temperature (°C)
  - Tilt & Inclination Dynamics (°)
- Rolling 60-sample historical telemetry buffer.

### 3. Alarms & Events
- Incident dispatch log with severity classification (`CRITICAL`, `WARNING`, `INFO`).
- Active vs. Cleared status, sensor source tag, limit comparison, and acknowledgement workflow.

### 4. Simulation Lab
- Manual control sliders: Water depth, Gas ADC, Temperature, Cover open toggle, Tilt Pitch & Roll angles.
- Deterministic repeatable test scenarios:
  1. **Normal Baseline**: Dry sewer, normal ambient gas, closed cover.
  2. **Storm Water**: Continuous gradual water level rise simulating rainfall.
  3. **Flash Flood**: Rapid water surge exceeding 80% chamber capacity.
  4. **Toxic Gas Accumulation**: Elevated methane/VOC reading exceeding 2400 ADC.
  5. **Cover Tamper**: Cover opened and tilted, disengaging reed switch.
  6. **High Heat**: Sub-surface fire / thermal threshold exceeded.

### 5. System Settings
- Configurable chamber depth and collar diameter.
- Editable safety thresholds (water warning/crit %, gas ADC limits, temperature limits, tilt angles).
- Hardware WebSocket endpoint configuration (`ws://[ESP32_IP]:81/telemetry`) and wire JSON specification.

### 6. Hardware Lab (3D Electronics Workbench)
- Realistic 3D procedural models of all 9 hardware components, power distribution rails, and passive modules.
- Interactive pin-to-pin 3D wiring with curved bezier spline jumper wires and custom wire color palette.
- **"Load Smart Manhole Circuit"** button loading the complete 33-wire validated netlist.
- Synchronized three-way view: 3D Workbench, 2D Schematic, and Pin Connection Table.
- **Electrical Validation Engine** detecting:
  - 5V signal direct connection to 3.3V non-tolerant inputs (e.g. HC-SR04 5V Echo to PA2).
  - Power-to-ground short circuits (5V/3.3V shorted to GND).
  - UART driver contention (TX connected to TX, RX connected to RX).
  - Missing common ground between microcontrollers.
  - I2C bus swapped lines (SCL to SDA).
  - Missing 4.7kΩ pull-up on DS18B20 1-Wire bus.
  - Missing 1k/2k voltage divider on ultrasonic echo.
  - Unconnected required power/ground pins.
- Component inspector displaying pin specifications, electrical limits, and live digital twin readings.

---

## 4. How to Run

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build Production Bundle
```bash
npm run build
```
Verify production build:
```bash
npm run preview
```

---

## 5. Connecting Real STM32 + ESP32 Hardware

1. Flash the STM32F103 with the sensor acquisition firmware (UART baud 115200 8N1 on PA9/PA10).
2. Flash the ESP32 with the WebSocket bridge firmware.
3. ESP32 connects to local Wi-Fi or acts as SoftAP (`192.168.4.1`) and hosts a WebSocket server on port `81`.
4. In the web app, navigate to **System Settings -> ESP32 / WebSocket**, enter your endpoint (`ws://192.168.4.1:81/telemetry`), and click **"Switch to Live Hardware Mode"**.
5. The dashboard transitions from `SIMULATED` to `CONNECTED`, parsing real hardware JSON packets at 1.0Hz.
