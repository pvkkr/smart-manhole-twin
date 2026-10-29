import { telemetryProvider } from './telemetryProvider';
import { RawTelemetryPayload } from '../types/telemetry';

export type SimulationScenario =
  | 'MANUAL'
  | 'NORMAL_BASELINE'
  | 'SLOW_RISE_RAIN'
  | 'FLASH_FLOOD'
  | 'GAS_ACCUMULATION'
  | 'COVER_TAMPER'
  | 'HIGH_HEAT';

export class SimulationEngine {
  private timerId: number | null = null;
  private isRunning: boolean = true;
  private scenario: SimulationScenario = 'NORMAL_BASELINE';
  private scenarioStep: number = 0;

  // Manual / current baseline values
  private waterDepthCm: number = 25;
  private gasAdc: number = 420;
  private temperatureC: number = 24.2;
  private coverOpen: boolean = false;
  private tiltPitchDeg: number = 0;
  private tiltRollDeg: number = 0;

  // Flags for sensor validity testing
  private distanceValid: boolean = true;
  private tempValid: boolean = true;
  private accelValid: boolean = true;

  constructor() {
    this.start();
  }

  public start() {
    if (this.timerId) return;
    this.isRunning = true;
    const interval = telemetryProvider.getConfig().telemetryIntervalMs || 1000;
    this.timerId = window.setInterval(() => this.tick(), interval);
  }

  public pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  public resume() {
    this.start();
  }

