"use client";

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';

const MOTOR_MESH_NAME = 'Body_Mat3_0';

const Loader = () => (
  <Html center>
    <div className="text-primary font-medium animate-pulse">Loading Scene...</div>
  </Html>
);

const PumpModel: React.FC<{ 
  isRunning?: boolean; 
  motorSpeed?: number; 
  motorPosition: [number, number, number] 
}> = ({
  isRunning = false,
  motorSpeed = 50,
  motorPosition
}) => {
  const { scene } = useGLTF('/models/zone1.glb');
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const rpm = Math.round((motorSpeed / 100) * 3000);
  const originalMaterialsRef = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        const mesh = child as THREE.Mesh;

        if (!originalMaterialsRef.current.has(mesh.name)) {
          originalMaterialsRef.current.set(mesh.name, mesh.material);
        }

        if (mesh.name === MOTOR_MESH_NAME) {
          if (isRunning) {
            const glowMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color('#22c55e'),
              emissive: new THREE.Color('#22c55e'),
              emissiveIntensity: 0.5,
              metalness: 0.8,
              roughness: 0.2,
            });
            mesh.material = glowMaterial;
          } else {
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
      <Html position={[motorPosition[0], motorPosition[1] + 1.2, motorPosition[2]]} center>
        {isRunning && (
          <div className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold shadow-lg">
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

export const Scene3D: React.FC<Scene3DProps> = ({ 
  isRunning = false, 
  motorSpeed = 50, 
  className 
}) => {
  const motorPosition: [number, number, number] = [-1.5, 0.3, 0];
  const [isDark, setIsDark] = useState(true);

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

  const gridColor = isDark ? '#555555' : '#e5e7eb';

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 5, 20], fov: 35 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <hemisphereLight intensity={0.5} groundColor="#000000" />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Suspense fallback={<Loader />}>
          <PumpModel isRunning={isRunning} motorSpeed={motorSpeed} motorPosition={motorPosition} />
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
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} frames={1} />
        </Suspense>
        <OrbitControls enablePan={false} makeDefault />
      </Canvas>
    </div>
  );
};

useGLTF.preload('/models/zone1.glb');
