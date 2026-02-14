import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../theme-provider';

// Mesh names from the model
const MOTOR_MESH_NAME = 'Body_Mat3_0';

// Simple Loader
const Loader = () => (
  // @ts-ignore
  <Html center>
    <div className="text-primary font-medium animate-pulse">Loading Scene...</div>
  </Html>
);

// Pump model component with motor glow effect
const PumpModel: React.FC<{ isRunning?: boolean; motorSpeed?: number; motorPosition: [number, number, number] }> = ({
  isRunning = false,
  motorSpeed = 50,
  motorPosition
}) => {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/zone1.glb`);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const rpm = Math.round((motorSpeed / 100) * 3000);
  const originalMaterialsRef = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  // Apply glow effect to motor mesh when running
  useEffect(() => {
    clonedScene.traverse((child) => {
      // @ts-ignore
      if (child.isMesh) {
        // @ts-ignore
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

  return (
    <group>
      <primitive object={clonedScene} scale={0.08} position={[0, -1, 0]} />
      {isRunning && (
        <pointLight position={motorPosition} color="#22c55e" intensity={3} distance={4} />
      )}
      {/* @ts-ignore */}
      <Html position={[motorPosition[0], motorPosition[1] + 1.2, motorPosition[2]]} center>
        {isRunning && (
          <div className="bg-success text-success-foreground px-3 py-1 rounded text-xs font-bold shadow-lg">
            {rpm.toLocaleString()} RPM
          </div>
        )}
      </Html>
    </group>
  );
};

interface Scene3DProps {
  isRunning?: boolean;
  motorSpeed?: number;
  className?: string;
}

export const Scene3D: React.FC<Scene3DProps> = ({ isRunning = false, motorSpeed = 50, className }) => {
  const motorPosition: [number, number, number] = [-1.5, 0.3, 0];
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Light gray grid lines for dark mode as requested
  const gridColor = isDark ? '#555555' : '#e5e7eb';

  return (
    <div className={className}>
      {/* @ts-ignore */}
      <Canvas camera={{ position: [0, 5, 20], fov: 35 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <hemisphereLight intensity={0.5} groundColor="#000000" />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Suspense fallback={<Loader />}>
          <PumpModel isRunning={isRunning} motorSpeed={motorSpeed} motorPosition={motorPosition} />
          {/* @ts-ignore */}
          <Grid
            position={[0, -1.01, 0]}
            args={[20, 20]}
            sectionSize={5}
            cellSize={1}
            sectionColor={gridColor}
            cellColor={gridColor}
            infiniteGrid
            fadeDistance={30}
            fadeStrength={3}
          />
          {/* @ts-ignore */}
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} frames={1} />
        </Suspense>
        {/* @ts-ignore */}
        <OrbitControls enablePan={false} makeDefault />
      </Canvas>
    </div>
  );
};

// Preload for better performance
useGLTF.preload(`${import.meta.env.BASE_URL}models/zone1.glb`);
