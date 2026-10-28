import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TelemetryState, ChamberConfig } from '../../types/telemetry';

interface WaterVolumeProps {
  telemetry: TelemetryState;
  config: ChamberConfig;
}

export const WaterVolume = ({ telemetry, config }: WaterVolumeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);

  // Normalize water level: chamber depth is e.g. 150cm.
  // In 3D units, chamber height = 4.0 units, radius = 1.3 units.
  const chamberH = 4.0;
  const radius = 1.25;
  const bottomY = -chamberH / 2; // -2.0

  // Calculate target height in 3D units
  const depthFraction = Math.max(0, Math.min(1, telemetry.waterDepthCm / config.chamberDepthCm));
  const waterHeight = Math.max(0.05, depthFraction * chamberH);
  const currentY = bottomY + waterHeight / 2;
  const surfaceY = bottomY + waterHeight;

  // Water color shifts if toxic gas or critical flood
  const isCritical = telemetry.waterStatus === 'CRITICAL';
  const isWarning = telemetry.waterStatus === 'WARNING';
  const waterColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#0284c7';

  // Smooth gentle animation on the water surface
  useFrame((state) => {
    if (surfaceRef.current) {
      const t = state.clock.getElapsedTime();
      surfaceRef.current.position.y = surfaceY + Math.sin(t * 2) * 0.015;
    }
  });

  return (
    <group>
      {/* Cylindrical body of water */}
      <mesh ref={meshRef} position={[0, currentY, 0]}>
        <cylinderGeometry args={[radius * 0.98, radius * 0.98, waterHeight, 32]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.65}
          roughness={0.2}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Rippling top water surface disk */}
      <mesh
        ref={surfaceRef}
        position={[0, surfaceY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[radius * 0.98, 32]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
};
