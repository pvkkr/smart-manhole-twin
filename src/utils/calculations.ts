import { ChamberConfig, SensorSeverity } from '../types/telemetry';

/**
 * Calculates water depth in centimetres from ultrasonic distance and chamber depth.
 * Clamps to physical limits and returns validity.
 */
export function calculateWaterDepth(
  ultrasonicDistanceCm: number,
  config: ChamberConfig,
  isDistanceValid: boolean
): { waterDepthCm: number; waterPercentage: number; isValid: boolean } {
  if (!isDistanceValid || isNaN(ultrasonicDistanceCm)) {
    return { waterDepthCm: 0, waterPercentage: 0, isValid: false };
  }

  // Reject readings outside sensor physical detection range (e.g. <2cm or >400cm)
  if (
    ultrasonicDistanceCm < config.minUltrasonicDistanceCm ||
    ultrasonicDistanceCm > config.maxUltrasonicDistanceCm
  ) {
    return { waterDepthCm: 0, waterPercentage: 0, isValid: false };
  }

  // water_depth_cm = chamber_depth_cm - ultrasonic_distance_cm
  const rawDepth = config.chamberDepthCm - ultrasonicDistanceCm;
  const clampedDepth = Math.max(0, Math.min(config.chamberDepthCm, rawDepth));
  const percentage = (clampedDepth / config.chamberDepthCm) * 100;

  return {
    waterDepthCm: Math.round(clampedDepth * 10) / 10,
    waterPercentage: Math.round(percentage * 10) / 10,
    isValid: true,
  };
}

/**
 * Derives tilt angles (pitch, roll, magnitude) in degrees from 3-axis accelerometer readings in mg (milli-g).
 * Ensures raw acceleration is NOT confused with degrees.
 */
export function calculateTiltAngles(
  accelXMg: number,
  accelYMg: number,
  accelZMg: number,
  isAccelValid: boolean
): { pitchDeg: number; rollDeg: number; magnitudeDeg: number; isValid: boolean } {
  if (!isAccelValid || isNaN(accelXMg) || isNaN(accelYMg) || isNaN(accelZMg)) {
    return { pitchDeg: 0, rollDeg: 0, magnitudeDeg: 0, isValid: false };
  }

  // Convert mg to g (1g = 1000 mg)
  const ax = accelXMg / 1000;
  const ay = accelYMg / 1000;
  const az = accelZMg / 1000;

  // Standard trigonometry for static tilt using gravity vector
  // Pitch (around X axis)
  const pitchRad = Math.atan2(ay, Math.sqrt(ax * ax + az * az));
  // Roll (around Y axis)
  const rollRad = Math.atan2(-ax, az);

  const pitchDeg = (pitchRad * 180) / Math.PI;
  const rollDeg = (rollRad * 180) / Math.PI;

  // Total angular inclination from vertical (Z-axis)
  const totalG = Math.sqrt(ax * ax + ay * ay + az * az);
  let magnitudeDeg = 0;
  if (totalG > 0.1) {
    const cosAngle = Math.max(-1, Math.min(1, az / totalG));
    magnitudeDeg = (Math.acos(cosAngle) * 180) / Math.PI;
  }

  return {
    pitchDeg: Math.round(pitchDeg * 10) / 10,
    rollDeg: Math.round(rollDeg * 10) / 10,
    magnitudeDeg: Math.round(magnitudeDeg * 10) / 10,
    isValid: true,
  };
}

/**
 * Converts raw temperature_x100 (e.g. 2950 from DS18B20 integer fixed-point) to °C
 */
export function convertTemperature(
  tempX100: number,
  isValid: boolean
): { temperatureC: number; isValid: boolean } {
  if (!isValid || isNaN(tempX100)) {
    return { temperatureC: 0, isValid: false };
  }
  const tempC = tempX100 / 100;
  return {
    temperatureC: Math.round(tempC * 10) / 10,
    isValid: true,
  };
}

/**
 * Converts raw ADC (0-4095 on ESP32 or 0-1023 on STM32) to millivolts
 */
export function convertGasAdcToMv(
  adcValue: number,
  referenceMv: number = 3300,
  resolutionBits: number = 12
): number {
  const maxAdc = (1 << resolutionBits) - 1;
  const mv = (adcValue / maxAdc) * referenceMv;
  return Math.round(mv);
}

/**
 * Determine severity for water level
 */
export function getWaterSeverity(percentage: number, config: ChamberConfig): SensorSeverity {
  if (percentage >= config.waterCriticalPercentage) return 'CRITICAL';
  if (percentage >= config.waterWarningPercentage) return 'WARNING';
  return 'NORMAL';
}

/**
 * Determine severity for gas ADC
 */
export function getGasSeverity(adc: number, config: ChamberConfig): SensorSeverity {
  if (adc >= config.gasCriticalAdc) return 'CRITICAL';
  if (adc >= config.gasWarningAdc) return 'WARNING';
  return 'NORMAL';
}

/**
 * Determine severity for temperature
 */
export function getTemperatureSeverity(tempC: number, config: ChamberConfig): SensorSeverity {
  if (tempC >= config.tempCriticalC) return 'CRITICAL';
  if (tempC >= config.tempWarningC) return 'WARNING';
  return 'NORMAL';
}

/**
 * Determine severity for tilt angle
 */
export function getTiltSeverity(angleDeg: number, config: ChamberConfig): SensorSeverity {
  if (angleDeg >= config.tiltCriticalDeg) return 'CRITICAL';
  if (angleDeg >= config.tiltWarningDeg) return 'WARNING';
  return 'NORMAL';
}
