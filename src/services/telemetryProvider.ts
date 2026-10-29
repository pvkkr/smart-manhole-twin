import {
  RawTelemetryPayload,
  TelemetryState,
  ChamberConfig,
  HistoricalTelemetryPoint,
} from '../types/telemetry';
import {
  calculateWaterDepth,
  calculateTiltAngles,
  convertTemperature,
  convertGasAdcToMv,
  getWaterSeverity,
  getGasSeverity,
  getTemperatureSeverity,
  getTiltSeverity,
} from '../utils/calculations';
import { alarmManager } from './alarmManager';

export type TelemetryListener = (state: TelemetryState) => void;
export type HistoryListener = (history: HistoricalTelemetryPoint[]) => void;

/**
 * Manages telemetry ingestion from either Simulation Engine or Hardware WebSocket client.
 * Serves as the single source of truth for the entire application.
 */
export class TelemetryProvider {
  private currentState: TelemetryState;
  private history: HistoricalTelemetryPoint[] = [];
  private maxHistoryPoints = 60; // Rolling 60-sample window (~1 minute at 1Hz)
  private telemetryListeners: TelemetryListener[] = [];
  private historyListeners: HistoryListener[] = [];
  private config: ChamberConfig;

  // WebSocket state for real hardware mode
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private thingspeakTimer: number | null = null;
  private currentMode: 'SIMULATION' | 'HARDWARE' | 'THINGSPEAK' = 'SIMULATION';

  constructor(initialConfig: ChamberConfig) {
    // Restore persisted config from localStorage if available
    const savedConfig = this.loadConfigFromStorage();
    this.config = savedConfig ? { ...initialConfig, ...savedConfig } : initialConfig;

    const initialDepth = 15; // Initial 15cm water for 50cm chamber
    const initialPercentage = Math.round((initialDepth / this.config.chamberDepthCm) * 100);

    const savedMode = (typeof window !== 'undefined' && localStorage.getItem('sm_telemetry_mode')) as
      | 'SIMULATION'
      | 'HARDWARE'
      | 'THINGSPEAK'
      | null;

    const startMode = savedMode || 'SIMULATION';
    this.currentMode = startMode;

    this.currentState = {
      timestamp: Date.now(),
      ultrasonicDistanceCm: this.config.chamberDepthCm - initialDepth,
      ultrasonicValid: true,
      waterDepthCm: initialDepth,
      waterPercentage: initialPercentage,
      waterStatus: 'NORMAL',

      gasAdc: 450,
      gasMv: convertGasAdcToMv(450),
      gasStatus: 'NORMAL',

      temperatureC: 24.5,
      temperatureValid: true,
      temperatureStatus: 'NORMAL',

      coverState: 'CLOSED',
      coverAngleDeg: 0,

      accelValid: true,
      accelXMg: 12,
      accelYMg: -8,
      accelZMg: 1002, // ~1g downwards
      tiltPitchDeg: 0.5,
      tiltRollDeg: -0.7,
      tiltMagnitudeDeg: 0.9,
      tiltStatus: 'NORMAL',

      systemStatus: 'NORMAL',
      activeAlarmsCount: 0,

      telemetrySource: startMode,
      connectionStatus: startMode === 'SIMULATION' ? 'SIMULATED' : 'RECONNECTING',
      lastPacketTime: Date.now(),
    };

    this.recordHistoryPoint(this.currentState);

    // If starting in ThingSpeak or Hardware mode, auto-engage connection
    if (startMode === 'THINGSPEAK') {
      setTimeout(() => this.startThingspeakPolling(), 200);
    } else if (startMode === 'HARDWARE') {
      setTimeout(() => this.connectHardwareWebSocket(), 200);
    }
  }

