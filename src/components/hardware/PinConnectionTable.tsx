import { useState } from 'react';
import { WireConnection, CircuitComponent } from '../../types/circuit';
import { Search, Trash2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PinConnectionTableProps {
  wires: WireConnection[];
  components: CircuitComponent[];
  highlightedNetName: string | null;
  selectedWireId: string | null;
  onSelectWire: (wireId: string | null) => void;
  onSelectNet: (netName: string | null) => void;
  onDeleteWire: (wireId: string) => void;
}

export const PinConnectionTable = ({
  wires,
  components,
  highlightedNetName,
  selectedWireId,
  onSelectWire,
  onSelectNet,
  onDeleteWire,
}: PinConnectionTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getCompName = (id: string) => {
    return components.find((c) => c.id === id)?.name || id;
  };

  const getPinInfo = (compId: string, pinId: string) => {
    const comp = components.find((c) => c.id === compId);
    return comp?.pins.find((p) => p.id === pinId);
  };

  const filteredWires = wires.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fromCompName = getCompName(w.fromComponentId).toLowerCase();
    const toCompName = getCompName(w.toComponentId).toLowerCase();
    const net = (w.netName || '').toLowerCase();
    return (
      fromCompName.includes(term) ||
      toCompName.includes(term) ||
      w.fromPinId.toLowerCase().includes(term) ||
      w.toPinId.toLowerCase().includes(term) ||
      net.includes(term)
    );
  });

  return (
    <div className="scada-panel p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div>
          <h3 className="font-bold text-white tracking-wider flex items-center gap-2">
            <span>PIN CONNECTION DIRECTORY</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {wires.length} Total Connections
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Select any connection row to isolate in 3D workbench and schematic view
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-graphite-900 border border-slate-800 px-2.5 py-1 rounded-lg">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search pin, net, component..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none text-xs w-48 font-mono placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-graphite-900/60 sticky top-0 backdrop-blur-md">
              <th className="py-2 px-2.5">Color / Net</th>
              <th className="py-2 px-2.5">Source Pin</th>
              <th className="py-2 px-2.5">Target Pin</th>
              <th className="py-2 px-2.5">Signal Type</th>
              <th className="py-2 px-2.5">Voltage</th>
              <th className="py-2 px-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {filteredWires.map((wire) => {
              const fromPin = getPinInfo(wire.fromComponentId, wire.fromPinId);
              const toPin = getPinInfo(wire.toComponentId, wire.toPinId);
              const isSelected = selectedWireId === wire.id || wire.netName === highlightedNetName;

              return (
                <tr
                  key={wire.id}
                  onClick={() => {
                    onSelectWire(wire.id);
                    if (wire.netName) onSelectNet(wire.netName);
                  }}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 text-scada-cyan font-semibold border-l-2 border-scada-cyan'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-2.5 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: wire.color || '#38bdf8' }}
                    />
                    <span className="font-bold text-slate-200">
                      {wire.netName || wire.id}
                    </span>
                  </td>
                  <td className="py-2 px-2.5">
                    <div className="font-semibold text-white">{wire.fromPinId}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {getCompName(wire.fromComponentId)}
                    </div>
                  </td>
                  <td className="py-2 px-2.5">
                    <div className="font-semibold text-white">{wire.toPinId}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {getCompName(wire.toComponentId)}
                    </div>
                  </td>
                  <td className="py-2 px-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {fromPin?.signalType || 'GPIO'}
                    </span>
                  </td>
                  <td className="py-2 px-2.5">
                    <span
                      className={`text-[10px] font-bold ${
                        fromPin?.voltageLevel === 5
                          ? 'text-red-400'
                          : fromPin?.voltageLevel === 3.3
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {fromPin?.voltageLevel !== undefined ? `${fromPin.voltageLevel}V` : '3.3V'}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWire(wire.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Disconnect Wire"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
