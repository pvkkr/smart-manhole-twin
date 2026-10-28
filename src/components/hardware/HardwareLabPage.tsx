import { useState, useMemo } from 'react';
import {
  WORKBENCH_COMPONENTS,
  DEFAULT_SMART_MANHOLE_WIRES,
} from '../../config/circuitData';
import { WireConnection, CircuitComponent } from '../../types/circuit';
import { circuitValidator } from '../../services/circuitValidator';
import { Workbench3D } from './Workbench3D';
import { SchematicView } from './SchematicView';
import { PinConnectionTable } from './PinConnectionTable';
import { TelemetryState } from '../../types/telemetry';
import {
  Cpu,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Sliders,
  Layers,
  FileCode,
  Trash2,
  Sparkles,
  Palette,
  ExternalLink,
} from 'lucide-react';

interface HardwareLabPageProps {
  telemetry: TelemetryState;
  onNavigateToTwin?: (sensorKey: string) => void;
}

export const HardwareLabPage = ({
  telemetry,
  onNavigateToTwin,
}: HardwareLabPageProps) => {
  const [components] = useState<CircuitComponent[]>(WORKBENCH_COMPONENTS);
  const [wires, setWires] = useState<WireConnection[]>(DEFAULT_SMART_MANHOLE_WIRES);

  // View mode switcher: 3D Workbench, 2D Schematic, Pin Table, or Split
  const [activeView, setActiveView] = useState<'3D' | 'SCHEMATIC' | 'TABLE' | 'ALL'>('ALL');

  // Interactive selection state
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('stm32');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [highlightedNetName, setHighlightedNetName] = useState<string | null>(null);

  // Pin-to-pin wiring in progress
  const [wiringSourcePin, setWiringSourcePin] = useState<{
    componentId: string;
    pinId: string;
  } | null>(null);
  const [wireColor, setWireColor] = useState<string>('#00f0ff');

  // Electrical Validation Report
  const validationReport = useMemo(() => {
    return circuitValidator.validateCircuit(components, wires);
  }, [components, wires]);

  // Load default smart manhole circuit
  const handleLoadDefaultCircuit = () => {
    setWires([...DEFAULT_SMART_MANHOLE_WIRES]);
    setSelectedWireId(null);
    setHighlightedNetName(null);
    setWiringSourcePin(null);
  };

  // Clear all wires
  const handleClearAllWires = () => {
    setWires([]);
    setSelectedWireId(null);
    setHighlightedNetName(null);
    setWiringSourcePin(null);
  };

  // Pin selection logic: handle interactive wiring
  const handleSelectPin = (componentId: string, pinId: string) => {
    setSelectedComponentId(componentId);
    setSelectedPinId(pinId);

    if (!wiringSourcePin) {
      // Start wiring from this pin
      setWiringSourcePin({ componentId, pinId });
    } else {
      // If clicking same pin, cancel wiring
      if (wiringSourcePin.componentId === componentId && wiringSourcePin.pinId === pinId) {
        setWiringSourcePin(null);
        return;
      }

      // Check if wire already exists between these two pins
      const alreadyExists = wires.some(
        (w) =>
          (w.fromComponentId === wiringSourcePin.componentId &&
            w.fromPinId === wiringSourcePin.pinId &&
            w.toComponentId === componentId &&
            w.toPinId === pinId) ||
          (w.fromComponentId === componentId &&
            w.fromPinId === pinId &&
            w.toComponentId === wiringSourcePin.componentId &&
            w.toPinId === wiringSourcePin.pinId)
      );

      if (!alreadyExists) {
        const newWire: WireConnection = {
          id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fromComponentId: wiringSourcePin.componentId,
          fromPinId: wiringSourcePin.pinId,
          toComponentId: componentId,
          toPinId: pinId,
          color: wireColor,
          netName: `NET_${wiringSourcePin.pinId}_${pinId}`,
        };
        setWires((prev) => [...prev, newWire]);
      }

      setWiringSourcePin(null);
    }
  };

  // Delete selected wire
  const handleDeleteSelectedWire = () => {
    if (selectedWireId) {
      setWires((prev) => prev.filter((w) => w.id !== selectedWireId));
      setSelectedWireId(null);
    }
  };

  const selectedComp = components.find((c) => c.id === selectedComponentId);
  const selectedPin = selectedComp?.pins.find((p) => p.id === selectedPinId);

  return (
    <div className="space-y-4 font-mono">
      {/* Top Action Bar */}
      <div className="scada-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-scada-cyan/10 border border-scada-cyan/30 text-scada-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
              HARDWARE LAB &amp; 3D ELECTRONICS WORKBENCH
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PROTOTYPING SUITE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 3D breadboard wiring, netlist validation engine, and live sensor digital-twin coupling
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadDefaultCircuit}
            className="px-3 py-1.5 bg-scada-cyan/20 hover:bg-scada-cyan/30 text-scada-cyan border border-scada-cyan/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Smart Manhole Circuit</span>
          </button>

          <button
            onClick={handleClearAllWires}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wires</span>
          </button>

          {/* Wire Color Chooser */}
          <div className="flex items-center gap-1 bg-graphite-900 border border-slate-800 px-2 py-1 rounded-lg">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            {['#00f0ff', '#ef4444', '#f59e0b', '#10b981', '#a855f7', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setWireColor(c)}
                style={{ backgroundColor: c }}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  wireColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                title={`Select wire color ${c}`}
              />
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-graphite-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveView('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeView === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setActiveView('3D')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeView === '3D' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Only
            </button>
            <button
              onClick={() => setActiveView('SCHEMATIC')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeView === 'SCHEMATIC' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Schematic
            </button>
            <button
              onClick={() => setActiveView('TABLE')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeView === 'TABLE' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pin Table
            </button>
          </div>
        </div>
      </div>

      {/* Electrical Validation Status Banner */}
      <div
        className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          validationReport.errorCount > 0
            ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
            : validationReport.warningCount > 0
            ? 'bg-amber-950/40 border-amber-500/60 text-amber-300'
            : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {validationReport.errorCount > 0 ? (
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
          ) : validationReport.warningCount > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>CIRCUIT VALIDATION:</span>
              <span>
                {validationReport.errorCount === 0
                  ? 'NO FATAL SHORT CIRCUITS OR OVERVOLTAGES'
                  : `${validationReport.errorCount} CRITICAL WIRING ERRORS DETECTED`}
              </span>
            </div>
            <div className="text-[11px] opacity-85">
              {validationReport.connectedNetsCount} connected electrical nets | {wires.length} wires |{' '}
              {validationReport.unconnectedRequiredPins.length} floating power pins
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
            {validationReport.errorCount} ERRORS
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            {validationReport.warningCount} WARNINGS
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
            {validationReport.infoCount} NOTES
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 3D Workbench / Views */}
        <div className={`space-y-4 ${activeView === 'ALL' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {(activeView === 'ALL' || activeView === '3D') && (
            <Workbench3D
              components={components}
              wires={wires}
              selectedComponentId={selectedComponentId}
              selectedPinId={selectedPinId}
              selectedWireId={selectedWireId}
              highlightedNetName={highlightedNetName}
              wiringSourcePin={wiringSourcePin}
              onSelectComponent={(id) => {
                setSelectedComponentId(id);
                setSelectedPinId(null);
              }}
              onSelectPin={handleSelectPin}
              onSelectWire={(id) => setSelectedWireId(id)}
              onDeleteSelectedWire={handleDeleteSelectedWire}
            />
          )}

          {(activeView === 'ALL' || activeView === 'SCHEMATIC') && (
            <SchematicView
              wires={wires}
              highlightedNetName={highlightedNetName}
              onSelectNet={(net) => setHighlightedNetName(net)}
            />
          )}

          {(activeView === 'ALL' || activeView === 'TABLE') && (
            <PinConnectionTable
              wires={wires}
              components={components}
              highlightedNetName={highlightedNetName}
              selectedWireId={selectedWireId}
              onSelectWire={(id) => setSelectedWireId(id)}
              onSelectNet={(net) => setHighlightedNetName(net)}
              onDeleteWire={(id) => setWires((prev) => prev.filter((w) => w.id !== id))}
            />
          )}
        </div>

        {/* Right Column: Component Inspector, Validation Issues, & Twin Linking */}
        {activeView === 'ALL' && (
          <div className="lg:col-span-4 space-y-4">
            {/* Component Inspector */}
            {selectedComp ? (
              <div className="scada-panel p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-scada-cyan" />
                    <h3 className="font-bold text-white uppercase tracking-wider">{selectedComp.name}</h3>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {selectedComp.category}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Model:</strong> {selectedComp.modelNumber}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{selectedComp.description}</p>

                {/* Datasheet Snippet */}
                <div className="p-2.5 rounded bg-graphite-950 border border-slate-800/80 text-[10px] text-slate-400">
                  <strong className="text-amber-400 block mb-0.5">Datasheet Electrical Limit:</strong>
                  {selectedComp.datasheetSnippet}
                </div>

                {/* Live Digital Twin Telemetry Link */}
                {selectedComp.associatedSensorKey && (
                  <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-scada-cyan font-bold text-[11px] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-scada-cyan animate-ping" />
                        Live Digital Twin Metric:
                      </span>
                      {onNavigateToTwin && (
                        <button
                          onClick={() => onNavigateToTwin(selectedComp.associatedSensorKey!)}
                          className="text-[10px] text-cyan-300 hover:text-white flex items-center gap-1"
                        >
                          <span>Highlight in 3D</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {selectedComp.associatedSensorKey === 'ULTRASONIC' && (
                      <div className="text-white font-bold text-sm">
                        Distance: {telemetry.ultrasonicDistanceCm} cm (Water: {telemetry.waterDepthCm} cm)
                      </div>
                    )}
                    {selectedComp.associatedSensorKey === 'GAS' && (
                      <div className="text-white font-bold text-sm">
                        Raw ADC: {telemetry.gasAdc} ({telemetry.gasMv} mV) [{telemetry.gasStatus}]
                      </div>
                    )}
                    {selectedComp.associatedSensorKey === 'TEMPERATURE' && (
                      <div className="text-white font-bold text-sm">
                        Temperature: {telemetry.temperatureC} °C [{telemetry.temperatureStatus}]
                      </div>
                    )}
                    {selectedComp.associatedSensorKey === 'COVER' && (
                      <div className="text-white font-bold text-sm">
                        Cover State: {telemetry.coverState}
                      </div>
                    )}
                    {selectedComp.associatedSensorKey === 'ACCEL' && (
                      <div className="text-white font-bold text-sm">
                        Tilt: {telemetry.tiltMagnitudeDeg}° (P:{telemetry.tiltPitchDeg}° R:{telemetry.tiltRollDeg}°)
                      </div>
                    )}
                  </div>
                )}

                {/* Component Pin Listing */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Exposed Pins ({selectedComp.pins.length}):
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {selectedComp.pins.map((pin) => {
                      const isPinSelected = selectedPinId === pin.id;
                      const isSource =
                        wiringSourcePin?.componentId === selectedComp.id &&
                        wiringSourcePin?.pinId === pin.id;

                      return (
                        <div
                          key={pin.id}
                          onClick={() => handleSelectPin(selectedComp.id, pin.id)}
                          className={`p-1.5 rounded cursor-pointer transition-colors border text-[11px] flex items-center justify-between ${
                            isSource
                              ? 'bg-cyan-950 border-scada-cyan text-scada-cyan font-bold ring-1 ring-scada-cyan'
                              : isPinSelected
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-graphite-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{pin.id}</span>
                            <span className="text-[10px] text-slate-400">({pin.name})</span>
                          </div>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                              pin.voltageLevel === 5
                                ? 'bg-red-950 text-red-300'
                                : pin.voltageLevel === 3.3
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {pin.voltageLevel}V {pin.signalType}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="scada-panel p-4 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                Click any component in the 3D Workbench to inspect its pins and electrical limits.
              </div>
            )}

            {/* Validation Rule Diagnostics Card */}
            <div className="scada-panel p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <h3 className="font-bold text-white tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <FileCode className="w-4 h-4 text-scada-cyan" />
                <span>Electrical Validation Diagnostics</span>
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {validationReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                      issue.severity === 'ERROR'
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                        : issue.severity === 'WARNING'
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                        : 'bg-blue-950/30 border-blue-500/50 text-blue-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {issue.severity === 'ERROR' ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      ) : issue.severity === 'WARNING' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span>{issue.title}</span>
                    </div>
                    <p className="text-slate-300 leading-snug">{issue.description}</p>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      <strong className="text-white">Fix:</strong> {issue.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
