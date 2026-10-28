import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TelemetryState } from '../../types/telemetry';

interface ManholeCoverProps {
  telemetry: TelemetryState;
  onSelectSensor?: (sensorKey: string) => void;
  selectedSensor?: string | null;
}

export const ManholeCover = ({
  telemetry,
  onSelectSensor,
  selectedSensor,
}: ManholeCoverProps) => {
  const hingeGroupRef = useRef<THREE.Group>(null);

  // Target open rotation angle in radians (e.g. 70 degrees when open)
  const targetOpenAngleRad = telemetry.coverState === 'OPEN' ? (70 * Math.PI) / 180 : 0;

  // Add simulated MPU6050 tilt disturbance
  const tiltPitchRad = (telemetry.tiltPitchDeg * Math.PI) / 180;
  const tiltRollRad = (telemetry.tiltRollDeg * Math.PI) / 180;

  useFrame((_, delta) => {
    if (hingeGroupRef.current) {
      // Lerp hinge rotation smoothly
      const currentRotX = hingeGroupRef.current.rotation.x;
      const desiredRotX = -targetOpenAngleRad + (telemetry.coverState === 'CLOSED' ? tiltPitchRad : 0);
      hingeGroupRef.current.rotation.x = THREE.MathUtils.damp(
        currentRotX,
        desiredRotX,
        6,
        delta
      );

      // Roll perturbation if closed
      if (telemetry.coverState === 'CLOSED') {
        hingeGroupRef.current.rotation.z = THREE.MathUtils.damp(
          hingeGroupRef.current.rotation.z,
          tiltRollRad,
          6,
          delta
        );
      } else {
        hingeGroupRef.current.rotation.z = THREE.MathUtils.damp(
          hingeGroupRef.current.rotation.z,
          0,
          6,
          delta
        );
      }
    }
  });

  const isCoverAlarm = telemetry.coverState === 'OPEN';
  const isTiltAlarm = telemetry.tiltStatus !== 'NORMAL';

  return (
    // The hinge pivot is positioned at the back edge of the rim: [0, 2.05, -1.2]
    <group position={[0, 2.05, -1.2]}>
      <group ref={hingeGroupRef}>
        {/* Shift back by radius so rotation pivots around hinge */}
        <group position={[0, 0, 1.2]}>
          {/* Cast Iron Main Lid Disc */}
          <mesh
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor?.('COVER');
            }}
          >
            <cylinderGeometry args={[1.22, 1.25, 0.1, 36]} />
            <meshStandardMaterial
              color={
                selectedSensor === 'COVER'
                  ? '#00f0ff'
                  : isCoverAlarm
                  ? '#ef4444'
                  : '#2a2f35'
              }
              metalness={0.75}
              roughness={0.35}
            />
          </mesh>

          {/* Cast iron inner concentric anti-slip ring */}
          <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.95, 32]} />
            <meshStandardMaterial
              color="#1c2024"
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>

          {/* Manhole Center Badge / Pick Hole */}
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
            <meshStandardMaterial color="#0f1318" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Underside MPU6050 Accelerometer / Gyroscope Module */}
          <group
            position={[0.3, -0.08, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor?.('ACCEL');
            }}
          >
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.06, 0.2]} />
              <meshStandardMaterial
                color={
                  selectedSensor === 'ACCEL'
                    ? '#00f0ff'
                    : isTiltAlarm
                    ? '#ef4444'
                    : '#0d9488'
                }
              />
            </mesh>
            {/* Status LED on MPU6050 */}
            <mesh position={[0.06, 0.035, 0.06]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial
                color={isTiltAlarm ? '#ef4444' : '#10b981'}
              />
            </mesh>
          </group>

          {/* Magnetic Reed Switch Magnet attached to lid rim */}
          <group
            position={[0, -0.06, 1.15]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor?.('COVER');
            }}
          >
            <mesh>
              <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
              <meshStandardMaterial
                color={isCoverAlarm ? '#ef4444' : '#e2e8f0'}
                metalness={0.9}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
