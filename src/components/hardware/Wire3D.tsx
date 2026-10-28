import { useMemo } from 'react';
import * as THREE from 'three';
import { WireConnection, CircuitComponent } from '../../types/circuit';

interface Wire3DProps {
  wire: WireConnection;
  components: CircuitComponent[];
  isSelected: boolean;
  onSelectWire: (wireId: string) => void;
}

export const Wire3D = ({
  wire,
  components,
  isSelected,
  onSelectWire,
}: Wire3DProps) => {
  const fromComp = components.find((c) => c.id === wire.fromComponentId);
  const toComp = components.find((c) => c.id === wire.toComponentId);

  const fromPin = fromComp?.pins.find((p) => p.id === wire.fromPinId);
  const toPin = toComp?.pins.find((p) => p.id === wire.toPinId);

  const curve = useMemo(() => {
    if (!fromComp || !toComp || !fromPin || !toPin) return null;

    const start = new THREE.Vector3(
      fromComp.position[0] + fromPin.positionOffset[0],
      fromComp.position[1] + fromPin.positionOffset[1],
      fromComp.position[2] + fromPin.positionOffset[2]
    );

    const end = new THREE.Vector3(
      toComp.position[0] + toPin.positionOffset[0],
      toComp.position[1] + toPin.positionOffset[1],
      toComp.position[2] + toPin.positionOffset[2]
    );

    // Arch the wire upward naturally in 3D space
    const distance = start.distanceTo(end);
    const midX = (start.x + end.x) / 2;
    const midZ = (start.z + end.z) / 2;
    const midY = Math.max(start.y, end.y) + Math.min(1.8, Math.max(0.4, distance * 0.25));

    const mid = new THREE.Vector3(midX, midY, midZ);
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [fromComp, toComp, fromPin, toPin]);

  if (!curve) return null;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelectWire(wire.id);
      }}
    >
      <mesh>
        <tubeGeometry args={[curve, 32, isSelected ? 0.045 : 0.025, 8, false]} />
        <meshStandardMaterial
          color={isSelected ? '#00f0ff' : wire.color || '#38bdf8'}
          metalness={0.2}
          roughness={0.4}
          emissive={isSelected ? '#00f0ff' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
};
