'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

class ModelErrorBoundary extends React.Component<{children: React.ReactNode, fallbackUrl?: string}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode, fallbackUrl?: string}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("3D Model Error:", error);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallbackUrl) {
        return (
          <div className="absolute inset-0 w-full h-full">
            <img src={this.props.fallbackUrl} alt="Fallback Media" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest bg-zinc-950/50 px-4 py-2 rounded-full backdrop-blur-md">3D Experience Unavailable</span>
            </div>
          </div>
        );
      }
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl m-4">
          <span className="text-white/50 text-sm font-bold uppercase tracking-widest">3D Experience Unavailable</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ModelViewer({ url, fallbackUrl }: { url: string, fallbackUrl?: string }) {
  if (!url) return null;
  
  return (
    <ModelErrorBoundary fallbackUrl={fallbackUrl}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <React.Suspense fallback={null}>
          <Model url={url} />
        </React.Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={1}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </ModelErrorBoundary>
  );
}