  private loadConfigFromStorage(): Partial<ChamberConfig> | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('sm_chamber_config');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.chamberDepthCm === 150) {
            parsed.chamberDepthCm = 50;
          }
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }

  private saveConfigToStorage(cfg: ChamberConfig) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sm_chamber_config', JSON.stringify(cfg));
      }
    } catch {
      // Ignore
    }
  }

  public updateConfig(newConfig: ChamberConfig) {
    this.config = { ...newConfig };
    this.saveConfigToStorage(this.config);
    // Re-evaluate current state with new configuration
    this.processRawPayload(this.createCurrentRawPayload());
  }

  public getConfig(): ChamberConfig {
    return { ...this.config };
  }

  public getState(): TelemetryState {
    return { ...this.currentState };
  }

  public getHistory(): HistoricalTelemetryPoint[] {
    return [...this.history];
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.telemetryListeners.push(listener);
    listener(this.currentState);
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((l) => l !== listener);
    };
  }

  public subscribeHistory(listener: HistoryListener): () => void {
    this.historyListeners.push(listener);
    listener(this.history);
    return () => {
      this.historyListeners = this.historyListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const l of this.telemetryListeners) {
      l(this.currentState);
    }
  }

  private notifyHistory() {
    const copy = [...this.history];
    for (const l of this.historyListeners) {
      l(copy);
    }
  }

  private recordHistoryPoint(state: TelemetryState) {
    const timeStr = new Date(state.timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const point: HistoricalTelemetryPoint = {
      timeStr,
      timestamp: state.timestamp,
      waterDepthCm: state.waterDepthCm,
      waterPercentage: state.waterPercentage,
      temperatureC: state.temperatureC,
      gasAdc: state.gasAdc,
      gasMv: state.gasMv,
      tiltPitchDeg: state.tiltPitchDeg,
      tiltRollDeg: state.tiltRollDeg,
      tiltMagnitudeDeg: state.tiltMagnitudeDeg,
      coverOpen: state.coverState === 'OPEN' ? 1 : 0,
    };

    this.history = [...this.history.slice(-(this.maxHistoryPoints - 1)), point];
    this.notifyHistory();
  }

  /**
   * Process raw JSON payload received either from simulation or ESP32 bridge
   */
  public processRawPayload(
    payload: RawTelemetryPayload,
    source: 'SIMULATION' | 'HARDWARE' | 'THINGSPEAK' = 'SIMULATION'
  ) {
    if (source === 'SIMULATION' && this.currentMode !== 'SIMULATION') {
      return; // Never overwrite real hardware or ThingSpeak cloud telemetry with simulation ticks!
    }
    const now = payload.timestamp || Date.now();

    // 1. Water level calculation
    const isDistValid = payload.distance_valid === 1;
    const waterCalc = calculateWaterDepth(payload.distance_cm, this.config, isDistValid);
    const waterStatus = getWaterSeverity(waterCalc.waterPercentage, this.config);

    // 2. Gas reading
    const gasAdc = Math.max(0, payload.gas_adc || 0);
    const gasMv = payload.gas_mv || convertGasAdcToMv(gasAdc);
    const gasStatus = getGasSeverity(gasAdc, this.config);

    // 3. Temperature reading
    const isTempValid = payload.temperature_valid === 1;
    const tempCalc = convertTemperature(payload.temperature_x100, isTempValid);
    const tempStatus = getTemperatureSeverity(tempCalc.temperatureC, this.config);

    // 4. Cover state
    const coverState: 'CLOSED' | 'OPEN' =
      payload.cover === 'COVER OPEN' ? 'OPEN' : 'CLOSED';
    const coverAngleDeg = coverState === 'OPEN' ? 65 : 0;

    // 5. Accelerometer & Tilt
    const isAccelValid = payload.accel_valid === 1;
    const tiltCalc = calculateTiltAngles(
      payload.accel_x_mg,
      payload.accel_y_mg,
      payload.accel_z_mg,
      isAccelValid
    );
    const tiltStatus = getTiltSeverity(tiltCalc.magnitudeDeg, this.config);

    // 6. Overall System Status
    let systemStatus: TelemetryState['systemStatus'] = 'NORMAL';
    if (
      waterStatus === 'CRITICAL' ||
      gasStatus === 'CRITICAL' ||
      tempStatus === 'CRITICAL' ||
      tiltStatus === 'CRITICAL' ||
      coverState === 'OPEN'
    ) {
      systemStatus = 'CRITICAL';
    } else if (
      waterStatus === 'WARNING' ||
      gasStatus === 'WARNING' ||
      tempStatus === 'WARNING' ||
      tiltStatus === 'WARNING'
    ) {
      systemStatus = 'WARNING';
    }

    const newState: TelemetryState = {
      timestamp: now,
      ultrasonicDistanceCm: payload.distance_cm,
      ultrasonicValid: isDistValid && waterCalc.isValid,
      waterDepthCm: waterCalc.waterDepthCm,
      waterPercentage: waterCalc.waterPercentage,
      waterStatus,

      gasAdc,
      gasMv,
      gasStatus,

      temperatureC: tempCalc.temperatureC,
      temperatureValid: tempCalc.isValid,
      temperatureStatus: tempStatus,

      coverState,
      coverAngleDeg,

      accelValid: isAccelValid && tiltCalc.isValid,
      accelXMg: payload.accel_x_mg,
      accelYMg: payload.accel_y_mg,
      accelZMg: payload.accel_z_mg,
      tiltPitchDeg: tiltCalc.pitchDeg,
      tiltRollDeg: tiltCalc.rollDeg,
      tiltMagnitudeDeg: tiltCalc.magnitudeDeg,
      tiltStatus,

      systemStatus,
      activeAlarmsCount: 0,

      telemetrySource: this.currentMode,
      connectionStatus: this.currentMode === 'HARDWARE'
        ? this.ws && this.ws.readyState === WebSocket.OPEN
          ? 'CONNECTED'
          : 'RECONNECTING'
        : this.currentMode === 'THINGSPEAK'
        ? 'CONNECTED'
        : 'SIMULATED',
      lastPacketTime: now,
    };

    // Update alarms
    alarmManager.evaluateTelemetry(newState, this.config);
    const activeAlarms = alarmManager.getAlarms().filter((a) => a.isActive);
    newState.activeAlarmsCount = activeAlarms.length;

    this.currentState = newState;
    this.recordHistoryPoint(newState);
    this.notify();
  }

  private createCurrentRawPayload(): RawTelemetryPayload {
    return {
      distance_cm: this.currentState.ultrasonicDistanceCm,
      distance_valid: this.currentState.ultrasonicValid ? 1 : 0,
      temperature_x100: Math.round(this.currentState.temperatureC * 100),
      temperature_valid: this.currentState.temperatureValid ? 1 : 0,
      gas_adc: this.currentState.gasAdc,
      gas_mv: this.currentState.gasMv,
      cover: this.currentState.coverState === 'OPEN' ? 'COVER OPEN' : 'COVER CLOSED',
      accel_valid: this.currentState.accelValid ? 1 : 0,
      accel_x_mg: this.currentState.accelXMg,
      accel_y_mg: this.currentState.accelYMg,
      accel_z_mg: this.currentState.accelZMg,
      status:
        this.currentState.systemStatus === 'CRITICAL'
          ? 'CRITICAL'
          : this.currentState.systemStatus === 'WARNING'
          ? 'WARNING'
          : 'NORMAL',
      timestamp: Date.now(),
    };
  }

  // --- Hardware & Cloud Management ---

  public setMode(mode: 'SIMULATION' | 'HARDWARE' | 'THINGSPEAK') {
    this.currentMode = mode;
    this.currentState.telemetrySource = mode;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sm_telemetry_mode', mode);
      }
    } catch {
      // Ignore
    }

    if (mode === 'HARDWARE') {
      this.stopThingspeakPolling();
      this.currentState.connectionStatus = 'RECONNECTING';
      this.connectHardwareWebSocket();
    } else if (mode === 'THINGSPEAK') {
      this.disconnectHardwareWebSocket();
      this.currentState.connectionStatus = 'RECONNECTING';
      this.startThingspeakPolling();
    } else {
      this.disconnectHardwareWebSocket();
      this.stopThingspeakPolling();
      this.currentState.connectionStatus = 'SIMULATED';
    }
    this.notify();
  }

  // --- ThingSpeak Cloud Polling ---

  private startThingspeakPolling() {
    this.stopThingspeakPolling();
    // Immediate initial fetch
    this.fetchThingspeakFeed();

    const interval = Math.max(5000, this.config.thingspeakPollIntervalMs || 15000);
    this.thingspeakTimer = window.setInterval(() => {
      if (this.currentMode === 'THINGSPEAK') {
        this.fetchThingspeakFeed();
      }
    }, interval);
  }

  private stopThingspeakPolling() {
    if (this.thingspeakTimer) {
      clearInterval(this.thingspeakTimer);
      this.thingspeakTimer = null;
    }
  }

  private async fetchThingspeakFeed() {
    if (this.currentMode !== 'THINGSPEAK' || !this.config.thingspeakChannelId) {
      if (this.currentMode === 'THINGSPEAK') {
        this.currentState.connectionStatus = 'DISCONNECTED';
        this.notify();
      }
      return;
    }

    try {
      const channelId = this.config.thingspeakChannelId.trim();
      const apiKey = this.config.thingspeakReadApiKey?.trim() || '';
      let url = `https://api.thingspeak.com/channels/${channelId}/feeds/last.json`;
      if (apiKey) {
        url += `?api_key=${apiKey}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ThingSpeak returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data || data === -1 || !data.created_at) {
        throw new Error('No entries found in ThingSpeak channel');
      }

      this.currentState.connectionStatus = 'CONNECTED';
      this.currentState.lastPacketTime = new Date(data.created_at).getTime() || Date.now();

      // Field mappings:
      // field1: distance_cm
      // field2: gas_adc
      // field3: temperature_c
      // field4: tilt_magnitude_deg
      // field5: cover_open (0 or 1)
      // field6: status ("NORMAL", "WARNING", "CRITICAL")

      const dist = parseFloat(data.field1) || 0;
      const gas = parseInt(data.field2, 10) || 0;
      const temp = parseFloat(data.field3) || 25.0;
      const tilt = parseFloat(data.field4) || 0;
      const coverVal = data.field5;
      const isCoverOpen = coverVal === '1' || coverVal === 'OPEN' || coverVal === 1;

      const payload: RawTelemetryPayload = {
        distance_cm: dist,
        distance_valid: dist > 0 ? 1 : 0,
        temperature_x100: Math.round(temp * 100),
        temperature_valid: 1,
        gas_adc: gas,
        gas_mv: convertGasAdcToMv(gas),
        cover: isCoverOpen ? 'COVER OPEN' : 'COVER CLOSED',
        accel_valid: 1,
        accel_x_mg: 0,
        accel_y_mg: 0,
        accel_z_mg: 1000,
        status: (data.field6 as any) || (isCoverOpen || gas > this.config.gasCriticalAdc ? 'CRITICAL' : 'NORMAL'),
        timestamp: this.currentState.lastPacketTime,
      };

      this.processRawPayload(payload, 'THINGSPEAK');
    } catch (err) {
      console.warn('ThingSpeak polling error:', err);
      if (this.currentMode === 'THINGSPEAK') {
        this.currentState.connectionStatus = 'DISCONNECTED';
        this.notify();
      }
    }
  }

  // --- WebSocket Management ---

  private connectHardwareWebSocket() {
    this.disconnectHardwareWebSocket();
    try {
      this.ws = new WebSocket(this.config.hardwareWsUrl);

      this.ws.onopen = () => {
        if (this.currentMode === 'HARDWARE') {
          this.currentState.connectionStatus = 'CONNECTED';
          this.notify();
          alarmManager.addEvent({
            severity: 'INFO',
            sensor: 'SYSTEM',
            title: 'Hardware Link Established',
            message: `Connected to ESP32 telemetry bridge at ${this.config.hardwareWsUrl}`,
            value: 'ONLINE',
            threshold: 'N/A',
            isActive: false,
          });
        }
      };

      this.ws.onmessage = (event) => {
        if (this.currentMode !== 'HARDWARE') return;
        try {
          const parsed = JSON.parse(event.data);
          if (
            typeof parsed.distance_cm === 'number' &&
            typeof parsed.gas_adc === 'number'
          ) {
            this.processRawPayload(parsed, 'HARDWARE');
          }
        } catch {
          console.warn('Failed to parse hardware telemetry frame:', event.data);
        }
      };

      this.ws.onclose = () => {
        if (this.currentMode === 'HARDWARE') {
          this.currentState.connectionStatus = 'RECONNECTING';
          this.notify();
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        if (this.currentMode === 'HARDWARE') {
          this.currentState.connectionStatus = 'DISCONNECTED';
          this.notify();
        }
      };
    } catch {
      this.currentState.connectionStatus = 'DISCONNECTED';
      this.notify();
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      if (this.currentMode === 'HARDWARE') {
        this.connectHardwareWebSocket();
      }
    }, 4000);
  }

  private disconnectHardwareWebSocket() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

import { DEFAULT_CHAMBER_CONFIG } from '../config/chamber';
export const telemetryProvider = new TelemetryProvider(DEFAULT_CHAMBER_CONFIG);
