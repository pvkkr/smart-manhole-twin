/**
 * Telemetry interfaces for Smart Manhole Digital Twin
 */

export interface RawTelemetryPayload {
  distance_cm: number;
  distance_valid: number; // 1 = valid, 0 = invalid
  temperature_x100: number; // e.g. 2950 for 29.50°C
  temperature_valid: number; // 1 = valid, 0 = invalid
  gas_adc: number; // Raw ADC reading (0-4095 or 0-1023)
  gas_mv: number; // Sensor output in millivolts
  cover: 'COVER OPEN' | 'COVER CLOSED';
  accel_valid: number; // 1 = valid, 0 = invalid
  accel_x_mg: number; // Accelerometer X in milli-g
  accel_y_mg: number; // Accelerometer Y in milli-g
  accel_z_mg: number; // Accelerometer Z in milli-g (typically ~1000mg at rest)
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp?: number;
}

export type SensorSeverity = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface TelemetryState {
  timestamp: number;
  
  // Ultrasonic & Water calculations
  ultrasonicDistanceCm: number;
  ultrasonicValid: boolean;
  waterDepthCm: number;
  waterPercentage: number;
  waterStatus: SensorSeverity;
  
  // Gas sensor (MQ-2)
  gasAdc: number;
  gasMv: number;
  gasStatus: SensorSeverity;
  
  // Temperature (DS18B20)
  temperatureC: number;
  temperatureValid: boolean;
  temperatureStatus: SensorSeverity;
  
  // Cover State (Reed switch)
  coverState: 'CLOSED' | 'OPEN';
  coverAngleDeg: number; // For 3D hinge animation (0° to 75°)
  
  // Accelerometer & Tilt (MPU6050)
  accelValid: boolean;
  accelXMg: number;
  accelYMg: number;
  accelZMg: number;
  tiltPitchDeg: number; // Computed from accelerometer
  tiltRollDeg: number;
  tiltMagnitudeDeg: number;
  tiltStatus: SensorSeverity;
  
  // System-level
  systemStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  activeAlarmsCount: number;
  
  // Connection details
  telemetrySource: 'SIMULATION' | 'HARDWARE';
  connectionStatus: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'SIMULATED';
  lastPacketTime: number;
}

export interface ChamberConfig {
  chamberDepthCm: number; // Total chamber depth from sensor mount to bottom, e.g. 150cm
  chamberDiameterCm: number; // e.g. 90cm
  minUltrasonicDistanceCm: number; // HC-SR04 blind zone (~2cm to 4cm)
  maxUltrasonicDistanceCm: number; // HC-SR04 max range (~400cm)
  waterWarningPercentage: number; // default 50%
  waterCriticalPercentage: number; // default 80%
  gasWarningAdc: number; // default 1200
  gasCriticalAdc: number; // default 2400
  tempWarningC: number; // default 45°C
  tempCriticalC: number; // default 60°C
  tiltWarningDeg: number; // default 8°
  tiltCriticalDeg: number; // default 15°
  telemetryIntervalMs: number; // default 1000ms
  hardwareWsUrl: string; // default ws://192.168.4.1:81 or similar
}

export interface HistoricalTelemetryPoint {
  timeStr: string;
  timestamp: number;
  waterDepthCm: number;
  waterPercentage: number;
  temperatureC: number;
  gasAdc: number;
  gasMv: number;
  tiltPitchDeg: number;
  tiltRollDeg: number;
  tiltMagnitudeDeg: number;
  coverOpen: number; // 0 or 1 for chart visualization
}
