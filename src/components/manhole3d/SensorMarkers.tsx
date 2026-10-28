import { Html } from '@react-three/drei';
import { TelemetryState, ChamberConfig } from '../../types/telemetry';

interface SensorMarkersProps {
  telemetry: TelemetryState;
  config: ChamberConfig;
  selectedSensor: string | null;
  onSelectSensor: (sensorKey: string) => void;
}

export const SensorMarkers = ({
  telemetry,
  config,
  selectedSensor,
  onSelectSensor,
}: SensorMarkersProps) => {
  // Ultrasonic beam geometry:
  // Mount height = Y 1.85. Water surface Y = -2.0 + (waterDepthCm / chamberDepthCm) * 4.0
  const depthFraction = Math.max(0, Math.min(1, telemetry.waterDepthCm / config.chamberDepthCm));
  const waterSurfaceY = -2.0 + depthFraction * 4.0;
  const sensorMountY = 1.85;
  const beamHeight = Math.max(0.1, sensorMountY - waterSurfaceY);
  const beamCenterY = sensorMountY - beamHeight / 2;

  const isWaterAlarm = telemetry.waterStatus !== 'NORMAL';
  const isGasAlarm = telemetry.gasStatus !== 'NORMAL';
  const isTempAlarm = telemetry.temperatureStatus !== 'NORMAL';
  const isCoverAlarm = telemetry.coverState === 'OPEN';
  const isTiltAlarm = telemetry.tiltStatus !== 'NORMAL';

  return (
    <group>
      {/* ================= 1. HC-SR04 ULTRASONIC SENSOR ================= */}
      <group
        position={[0, sensorMountY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSensor('ULTRASONIC');
        }}
      >
        {/* Mounting Bracket attached to concrete collar */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.6, 0.04, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* HC-SR04 Blue PCB */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.22]} />
          <meshStandardMaterial
            color={
              selectedSensor === 'ULTRASONIC'
                ? '#00f0ff'
                : isWaterAlarm
                ? '#ef4444'
                : '#0284c7'
            }
          />
        </mesh>

        {/* Transducer 1 (Trig) */}
        <mesh position={[-0.15, -0.06, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Transducer 2 (Echo) */}
        <mesh position={[0.15, -0.06, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Ultrasonic Conical Ranging Field (Transparent beam) */}
        <mesh position={[0, -beamHeight / 2, 0]}>
          <coneGeometry args={[0.35 + beamHeight * 0.15, beamHeight, 24, 1, true]} />
          <meshBasicMaterial
            color={isWaterAlarm ? '#ef4444' : '#00f0ff'}
            transparent
            opacity={0.12}
            wireframe={true}
          />
        </mesh>

        {/* HTML Info Marker */}
        <Html position={[0.45, 0.1, 0]} distanceFactor={8} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor('ULTRASONIC');
            }}
            className={`cursor-pointer px-2.5 py-1 rounded text-xs font-mono border backdrop-blur-md whitespace-nowrap transition-all shadow-lg ${
              selectedSensor === 'ULTRASONIC'
                ? 'bg-cyan-950/90 border-scada-cyan text-scada-cyan ring-2 ring-scada-cyan/40 scale-105'
                : isWaterAlarm
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                : 'bg-graphite-900/85 border-slate-700 text-slate-200 hover:border-scada-cyan'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isWaterAlarm ? 'bg-red-500 animate-ping' : 'bg-scada-cyan'
                }`}
              />
              HC-SR04 Ranging
            </div>
            <div className="text-[11px] text-slate-300">
              Dist: <span className="font-semibold text-white">{telemetry.ultrasonicDistanceCm} cm</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Water: {telemetry.waterDepthCm} cm ({telemetry.waterPercentage}%)
            </div>
          </div>
        </Html>
      </group>

      {/* ================= 2. MQ-2 GAS SENSOR ================= */}
      <group
        position={[-1.15, 1.4, 0.3]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSensor('GAS');
        }}
      >
        {/* Wall Bracket */}
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.06, 0.35, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.5} />
        </mesh>

        {/* Green PCB */}
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.3]} />
          <meshStandardMaterial
            color={
              selectedSensor === 'GAS'
                ? '#00f0ff'
                : isGasAlarm
                ? '#ef4444'
                : '#047857'
            }
          />
        </mesh>

        {/* Round Steel Mesh Sensing Hood */}
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.9}
            roughness={0.3}
            wireframe={true}
          />
        </mesh>

        {/* HTML Info Marker */}
        <Html position={[0.3, 0.15, 0]} distanceFactor={8} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor('GAS');
            }}
            className={`cursor-pointer px-2.5 py-1 rounded text-xs font-mono border backdrop-blur-md whitespace-nowrap transition-all shadow-lg ${
              selectedSensor === 'GAS'
                ? 'bg-cyan-950/90 border-scada-cyan text-scada-cyan ring-2 ring-scada-cyan/40 scale-105'
                : isGasAlarm
                ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-graphite-900/85 border-slate-700 text-slate-200 hover:border-scada-cyan'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isGasAlarm ? 'bg-amber-500 animate-ping' : 'bg-emerald-400'
                }`}
              />
              MQ-2 Gas Probe
            </div>
            <div className="text-[11px] text-slate-300">
              Raw ADC: <span className="font-semibold text-white">{telemetry.gasAdc}</span> ({telemetry.gasMv} mV)
            </div>
            <div className="text-[10px] text-slate-400">
              Status: <span className={isGasAlarm ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{telemetry.gasStatus}</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ================= 3. DS18B20 WATERPROOF TEMPERATURE PROBE ================= */}
      <group
        position={[1.05, 0.5, 0.4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSensor('TEMPERATURE');
        }}
      >
        {/* Wall conduit & cable */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Stainless Steel Probe Cylinder */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
          <meshStandardMaterial
            color={
              selectedSensor === 'TEMPERATURE'
                ? '#00f0ff'
                : isTempAlarm
                ? '#ef4444'
                : '#e2e8f0'
            }
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>

        {/* HTML Info Marker */}
        <Html position={[0.2, 0.1, 0]} distanceFactor={8} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor('TEMPERATURE');
            }}
            className={`cursor-pointer px-2.5 py-1 rounded text-xs font-mono border backdrop-blur-md whitespace-nowrap transition-all shadow-lg ${
              selectedSensor === 'TEMPERATURE'
                ? 'bg-cyan-950/90 border-scada-cyan text-scada-cyan ring-2 ring-scada-cyan/40 scale-105'
                : isTempAlarm
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                : 'bg-graphite-900/85 border-slate-700 text-slate-200 hover:border-scada-cyan'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isTempAlarm ? 'bg-red-500 animate-ping' : 'bg-blue-400'
                }`}
              />
              DS18B20 Temp
            </div>
            <div className="text-[11px] text-slate-300">
              Temp: <span className="font-semibold text-white">{telemetry.temperatureC} °C</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Bus: 1-Wire Digital
            </div>
          </div>
        </Html>
      </group>

      {/* ================= 4. MAGNETIC REED SWITCH COLLAR SENSOR ================= */}
      <group
        position={[0, 2.05, 1.25]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectSensor('COVER');
        }}
      >
        <mesh>
          <boxGeometry args={[0.15, 0.06, 0.08]} />
          <meshStandardMaterial
            color={
              selectedSensor === 'COVER'
                ? '#00f0ff'
                : isCoverAlarm
                ? '#ef4444'
                : '#475569'
            }
          />
        </mesh>

        {/* Reed Switch HTML Callout */}
        <Html position={[0.2, 0.15, 0]} distanceFactor={8} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor('COVER');
            }}
            className={`cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono border backdrop-blur-md whitespace-nowrap transition-all shadow-md ${
              isCoverAlarm
                ? 'bg-red-950/95 border-red-500 text-red-200 animate-bounce'
                : 'bg-graphite-900/80 border-slate-700 text-slate-300'
            }`}
          >
            Reed: <span className="font-bold">{telemetry.coverState}</span>
          </div>
        </Html>
      </group>

      {/* ================= 5. MPU6050 CALLOUT (ATTACHED TO LID) ================= */}
      <group position={[0.3, 2.05, 0]}>
        <Html position={[0.25, 0.25, 0]} distanceFactor={8} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectSensor('ACCEL');
            }}
            className={`cursor-pointer px-2.5 py-1 rounded text-xs font-mono border backdrop-blur-md whitespace-nowrap transition-all shadow-lg ${
              selectedSensor === 'ACCEL'
                ? 'bg-cyan-950/90 border-scada-cyan text-scada-cyan ring-2 ring-scada-cyan/40 scale-105'
                : isTiltAlarm
                ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-pulse'
                : 'bg-graphite-900/85 border-slate-700 text-slate-200 hover:border-scada-cyan'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isTiltAlarm ? 'bg-amber-500 animate-ping' : 'bg-teal-400'
                }`}
              />
              MPU6050 Motion
            </div>
            <div className="text-[11px] text-slate-300">
              Tilt: <span className="font-semibold text-white">{telemetry.tiltMagnitudeDeg}°</span>
            </div>
            <div className="text-[10px] text-slate-400">
              P: {telemetry.tiltPitchDeg}° | R: {telemetry.tiltRollDeg}°
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};
