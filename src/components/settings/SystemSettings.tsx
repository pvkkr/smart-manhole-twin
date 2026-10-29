import { useState, useEffect } from 'react';
import { ChamberConfig } from '../../types/telemetry';
import { telemetryProvider } from '../../services/telemetryProvider';
import { DEFAULT_CHAMBER_CONFIG } from '../../config/chamber';
import {
  Save,
  RotateCcw,
  Sliders,
  Cpu,
  Wifi,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface SystemSettingsProps {
  config: ChamberConfig;
  onUpdateConfig: (newConfig: ChamberConfig) => void;
}

export const SystemSettings = ({ config, onUpdateConfig }: SystemSettingsProps) => {
  const [formData, setFormData] = useState<ChamberConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'THRESHOLDS' | 'HARDWARE' | 'DOCS'>('THRESHOLDS');

  useEffect(() => {
    setFormData({ ...config });
  }, [config]);

  const handleChange = (field: keyof ChamberConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    telemetryProvider.updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_CHAMBER_CONFIG });
    onUpdateConfig(DEFAULT_CHAMBER_CONFIG);
    telemetryProvider.updateConfig(DEFAULT_CHAMBER_CONFIG);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Tab Navigation */}
      <div className="scada-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-mono font-bold text-white tracking-wider">
            SCADA SYSTEM CONFIGURATION & HARDWARE PARAMETERS
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Calibrate physical chamber metrics, alarm thresholds, and network bridge bindings
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-graphite-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('THRESHOLDS')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              activeTab === 'THRESHOLDS'
                ? 'bg-scada-cyan/20 text-scada-cyan font-semibold border border-scada-cyan/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical &amp; Thresholds
          </button>
          <button
            onClick={() => setActiveTab('HARDWARE')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              activeTab === 'HARDWARE'
                ? 'bg-scada-cyan/20 text-scada-cyan font-semibold border border-scada-cyan/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ThingSpeak &amp; WebSocket
          </button>
          <button
            onClick={() => setActiveTab('DOCS')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              activeTab === 'DOCS'
                ? 'bg-scada-cyan/20 text-scada-cyan font-semibold border border-scada-cyan/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Payload Spec
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-4 py-2.5 rounded-lg font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration parameters persisted successfully. Telemetry provider re-synchronized.</span>
        </div>
      )}

      {/* Tab 1: Physical & Thresholds */}
      {activeTab === 'THRESHOLDS' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="scada-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-scada-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Underground Chamber Dimensions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Chamber Depth (sensor to bottom in cm):</label>
                <input
                  type="number"
                  value={formData.chamberDepthCm}
                  onChange={(e) => handleChange('chamberDepthCm', Number(e.target.value))}
                  className="w-full bg-graphite-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-scada-cyan focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Standard deep inspection manhole: 150 cm</span>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Chamber Riser Diameter (cm):</label>
                <input
                  type="number"
                  value={formData.chamberDiameterCm}
                  onChange={(e) => handleChange('chamberDiameterCm', Number(e.target.value))}
                  className="w-full bg-graphite-900 border border-slate-700 rounded p-2 text-white font-mono focus:border-scada-cyan focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Standard concrete collar: 90 cm</span>
              </div>
            </div>
          </div>

          <div className="scada-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-scada-cyan uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Alarm Trigger Thresholds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              {/* Water */}
              <div className="bg-graphite-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <span className="font-bold text-blue-400">Water Capacity Limits</span>
                <div>
                  <label className="text-slate-400 text-[11px] block">Warning (% capacity):</label>
                  <input
                    type="number"
                    value={formData.waterWarningPercentage}
                    onChange={(e) => handleChange('waterWarningPercentage', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Critical (% capacity):</label>
                  <input
                    type="number"
                    value={formData.waterCriticalPercentage}
                    onChange={(e) => handleChange('waterCriticalPercentage', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Gas */}
              <div className="bg-graphite-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <span className="font-bold text-amber-400">MQ-2 Gas Limits</span>
                <div>
                  <label className="text-slate-400 text-[11px] block">Warning (Raw ADC):</label>
                  <input
                    type="number"
                    value={formData.gasWarningAdc}
                    onChange={(e) => handleChange('gasWarningAdc', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Critical (Raw ADC):</label>
                  <input
                    type="number"
                    value={formData.gasCriticalAdc}
                    onChange={(e) => handleChange('gasCriticalAdc', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-graphite-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <span className="font-bold text-rose-400">Temperature Limits</span>
                <div>
                  <label className="text-slate-400 text-[11px] block">Warning (°C):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={formData.tempWarningC}
                    onChange={(e) => handleChange('tempWarningC', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Critical (°C):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={formData.tempCriticalC}
                    onChange={(e) => handleChange('tempCriticalC', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Tilt */}
              <div className="bg-graphite-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <span className="font-bold text-teal-400">MPU6050 Tilt Limits</span>
                <div>
                  <label className="text-slate-400 text-[11px] block">Warning (° angle):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={formData.tiltWarningDeg}
                    onChange={(e) => handleChange('tiltWarningDeg', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Critical (° angle):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={formData.tiltCriticalDeg}
                    onChange={(e) => handleChange('tiltCriticalDeg', Number(e.target.value))}
                    className="w-full bg-graphite-900 border border-slate-700 rounded p-1.5 text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-scada-cyan text-graphite-950 hover:bg-cyan-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/50"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Apply</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Hardware & Cloud Bridge */}
      {activeTab === 'HARDWARE' && (
        <div className="scada-panel p-5 rounded-xl border border-slate-800 space-y-6 font-mono text-xs">
          {/* ThingSpeak Cloud Section */}
          <div className="bg-graphite-900/90 border border-scada-cyan/30 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-scada-cyan" />
                  <span>ThingSpeak Cloud Bridge (Recommended for GitHub Pages)</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  100% pure HTTPS link. Streams telemetry from NodeMCU directly to your deployed website anywhere in the world!
                </p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded font-bold">
                NO MIXED CONTENT ISSUES
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">ThingSpeak Channel ID:</label>
                <input
                  type="text"
                  value={formData.thingspeakChannelId || ''}
                  onChange={(e) => handleChange('thingspeakChannelId', e.target.value)}
                  className="w-full bg-graphite-950 border border-slate-700 rounded p-2 text-white font-mono focus:border-scada-cyan focus:outline-none"
                  placeholder="e.g. 2489123"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Found on your ThingSpeak Channel overview page.
                </span>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">Read API Key (Optional if Public):</label>
                <input
                  type="text"
                  value={formData.thingspeakReadApiKey || ''}
                  onChange={(e) => handleChange('thingspeakReadApiKey', e.target.value)}
                  className="w-full bg-graphite-950 border border-slate-700 rounded p-2 text-white font-mono focus:border-scada-cyan focus:outline-none"
                  placeholder="e.g. A9B8C7D6E5F4G3H2"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Found under "API Keys" on ThingSpeak. Leave blank if channel is public.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig(formData);
                  telemetryProvider.updateConfig(formData);
                  telemetryProvider.setMode('THINGSPEAK');
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-4 py-2 bg-scada-cyan/20 hover:bg-scada-cyan/30 text-scada-cyan border border-scada-cyan/50 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/40"
              >
                <Wifi className="w-4 h-4" />
                <span>Save &amp; Switch to ThingSpeak Cloud</span>
              </button>
            </div>

            <div className="bg-graphite-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-200">ThingSpeak Field Mapping:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                <div>• Field 1: Distance (cm)</div>
                <div>• Field 2: Gas (Raw ADC)</div>
                <div>• Field 3: Temp (°C)</div>
                <div>• Field 4: Tilt Angle (deg)</div>
                <div>• Field 5: Cover Open (0/1)</div>
                <div>• Field 6: System Status</div>
              </div>
            </div>
          </div>

          {/* Local WebSocket Section */}
          <div className="bg-graphite-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-scada-blue" />
                <span>Local Direct WebSocket Link (LAN / SoftAP)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Low-latency ~100ms connection via NodeMCU Wi-Fi access point or local network
              </p>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">Telemetry WebSocket Endpoint URL:</label>
              <input
                type="text"
                value={formData.hardwareWsUrl}
                onChange={(e) => handleChange('hardwareWsUrl', e.target.value)}
                className="w-full bg-graphite-950 border border-slate-700 rounded p-2 text-white font-mono focus:border-scada-cyan focus:outline-none"
                placeholder="ws://192.168.4.1:81/telemetry"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard format: ws://[NODEMCU_IP]:[PORT]/[ROUTE]. Default SoftAP is ws://192.168.4.1:81/telemetry.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  onUpdateConfig(formData);
                  telemetryProvider.updateConfig(formData);
                  telemetryProvider.setMode('HARDWARE');
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-4 py-2 bg-scada-blue/20 hover:bg-scada-blue/30 text-scada-blue border border-scada-blue/50 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Cpu className="w-4 h-4" />
                <span>Save &amp; Switch to Direct WebSocket</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  telemetryProvider.setMode('SIMULATION');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 transition-colors"
              >
                <span>Switch to Simulation Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Documentation & Payload Spec */}
      {activeTab === 'DOCS' && (
        <div className="scada-panel p-5 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-scada-cyan" />
              <span>Standard Telemetry JSON Wire Format</span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              Emitted by ESP32 Gateway firmware over WebSocket at 1.0Hz
            </p>
          </div>

          <pre className="bg-graphite-950 p-4 rounded-lg border border-slate-800 text-scada-cyan overflow-x-auto text-[11px] leading-relaxed">
{`{
  "distance_cm": 8.5,            // HC-SR04 ultrasonic measured distance to liquid
  "distance_valid": 1,           // 1 = valid echo, 0 = sensor lost / out of bounds
  "temperature_x100": 2950,      // DS18B20 1-Wire integer fixed-point (2950 = 29.50 °C)
  "temperature_valid": 1,        // 1 = valid CRC checksum, 0 = bus error
  "gas_adc": 636,                // Raw analog ADC value (0-4095)
  "gas_mv": 512,                 // Conditioned millivolts (0-3300 mV)
  "cover": "COVER OPEN",         // Reed switch tamper state ("COVER OPEN" | "COVER CLOSED")
  "accel_valid": 1,              // MPU6050 I2C bus state (1 = valid, 0 = bus fault)
  "accel_x_mg": 10,              // Acceleration X axis in milli-g
  "accel_y_mg": -6,              // Acceleration Y axis in milli-g
  "accel_z_mg": 1013,            // Acceleration Z axis in milli-g (~1000mg static gravity)
  "status": "CRITICAL"           // Optional firmware-level pre-evaluated status
}`}
          </pre>

          <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Field Calculation Formulas</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-white">Water Depth:</strong> <code className="text-scada-cyan">water_depth_cm = chamber_depth_cm - distance_cm</code></li>
              <li><strong className="text-white">Capacity %:</strong> <code className="text-scada-cyan">water_percentage = (water_depth_cm / chamber_depth_cm) * 100</code></li>
              <li><strong className="text-white">Temperature:</strong> <code className="text-scada-cyan">temp_c = temperature_x100 / 100</code></li>
              <li><strong className="text-white">MPU6050 Pitch &amp; Roll:</strong> Trigonometric static inclination derived from <code className="text-scada-cyan">atan2(ay, sqrt(ax^2 + az^2))</code>. Acceleration values in mg are strictly preserved as acceleration measurements, not raw degrees.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
