import { useState } from 'react';
import {
  simulationEngine,
  SimulationScenario,
} from '../../services/simulationEngine';
import { TelemetryState, ChamberConfig } from '../../types/telemetry';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CloudRain,
  Flame,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert,
  ThermometerSnowflake,
  Activity,
} from 'lucide-react';

interface SimulationControlPanelProps {
  telemetry: TelemetryState;
  config: ChamberConfig;
}

export const SimulationControlPanel = ({
  telemetry,
  config,
}: SimulationControlPanelProps) => {
  const isRunning = simulationEngine.getIsRunning();
  const currentScenario = simulationEngine.getScenario();

  return (
    <div className="scada-panel rounded-xl border border-slate-800 p-4 space-y-4">
      {/* Header and Master Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-scada-cyan/10 border border-scada-cyan/30 text-scada-cyan">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wider">
              SIMULATION ENGINE & SCENARIO LAB
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic IoT physics simulation and manual fault injection
            </p>
          </div>
        </div>

        {/* Master Run/Pause/Reset */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => simulationEngine.pause()}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE SIM</span>
            </button>
          ) : (
            <button
              onClick={() => simulationEngine.resume()}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>RESUME SIM</span>
            </button>
          )}

          <button
            onClick={() => simulationEngine.reset()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Scenario Presets Grid */}
      <div>
        <label className="text-[11px] font-mono text-slate-400 font-bold block mb-2 uppercase tracking-wider">
          Predefined Incident Scenarios
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => simulationEngine.setScenario('NORMAL_BASELINE')}
            className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
              currentScenario === 'NORMAL_BASELINE'
                ? 'bg-scada-cyan/20 border-scada-cyan text-white shadow-md ring-1 ring-scada-cyan/30'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Normal Base</span>
            </div>
            <div className="text-[10px] text-slate-400">Dry sewer, safe air</div>
          </button>

          <button
            onClick={() => simulationEngine.setScenario('SLOW_RISE_RAIN')}
            className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
              currentScenario === 'SLOW_RISE_RAIN'
                ? 'bg-scada-cyan/20 border-scada-cyan text-white shadow-md ring-1 ring-scada-cyan/30'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Storm Water</span>
            </div>
            <div className="text-[10px] text-slate-400">Slow rise to 55%</div>
          </button>

          <button
            onClick={() => simulationEngine.setScenario('FLASH_FLOOD')}
            className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
              currentScenario === 'FLASH_FLOOD'
                ? 'bg-rose-950/60 border-rose-500 text-white shadow-md ring-1 ring-rose-500/30'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>3. Flash Flood</span>
            </div>
            <div className="text-[10px] text-slate-400">Rapid rise &gt;80%</div>
          </button>

          <button
            onClick={() => simulationEngine.setScenario('GAS_ACCUMULATION')}
            className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
              currentScenario === 'GAS_ACCUMULATION'
                ? 'bg-amber-950/60 border-amber-500 text-white shadow-md ring-1 ring-amber-500/30'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>4. Toxic Gas</span>
            </div>
            <div className="text-[10px] text-slate-400">MQ-2 spike &gt;2500</div>
          </button>

          <button
            onClick={() => simulationEngine.setScenario('COVER_TAMPER')}
            className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
              currentScenario === 'COVER_TAMPER'
                ? 'bg-rose-950/60 border-rose-500 text-white shadow-md ring-1 ring-rose-500/30'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
              <span>5. Cover Tamper</span>
            </div>
            <div className="text-[10px] text-slate-400">Lid opened &amp; tilted</div>
          </button>

          <button
            onClick={() => simulationEngine.setScenario('HIGH_HEAT')}
            className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
              currentScenario === 'HIGH_HEAT'
                ? 'bg-rose-950/60 border-rose-500 text-white shadow-md ring-1 ring-rose-500/30'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-rose-400" />
              <span>6. High Heat</span>
            </div>
            <div className="text-[10px] text-slate-400">Temp climbs &gt;50°C</div>
          </button>
        </div>
      </div>

      {/* Manual Sliders & Overrides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-graphite-950/60 p-3.5 rounded-lg border border-slate-800/80 font-mono text-xs">
        {/* Water Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Water Depth:</span>
            <span className="text-scada-cyan font-bold">{telemetry.waterDepthCm} cm</span>
          </div>
          <input
            type="range"
            min={0}
            max={config.chamberDepthCm}
            step={1}
            value={telemetry.waterDepthCm}
            onChange={(e) => simulationEngine.setManualWaterDepth(Number(e.target.value))}
            className="w-full accent-scada-cyan cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 cm (Dry)</span>
            <span>{config.chamberDepthCm} cm (Full)</span>
          </div>
        </div>

        {/* Gas ADC Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">MQ-2 Gas ADC:</span>
            <span className="text-amber-400 font-bold">{telemetry.gasAdc}</span>
          </div>
          <input
            type="range"
            min={100}
            max={4000}
            step={20}
            value={telemetry.gasAdc}
            onChange={(e) => simulationEngine.setManualGasAdc(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>100 (Clean)</span>
            <span>4000 (Hazard)</span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Temperature:</span>
            <span className="text-rose-400 font-bold">{telemetry.temperatureC} °C</span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            step={0.5}
            value={telemetry.temperatureC}
            onChange={(e) => simulationEngine.setManualTemperature(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 °C</span>
            <span>80 °C (Critical)</span>
          </div>
        </div>

        {/* Cover Toggle & Tilt */}
        <div className="space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Cover State:</span>
            <button
              onClick={() => simulationEngine.setManualCoverState(telemetry.coverState !== 'OPEN')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                telemetry.coverState === 'OPEN'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-emerald-700 text-white'
              }`}
            >
              {telemetry.coverState === 'OPEN' ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>OPEN</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>SEALED</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Tilt Pitch:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => simulationEngine.setManualTilt(Math.max(-30, telemetry.tiltPitchDeg - 5), telemetry.tiltRollDeg)}
                className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                -5°
              </button>
              <span className="text-white font-bold w-10 text-center">{telemetry.tiltPitchDeg}°</span>
              <button
                onClick={() => simulationEngine.setManualTilt(Math.min(45, telemetry.tiltPitchDeg + 5), telemetry.tiltRollDeg)}
                className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                +5°
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
