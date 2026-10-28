import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { HistoricalTelemetryPoint, ChamberConfig } from '../../types/telemetry';

interface TelemetryChartsProps {
  history: HistoricalTelemetryPoint[];
  config: ChamberConfig;
}

export const TelemetryCharts = ({ history, config }: TelemetryChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Water Level Chart */}
      <div className="scada-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider">
              WATER LEVEL & FLOOD STAGE (CM)
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Chamber Depth: {config.chamberDepthCm}cm | Warn: {config.waterWarningPercentage}% | Crit: {config.waterCriticalPercentage}%
            </p>
          </div>
          <span className="text-xs font-mono text-scada-cyan bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            {history[history.length - 1]?.waterDepthCm || 0} cm
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, config.chamberDepthCm]} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <ReferenceLine
                y={(config.chamberDepthCm * config.waterWarningPercentage) / 100}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'WARN', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={(config.chamberDepthCm * config.waterCriticalPercentage) / 100}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{ value: 'CRIT', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="waterDepthCm"
                name="Water (cm)"
                stroke="#00f0ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#waterGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Gas Reading Chart */}
      <div className="scada-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider">
              MQ-2 TOXIC / COMBUSTIBLE GAS SENSOR (RAW ADC)
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Warn: {config.gasWarningAdc} ADC | Crit: {config.gasCriticalAdc} ADC
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            {history[history.length - 1]?.gasAdc || 0} ADC
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 4095]} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <ReferenceLine
                y={config.gasWarningAdc}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'WARN', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={config.gasCriticalAdc}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{ value: 'CRIT', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="gasAdc"
                name="Gas (ADC)"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gasGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Temperature Chart */}
      <div className="scada-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider">
              UNDERGROUND TEMPERATURE (°C)
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Sensor: DS18B20 1-Wire | Warn: {config.tempWarningC}°C | Crit: {config.tempCriticalC}°C
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
            {history[history.length - 1]?.temperatureC || 0} °C
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <ReferenceLine
                y={config.tempWarningC}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'WARN', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="temperatureC"
                name="Temp (°C)"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. MPU6050 Tilt Dynamics Chart */}
      <div className="scada-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 tracking-wider">
              COVER TILT & INCLINATION DYNAMICS (DEGREES)
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              MPU6050 6-DoF | Warn: {config.tiltWarningDeg}° | Crit: {config.tiltCriticalDeg}°
            </p>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40">
            {history[history.length - 1]?.tiltMagnitudeDeg || 0}° tilt
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="timeStr" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 45]} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <ReferenceLine
                y={config.tiltWarningDeg}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'WARN', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
              <Line
                type="monotone"
                dataKey="tiltMagnitudeDeg"
                name="Tilt Mag (°)"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="tiltPitchDeg"
                name="Pitch (°)"
                stroke="#38bdf8"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="tiltRollDeg"
                name="Roll (°)"
                stroke="#c084fc"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
