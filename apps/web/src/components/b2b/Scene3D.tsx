"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";

function Model({ url }: { url: string }) {
  // We use a try/catch mechanism internally via Suspense boundaries,
  // but if the URL is invalid, it will throw.
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

export default function Scene3D({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      <Suspense fallback={null}>
        {modelUrl ? (
          <Model url={modelUrl} />
        ) : (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        )}
        <Environment preset="city" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
      </Suspense>
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={2} 
        maxDistance={10} 
        autoRotate 
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
