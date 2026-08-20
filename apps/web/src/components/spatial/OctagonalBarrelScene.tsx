"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpatialSection } from './spatial-experience.types';
import { SPATIAL_OCTAGON_CONFIG } from './spatial-experience.config';
import { SpatialFace } from './SpatialFace';
import { E3EnergyHub } from './E3EnergyHub';

export interface OctagonalBarrelSceneProps {
  sections: SpatialSection[];
  targetRotationX: number;
  activeIndex: number;
  scrollVelocity?: number;
  isMobile?: boolean;
  tier?: 'full' | 'balanced' | 'minimal';
}

function BarrelCore({
  sections,
  targetRotationX,
  activeIndex,
  scrollVelocity = 0,
  isMobile = false,
}: {
  sections: SpatialSection[];
  targetRotationX: number;
  activeIndex: number;
  scrollVelocity?: number;
  isMobile?: boolean;
}) {
  const barrelGroupRef = useRef<THREE.Group>(null);
  const smoothedRotationX = useRef<number>(0);

  // Smoothly damp the rotation of the barrel around the X-axis
  useFrame((state, delta) => {
    if (barrelGroupRef.current) {
      // Damped rotation interpolation
      smoothedRotationX.current = THREE.MathUtils.damp(
        smoothedRotationX.current,
        targetRotationX,
        8.5,
        delta
      );

      barrelGroupRef.current.rotation.x = smoothedRotationX.current;

      // Subtle mouse/pointer parallax tilt for physical weight
      const pointer = state.pointer;
      barrelGroupRef.current.rotation.y = THREE.MathUtils.damp(
        barrelGroupRef.current.rotation.y,
        pointer.x * 0.04,
        3.5,
        delta
      );
    }
  });

  // 3. Virtualized Recycled Face Window:
  // Dynamically map active and transition faces into an 8-slot physical cylinder without geometry collisions
  const virtualFaces = useMemo(() => {
    if (!sections || sections.length === 0) return [];

    // For <= 8 sections, map directly
    if (sections.length <= 8) {
      return sections.map((section, sIdx) => ({
        section,
        sectionIndex: sIdx,
        slotIndex: sIdx,
        isActive: sIdx === activeIndex,
      }));
    }

    // For > 8 sections, compute an 8-face window around activeIndex (e.g. [-3 .. +4])
    const windowStart = Math.max(0, activeIndex - 3);
    const windowEnd = Math.min(sections.length - 1, windowStart + 7);
    const adjustedStart = Math.max(0, Math.min(windowStart, windowEnd - 7));

    const result = [];
    for (let sIdx = adjustedStart; sIdx <= windowEnd; sIdx++) {
      const section = sections[sIdx];
      if (section) {
        const slotIndex = ((sIdx % 8) + 8) % 8;
        result.push({
          section,
          sectionIndex: sIdx,
          slotIndex,
          isActive: sIdx === activeIndex,
        });
      }
    }
    return result;
  }, [sections, activeIndex]);

  const activeSection = sections[activeIndex] || sections[0];
  const haloColor = activeSection?.haloColor || '#0284c7';
  const accentColor = activeSection?.accentColor || '#38bdf8';

  return (
    <>
      {/* 1. Atmospheric Depth Fog */}
      <fogExp2 attach="fog" args={['#050811', 0.08]} />

      {/* 2. Controlled Architectural Lighting */}
      <ambientLight intensity={0.7} />
      
      {/* Key Front Spotlight illuminating the active face */}
      <directionalLight
        position={[0, 1.5, 9]}
        intensity={1.8}
        color="#ffffff"
      />
      
      {/* Top Rim Light revealing the top adjacent rolling face */}
      <directionalLight
        position={[0, 6, 4]}
        intensity={0.8}
        color={accentColor}
      />

      {/* Bottom Rim Light revealing the rising bottom face */}
      <directionalLight
        position={[0, -6, 4]}
        intensity={0.6}
        color={haloColor}
      />

      {/* 3. The 8-Sided Horizontal Rotating Barrel Group with Recycled Virtual Face Pool */}
      <group ref={barrelGroupRef} position={[0, 0, 0]}>
        {virtualFaces.map((item) => (
          <SpatialFace
            key={item.section.id}
            section={item.section}
            slotIndex={item.slotIndex}
            isActive={item.isActive}
          />
        ))}
      </group>

      {/* 4. Central E3 Energy Hub on Axle (counter-rotates independently) */}
      <E3EnergyHub
        barrelRotationX={targetRotationX}
        haloColor={haloColor}
        accentColor={accentColor}
        scrollVelocity={scrollVelocity}
        isMobile={isMobile}
      />
    </>
  );
}

export function OctagonalBarrelScene({
  sections,
  targetRotationX,
  activeIndex,
  scrollVelocity = 0,
  isMobile = false,
  tier = 'balanced',
}: OctagonalBarrelSceneProps) {
  const dpr = useMemo<[number, number]>(() => {
    if (tier === 'full') return [1, 1.5];
    if (tier === 'balanced') return [1, 1.25];
    return [1, 1];
  }, [tier]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <Canvas
        camera={{
          position: [0, 0, SPATIAL_OCTAGON_CONFIG.cameraZ],
          fov: isMobile ? 54 : SPATIAL_OCTAGON_CONFIG.cameraFov,
          near: 0.1,
          far: 50,
        }}
        dpr={dpr}
        gl={{
          alpha: true,
          antialias: tier !== 'minimal',
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <BarrelCore
          sections={sections}
          targetRotationX={targetRotationX}
          activeIndex={activeIndex}
          scrollVelocity={scrollVelocity}
          isMobile={isMobile}
        />
      </Canvas>
    </div>
  );
}
