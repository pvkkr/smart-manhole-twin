export type AlarmSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SystemAlarm {
  id: string;
  timestamp: number;
  timeFormatted: string;
  severity: AlarmSeverity;
  sensor: 'ULTRASONIC' | 'GAS' | 'TEMPERATURE' | 'COVER' | 'ACCEL' | 'SYSTEM';
  title: string;
  message: string;
  value: string;
  threshold: string;
  isActive: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: number;
}
