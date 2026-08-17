"use client";

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SpatialSection } from './spatial-experience.types';
import { SPATIAL_OCTAGON_CONFIG } from './spatial-experience.config';

export interface SpatialFaceProps {
  section: SpatialSection;
  index: number;
  isActive: boolean;
  barrelRotationX: number;
}

export function SpatialFace({
  section,
  index,
  isActive,
  barrelRotationX,
}: SpatialFaceProps) {
  const { radius, faceWidth, faceHeight, angleStep } = SPATIAL_OCTAGON_CONFIG;

  // Angular position of this face around the horizontal X-axis
  const faceAngle = index * angleStep;

  // Calculate face center in Y-Z plane
  const posY = Math.sin(faceAngle) * radius;
  const posZ = Math.cos(faceAngle) * radius;

  // Rotation: rotate around X-axis by -faceAngle so normal points outward
  const rotX = -faceAngle;

  const accentColor = section.accentColor || '#38bdf8';
  const bgColor = section.backgroundColor || '#0a0d14';

  const accentThreeColor = useMemo(() => new THREE.Color(accentColor), [accentColor]);
  const bgThreeColor = useMemo(() => new THREE.Color(bgColor), [bgColor]);

  return (
    <group position={[0, posY, posZ]} rotation={[rotX, 0, 0]}>
      {/* 1. Main Face Backplane Plate */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[faceWidth, faceHeight]} />
        <meshPhysicalMaterial
          color={bgThreeColor}
          roughness={0.4}
          metalness={0.2}
          transmission={0.3}
          thickness={0.5}
          transparent={true}
          opacity={0.88}
          clearcoat={0.3}
        />
      </mesh>

      {/* 2. Sleek Architectural Bevel Frame / Rim */}
      {/* Top Border Line */}
      <mesh position={[0, faceHeight / 2, 0.02]}>
        <boxGeometry args={[faceWidth, 0.04, 0.02]} />
        <meshStandardMaterial
          color={accentThreeColor}
          emissive={accentThreeColor}
          emissiveIntensity={isActive ? 1.4 : 0.4}
        />
      </mesh>

      {/* Bottom Border Line */}
      <mesh position={[0, -faceHeight / 2, 0.02]}>
        <boxGeometry args={[faceWidth, 0.04, 0.02]} />
        <meshStandardMaterial
          color={accentThreeColor}
          emissive={accentThreeColor}
          emissiveIntensity={isActive ? 1.4 : 0.4}
        />
      </mesh>

      {/* Left Outer Cap */}
      <mesh position={[-faceWidth / 2, 0, 0.02]}>
        <boxGeometry args={[0.04, faceHeight, 0.02]} />
        <meshStandardMaterial
          color={accentThreeColor}
          emissive={accentThreeColor}
          emissiveIntensity={isActive ? 1.2 : 0.3}
        />
      </mesh>

      {/* Right Outer Cap */}
      <mesh position={[faceWidth / 2, 0, 0.02]}>
        <boxGeometry args={[0.04, faceHeight, 0.02]} />
        <meshStandardMaterial
          color={accentThreeColor}
          emissive={accentThreeColor}
          emissiveIntensity={isActive ? 1.2 : 0.3}
        />
      </mesh>

      {/* 3. Corner High-Tech Marker Brackets */}
      {[-1, 1].map((sideX) =>
        [-1, 1].map((sideY) => (
          <group
            key={`corner-${sideX}-${sideY}`}
            position={[(sideX * faceWidth) / 2 - sideX * 0.4, (sideY * faceHeight) / 2 - sideY * 0.3, 0.03]}
          >
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.35, 0.05, 0.02]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={accentThreeColor}
                emissiveIntensity={isActive ? 2.0 : 0.6}
              />
            </mesh>
            <mesh position={[sideX * 0.15, -sideY * 0.1, 0]}>
              <boxGeometry args={[0.05, 0.25, 0.02]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={accentThreeColor}
                emissiveIntensity={isActive ? 2.0 : 0.6}
              />
            </mesh>
          </group>
        ))
      )}

      {/* 4. Subtle Lateral Structural Axle Ribs */}
      {[-faceWidth * 0.38, faceWidth * 0.38].map((xOffset, i) => (
        <mesh key={`rib-${i}`} position={[xOffset, 0, 0.01]}>
          <boxGeometry args={[0.02, faceHeight * 0.95, 0.01]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.6}
            metalness={0.8}
            transparent={true}
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
