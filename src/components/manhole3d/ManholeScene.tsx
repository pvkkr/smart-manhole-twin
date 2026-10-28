import { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { ChamberModel } from './ChamberModel';
import { WaterVolume } from './WaterVolume';
import { ManholeCover } from './ManholeCover';
import { SensorMarkers } from './SensorMarkers';
import { TelemetryState, ChamberConfig } from '../../types/telemetry';
import {
  Eye,
  RotateCcw,
  Layers,
  Activity,
  AlertTriangle,
  Info,
  X,
  Compass,
} from 'lucide-react';

interface ManholeSceneProps {
  telemetry: TelemetryState;
  config: ChamberConfig;
  selectedSensor: string | null;
  onSelectSensor: (sensorKey: string | null) => void;
}

export const ManholeScene = ({
  telemetry,
  config,
  selectedSensor,
  onSelectSensor,
}: ManholeSceneProps) => {
  const [isCutaway, setIsCutaway] = useState<boolean>(true);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(4.5, 3.2, 5.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setViewTopDown = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 7.5, 0.1);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setViewSideSection = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 0.5, 6.2);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-graphite-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Viewport Top HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Title and Digital Twin Tag */}
        <div className="flex items-center gap-2 bg-graphite-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg pointer-events-auto backdrop-blur-md">
          <Activity className="w-4 h-4 text-scada-cyan animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200">
            CHAMBER-3D // TWIN VIEWPORT
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              telemetry.systemStatus === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : telemetry.systemStatus === 'WARNING'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {telemetry.systemStatus}
          </span>
        </div>

        {/* View Control Buttons */}
        <div className="flex items-center gap-1.5 bg-graphite-900/90 border border-slate-700/80 p-1 rounded-lg shadow-lg pointer-events-auto backdrop-blur-md">
          <button
            onClick={() => setIsCutaway(!isCutaway)}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
              isCutaway
                ? 'bg-scada-cyan/20 text-scada-cyan border border-scada-cyan/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle underground chamber cutaway view"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isCutaway ? 'Cutaway ON' : 'Exterior'}</span>
          </button>

          <button
            onClick={setViewSideSection}
            className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Side Section View"
          >
            Section
          </button>

          <button
            onClick={setViewTopDown}
            className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Top-down Street View"
          >
            Top-Down
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full flex-1">
        <Canvas
          shadows
          camera={{ position: [4.5, 3.2, 5.5], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[6, 10, 6]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          {/* Sub-surface amber/cyan inspection light */}
          <pointLight position={[0, 0.5, 0]} intensity={0.8} color="#38bdf8" distance={6} />
          <pointLight position={[0, -1.2, 0]} intensity={0.4} color="#f59e0b" distance={4} />

          <Suspense fallback={null}>
            {/* Ground Grid */}
            <Grid
              position={[0, -2.15, 0]}
              args={[20, 20]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#1e293b"
              sectionSize={2.0}
              sectionThickness={1.0}
              sectionColor="#334155"
              fadeDistance={18}
            />

            {/* Chamber Model */}
            <ChamberModel isCutaway={isCutaway} />

            {/* Dynamic Water Volume */}
            <WaterVolume telemetry={telemetry} config={config} />

            {/* Manhole Cover (Cast-iron lid with MPU6050 and hinge) */}
            <ManholeCover
              telemetry={telemetry}
              onSelectSensor={onSelectSensor}
              selectedSensor={selectedSensor}
            />

            {/* Sensor 3D Markers & Callouts */}
            <SensorMarkers
              telemetry={telemetry}
              config={config}
              selectedSensor={selectedSensor}
              onSelectSensor={onSelectSensor}
            />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={2.5}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2 + 0.15} // Prevent looking completely underneath ground
          />
        </Canvas>
      </div>

      {/* Viewport Bottom Overlay Status Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Navigation Hint */}
        <div className="bg-graphite-900/90 border border-slate-800 px-2.5 py-1 rounded text-[11px] font-mono text-slate-400 flex items-center gap-2 pointer-events-auto backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>Left Drag: Orbit | Right Drag: Pan | Scroll: Zoom</span>
        </div>

        {/* Real-time State Summary */}
        <div className="bg-graphite-900/90 border border-slate-800 px-3 py-1 rounded text-xs font-mono text-slate-300 flex items-center gap-3 pointer-events-auto backdrop-blur-md">
          <span>
            Water: <strong className="text-white">{telemetry.waterDepthCm} cm</strong> ({telemetry.waterPercentage}%)
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Cover: <strong className={telemetry.coverState === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'}>{telemetry.coverState}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Gas: <strong className="text-white">{telemetry.gasAdc} ADC</strong>
          </span>
        </div>
      </div>

      {/* Sensor Detail Drawer/Card if a sensor is selected */}
      {selectedSensor && (
        <div className="absolute top-16 right-4 z-20 w-80 bg-graphite-900/95 border border-scada-cyan/40 rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-scada-cyan animate-pulse" />
              <h4 className="font-bold text-white uppercase tracking-wider">
                {selectedSensor === 'ULTRASONIC' && 'HC-SR04 Ultrasonic'}
                {selectedSensor === 'GAS' && 'MQ-2 Gas Sensor'}
                {selectedSensor === 'TEMPERATURE' && 'DS18B20 Temp Probe'}
                {selectedSensor === 'COVER' && 'Magnetic Reed Switch'}
                {selectedSensor === 'ACCEL' && 'MPU6050 6-DoF IMU'}
              </h4>
            </div>
            <button
              onClick={() => onSelectSensor(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedSensor === 'ULTRASONIC' && (
            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Measures ultrasonic time-of-flight to the wastewater liquid surface.
              </p>
              <div className="bg-graphite-950 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Air Distance:</span>
                  <span className="font-bold text-white">{telemetry.ultrasonicDistanceCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calculated Water Depth:</span>
                  <span className="font-bold text-scada-cyan">{telemetry.waterDepthCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity Utilization:</span>
                  <span className="font-bold text-white">{telemetry.waterPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensor Diagnostic:</span>
                  <span className={telemetry.ultrasonicValid ? 'text-emerald-400' : 'text-rose-400'}>
                    {telemetry.ultrasonicValid ? 'ECHO VALID' : 'SIGNAL LOST'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedSensor === 'GAS' && (
            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sniffs volatile sewer gases, methane (CH4) and hydrogen sulfide (H2S).
              </p>
              <div className="bg-graphite-950 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Raw ADC Value:</span>
                  <span className="font-bold text-white">{telemetry.gasAdc} / 4095</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Analog Voltage:</span>
                  <span className="font-bold text-scada-cyan">{telemetry.gasMv} mV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hazard Assessment:</span>
                  <span className={`font-bold ${telemetry.gasStatus === 'CRITICAL' ? 'text-rose-400' : telemetry.gasStatus === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {telemetry.gasStatus}
                  </span>
                </div>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Note: Raw ADC reading displayed. Engineering ppm requires multi-point laboratory gas calibration.</span>
              </div>
            </div>
          )}

          {selectedSensor === 'TEMPERATURE' && (
            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Digital waterproof stainless-steel probe submerged in chamber atmosphere.
              </p>
              <div className="bg-graphite-950 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Temperature:</span>
                  <span className="font-bold text-scada-cyan text-sm">{telemetry.temperatureC} °C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bus Interface:</span>
                  <span className="font-bold text-white">Dallas 1-Wire (PB12)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thermal Status:</span>
                  <span className={telemetry.temperatureStatus === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'}>
                    {telemetry.temperatureStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedSensor === 'COVER' && (
            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Magnetic dry-contact reed switch sensing cover presence / intrusion.
              </p>
              <div className="bg-graphite-950 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reed Switch State:</span>
                  <span className={`font-bold ${telemetry.coverState === 'OPEN' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {telemetry.coverState}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MCU Input:</span>
                  <span className="font-bold text-white">STM32 PB13 (Weak Pull-Up)</span>
                </div>
              </div>
            </div>
          )}

          {selectedSensor === 'ACCEL' && (
            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                6-Axis MEMS accelerometer detecting cover displacement or vehicular vibration.
              </p>
              <div className="bg-graphite-950 p-2.5 rounded border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Calculated Tilt:</span>
                  <span className="font-bold text-scada-cyan">{telemetry.tiltMagnitudeDeg}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pitch (X) / Roll (Y):</span>
                  <span className="font-bold text-white">{telemetry.tiltPitchDeg}° / {telemetry.tiltRollDeg}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Raw Acceleration (mg):</span>
                  <span className="font-mono text-slate-300">X:{telemetry.accelXMg} Y:{telemetry.accelYMg} Z:{telemetry.accelZMg}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