  public reset() {
    this.scenario = 'NORMAL_BASELINE';
    this.scenarioStep = 0;
    this.waterDepthCm = 25;
    this.gasAdc = 420;
    this.temperatureC = 24.2;
    this.coverOpen = false;
    this.tiltPitchDeg = 0;
    this.tiltRollDeg = 0;
    this.distanceValid = true;
    this.tempValid = true;
    this.accelValid = true;
    this.publishTelemetry();
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getScenario(): SimulationScenario {
    return this.scenario;
  }

  public setScenario(s: SimulationScenario) {
    this.scenario = s;
    this.scenarioStep = 0;

    switch (s) {
      case 'NORMAL_BASELINE':
        this.waterDepthCm = 25;
        this.gasAdc = 420;
        this.temperatureC = 24.0;
        this.coverOpen = false;
        this.tiltPitchDeg = 0.4;
        this.tiltRollDeg = -0.2;
        break;
      case 'SLOW_RISE_RAIN':
        this.waterDepthCm = 30;
        this.gasAdc = 480;
        this.temperatureC = 22.5;
        this.coverOpen = false;
        this.tiltPitchDeg = 0.5;
        this.tiltRollDeg = 0.1;
        break;
      case 'FLASH_FLOOD':
        this.waterDepthCm = 70;
        this.gasAdc = 550;
        this.temperatureC = 21.0;
        this.coverOpen = false;
        this.tiltPitchDeg = 1.2;
        this.tiltRollDeg = 0.8;
        break;
      case 'GAS_ACCUMULATION':
        this.waterDepthCm = 28;
        this.gasAdc = 1100;
        this.temperatureC = 26.5;
        this.coverOpen = false;
        this.tiltPitchDeg = 0.2;
        this.tiltRollDeg = 0.1;
        break;
      case 'COVER_TAMPER':
        this.waterDepthCm = 25;
        this.gasAdc = 450;
        this.temperatureC = 24.5;
        this.coverOpen = true;
        this.tiltPitchDeg = 18.5;
        this.tiltRollDeg = -6.2;
        break;
      case 'HIGH_HEAT':
        this.waterDepthCm = 15;
        this.gasAdc = 650;
        this.temperatureC = 46.0;
        this.coverOpen = false;
        this.tiltPitchDeg = 0.3;
        this.tiltRollDeg = 0.1;
        break;
      case 'MANUAL':
        break;
    }

    this.publishTelemetry();
  }

  // --- Manual Override Controls ---

  public setManualWaterDepth(depthCm: number) {
    this.scenario = 'MANUAL';
    const config = telemetryProvider.getConfig();
    this.waterDepthCm = Math.max(0, Math.min(config.chamberDepthCm, depthCm));
    this.publishTelemetry();
  }

  public setManualGasAdc(adc: number) {
    this.scenario = 'MANUAL';
    this.gasAdc = Math.max(0, Math.min(4095, adc));
    this.publishTelemetry();
  }

  public setManualTemperature(tempC: number) {
    this.scenario = 'MANUAL';
    this.temperatureC = Math.max(-10, Math.min(100, tempC));
    this.publishTelemetry();
  }

  public setManualCoverState(open: boolean) {
    this.scenario = 'MANUAL';
    this.coverOpen = open;
    if (open && Math.abs(this.tiltPitchDeg) < 5) {
      this.tiltPitchDeg = 18.0; // Naturally tilts when opened
    } else if (!open && Math.abs(this.tiltPitchDeg) >= 15) {
      this.tiltPitchDeg = 0.5;
    }
    this.publishTelemetry();
  }

  public setManualTilt(pitchDeg: number, rollDeg: number) {
    this.scenario = 'MANUAL';
    this.tiltPitchDeg = pitchDeg;
    this.tiltRollDeg = rollDeg;
    this.publishTelemetry();
  }

  public setSensorValidity(sensor: 'distance' | 'temp' | 'accel', valid: boolean) {
    if (sensor === 'distance') this.distanceValid = valid;
    if (sensor === 'temp') this.tempValid = valid;
    if (sensor === 'accel') this.accelValid = valid;
    this.publishTelemetry();
  }

  // --- Periodic Tick & Scenario Progression ---

  private tick() {
    this.scenarioStep++;
    const config = telemetryProvider.getConfig();

    // Subtle random noise for organic sensor realism
    const noise = (Math.random() - 0.5) * 0.4;
    const gasNoise = Math.floor((Math.random() - 0.5) * 8);

    switch (this.scenario) {
      case 'NORMAL_BASELINE':
        // Slight fluctuation around baseline
        this.waterDepthCm = Math.max(20, Math.min(30, 25 + Math.sin(this.scenarioStep / 6) * 1.5 + noise));
        this.gasAdc = Math.max(380, Math.min(480, 420 + gasNoise));
        this.temperatureC = Math.max(23.5, Math.min(25.0, 24.2 + noise * 0.2));
        this.tiltPitchDeg = 0.4 + noise * 0.1;
        this.tiltRollDeg = -0.2 + noise * 0.1;
        break;

      case 'SLOW_RISE_RAIN':
        // Steadily rise by 1.2 cm per second up to 110cm (warning to critical)
        this.waterDepthCm = Math.min(config.chamberDepthCm * 0.85, this.waterDepthCm + 1.2 + noise * 0.3);
        this.gasAdc = Math.max(400, Math.min(600, 480 + gasNoise));
        this.temperatureC = Math.max(20.0, 23.0 - (this.waterDepthCm / config.chamberDepthCm) * 3);
        break;

      case 'FLASH_FLOOD':
        // Rapid rise by 3.5 cm per second until near full overflow!
        this.waterDepthCm = Math.min(config.chamberDepthCm * 0.96, this.waterDepthCm + 3.8 + noise * 0.5);
        this.gasAdc = Math.min(1800, this.gasAdc + 20 + gasNoise);
        this.temperatureC = 19.5 + noise * 0.2;
        break;

      case 'GAS_ACCUMULATION':
        // Gas spikes from 1100 to 2800 (critical sewer gas hazard)
        this.gasAdc = Math.min(3400, this.gasAdc + 65 + gasNoise);
        this.waterDepthCm = 28 + Math.sin(this.scenarioStep / 5) * 0.8;
        this.temperatureC = 27.5 + noise * 0.3;
        break;

      case 'COVER_TAMPER':
        this.coverOpen = true;
        this.tiltPitchDeg = 22.0 + Math.sin(this.scenarioStep) * 2.0;
        this.tiltRollDeg = -8.0 + noise;
        break;

      case 'HIGH_HEAT':
        // Sub-surface temperature climbs to 65°C
        this.temperatureC = Math.min(72.0, this.temperatureC + 0.8 + noise * 0.1);
        this.gasAdc = Math.min(2200, this.gasAdc + 15 + gasNoise);
        break;

      case 'MANUAL':
        // Small organic jitter around manual settings
        this.gasAdc = Math.max(0, Math.min(4095, this.gasAdc + gasNoise));
        this.temperatureC = Math.max(-10, Math.min(100, this.temperatureC + noise * 0.05));
        break;
    }

    this.publishTelemetry();
  }

  private publishTelemetry() {
    if (telemetryProvider.getState().telemetrySource !== 'SIMULATION') {
      return; // Do not emit simulation data if user has switched to ThingSpeak or Hardware
    }

    const config = telemetryProvider.getConfig();

    // ultrasonic_distance = chamber_depth - water_depth
    const distance_cm = Math.max(
      config.minUltrasonicDistanceCm,
      Math.min(config.chamberDepthCm, config.chamberDepthCm - this.waterDepthCm)
    );

    // MPU6050 Acceleration reconstruction from pitch & roll:
    // pitch = atan2(ay, az), roll = atan2(-ax, az)
    const pitchRad = (this.tiltPitchDeg * Math.PI) / 180;
    const rollRad = (this.tiltRollDeg * Math.PI) / 180;
    const ax_mg = Math.round(-Math.sin(rollRad) * 1000);
    const ay_mg = Math.round(Math.sin(pitchRad) * 1000);
    const az_mg = Math.round(Math.cos(pitchRad) * Math.cos(rollRad) * 1000);

    const payload: RawTelemetryPayload = {
      distance_cm: Math.round(distance_cm * 10) / 10,
      distance_valid: this.distanceValid ? 1 : 0,
      temperature_x100: Math.round(this.temperatureC * 100),
      temperature_valid: this.tempValid ? 1 : 0,
      gas_adc: Math.round(this.gasAdc),
      gas_mv: Math.round((this.gasAdc / 4095) * 3300),
      cover: this.coverOpen ? 'COVER OPEN' : 'COVER CLOSED',
      accel_valid: this.accelValid ? 1 : 0,
      accel_x_mg: ax_mg,
      accel_y_mg: ay_mg,
      accel_z_mg: az_mg,
      status: 'NORMAL', // Computed by provider
      timestamp: Date.now(),
    };

    telemetryProvider.processRawPayload(payload);
  }
}

export const simulationEngine = new SimulationEngine();
