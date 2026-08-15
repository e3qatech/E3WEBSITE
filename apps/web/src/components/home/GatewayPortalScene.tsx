"use client";

import React, { useEffect, useRef } from "react";
import { isWebGLSupported } from "@/lib/webgl-capability";

export interface GatewayPortalSceneProps {
  isMobile?: boolean;
  hoveredWorld?: "b2c" | "b2b" | null;
  isReducedMotion?: boolean;
  isRtl?: boolean;
}

export function GatewayPortalScene({
  isMobile = false,
  hoveredWorld = null,
  isReducedMotion = false,
  isRtl = false,
}: GatewayPortalSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !isWebGLSupported() || isReducedMotion) return;

    let renderer: any = null;
    let scene: any = null;
    let camera: any = null;
    let particlesMesh: any = null;
    let ringOuterMesh: any = null;
    let b2cArcMesh: any = null;
    let b2bArcMesh: any = null;
    let isDisposed = false;

    const init = async () => {
      try {
        const THREE = await import("three");
        if (isDisposed || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth || (isMobile ? 320 : 250);
        const height = container.clientHeight || (isMobile ? 120 : 600);

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

        // Clear container and append canvas
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        container.appendChild(renderer.domElement);

        // Ellipse Radii (normalized in Three.js units)
        const radiusX = isMobile ? 1.8 : 0.85;
        const radiusY = isMobile ? 0.65 : 2.2;

        // 1. Outer Metallic Graphite Ring (Curve)
        const curve = new THREE.EllipseCurve(
          0, 0,
          radiusX, radiusY,
          0, 2 * Math.PI,
          false,
          0
        );
        const points = curve.getPoints(120);
        const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
        const ringMat = new THREE.LineBasicMaterial({
          color: 0x334155, // Metallic graphite / slate-700
          transparent: true,
          opacity: 0.85,
          linewidth: 2,
        });
        ringOuterMesh = new THREE.Line(ringGeo, ringMat);
        scene.add(ringOuterMesh);

        // 2. Dual Lighting Glow Arcs:
        // B2C Arc: Violet/Magenta (#8B5CF6 / #EC4899)
        // B2B Arc: Signal Blue/Cyan (#3B82F6 / #22D3EE)
        // In LTR: B2C is left (angle PI/2 to 3PI/2), B2B is right (angle -PI/2 to PI/2).
        // In RTL: B2C is right, B2B is left.
        const b2cStartAngle = isRtl ? -Math.PI / 2 : Math.PI / 2;
        const b2cEndAngle = isRtl ? Math.PI / 2 : (3 * Math.PI) / 2;

        const b2bStartAngle = isRtl ? Math.PI / 2 : -Math.PI / 2;
        const b2bEndAngle = isRtl ? (3 * Math.PI) / 2 : Math.PI / 2;

        const b2cCurve = new THREE.EllipseCurve(
          0, 0,
          radiusX, radiusY,
          b2cStartAngle, b2cEndAngle,
          false,
          0
        );
        const b2cPoints = b2cCurve.getPoints(60);
        const b2cGeo = new THREE.BufferGeometry().setFromPoints(b2cPoints);
        const b2cMat = new THREE.LineBasicMaterial({
          color: 0xc084fc, // Bright violet-magenta glow
          transparent: true,
          opacity: 0.95,
        });
        b2cArcMesh = new THREE.Line(b2cGeo, b2cMat);
        scene.add(b2cArcMesh);

        const b2bCurve = new THREE.EllipseCurve(
          0, 0,
          radiusX, radiusY,
          b2bStartAngle, b2bEndAngle,
          false,
          0
        );
        const b2bPoints = b2bCurve.getPoints(60);
        const b2bGeo = new THREE.BufferGeometry().setFromPoints(b2bPoints);
        const b2bMat = new THREE.LineBasicMaterial({
          color: 0x38bdf8, // Bright signal cyan-blue glow
          transparent: true,
          opacity: 0.95,
        });
        b2bArcMesh = new THREE.Line(b2bGeo, b2bMat);
        scene.add(b2bArcMesh);

        // 3. Inner Atmospheric Particles
        const particleCount = isMobile ? 35 : 70;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);

        const colorB2C = new THREE.Color(0xa855f7); // Violet
        const colorB2B = new THREE.Color(0x06b6d4); // Cyan

        for (let i = 0; i < particleCount; i++) {
          const theta = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * 0.9;
          const x = Math.cos(theta) * radiusX * r;
          const y = Math.sin(theta) * radiusY * r;
          const z = (Math.random() - 0.5) * 0.8;

          particlePositions[i * 3] = x;
          particlePositions[i * 3 + 1] = y;
          particlePositions[i * 3 + 2] = z;

          // Color based on x position (B2C vs B2B)
          const isLeft = x < 0;
          const isB2CParticle = isRtl ? !isLeft : isLeft;
          const chosenColor = isB2CParticle ? colorB2C : colorB2B;

          particleColors[i * 3] = chosenColor.r;
          particleColors[i * 3 + 1] = chosenColor.g;
          particleColors[i * 3 + 2] = chosenColor.b;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

        const particleMat = new THREE.PointsMaterial({
          size: isMobile ? 0.04 : 0.05,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });

        particlesMesh = new THREE.Points(particleGeo, particleMat);
        scene.add(particlesMesh);

        // Animation Loop
        let time = 0;
        const animate = () => {
          if (isDisposed) return;
          time += 0.015;

          // Subtle harmonic breathing of the aperture
          const scaleOffset = Math.sin(time * 1.5) * 0.015;
          if (ringOuterMesh) ringOuterMesh.scale.set(1 + scaleOffset, 1 + scaleOffset, 1);
          if (b2cArcMesh) b2cArcMesh.scale.set(1 + scaleOffset, 1 + scaleOffset, 1);
          if (b2bArcMesh) b2bArcMesh.scale.set(1 + scaleOffset, 1 + scaleOffset, 1);

          // Slowly rotate particles with responsive bias toward hovered world
          if (particlesMesh) {
            particlesMesh.rotation.z = Math.sin(time * 0.3) * 0.05;
            
            // Hover bias
            let targetBias = 0;
            if (hoveredWorld === "b2c") targetBias = isRtl ? 0.15 : -0.15;
            if (hoveredWorld === "b2b") targetBias = isRtl ? -0.15 : 0.15;

            particlesMesh.position.x += (targetBias - particlesMesh.position.x) * 0.05;
          }

          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
          animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Resize handler
        const handleResize = () => {
          if (!containerRef.current || !renderer || !camera || isDisposed) return;
          const newW = containerRef.current.clientWidth || (isMobile ? 320 : 250);
          const newH = containerRef.current.clientHeight || (isMobile ? 120 : 600);
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        console.warn("[GatewayPortalScene] Three.js initialization fallback:", err);
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
  }, [isMobile, hoveredWorld, isReducedMotion, isRtl]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full pointer-events-none flex items-center justify-center relative select-none"
      aria-hidden="true"
    >
      {/* CSS/SVG Elliptical Fallback (renders instantly while WebGL boots or as pure decorative underlay) */}
      <svg
        viewBox={isMobile ? "0 0 320 120" : "0 0 250 680"}
        className="w-full h-full pointer-events-none absolute inset-0 opacity-40 mix-blend-screen"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="portalB2CGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="portalB2BGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
          </linearGradient>
          <filter id="portalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <ellipse
          cx={isMobile ? "160" : "125"}
          cy={isMobile ? "60" : "340"}
          rx={isMobile ? "140" : "110"}
          ry={isMobile ? "45" : "310"}
          fill="none"
          stroke="url(#portalB2CGradient)"
          strokeWidth="2.5"
          filter="url(#portalGlow)"
        />
        <ellipse
          cx={isMobile ? "160" : "125"}
          cy={isMobile ? "60" : "340"}
          rx={isMobile ? "140" : "110"}
          ry={isMobile ? "45" : "310"}
          fill="none"
          stroke="url(#portalB2BGradient)"
          strokeWidth="2.5"
          filter="url(#portalGlow)"
        />
      </svg>
    </div>
  );
}
