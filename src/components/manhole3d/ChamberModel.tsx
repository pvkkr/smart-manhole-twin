import * as THREE from 'three';

interface ChamberModelProps {
  isCutaway: boolean;
}

export const ChamberModel = ({ isCutaway }: ChamberModelProps) => {
  const chamberH = 4.0;
  const radius = 1.3;
  const wallThickness = 0.15;

  return (
    <group>
      {/* --- Road Surface & Asphalt Pavement --- */}
      <group position={[0, 2.0, 0]}>
        {/* Main Road Slab */}
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[9.0, 0.1, 9.0]} />
          <meshStandardMaterial
            color="#1e242c"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Road Surface Marking (White dashed line) */}
        <mesh position={[2.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 8.5]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>
        <mesh position={[-2.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 8.5]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>

        {/* Cast-Iron Manhole Rim / Collar Collar */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[1.35, 1.4, 0.08, 36]} />
          <meshStandardMaterial color="#1a1e24" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* --- Underground Sub-Surface Concrete Shaft --- */}
      <group position={[0, 0, 0]}>
        {/* If cutaway, use a cylinder segment with thetaLength = 4.2 rad (~240 degrees) */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry
            args={[
              radius,
              radius,
              chamberH,
              36,
              1,
              true, // openEnded
              isCutaway ? 0.9 : 0,
              isCutaway ? Math.PI * 1.45 : Math.PI * 2
            ]}
          />
          <meshStandardMaterial
            color="#475569"
            roughness={0.85}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer concrete collar ring */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry
            args={[
              radius + wallThickness,
              radius + wallThickness,
              chamberH,
              36,
              1,
              true,
              isCutaway ? 0.9 : 0,
              isCutaway ? Math.PI * 1.45 : Math.PI * 2
            ]}
          />
          <meshStandardMaterial
            color="#334155"
            roughness={0.9}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Chamber Concrete Base / Floor */}
        <mesh receiveShadow position={[0, -chamberH / 2 - 0.1, 0]}>
          <cylinderGeometry args={[radius + wallThickness, radius + wallThickness, 0.2, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>

        {/* --- Sewer Inlet Pipe (Left) --- */}
        <group position={[-radius - 0.7, -chamberH / 2 + 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.35, 1.6, 24, 1, true]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <torusGeometry args={[0.36, 0.04, 12, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.4} />
          </mesh>
        </group>

        {/* --- Sewer Outlet Pipe (Right) --- */}
        <group position={[radius + 0.7, -chamberH / 2 + 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.38, 0.38, 1.6, 24, 1, true]} />
            <meshStandardMaterial color="#64748b" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.75, 0]}>
            <torusGeometry args={[0.39, 0.04, 12, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.4} />
          </mesh>
        </group>

        {/* --- Inspection Maintenance Ladder Rungs (Back Wall) --- */}
        {[-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5].map((yLevel, idx) => (
          <group key={idx} position={[0, yLevel, -radius + 0.12]}>
            {/* Horizontal step bar */}
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.04, 0.04]} />
              <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Left anchor bracket */}
            <mesh position={[-0.22, 0, -0.05]}>
              <boxGeometry args={[0.04, 0.04, 0.1]} />
              <meshStandardMaterial color="#a16207" metalness={0.8} />
            </mesh>
            {/* Right anchor bracket */}
            <mesh position={[0.22, 0, -0.05]}>
              <boxGeometry args={[0.04, 0.04, 0.1]} />
              <meshStandardMaterial color="#a16207" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
