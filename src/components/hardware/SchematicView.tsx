import { WireConnection } from '../../types/circuit';
import { WORKBENCH_COMPONENTS } from '../../config/circuitData';

interface SchematicViewProps {
  wires: WireConnection[];
  highlightedNetName: string | null;
  onSelectNet: (netName: string | null) => void;
}

export const SchematicView = ({
  wires,
  highlightedNetName,
  onSelectNet,
}: SchematicViewProps) => {
  // Predefined electrical nets for schematic representation
  const NET_COLORS: Record<string, string> = {
    '5V_BUS': '#ef4444',
    '3V3_BUS': '#f59e0b',
    'GND': '#475569',
    'US_TRIG': '#06b6d4',
    'US_ECHO_5V': '#8b5cf6',
    'US_ECHO_3V3': '#00f0ff',
    'GAS_ANALOG': '#10b981',
    '1WIRE_BUS': '#ec4899',
    'REED_SENSE': '#eab308',
    'I2C_SCL': '#3b82f6',
    'I2C_SDA': '#14b8a6',
    'BUZZER_ACT': '#fb923c',
    'UART_TX_RX': '#a855f7',
    'UART_RX_TX': '#6366f1',
  };

  return (
    <div className="scada-panel p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
            <span>2D ENGINEERING SCHEMATIC &amp; BUS TOPOLOGY</span>
            {highlightedNetName && (
              <span className="text-[10px] bg-cyan-950 text-scada-cyan border border-cyan-800 px-2 py-0.5 rounded">
                NET: {highlightedNetName}
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-400">
            Click any bus or functional block to cross-highlight across 3D Workbench and Pin Table
          </p>
        </div>

        {highlightedNetName && (
          <button
            onClick={() => onSelectNet(null)}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded border border-slate-700"
          >
            Clear Net Highlight
          </button>
        )}
      </div>

      {/* SVG Circuit Schematic */}
      <div className="w-full overflow-x-auto bg-graphite-950 rounded-lg border border-slate-800/80 p-2">
        <svg
          viewBox="0 0 960 480"
          className="w-full min-w-[750px] h-auto select-none font-mono"
        >
          {/* Background Grid Pattern */}
          <defs>
            <pattern id="schematicGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#17202c" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="960" height="480" fill="#0c1017" />
          <rect width="960" height="480" fill="url(#schematicGrid)" />

          {/* Top Power Rails */}
          {/* 5V Rail */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectNet('5V_BUS')}
          >
            <line
              x1="40"
              y1="30"
              x2="920"
              y2="30"
              stroke="#ef4444"
              strokeWidth={highlightedNetName === '5V_BUS' ? 4 : 2}
            />
            <rect x="40" y="20" width="70" height="20" rx="3" fill="#ef4444" />
            <text x="75" y="34" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              +5V BUS
            </text>
          </g>

          {/* 3.3V Rail */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectNet('3V3_BUS')}
          >
            <line
              x1="40"
              y1="55"
              x2="920"
              y2="55"
              stroke="#f59e0b"
              strokeWidth={highlightedNetName === '3V3_BUS' ? 4 : 2}
            />
            <rect x="40" y="45" width="70" height="20" rx="3" fill="#f59e0b" />
            <text x="75" y="59" fill="#000000" fontSize="10" fontWeight="bold" textAnchor="middle">
              +3.3V BUS
            </text>
          </g>

          {/* Bottom Common Ground Rail */}
          <g
            className="cursor-pointer"
            onClick={() => onSelectNet('GND')}
          >
            <line
              x1="40"
              y1="450"
              x2="920"
              y2="450"
              stroke="#64748b"
              strokeWidth={highlightedNetName === 'GND' ? 5 : 3}
            />
            <rect x="40" y="440" width="70" height="20" rx="3" fill="#334155" />
            <text x="75" y="454" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              COMMON GND
            </text>
          </g>

          {/* --- CENTRAL BLOCK 1: STM32F103C8T6 BLUE PILL --- */}
          <g transform="translate(320, 95)">
            <rect
              width="240"
              height="320"
              rx="6"
              fill="#0d47a1"
              stroke={highlightedNetName ? '#1e3a8a' : '#38bdf8'}
              strokeWidth="2"
            />
            <rect width="240" height="30" rx="6" fill="#1e40af" />
            <text x="120" y="20" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
              STM32F103C8T6 (Blue Pill)
            </text>

            {/* Pins Left Column */}
            <text x="10" y="55" fill="#e2e8f0" fontSize="9">PA0 (ADC0_GAS)</text>
            <text x="10" y="85" fill="#e2e8f0" fontSize="9">PA1 (TRIG_US)</text>
            <text x="10" y="115" fill="#e2e8f0" fontSize="9">PA2 (ECHO_US_3V3)</text>
            <text x="10" y="155" fill="#e2e8f0" fontSize="9">PB12 (1-WIRE_TEMP)</text>
            <text x="10" y="185" fill="#e2e8f0" fontSize="9">PB13 (REED_COVER)</text>
            <text x="10" y="225" fill="#e2e8f0" fontSize="9">PB8 (I2C1_SCL)</text>
            <text x="10" y="255" fill="#e2e8f0" fontSize="9">PB9 (I2C1_SDA)</text>
            <text x="10" y="290" fill="#e2e8f0" fontSize="9">PB0 (BUZZER)</text>

            {/* Pins Right Column */}
            <text x="230" y="70" fill="#e2e8f0" fontSize="9" textAnchor="end">PA9 (USART1_TX)</text>
            <text x="230" y="100" fill="#e2e8f0" fontSize="9" textAnchor="end">PA10 (USART1_RX)</text>
            <text x="230" y="270" fill="#f59e0b" fontSize="9" textAnchor="end">+3.3V VDD</text>
            <text x="230" y="295" fill="#cbd5e1" fontSize="9" textAnchor="end">GND</text>
          </g>

          {/* --- BLOCK 2: ESP32 WI-FI GATEWAY --- */}
          <g transform="translate(680, 110)">
            <rect width="180" height="210" rx="6" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.5" />
            <rect width="180" height="26" rx="6" fill="#0f172a" />
            <text x="90" y="18" fill="#00f0ff" fontSize="10" fontWeight="bold" textAnchor="middle">
              ESP32 DevKit (Wi-Fi)
            </text>

            <text x="10" y="60" fill="#e2e8f0" fontSize="9">GPIO16 (RX2)</text>
            <text x="10" y="90" fill="#e2e8f0" fontSize="9">GPIO17 (TX2)</text>
            <text x="10" y="140" fill="#ef4444" fontSize="9">VIN (5V)</text>
            <text x="10" y="170" fill="#cbd5e1" fontSize="9">GND (Common)</text>

            <rect x="50" y="125" width="80" height="50" rx="4" fill="#334155" />
            <text x="90" y="154" fill="#38bdf8" fontSize="9" textAnchor="middle">
              WebSocket Tx
            </text>
          </g>

          {/* --- SENSOR BLOCKS (LEFT COLUMN) --- */}
          {/* HC-SR04 Ultrasonic */}
          <g transform="translate(60, 90)">
            <rect width="130" height="70" rx="4" fill="#0284c7" stroke="#38bdf8" />
            <text x="65" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              HC-SR04 Ranging
            </text>
            <text x="10" y="38" fill="#e2e8f0" fontSize="8">TRIG (to PA1)</text>
            <text x="10" y="54" fill="#e2e8f0" fontSize="8">ECHO (5V OUT)</text>
          </g>

          {/* 1k/2k Divider */}
          <g transform="translate(200, 120)">
            <rect width="80" height="45" rx="3" fill="#475569" stroke="#94a3b8" />
            <text x="40" y="16" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
              1k/2k Divider
            </text>
            <text x="5" y="32" fill="#cbd5e1" fontSize="7">IN: 5V Echo</text>
            <text x="45" y="32" fill="#00f0ff" fontSize="7">OUT: 3.3V</text>
          </g>

          {/* MQ-2 Gas Sensor */}
          <g transform="translate(60, 180)">
            <rect width="130" height="60" rx="4" fill="#047857" stroke="#34d399" />
            <text x="65" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              MQ-2 Gas Sensor
            </text>
            <text x="10" y="36" fill="#e2e8f0" fontSize="8">AO (to PA0 ADC)</text>
            <text x="10" y="50" fill="#fca5a5" fontSize="8">VCC: 5V Heater</text>
          </g>

          {/* DS18B20 Temp + Pull-up */}
          <g transform="translate(60, 260)">
            <rect width="130" height="65" rx="4" fill="#334155" stroke="#94a3b8" />
            <text x="65" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              DS18B20 1-Wire
            </text>
            <text x="10" y="36" fill="#ec4899" fontSize="8">DATA (PB12)</text>
            <text x="10" y="52" fill="#f59e0b" fontSize="7">+ 4.7kΩ to 3.3V</text>
          </g>

          {/* Reed Switch */}
          <g transform="translate(60, 345)">
            <rect width="130" height="50" rx="4" fill="#1e293b" stroke="#cbd5e1" />
            <text x="65" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              Reed Switch (Cover)
            </text>
            <text x="10" y="36" fill="#eab308" fontSize="8">PB13 &lt;---&gt; GND</text>
          </g>

          {/* --- RIGHT SENSORS / ACTUATORS --- */}
          {/* MPU6050 & LCD (I2C Bus) */}
          <g transform="translate(680, 340)">
            <rect width="100" height="75" rx="4" fill="#0d9488" stroke="#2dd4bf" />
            <text x="50" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              MPU6050 (0x68)
            </text>
            <text x="10" y="38" fill="#3b82f6" fontSize="8">SCL (PB8)</text>
            <text x="10" y="54" fill="#14b8a6" fontSize="8">SDA (PB9)</text>
          </g>

          <g transform="translate(800, 340)">
            <rect width="110" height="75" rx="4" fill="#15803d" stroke="#4ade80" />
            <text x="55" y="18" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              16x2 LCD (0x27)
            </text>
            <text x="10" y="38" fill="#3b82f6" fontSize="8">SCL (PB8)</text>
            <text x="10" y="54" fill="#14b8a6" fontSize="8">SDA (PB9)</text>
            <text x="10" y="68" fill="#ef4444" fontSize="7">VCC: 5V Rail</text>
          </g>

          {/* --- INTERCONNECT NET WIRES (PATHS) --- */}
          {/* UART Lines: STM32 PA9 -> ESP32 GPIO16 */}
          <path
            d="M 560 165 L 620 165 L 620 170 L 680 170"
            fill="none"
            stroke={highlightedNetName === 'UART_TX_RX' ? '#00f0ff' : '#a855f7'}
            strokeWidth={highlightedNetName === 'UART_TX_RX' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('UART_TX_RX')}
          />
          {/* UART Lines: ESP32 GPIO17 -> STM32 PA10 */}
          <path
            d="M 680 200 L 630 200 L 630 195 L 560 195"
            fill="none"
            stroke={highlightedNetName === 'UART_RX_TX' ? '#00f0ff' : '#6366f1'}
            strokeWidth={highlightedNetName === 'UART_RX_TX' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('UART_RX_TX')}
          />

          {/* HC-SR04 TRIG to PA1 */}
          <path
            d="M 190 128 L 320 180"
            fill="none"
            stroke={highlightedNetName === 'US_TRIG' ? '#00f0ff' : '#06b6d4'}
            strokeWidth={highlightedNetName === 'US_TRIG' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('US_TRIG')}
          />

          {/* HC-SR04 ECHO to Divider, Divider to PA2 */}
          <path
            d="M 190 144 L 200 144"
            fill="none"
            stroke={highlightedNetName === 'US_ECHO_5V' ? '#00f0ff' : '#8b5cf6'}
            strokeWidth={highlightedNetName === 'US_ECHO_5V' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('US_ECHO_5V')}
          />
          <path
            d="M 280 144 L 320 210"
            fill="none"
            stroke={highlightedNetName === 'US_ECHO_3V3' ? '#00f0ff' : '#00f0ff'}
            strokeWidth={highlightedNetName === 'US_ECHO_3V3' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('US_ECHO_3V3')}
          />

          {/* MQ-2 AO to PA0 */}
          <path
            d="M 190 216 L 320 150"
            fill="none"
            stroke={highlightedNetName === 'GAS_ANALOG' ? '#00f0ff' : '#10b981'}
            strokeWidth={highlightedNetName === 'GAS_ANALOG' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('GAS_ANALOG')}
          />

          {/* DS18B20 to PB12 */}
          <path
            d="M 190 296 L 320 250"
            fill="none"
            stroke={highlightedNetName === '1WIRE_BUS' ? '#00f0ff' : '#ec4899'}
            strokeWidth={highlightedNetName === '1WIRE_BUS' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('1WIRE_BUS')}
          />

          {/* Reed to PB13 */}
          <path
            d="M 190 380 L 320 280"
            fill="none"
            stroke={highlightedNetName === 'REED_SENSE' ? '#00f0ff' : '#eab308'}
            strokeWidth={highlightedNetName === 'REED_SENSE' ? 3.5 : 1.8}
            className="cursor-pointer"
            onClick={() => onSelectNet('REED_SENSE')}
          />
        </svg>
      </div>
    </div>
  );
};
