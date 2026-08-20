"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPATIAL_OCTAGON_CONFIG } from './spatial-experience.config';

export interface E3EnergyHubProps {
  barrelRotationX: number;
  haloColor?: string;
  accentColor?: string;
  scrollVelocity?: number;
  isMobile?: boolean;
}

// Procedural Halo Vertex Shader
const haloVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Procedural Halo Fragment Shader (Lightweight dynamic noise & concentric energy ripples)
const haloFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uAccentColor;
  uniform float uVelocity;
  uniform float uPulse;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vec2 center = vUv - vec2(0.5);
    float dist = length(center) * 2.0;
    
    // Multi-layered concentric energy waves
    float wave1 = sin(dist * 18.0 - uTime * 2.5) * 0.5 + 0.5;
    float wave2 = cos(dist * 32.0 - uTime * 4.0 + atan(center.y, center.x) * 4.0) * 0.5 + 0.5;
    float ripple = mix(wave1, wave2, 0.4);

    // Fresnel glow on rim
    float rim = 1.0 - max(0.0, dot(vec3(0.0, 0.0, 1.0), vNormal));
    rim = pow(rim, 2.5);

    // Soft radial fade (transparent at outer edge and inner axle)
    float mask = smoothstep(1.0, 0.25, dist) * smoothstep(0.1, 0.4, dist);

    // Combined intensity with velocity response and face-change pulse
    float energy = (ripple * 0.65 + rim * 0.85 + uPulse * 0.4) * (1.0 + min(abs(uVelocity) * 2.0, 1.2));

    vec3 finalColor = mix(uColor, uAccentColor, wave2 * 0.6);
    float alpha = clamp(energy * mask * 0.75, 0.0, 0.95);

    gl_FragColor = vec4(finalColor * (1.2 + uPulse * 0.5), alpha);
  }
