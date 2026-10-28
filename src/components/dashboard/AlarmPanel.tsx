import { useState } from 'react';
import { SystemAlarm, AlarmSeverity } from '../../types/alarms';
import { alarmManager } from '../../services/alarmManager';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Trash2,
  BellRing,
  Filter,
} from 'lucide-react';

interface AlarmPanelProps {
  alarms: SystemAlarm[];
}

export const AlarmPanel = ({ alarms }: AlarmPanelProps) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [onlyActive, setOnlyActive] = useState<boolean>(false);

  const filtered = alarms.filter((a) => {
    if (onlyActive && !a.isActive) return false;
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const activeCount = alarms.filter((a) => a.isActive).length;

  return (
    <div className="scada-panel rounded-xl border border-slate-800 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wider flex items-center gap-2">
              SCADA ALARMS & INCIDENT LOG
              {activeCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-mono px-2 py-0.2 rounded-full font-bold">
                  {activeCount} ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic threshold event dispatch and acknowledgement log
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-graphite-900 border border-slate-800 p-1 rounded-lg text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-slate-300 border-none focus:outline-none pr-2 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="INFO">Info Only</option>
            </select>
          </div>

          <button
            onClick={() => setOnlyActive(!onlyActive)}
            className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all ${
              onlyActive
                ? 'bg-scada-cyan/20 border-scada-cyan text-scada-cyan font-semibold'
                : 'bg-graphite-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {onlyActive ? 'Showing Active' : 'All Events'}
          </button>

          <button
            onClick={() => alarmManager.acknowledgeAll()}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            Acknowledge All
          </button>
        </div>
      </div>

      {/* Alarm List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No alarm events matching active filter criteria.
          </div>
        ) : (
          filtered.map((alarm) => {
            const isCrit = alarm.severity === 'CRITICAL';
            const isWarn = alarm.severity === 'WARNING';

            return (
              <div
                key={alarm.id}
                className={`p-3 rounded-lg border transition-all font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  alarm.isActive
                    ? isCrit
                      ? 'bg-rose-950/25 border-rose-500/60 ring-1 ring-rose-500/20'
                      : isWarn
                      ? 'bg-amber-950/25 border-amber-500/60'
                      : 'bg-blue-950/20 border-blue-500/40'
                    : 'bg-graphite-900/60 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5">
                    {isCrit ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-semibold">
                        [{alarm.timeFormatted}]
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                          isCrit
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                            : isWarn
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {alarm.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                        {alarm.sensor}
                      </span>
                      {alarm.isActive ? (
                        <span className="text-[10px] text-rose-400 font-bold bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800">
                          ACTIVE ALARM
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-900">
                          CLEARED
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-white text-xs mb-0.5">
                      {alarm.title}
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">
                      {alarm.message}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Reading: <span className="text-slate-200 font-bold">{alarm.value}</span> | Limit: {alarm.threshold}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!alarm.isAcknowledged ? (
                    <button
                      onClick={() => alarmManager.acknowledgeAlarm(alarm.id)}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>ACK</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ACKED</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
