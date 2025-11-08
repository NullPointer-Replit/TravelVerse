'use client';

import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function EarthModel() {
  const { scene } = useGLTF('/earth.glb');
  const earthRef = useRef();
  const groupRef = useRef();

  // Rotate the earth continuously
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.2; // Adjust speed here (0.2 = slow rotation)
    }
  });

  // Clone and center the scene
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Calculate bounding box to center the model
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the model
    cloned.position.x = -center.x;
    cloned.position.y = -center.y;
    cloned.position.z = -center.z;
    
    // Calculate optimal scale to fit in view (with padding)
    // Camera is at z=12, FOV=65, so we want the model to fit comfortably
    const maxDim = Math.max(size.x, size.y, size.z);
    // Scale to fit with generous padding to ensure nothing is cut off
    // Using a smaller multiplier ensures the earth fits fully in view
    const optimalScale = 1.5 / maxDim;
    
    return { cloned, scale: optimalScale };
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive 
        ref={earthRef} 
        object={clonedScene.cloned} 
        scale={clonedScene.scale} 
        position={[0, 0, 0]}
      />
    </group>
  );
}

// Preload the model for better performance
useGLTF.preload('/earth.glb');

export default function Earth3D() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center" style={{ minHeight: '100vh' }}>
      {/* Scrolling Text Behind Globe */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0">
        <div className="scrolling-text-globe text-5xl md:text-7xl lg:text-8xl font-bold text-emerald-500/15 whitespace-nowrap">
          Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • Your Journey, Your Itinerary! • 
        </div>
      </div>

      {/* Three.js Canvas */}
      <div className="relative z-10 w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 65 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            {/* Studio Quality Lighting Setup */}
            {/* Key Light - Main bright light from front-right */}
            <directionalLight 
              position={[5, 3, 5]} 
              intensity={2.5} 
              color="#ffffff"
              castShadow
            />
            {/* Fill Light - Softer light from front-left to fill shadows */}
            <directionalLight 
              position={[-4, 2, 4]} 
              intensity={1.2} 
              color="#ffffff"
            />
            {/* Rim/Back Light - Edge lighting from behind */}
            <directionalLight 
              position={[-3, -2, -5]} 
              intensity={1.5} 
              color="#ffffff"
            />
            {/* Top Light - Additional light from above */}
            <directionalLight 
              position={[0, 8, 0]} 
              intensity={1.0} 
              color="#ffffff"
            />
            {/* Ambient Light - Overall base illumination */}
            <ambientLight intensity={1.2} color="#ffffff" />
            {/* Additional point lights for depth */}
            <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
            <pointLight position={[-5, -3, -3]} intensity={0.6} color="#ffffff" />
            
            <EarthModel />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
