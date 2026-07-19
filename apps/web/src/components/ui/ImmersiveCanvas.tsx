'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { useB2CThemeStore } from '@/store/useB2CThemeStore';
import { ShaderBackground } from './ShaderBackground';
import { cn } from './AnimatedText';

interface ImmersiveCanvasProps {
  className?: string;
  children?: React.ReactNode;
}

// We wrap the heavy ThreeJS canvas to strictly control when it renders
export function ImmersiveCanvas({ className, children }: ImmersiveCanvasProps) {
  const immersiveMode = useB2CThemeStore((state) => state.immersiveMode);

  // If the user hasn't opted into immersive mode (or prefers reduced motion), we render a lightweight fallback
  if (!immersiveMode) {
    return (
      <div className={cn("absolute inset-0 bg-gradient-to-br from-[var(--background-primary)] to-[var(--background-secondary)] -z-10", className)} />
    );
  }

  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]} // Optimize for mobile vs desktop pixel ratios
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <Suspense fallback={null}>
          <ShaderBackground />
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
