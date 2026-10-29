import { ChamberConfig } from '../types/telemetry';

export const DEFAULT_CHAMBER_CONFIG: ChamberConfig = {
  chamberDepthCm: 50, // 50cm benchtop testing / miniature manhole model
  chamberDiameterCm: 30, // 30cm scaled diameter
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
  thingspeakChannelId: '', // ThingSpeak Numeric Channel ID
  thingspeakReadApiKey: '', // ThingSpeak Read API Key (if private)
  thingspeakPollIntervalMs: 15000, // 15-second polling interval (ThingSpeak standard)
};
