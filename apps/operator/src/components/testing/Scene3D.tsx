import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// Mesh names from the model
const MOTOR_MESH_NAME = 'Body_Mat3_0';

// RPM Indicator component
const RPMIndicator: React.FC<{ position: [number, number, number]; rpm: number; visible: boolean }> = ({ position, rpm, visible }) => {
  if (!visible) return null;
  
  return (
    <Html position={position} center>
      <div className="bg-success/90 text-success-foreground px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in border border-success">
        <div className="text-xs font-medium opacity-80">RPM</div>
        <div className="text-2xl font-bold">{rpm.toLocaleString()}</div>
      </div>
    </Html>
  );
};

// Pump model component with motor glow effect
const PumpModel: React.FC<{ isRunning?: boolean; motorSpeed?: number; motorPosition: [number, number, number] }> = ({ 
  isRunning = false, 
  motorSpeed = 50, 
  motorPosition 
}) => {
  const { scene } = useGLTF('/models/zone1.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const rpm = Math.round((motorSpeed / 100) * 3000);
  const originalMaterialsRef = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  // Apply glow effect to motor mesh when running
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Store original material if not already stored
        if (!originalMaterialsRef.current.has(mesh.name)) {
          originalMaterialsRef.current.set(mesh.name, mesh.material);
        }

        // Apply glow to motor mesh when running
        if (mesh.name === MOTOR_MESH_NAME) {
          if (isRunning) {
            // Create glowing green material
            const glowMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#22c55e'),
              emissive: new THREE.Color('#22c55e'),
              emissiveIntensity: 0.5,
              metalness: 0.8,
              roughness: 0.2,
            });
            mesh.material = glowMaterial;
          } else {
            // Restore original material
            const originalMaterial = originalMaterialsRef.current.get(mesh.name);
            if (originalMaterial) {
              mesh.material = originalMaterial;
            }
          }
        }
      }
    });
  }, [clonedScene, isRunning]);

  const rpmPosition: [number, number, number] = [motorPosition[0], motorPosition[1] + 1.2, motorPosition[2]];

  return (
    <group>
      <primitive 
        object={clonedScene} 
        scale={0.08} 
        position={[0, -1, 0]}
      />
      
      {/* Point light for motor glow effect when running */}
      {isRunning && (
        <pointLight 
          position={motorPosition} 
          color="#22c55e" 
          intensity={3} 
          distance={4} 
        />
      )}
      
      {/* RPM Indicator above motor */}
      <RPMIndicator position={rpmPosition} rpm={rpm} visible={isRunning} />
    </group>
  );
};

// Fallback placeholder if model doesn't load
const PlaceholderPump: React.FC<{ isRunning?: boolean }> = ({ isRunning = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      if (isRunning) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.7, 1.2, 32]} />
      <meshStandardMaterial 
        color="#4a5568" 
        metalness={0.8} 
        roughness={0.2}
      />
    </mesh>
  );
};

interface Scene3DProps {
  isRunning?: boolean;
  motorSpeed?: number;
  className?: string;
}

export const Scene3D: React.FC<Scene3DProps> = ({ isRunning = false, motorSpeed = 50, className }) => {
  // Motor position - position of the motor mesh for RPM indicator and glow
  const motorPosition: [number, number, number] = [-1.5, 0.3, 0];

  return (
    <div id="canvas-container" className={className}>
      <Canvas
        camera={{ position: [0, 5, 20], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight
          position={[-5, 10, -5]}
          intensity={0.5}
          angle={0.3}
          penumbra={1}
        />

        <Suspense fallback={<PlaceholderPump isRunning={isRunning} />}>
          <PumpModel isRunning={isRunning} motorSpeed={motorSpeed} motorPosition={motorPosition} />
          <ContactShadows
            position={[0, -1, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

// Preload the model
useGLTF.preload('/models/zone1.glb');