`;

export function E3EnergyHub({
  barrelRotationX,
  haloColor = '#0284c7',
  accentColor = '#38bdf8',
  scrollVelocity = 0,
  isMobile = false,
}: E3EnergyHubProps) {
  const hubGroupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const haloMatRef = useRef<THREE.ShaderMaterial>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const prevRotationXRef = useRef<number>(barrelRotationX);
  const pulseRef = useRef<number>(0);

  // Target colors for smooth transitions
  const targetColor = useMemo(() => new THREE.Color(haloColor), [haloColor]);
  const targetAccent = useMemo(() => new THREE.Color(accentColor), [accentColor]);
  const currentColor = useRef<THREE.Color>(new THREE.Color(haloColor));
  const currentAccent = useRef<THREE.Color>(new THREE.Color(accentColor));

  // Shader uniforms
  const haloUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(haloColor) },
      uAccentColor: { value: new THREE.Color(accentColor) },
      uVelocity: { value: 0 },
      uPulse: { value: 0 },
    }),
    [haloColor, accentColor]
  );

  // Ambient dust particle cloud along horizontal axle
  const particleCount = isMobile ? 40 : 100;
  const particleData = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);

    const baseColor = new THREE.Color(accentColor);
    const axleWidth = SPATIAL_OCTAGON_CONFIG.faceWidth * 0.9;

    // Pure deterministic PRNG based on index for rendering purity
    const prng = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    for (let i = 0; i < particleCount; i++) {
      // Spread across horizontal axle X in [-axleWidth/2, +axleWidth/2]
      pos[i * 3] = (prng(i * 4 + 1) - 0.5) * axleWidth;
      // Orbit in Y-Z radius between 0.8 and 3.2
      const angle = prng(i * 4 + 2) * Math.PI * 2;
      const radius = 0.8 + prng(i * 4 + 3) * 2.4;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = Math.cos(angle) * radius;

      col[i * 3] = baseColor.r * (0.6 + prng(i * 4 + 4) * 0.5);
      col[i * 3 + 1] = baseColor.g * (0.6 + prng(i * 4 + 4) * 0.5);
      col[i * 3 + 2] = baseColor.b * (0.6 + prng(i * 4 + 4) * 0.5);

      spd[i] = 0.2 + prng(i * 4 + 5) * 0.8;
    }

    return { positions: pos, colors: col, speeds: spd };
  }, [particleCount, accentColor]);

  useFrame((state, delta) => {
    // 1. Detect rotation change to trigger energy pulse
    if (Math.abs(barrelRotationX - prevRotationXRef.current) > 0.05) {
      pulseRef.current = Math.min(pulseRef.current + 0.35, 1.0);
      prevRotationXRef.current = barrelRotationX;
    }
    // Decay pulse
    pulseRef.current = Math.max(0, pulseRef.current - delta * 2.0);

    // 2. Smoothly lerp shader colors
    currentColor.current.lerp(targetColor, delta * 3.5);
    currentAccent.current.lerp(targetAccent, delta * 3.5);

    if (haloMatRef.current) {
      haloMatRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      haloMatRef.current.uniforms.uColor.value.copy(currentColor.current);
      haloMatRef.current.uniforms.uAccentColor.value.copy(currentAccent.current);
      haloMatRef.current.uniforms.uVelocity.value = THREE.MathUtils.lerp(
        haloMatRef.current.uniforms.uVelocity.value,
        scrollVelocity,
        delta * 6.0
      );
      haloMatRef.current.uniforms.uPulse.value = pulseRef.current;
    }

    // 3. Counter-rotate on X-axis at ~30% speed for mechanical parallax
    if (hubGroupRef.current) {
      const counterRotX = barrelRotationX * SPATIAL_OCTAGON_CONFIG.hubCounterRotationRatio;
      hubGroupRef.current.rotation.x = THREE.MathUtils.damp(
        hubGroupRef.current.rotation.x,
        counterRotX,
        8,
        delta
      );

      // Subtle mouse/pointer parallax tilt
      const pointer = state.pointer;
      hubGroupRef.current.rotation.y = THREE.MathUtils.damp(
        hubGroupRef.current.rotation.y,
        pointer.x * 0.12,
        4,
        delta
      );
      hubGroupRef.current.rotation.z = THREE.MathUtils.damp(
        hubGroupRef.current.rotation.z,
        pointer.y * 0.08,
        4,
        delta
      );
    }

    // 4. Internal concentric rings continuous counter-rotation
    const time = state.clock.getElapsedTime();
    if (ring1Ref.current) ring1Ref.current.rotation.x = time * 0.45;
    if (ring2Ref.current) ring2Ref.current.rotation.x = -time * 0.35;
    if (ring3Ref.current) ring3Ref.current.rotation.x = time * 0.65;

    // 5. Central E3 faceted core rotation
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.8;
      coreRef.current.rotation.z = Math.sin(time * 1.2) * 0.2;
      const scale = 1.0 + Math.sin(time * 3.0) * 0.05 + pulseRef.current * 0.2;
      coreRef.current.scale.set(scale, scale, scale);
    }

    // 6. Particle cloud orbital flow
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const currentY = positions[idx + 1];
        const currentZ = positions[idx + 2];
        const angle = Math.atan2(currentY, currentZ) + delta * particleData.speeds[i] * 0.5;
        const radius = Math.sqrt(currentY * currentY + currentZ * currentZ);
        positions[idx + 1] = Math.sin(angle) * radius;
        positions[idx + 2] = Math.cos(angle) * radius;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const axleLength = SPATIAL_OCTAGON_CONFIG.faceWidth * 1.05;

  return (
    <group ref={hubGroupRef} position={[0, 0, 0]}>
      {/* 1. Main Horizontal Axle Shaft along X-axis */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, axleLength, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.88}
          roughness={0.25}
          emissive={haloColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 2. Axle Bearing Mounts / End Rings */}
      {[-axleLength * 0.45, -axleLength * 0.22, 0, axleLength * 0.22, axleLength * 0.45].map(
        (posX, idx) => (
          <mesh key={idx} position={[posX, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.15, 24]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.92}
              roughness={0.2}
              emissive={accentColor}
              emissiveIntensity={0.25}
            />
          </mesh>
        )
      )}

      {/* 3. Procedural Energy Halo Disk at Center (Y-Z plane) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[7.2, 7.2, 32, 32]} />
        <shaderMaterial
          ref={haloMatRef}
          vertexShader={haloVertexShader}
          fragmentShader={haloFragmentShader}
          uniforms={haloUniforms}
          transparent={true}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Concentric High-Tech Architectural Energy Rings */}
      <group position={[0, 0, 0]}>
        {/* Outer Ring */}
        <mesh ref={ring1Ref} rotation={[0, 0, 0]}>
          <torusGeometry args={[2.8, 0.035, 16, 64]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Middle Segmented Ring */}
        <mesh ref={ring2Ref} rotation={[0, 0, 0]}>
          <torusGeometry args={[2.0, 0.045, 16, 64]} />
          <meshStandardMaterial
            color={haloColor}
            emissive={haloColor}
            emissiveIntensity={1.5}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Inner Fast Ring */}
        <mesh ref={ring3Ref} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.2, 0.03, 16, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={accentColor}
            emissiveIntensity={2.0}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 5. Central E3 Faceted Geometric Energy Core */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={accentColor}
          emissiveIntensity={1.8}
          wireframe={false}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* 6. Surrounding Ambient Dust Particle Swarm */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 0.05 : 0.075}
          vertexColors={true}
          transparent={true}
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
