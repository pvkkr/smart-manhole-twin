import { Html } from '@react-three/drei';
import { CircuitComponent, PinDefinition } from '../../types/circuit';

interface ComponentModel3DProps {
  component: CircuitComponent;
  isSelected: boolean;
  selectedPinId: string | null;
  highlightedPinIds?: string[];
  wiringSourcePin: { componentId: string; pinId: string } | null;
  onSelectComponent: (componentId: string) => void;
  onSelectPin: (componentId: string, pinId: string) => void;
}

export const ComponentModel3D = ({
  component,
  isSelected,
  selectedPinId,
  highlightedPinIds = [],
  wiringSourcePin,
  onSelectComponent,
  onSelectPin,
}: ComponentModel3DProps) => {
  const [w, h, d] = component.dimensions;

  return (
    <group
      position={component.position}
      rotation={component.rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelectComponent(component.id);
      }}
    >
      {/* Selection Glow / Bounding Indicator */}
      {isSelected && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w + 0.15, h + 0.15, d + 0.15]} />
          <meshBasicMaterial color="#00f0ff" wireframe={true} />
        </mesh>
      )}

      {/* --- Procedural Body rendering based on component.id --- */}
      {component.id === 'stm32' && (
        <group>
          {/* Blue PCB */}
          <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#0d47a1" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* STM32 LQFP48 MCU Chip */}
          <mesh position={[0, h + 0.05, 0]}>
            <boxGeometry args={[0.9, 0.08, 0.9]} />
            <meshStandardMaterial color="#111827" roughness={0.5} />
          </mesh>
          {/* Micro USB Port */}
          <mesh position={[0, h + 0.08, -d / 2 + 0.25]}>
            <boxGeometry args={[0.5, 0.16, 0.45]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* 8MHz Crystal Oscillator */}
          <mesh position={[-0.4, h + 0.05, 0.8]}>
            <boxGeometry args={[0.2, 0.1, 0.45]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          {/* Reset Switch */}
          <mesh position={[0.5, h + 0.06, -1.4]}>
            <cylinderGeometry args={[0.08, 0.08, 0.08, 12]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      )}

      {component.id === 'esp32' && (
        <group>
          {/* Black PCB */}
          <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.1} />
          </mesh>
          {/* ESP-WROOM-32 Metal RF Shield Can */}
          <mesh position={[0, h + 0.08, -0.6]}>
            <boxGeometry args={[1.5, 0.14, 1.8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* PCB Trace Antenna Area */}
          <mesh position={[0, h + 0.02, -d / 2 + 0.4]}>
            <boxGeometry args={[1.4, 0.02, 0.6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Micro USB Port */}
          <mesh position={[0, h + 0.08, d / 2 - 0.25]}>
            <boxGeometry args={[0.5, 0.16, 0.45]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {component.id === 'hcsr04' && (
        <group>
          {/* Blue PCB */}
          <mesh castShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Transducer 1 (Trig) */}
          <mesh position={[-0.7, h + 0.25, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Transducer 2 (Echo) */}
          <mesh position={[0.7, h + 0.25, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.5, 24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {component.id === 'mq2' && (
        <group>
          {/* Green PCB */}
          <mesh castShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#047857" />
          </mesh>
          {/* Sniffer Round Metal Mesh Hood */}
          <mesh position={[0, h + 0.4, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.75, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} wireframe={true} />
          </mesh>
        </group>
      )}

      {component.id === 'ds18b20' && (
        <group>
          {/* Small Carrier Board */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Stainless Steel Probe Capsule */}
          <mesh position={[0, h + 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 1.4, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      )}

      {component.id === 'mpu6050' && (
        <group>
          {/* Teal GY-521 PCB */}
          <mesh castShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#0d9488" />
          </mesh>
          {/* QFN Accelerometer IC */}
          <mesh position={[0, h + 0.05, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.5]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {/* Power LED */}
          <mesh position={[-0.4, h + 0.04, -0.4]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {component.id === 'reed' && (
        <group>
          {/* Plastic carrier */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Glass Reed Capsule */}
          <mesh position={[0, h + 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 1.2, 12]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
          </mesh>
        </group>
      )}

      {component.id === 'lcd1602' && (
        <group>
          {/* Green PCB base */}
          <mesh castShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
          {/* LCD Screen Bezel Frame */}
          <mesh position={[0, h + 0.1, 0]}>
            <boxGeometry args={[2.8, 0.1, 1.3]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Blue Character Display Area */}
          <mesh position={[0, h + 0.16, 0]}>
            <boxGeometry args={[2.5, 0.04, 0.9]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {component.id === 'buzzer' && (
        <group>
          {/* Base board */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h * 0.4, d]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Cylindrical Piezo sounder body */}
          <mesh position={[0, h * 0.4 + 0.35, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.7, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} />
          </mesh>
          {/* Sound aperture hole */}
          <mesh position={[0, h * 0.4 + 0.71, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      )}

      {component.id === 'power_rails' && (
        <group>
          {/* Distribution Rail strip */}
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.4} />
          </mesh>
        </group>
      )}

      {(component.id === 'divider' || component.id === 'pullup') && (
        <group>
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={component.id === 'divider' ? '#475569' : '#b45309'} />
          </mesh>
          {/* Resistor cylinder */}
          <mesh position={[0, h + 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 12]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        </group>
      )}

      {/* --- Interactive Pins --- */}
      {component.pins.map((pin) => {
        const isPinSelected = selectedPinId === pin.id && isSelected;
        const isWiringSource =
          wiringSourcePin?.componentId === component.id &&
          wiringSourcePin?.pinId === pin.id;
        const isHighlighted = highlightedPinIds.includes(`${component.id}:${pin.id}`);

        let pinColor = '#e2e8f0'; // Default silver
        if (pin.signalType === 'POWER_5V') pinColor = '#ef4444';
        else if (pin.signalType === 'POWER_3V3') pinColor = '#f59e0b';
        else if (pin.signalType === 'GND') pinColor = '#1e293b';
        else if (pin.signalType === 'I2C_SCL' || pin.signalType === 'I2C_SDA') pinColor = '#06b6d4';
        else if (pin.signalType === 'UART_TX' || pin.signalType === 'UART_RX') pinColor = '#a855f7';

        return (
          <group
            key={pin.id}
            position={pin.positionOffset}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPin(component.id, pin.id);
            }}
          >
            {/* Metal Pin Post */}
            <mesh castShadow>
              <cylinderGeometry
                args={[
                  isWiringSource ? 0.08 : isPinSelected ? 0.07 : 0.045,
                  isWiringSource ? 0.08 : isPinSelected ? 0.07 : 0.045,
                  0.35,
                  12,
                ]}
              />
              <meshStandardMaterial
                color={
                  isWiringSource
                    ? '#00f0ff'
                    : isPinSelected || isHighlighted
                    ? '#38bdf8'
                    : pinColor
                }
                metalness={0.9}
                roughness={0.2}
                emissive={isWiringSource ? '#00f0ff' : '#000000'}
                emissiveIntensity={isWiringSource ? 0.8 : 0}
              />
            </mesh>

            {/* Pin Ring indicator */}
            <mesh position={[0, 0.18, 0]}>
              <sphereGeometry args={[isWiringSource ? 0.09 : 0.06, 8, 8]} />
              <meshBasicMaterial
                color={
                  isWiringSource
                    ? '#00f0ff'
                    : isPinSelected
                    ? '#38bdf8'
                    : pinColor
                }
              />
            </mesh>
          </group>
        );
      })}

      {/* Component Title Label in 3D */}
      <Html position={[0, h + 0.45, 0]} distanceFactor={14} center>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(component.id);
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all ${
            isSelected
              ? 'bg-cyan-950/95 border border-scada-cyan text-scada-cyan font-bold shadow-lg ring-1 ring-scada-cyan/40 scale-105'
              : 'bg-graphite-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
          }`}
        >
          {component.name}
        </div>
      </Html>
    </group>
  );
};
