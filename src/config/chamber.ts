import { ChamberConfig } from '../types/telemetry';

export const DEFAULT_CHAMBER_CONFIG: ChamberConfig = {
  chamberDepthCm: 150, // 1.5m industrial standard inspection chamber
  chamberDiameterCm: 90, // 900mm concrete riser
  minUltrasonicDistanceCm: 3, // HC-SR04 deadband threshold
  maxUltrasonicDistanceCm: 400, // HC-SR04 practical upper limit
  waterWarningPercentage: 50, // 50% chamber filled
  waterCriticalPercentage: 80, // 80% chamber filled (flood risk)
  gasWarningAdc: 1200, // Elevated VOC / Methane raw ADC
  gasCriticalAdc: 2400, // Dangerous gas build-up raw ADC
  tempWarningC: 45.0, // Sub-surface thermal warning
  tempCriticalC: 60.0, // Critical thermal threshold
  tiltWarningDeg: 8.0, // Disturbance / displacement
  tiltCriticalDeg: 15.0, // Cover displacement / unauthorized tamper
  telemetryIntervalMs: 1000,
  hardwareWsUrl: 'ws://192.168.4.1:81/telemetry', // ESP32 AP default endpoint
};
