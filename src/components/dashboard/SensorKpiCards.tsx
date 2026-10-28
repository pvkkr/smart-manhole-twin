import { TelemetryState } from '../../types/telemetry';
import {
  Waves,
  Ruler,
  Flame,
  Thermometer,
  ShieldAlert,
  Compass,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SensorKpiCardsProps {
  telemetry: TelemetryState;
  selectedSensor: string | null;
  onSelectSensor: (sensorKey: string) => void;
}

export const SensorKpiCards = ({
  telemetry,
  selectedSensor,
  onSelectSensor,
}: SensorKpiCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* 1. Water Level */}
      <div
        onClick={() => onSelectSensor('ULTRASONIC')}
        className={`scada-panel p-3 rounded-lg border transition-all cursor-pointer hover:border-scada-cyan/60 flex flex-col justify-between ${
          selectedSensor === 'ULTRASONIC'
            ? 'border-scada-cyan ring-1 ring-scada-cyan/30'
            : telemetry.waterStatus === 'CRITICAL'
            ? 'border-rose-500/80 bg-rose-950/20'
            : telemetry.waterStatus === 'WARNING'
            ? 'border-amber-500/80 bg-amber-950/20'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">WATER DEPTH</span>
          <Waves className="w-4 h-4 text-scada-cyan" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-white">
              {telemetry.waterDepthCm}
            </span>
            <span className="text-xs text-slate-400 font-mono">cm</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {telemetry.waterPercentage}% cap
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              telemetry.waterStatus === 'CRITICAL'
                ? 'bg-rose-500'
                : telemetry.waterStatus === 'WARNING'
                ? 'bg-amber-500'
                : 'bg-scada-cyan'
            }`}
            style={{ width: `${Math.min(100, telemetry.waterPercentage)}%` }}
          />
        </div>
      </div>

      {/* 2. Ultrasonic Air Distance */}
      <div
        onClick={() => onSelectSensor('ULTRASONIC')}
        className={`scada-panel p-3 rounded-lg border transition-all cursor-pointer hover:border-scada-cyan/60 flex flex-col justify-between ${
          selectedSensor === 'ULTRASONIC' ? 'border-scada-cyan ring-1 ring-scada-cyan/30' : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">ULTRASONIC</span>
          <Ruler className="w-4 h-4 text-blue-400" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-white">
              {telemetry.ultrasonicDistanceCm}
            </span>
            <span className="text-xs text-slate-400 font-mono">cm</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">Air gap distance</div>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>HC-SR04 Active</span>
        </div>
      </div>

      {/* 3. MQ-2 Gas Reading */}
      <div
        onClick={() => onSelectSensor('GAS')}
        className={`scada-panel p-3 rounded-lg border transition-all cursor-pointer hover:border-scada-cyan/60 flex flex-col justify-between ${
          selectedSensor === 'GAS'
            ? 'border-scada-cyan ring-1 ring-scada-cyan/30'
            : telemetry.gasStatus === 'CRITICAL'
            ? 'border-rose-500/80 bg-rose-950/20'
            : telemetry.gasStatus === 'WARNING'
            ? 'border-amber-500/80 bg-amber-950/20'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">MQ-2 GAS</span>
          <Flame className="w-4 h-4 text-amber-400" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-white">
              {telemetry.gasAdc}
            </span>
            <span className="text-xs text-slate-400 font-mono">ADC</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {telemetry.gasMv} mV raw
          </div>
        </div>
        <div className="text-[10px] font-mono">
          <span
            className={`font-semibold ${
              telemetry.gasStatus === 'CRITICAL'
                ? 'text-rose-400'
                : telemetry.gasStatus === 'WARNING'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {telemetry.gasStatus} AIR
          </span>
        </div>
      </div>

      {/* 4. Temperature */}
      <div
        onClick={() => onSelectSensor('TEMPERATURE')}
        className={`scada-panel p-3 rounded-lg border transition-all cursor-pointer hover:border-scada-cyan/60 flex flex-col justify-between ${
          selectedSensor === 'TEMPERATURE'
            ? 'border-scada-cyan ring-1 ring-scada-cyan/30'
            : telemetry.temperatureStatus === 'CRITICAL'
            ? 'border-rose-500/80 bg-rose-950/20'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">TEMPERATURE</span>
          <Thermometer className="w-4 h-4 text-rose-400" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-white">
              {telemetry.temperatureC}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">DS18B20 Probe</div>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          Status: <span className="text-emerald-400">{telemetry.temperatureStatus}</span>
        </div>
      </div>

      {/* 5. Cover Status */}
      <div
        onClick={() => onSelectSensor('COVER')}
        className={`scada-panel p-3 rounded-lg border transition-all cursor-pointer hover:border-scada-cyan/60 flex flex-col justify-between ${
          selectedSensor === 'COVER'
            ? 'border-scada-cyan ring-1 ring-scada-cyan/30'
            : telemetry.coverState === 'OPEN'
            ? 'border-rose-500 bg-rose-950/30 animate-pulse'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">COVER TAMPER</span>
          <ShieldAlert className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg font-mono font-bold ${
                telemetry.coverState === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {telemetry.coverState}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">Reed Switch PB13</div>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          {telemetry.coverState === 'OPEN' ? (
            <span className="text-rose-400 font-bold">ALARM ACTIVE</span>
          ) : (
            <span className="text-emerald-400">SEALED NORMAL</span>
          )}
        </div>
      </div>

      {/* 6. Tilt & Motion */}
      <div
        onClick={() => onSelectSensor('ACCEL')}
        className={`scada-panel p-3 rounded-lg border transition-all cursor-pointer hover:border-scada-cyan/60 flex flex-col justify-between ${
          selectedSensor === 'ACCEL'
            ? 'border-scada-cyan ring-1 ring-scada-cyan/30'
            : telemetry.tiltStatus === 'CRITICAL'
            ? 'border-rose-500/80 bg-rose-950/20'
            : telemetry.tiltStatus === 'WARNING'
            ? 'border-amber-500/80 bg-amber-950/20'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">MPU6050 TILT</span>
          <Compass className="w-4 h-4 text-teal-400" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-white">
              {telemetry.tiltMagnitudeDeg}
            </span>
            <span className="text-xs text-slate-400 font-mono">°</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            P:{telemetry.tiltPitchDeg}° R:{telemetry.tiltRollDeg}°
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          {telemetry.tiltStatus === 'NORMAL' ? (
            <span className="text-emerald-400">STABLE</span>
          ) : (
            <span className="text-amber-400 font-bold">DISPLACED</span>
          )}
        </div>
      </div>

      {/* 7. Connection Status */}
      <div className="scada-panel p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono tracking-wider">TELEMETRY LINK</span>
          <Radio className="w-4 h-4 text-scada-blue" />
        </div>
        <div className="my-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-mono font-bold text-white">
              {telemetry.connectionStatus}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Source: {telemetry.telemetrySource}
          </div>
        </div>
        <div className="text-[10px] font-mono flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              telemetry.connectionStatus === 'CONNECTED' ||
              telemetry.connectionStatus === 'SIMULATED'
                ? 'bg-emerald-400'
                : 'bg-rose-500 animate-pulse'
            }`}
          />
          <span className="text-slate-300">
            {telemetry.connectionStatus === 'SIMULATED' ? 'Loopback 1.0s' : 'WebSocket'}
          </span>
        </div>
      </div>
    </div>
  );
};
