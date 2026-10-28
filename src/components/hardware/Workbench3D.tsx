import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CircuitComponent, WireConnection } from '../../types/circuit';
import { ComponentModel3D } from './ComponentModels3D';
import { Wire3D } from './Wire3D';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';
import { RotateCcw, Layers, Compass, Scissors, PlusCircle } from 'lucide-react';

interface Workbench3DProps {
  components: CircuitComponent[];
  wires: WireConnection[];
  selectedComponentId: string | null;
  selectedPinId: string | null;
  selectedWireId: string | null;
  highlightedNetName: string | null;
  wiringSourcePin: { componentId: string; pinId: string } | null;
  onSelectComponent: (componentId: string | null) => void;
  onSelectPin: (componentId: string, pinId: string) => void;
  onSelectWire: (wireId: string | null) => void;
  onDeleteSelectedWire: () => void;
}

export const Workbench3D = ({
  components,
  wires,
  selectedComponentId,
  selectedPinId,
  selectedWireId,
  highlightedNetName,
  wiringSourcePin,
  onSelectComponent,
  onSelectPin,
  onSelectWire,
  onDeleteSelectedWire,
}: Workbench3DProps) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(0, 11, 7);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Find pins that belong to highlighted net (if any)
  const highlightedPinIds: string[] = [];
  if (highlightedNetName) {
    const netWires = wires.filter((w) => w.netName === highlightedNetName);
    for (const w of netWires) {
      highlightedPinIds.push(`${w.fromComponentId}:${w.fromPinId}`);
      highlightedPinIds.push(`${w.toComponentId}:${w.toPinId}`);
    }
  }

  return (
    <div className="relative w-full h-[520px] bg-graphite-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top HUD Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-graphite-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg pointer-events-auto backdrop-blur-md flex items-center gap-2">
          <Layers className="w-4 h-4 text-scada-cyan" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            3D ELECTRONICS WORKBENCH
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {wires.length} Wires Connected
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {wiringSourcePin && (
            <div className="bg-cyan-950/90 border border-scada-cyan text-scada-cyan px-3 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 animate-pulse shadow-lg backdrop-blur-md">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Wiring: Click destination pin to connect</span>
            </div>
          )}

          {selectedWireId && (
            <button
              onClick={onDeleteSelectedWire}
              className="bg-rose-950/90 hover:bg-rose-900 border border-rose-500 text-rose-200 px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shadow-lg backdrop-blur-md"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Remove Wire</span>
            </button>
          )}

          <button
            onClick={resetCamera}
            className="p-1.5 bg-graphite-900/90 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors backdrop-blur-md"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-full flex-1">
        <CanvasErrorBoundary fallbackTitle="3D Electronics Workbench">
          <Canvas
            shadows
            camera={{ position: [0, 11, 7], fov: 42 }}
            gl={{ antialias: true }}
            onClick={() => {
              onSelectComponent(null);
              onSelectWire(null);
            }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[8, 14, 8]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[0, 4, 0]} intensity={0.5} color="#38bdf8" />

            <Suspense fallback={null}>
              {/* ESD Anti-Static Mat Grid */}
              <Grid
                position={[0, 0, 0]}
                args={[18, 14]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#1e293b"
                sectionSize={2.0}
                sectionThickness={1.0}
                sectionColor="#334155"
                fadeDistance={18}
              />

              {/* Workbench Table Surface */}
              <mesh position={[0, -0.05, 0]} receiveShadow>
                <boxGeometry args={[16, 0.1, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.1} />
              </mesh>

              {/* Components */}
              {components.map((comp) => (
                <ComponentModel3D
                  key={comp.id}
                  component={comp}
                  isSelected={selectedComponentId === comp.id}
                  selectedPinId={selectedComponentId === comp.id ? selectedPinId : null}
                  highlightedPinIds={highlightedPinIds}
                  wiringSourcePin={wiringSourcePin}
                  onSelectComponent={onSelectComponent}
                  onSelectPin={onSelectPin}
                />
              ))}

              {/* 3D Curved Spline Wires */}
              {wires.map((wire) => (
                <Wire3D
                  key={wire.id}
                  wire={wire}
                  components={components}
                  isSelected={selectedWireId === wire.id || wire.netName === highlightedNetName}
                  onSelectWire={onSelectWire}
                />
              ))}
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.06}
              minDistance={4}
              maxDistance={22}
              maxPolarAngle={Math.PI / 2 - 0.05}
            />
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none text-[11px] font-mono text-slate-400">
        <div className="bg-graphite-900/90 border border-slate-800 px-2.5 py-1 rounded backdrop-blur-md flex items-center gap-2 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>Click any pin to start wiring, then click target pin. Click wires to inspect/delete.</span>
        </div>
      </div>
    </div>
  );
};
