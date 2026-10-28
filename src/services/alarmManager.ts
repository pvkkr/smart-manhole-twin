import { SystemAlarm, AlarmSeverity } from '../types/alarms';
import { TelemetryState, ChamberConfig } from '../types/telemetry';

export class AlarmManager {
  private alarms: SystemAlarm[] = [];
  private listeners: ((alarms: SystemAlarm[]) => void)[] = [];

  constructor() {
    // Initial system boot notification
    this.addEvent({
      severity: 'INFO',
      sensor: 'SYSTEM',
      title: 'Telemetry Subsystem Initialized',
      message: 'SCADA monitoring client booted. Telemetry polling started.',
      value: 'READY',
      threshold: 'N/A',
      isActive: false,
    });
  }

  public subscribe(listener: (alarms: SystemAlarm[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.alarms]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const copy = [...this.alarms];
    for (const listener of this.listeners) {
      listener(copy);
    }
  }

  public addEvent(params: {
    severity: AlarmSeverity;
    sensor: SystemAlarm['sensor'];
    title: string;
    message: string;
    value: string;
    threshold: string;
    isActive: boolean;
  }): void {
    const id = `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newAlarm: SystemAlarm = {
      id,
      timestamp: now,
      timeFormatted,
      severity: params.severity,
      sensor: params.sensor,
      title: params.title,
      message: params.message,
      value: params.value,
      threshold: params.threshold,
      isActive: params.isActive,
      isAcknowledged: false,
    };

    // Prepend new alarms, bounded history of 100 items
    this.alarms = [newAlarm, ...this.alarms.slice(0, 99)];
    this.notify();
  }

  public evaluateTelemetry(state: TelemetryState, config: ChamberConfig) {
    // 1. Water Flood Check
    this.checkThresholdAlarm(
      'ULTRASONIC',
      state.waterStatus,
      state.waterPercentage,
      `${state.waterDepthCm} cm (${state.waterPercentage}%)`,
      `Warning: ${config.waterWarningPercentage}% / Crit: ${config.waterCriticalPercentage}%`,
      'Water Level Alarm',
      state.waterStatus === 'CRITICAL'
        ? 'Chamber critical flood stage reached! Risk of road overflow.'
        : 'Water level elevated above warning limit.'
    );

    // 2. Gas Toxic Check
    this.checkThresholdAlarm(
      'GAS',
      state.gasStatus,
      state.gasAdc,
      `ADC ${state.gasAdc} (${state.gasMv} mV)`,
      `Warning: ${config.gasWarningAdc} / Crit: ${config.gasCriticalAdc}`,
      'Harmful Gas Concentration',
      state.gasStatus === 'CRITICAL'
        ? 'Dangerous toxic/combustible gas concentration detected by MQ-2 sensor!'
        : 'Gas levels rising above baseline warning limit.'
    );

    // 3. Thermal Check
    this.checkThresholdAlarm(
      'TEMPERATURE',
      state.temperatureStatus,
      state.temperatureC,
      `${state.temperatureC} °C`,
      `Warning: ${config.tempWarningC}°C / Crit: ${config.tempCriticalC}°C`,
      'Thermal Limit Exceeded',
      state.temperatureStatus === 'CRITICAL'
        ? 'Critical underground temperature detected! Risk of sewer fire or line damage.'
        : 'Underground temperature elevated.'
    );

    // 4. Tilt / Tamper Check
    this.checkThresholdAlarm(
      'ACCEL',
      state.tiltStatus,
      state.tiltMagnitudeDeg,
      `${state.tiltMagnitudeDeg}° tilt`,
      `Warning: ${config.tiltWarningDeg}° / Crit: ${config.tiltCriticalDeg}°`,
      'Cover Displacement / Tilt',
      state.tiltStatus === 'CRITICAL'
        ? 'Severe manhole cover tilt! Structural displacement or vehicle collision.'
        : 'Cover tilt deviation detected.'
    );

    // 5. Cover Open Check
    const coverAlarmActive = state.coverState === 'OPEN';
    const existingCoverAlarm = this.alarms.find(
      (a) => a.sensor === 'COVER' && a.isActive
    );

    if (coverAlarmActive && !existingCoverAlarm) {
      this.addEvent({
        severity: 'CRITICAL',
        sensor: 'COVER',
        title: 'Manhole Cover Tamper / Open',
        message: 'Magnetic reed switch disengaged. Manhole cover has been opened or removed!',
        value: 'REED OPEN',
        threshold: 'CLOSED',
        isActive: true,
      });
    } else if (!coverAlarmActive && existingCoverAlarm) {
      existingCoverAlarm.isActive = false;
      this.notify();
    }
  }

  private checkThresholdAlarm(
    sensor: SystemAlarm['sensor'],
    status: 'NORMAL' | 'WARNING' | 'CRITICAL',
    _valueNum: number,
    valueFormatted: string,
    thresholdFormatted: string,
    title: string,
    description: string
  ) {
    const activeAlarm = this.alarms.find(
      (a) => a.sensor === sensor && a.isActive
    );

    if (status === 'NORMAL') {
      if (activeAlarm) {
        activeAlarm.isActive = false;
        this.notify();
      }
      return;
    }

    const severity: AlarmSeverity = status === 'CRITICAL' ? 'CRITICAL' : 'WARNING';

    if (!activeAlarm) {
      this.addEvent({
        severity,
        sensor,
        title,
        message: description,
        value: valueFormatted,
        threshold: thresholdFormatted,
        isActive: true,
      });
    } else if (activeAlarm.severity !== severity) {
      // Escalated or de-escalated
      activeAlarm.severity = severity;
      activeAlarm.message = description;
      activeAlarm.value = valueFormatted;
      this.notify();
    }
  }

  public acknowledgeAlarm(id: string): void {
    const alarm = this.alarms.find((a) => a.id === id);
    if (alarm) {
      alarm.isAcknowledged = true;
      alarm.acknowledgedAt = Date.now();
      this.notify();
    }
  }

  public acknowledgeAll(): void {
    const now = Date.now();
    for (const a of this.alarms) {
      if (!a.isAcknowledged) {
        a.isAcknowledged = true;
        a.acknowledgedAt = now;
      }
    }
    this.notify();
  }

  public clearInactive(): void {
    this.alarms = this.alarms.filter((a) => a.isActive);
    this.notify();
  }

  public getAlarms(): SystemAlarm[] {
    return [...this.alarms];
  }
}

export const alarmManager = new AlarmManager();
