"use client";

import React, { useEffect, useRef } from "react";
import { isWebGLSupported } from "@/lib/webgl-capability";

export interface GatewayPortalSceneProps {
  isMobile?: boolean;
  hoveredWorld?: "b2c" | "b2b" | null;
  isReducedMotion?: boolean;
  isRtl?: boolean;
  isLight?: boolean;
}

export function GatewayPortalScene({
  isMobile = false,
  hoveredWorld = null,
  isReducedMotion = false,
  isRtl = false,
  isLight = false,
}: GatewayPortalSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !isWebGLSupported() || isReducedMotion) return;

    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let particlesMesh: any = null;
    let seamLineMesh: any = null;
    let isDisposed = false;

    const init = async () => {
      try {
        const THREE = await import("three");
        if (isDisposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || (isMobile ? 320 : 60);
        const height = container.clientHeight || (isMobile ? 40 : 800);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 5;

        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          });
        } catch {
          return;
        }

        if (!renderer || isDisposed) return;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        container.appendChild(renderer.domElement);

        // 1. Restrained Slanted Energy Seam Line
        const linePoints = [
          new THREE.Vector3(isMobile ? -2.5 : 0.2, isMobile ? 0 : 3.5, 0),
          new THREE.Vector3(isMobile ? 2.5 : -0.2, isMobile ? 0 : -3.5, 0),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({
          color: isLight ? 0x7c3aed : 0x38bdf8,
          transparent: true,
          opacity: isLight ? 0.6 : 0.85,
        });
        seamLineMesh = new THREE.Line(lineGeo, lineMat);
        scene.add(seamLineMesh);

        // 2. Linear Atmospheric Particle Stream along the seam
        const particleCount = isMobile ? 15 : 30;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        const colorB2C = new THREE.Color(isLight ? 0xd9468f : 0xa855f7);
        const colorB2B = new THREE.Color(isLight ? 0x2563eb : 0x06b6d4);

        for (let i = 0; i < particleCount; i++) {
          const t = (i / particleCount) * 2 - 1;
          const x = (isMobile ? t * 2.5 : t * -0.2) + (Math.random() - 0.5) * 0.15;
          const y = (isMobile ? (Math.random() - 0.5) * 0.15 : t * 3.5);
          const z = (Math.random() - 0.5) * 0.2;

          particlePositions[i * 3] = x;
          particlePositions[i * 3 + 1] = y;
          particlePositions[i * 3 + 2] = z;

          const chosenColor = i % 2 === 0 ? colorB2C : colorB2B;
          particleColors[i * 3] = chosenColor.r;
          particleColors[i * 3 + 1] = chosenColor.g;
          particleColors[i * 3 + 2] = chosenColor.b;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

        const particleMat = new THREE.PointsMaterial({
          size: isMobile ? 0.03 : 0.04,
          vertexColors: true,
          transparent: true,
          opacity: isLight ? 0.5 : 0.75,
          blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        });

        particlesMesh = new THREE.Points(particleGeo, particleMat);
        scene.add(particlesMesh);

        // Animation Loop
        const animate = () => {
          if (isDisposed) return;

          if (particlesMesh) {
            const positions = particlesMesh.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
              if (isMobile) {
                positions[i * 3] += 0.008;
                if (positions[i * 3] > 2.5) positions[i * 3] = -2.5;
              } else {
                positions[i * 3 + 1] -= 0.01;
                if (positions[i * 3 + 1] < -3.5) positions[i * 3 + 1] = 3.5;
              }
            }
            particlesMesh.geometry.attributes.position.needsUpdate = true;

            // Hover bias toward active world
            let targetBias = 0;
            if (hoveredWorld === "b2c") targetBias = isRtl ? 0.1 : -0.1;
            if (hoveredWorld === "b2b") targetBias = isRtl ? -0.1 : 0.1;
            particlesMesh.position.x += (targetBias - particlesMesh.position.x) * 0.05;
          }

          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
          animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera || isDisposed) return;
          const newW = containerRef.current.clientWidth || (isMobile ? 320 : 60);
          const newH = containerRef.current.clientHeight || (isMobile ? 40 : 800);
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        console.warn("[GatewayPortalScene] Three.js energy seam fallback:", err);
      }
    };

    const cleanupPromise = init();

    return () => {
      isDisposed = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      cleanupPromise.then((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
      if (renderer) {
        try {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        } catch {}
      }
    };
  }, [isMobile, hoveredWorld, isReducedMotion, isRtl, isLight]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full pointer-events-none flex items-center justify-center relative select-none"
      aria-hidden="true"
    />
  );
}
