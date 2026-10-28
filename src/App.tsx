import { useState, useEffect } from 'react';
import { telemetryProvider } from './services/telemetryProvider';
import { alarmManager } from './services/alarmManager';
import { TelemetryState, ChamberConfig, HistoricalTelemetryPoint } from './types/telemetry';
import { SystemAlarm } from './types/alarms';

// Component Pages
import { ManholeScene } from './components/manhole3d/ManholeScene';
import { SensorKpiCards } from './components/dashboard/SensorKpiCards';
import { TelemetryCharts } from './components/charts/TelemetryCharts';
import { AlarmPanel } from './components/dashboard/AlarmPanel';
import { SimulationControlPanel } from './components/dashboard/SimulationControlPanel';
import { SystemSettings } from './components/settings/SystemSettings';
import { HardwareLabPage } from './components/hardware/HardwareLabPage';

// Icons
import {
  Activity,
  Layers,
  LineChart,
  BellRing,
  Sliders,
  Settings,
  Cpu,
  Radio,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

export function App() {
  const [telemetry, setTelemetry] = useState<TelemetryState>(telemetryProvider.getState());
  const [history, setHistory] = useState<HistoricalTelemetryPoint[]>(telemetryProvider.getHistory());
  const [config, setConfig] = useState<ChamberConfig>(telemetryProvider.getConfig());
  const [alarms, setAlarms] = useState<SystemAlarm[]>(alarmManager.getAlarms());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'TELEMETRY' | 'ALARMS' | 'SIMULATION' | 'SETTINGS' | 'HARDWARE'
  >('OVERVIEW');

  // Interactive selected sensor (highlighted in 3D manhole and cards)
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  // Live ticking clock for header
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    // Clock tick
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    // Subscribe to central telemetry provider
    const unsubTelemetry = telemetryProvider.subscribe((state) => {
      setTelemetry(state);
    });

    // Subscribe to history
    const unsubHistory = telemetryProvider.subscribeHistory((pts) => {
      setHistory(pts);
    });

    // Subscribe to alarms
    const unsubAlarms = alarmManager.subscribe((alms) => {
      setAlarms(alms);
    });

    return () => {
      clearInterval(clockTimer);
      unsubTelemetry();
      unsubHistory();
      unsubAlarms();
    };
  }, []);

  const activeAlarmCount = alarms.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen bg-graphite-950 text-slate-200 flex flex-col font-sans scada-grid-bg">
      {/* ================= HEADER SECTION ================= */}
      <header className="sticky top-0 z-50 bg-graphite-900/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Application Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-scada-cyan to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/40 border border-cyan-400/30">
              <Activity className="w-6 h-6 text-graphite-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base md:text-lg font-black tracking-wider text-white">
                  SMART MANHOLE <span className="text-scada-cyan font-light">|</span> DIGITAL TWIN
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SCADA v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-wide">
                Real-Time Underground Infrastructure Monitoring System
              </p>
            </div>
          </div>

          {/* Right Status Indicators & Metadata */}
          <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400 bg-graphite-950/70 border border-slate-800/80 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentTimeStr}</span>
            </div>

            {/* Mode Indicator & Switcher */}
            <div className="flex items-center gap-1.5 bg-graphite-950 border border-slate-800 px-2.5 py-1 rounded-lg">
              <Radio className="w-3.5 h-3.5 text-scada-blue" />
              <span className="text-[11px] text-slate-400">Mode:</span>
              <button
                onClick={() =>
                  telemetryProvider.setMode(
                    telemetry.telemetrySource === 'SIMULATION' ? 'HARDWARE' : 'SIMULATION'
                  )
                }
                className="font-bold text-white hover:text-scada-cyan transition-colors"
                title="Click to toggle between Simulation and Physical Hardware WebSocket bridge"
              >
                {telemetry.telemetrySource}
              </button>
            </div>

            {/* Connection Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold text-[11px] ${
                telemetry.connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : telemetry.connectionStatus === 'SIMULATED'
                  ? 'bg-cyan-950/60 border-scada-cyan/40 text-scada-cyan'
                  : telemetry.connectionStatus === 'RECONNECTING'
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 animate-pulse'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  telemetry.connectionStatus === 'CONNECTED' ||
                  telemetry.connectionStatus === 'SIMULATED'
                    ? 'bg-emerald-400'
                    : 'bg-rose-500 animate-ping'
                }`}
              />
              <span>{telemetry.connectionStatus}</span>
            </div>

            {/* Alarm Notification Bell */}
            <button
              onClick={() => setActiveTab('ALARMS')}
              className={`relative p-2 rounded-lg border transition-all flex items-center justify-center ${
                activeAlarmCount > 0
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse shadow-lg shadow-rose-950/50'
                  : 'bg-graphite-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={`${activeAlarmCount} Active Alarms`}
            >
              <BellRing className="w-4 h-4" />
              {activeAlarmCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {activeAlarmCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between overflow-x-auto">
          <nav className="flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'OVERVIEW'
                  ? 'bg-scada-cyan text-graphite-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Overview Twin</span>
            </button>

            <button
              onClick={() => setActiveTab('TELEMETRY')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'TELEMETRY'
                  ? 'bg-scada-cyan text-graphite-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>2. Live Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('ALARMS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'ALARMS'
                  ? 'bg-scada-cyan text-graphite-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>3. Alarms &amp; Events</span>
              {activeAlarmCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {activeAlarmCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('SIMULATION')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'SIMULATION'
                  ? 'bg-scada-cyan text-graphite-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>4. Simulation Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'SETTINGS'
                  ? 'bg-scada-cyan text-graphite-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>5. System Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('HARDWARE')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'HARDWARE'
                  ? 'bg-scada-cyan text-graphite-950 font-bold shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>6. Hardware Lab</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 rounded">
                3D Workbench
              </span>
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>Chamber: {config.chamberDepthCm}cm</span>
            <span>•</span>
            <span
              className={
                telemetry.systemStatus === 'CRITICAL'
                  ? 'text-rose-400 font-bold'
                  : telemetry.systemStatus === 'WARNING'
                  ? 'text-amber-400 font-bold'
                  : 'text-emerald-400'
              }
            >
              System: {telemetry.systemStatus}
            </span>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* PAGE 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Sensor KPI Cards */}
            <SensorKpiCards
              telemetry={telemetry}
              selectedSensor={selectedSensor}
              onSelectSensor={(key) => setSelectedSensor(key === selectedSensor ? null : key)}
            />

            {/* Main Interactive 3D Manhole Twin */}
            <div className="w-full h-[540px]">
              <ManholeScene
                telemetry={telemetry}
                config={config}
                selectedSensor={selectedSensor}
                onSelectSensor={setSelectedSensor}
              />
            </div>

            {/* Quick Dual Panels: Simulation Quick Controls + Latest Alarms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SimulationControlPanel telemetry={telemetry} config={config} />
              <AlarmPanel alarms={alarms} />
            </div>
          </div>
        )}

        {/* PAGE 2: LIVE TELEMETRY */}
        {activeTab === 'TELEMETRY' && (
          <div className="space-y-4">
            <SensorKpiCards
              telemetry={telemetry}
              selectedSensor={selectedSensor}
              onSelectSensor={(key) => setSelectedSensor(key === selectedSensor ? null : key)}
            />

            <TelemetryCharts history={history} config={config} />

            {/* Rolling Telemetry Historical Log Table */}
            <div className="scada-panel p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white tracking-wider">
                  ROLLING TELEMETRY BUFFER (LAST 60 SAMPLES)
                </h3>
                <span className="text-[11px] text-slate-400">Sample Rate: 1.0 Hz</span>
              </div>
              <div className="overflow-x-auto max-h-60 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-1.5 px-2">Time</th>
                      <th className="py-1.5 px-2">Water (cm)</th>
                      <th className="py-1.5 px-2">Capacity (%)</th>
                      <th className="py-1.5 px-2">Temp (°C)</th>
                      <th className="py-1.5 px-2">Gas (ADC)</th>
                      <th className="py-1.5 px-2">Gas (mV)</th>
                      <th className="py-1.5 px-2">Tilt Mag (°)</th>
                      <th className="py-1.5 px-2">Pitch / Roll</th>
                      <th className="py-1.5 px-2">Cover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-[11px]">
                    {[...history].reverse().slice(0, 20).map((pt, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="py-1 px-2 text-slate-400">{pt.timeStr}</td>
                        <td className="py-1 px-2 font-bold text-white">{pt.waterDepthCm}</td>
                        <td className="py-1 px-2 text-scada-cyan">{pt.waterPercentage}%</td>
                        <td className="py-1 px-2 text-rose-300">{pt.temperatureC}</td>
                        <td className="py-1 px-2 text-amber-300">{pt.gasAdc}</td>
                        <td className="py-1 px-2 text-slate-400">{pt.gasMv}</td>
                        <td className="py-1 px-2 text-teal-300">{pt.tiltMagnitudeDeg}°</td>
                        <td className="py-1 px-2 text-slate-400">{pt.tiltPitchDeg}° / {pt.tiltRollDeg}°</td>
                        <td className="py-1 px-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              pt.coverOpen === 1
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950 text-emerald-300'
                            }`}
                          >
                            {pt.coverOpen === 1 ? 'OPEN' : 'CLOSED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: ALARMS & EVENTS */}
        {activeTab === 'ALARMS' && (
          <div className="space-y-4">
            <AlarmPanel alarms={alarms} />
          </div>
        )}

        {/* PAGE 4: SIMULATION LAB */}
        {activeTab === 'SIMULATION' && (
          <div className="space-y-4">
            <SensorKpiCards
              telemetry={telemetry}
              selectedSensor={selectedSensor}
              onSelectSensor={(key) => setSelectedSensor(key === selectedSensor ? null : key)}
            />
            <SimulationControlPanel telemetry={telemetry} config={config} />
            <div className="h-[460px]">
              <ManholeScene
                telemetry={telemetry}
                config={config}
                selectedSensor={selectedSensor}
                onSelectSensor={setSelectedSensor}
              />
            </div>
          </div>
        )}

        {/* PAGE 5: SYSTEM SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <SystemSettings config={config} onUpdateConfig={(newCfg) => setConfig(newCfg)} />
        )}

        {/* PAGE 6: HARDWARE LAB & 3D ELECTRONICS WORKBENCH */}
        {activeTab === 'HARDWARE' && (
          <HardwareLabPage
            telemetry={telemetry}
            onNavigateToTwin={(sensorKey) => {
              setSelectedSensor(sensorKey);
              setActiveTab('OVERVIEW');
            }}
          />
        )}
      </main>

      {/* ================= INDUSTRIAL FOOTER ================= */}
      <footer className="bg-graphite-950 border-t border-slate-800/80 px-4 py-3 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>STM32F103C8T6 + ESP32 Infrastructure SCADA Twin</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Sensors: HC-SR04, MQ-2, DS18B20, MPU6050, Reed Switch</span>
            <span>•</span>
            <span>Three.js + React Three Fiber + Drei</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
