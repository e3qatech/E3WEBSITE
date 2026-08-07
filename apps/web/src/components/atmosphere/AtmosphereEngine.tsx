"use client";

import React, { useEffect, useRef } from "react";
import { AtmosphereRendererType } from "@/types/gateway-cms";

export interface AtmosphereEngineProps {
  rendererType: AtmosphereRendererType;
  particleCount?: number;
  particleSpeed?: number;
  particleOpacity?: number;
  waterHeightPercent?: number;
  sandHeightPercent?: number;
  windSpeedKmh?: number;
  windDirectionDeg?: number;
  isNight?: boolean;
  isReducedMotion?: boolean;
  isWebGlAvailable?: boolean;
  className?: string;
}

export function AtmosphereEngine({
  rendererType,
  particleCount = 60,
  particleSpeed = 5,
  particleOpacity = 0.5,
  waterHeightPercent = 0,
  sandHeightPercent = 0,
  windSpeedKmh = 15,
  windDirectionDeg = 45,
  isNight = false,
  isReducedMotion = false,
  isWebGlAvailable = true,
  className,
}: AtmosphereEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // If reduced motion or WebGL unavailable, render static frame once
    if (isReducedMotion || !isWebGlAvailable || rendererType === 'static-fallback') {
      ctx.clearRect(0, 0, width, height);

      if (rendererType === 'heat') {
        const heatGrad = ctx.createLinearGradient(0, 0, 0, height);
        heatGrad.addColorStop(0, "rgba(245, 158, 11, 0.1)");
        heatGrad.addColorStop(1, "rgba(180, 83, 9, 0.25)");
        ctx.fillStyle = heatGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (rendererType === 'night' || isNight) {
        ctx.fillStyle = "rgba(9, 9, 15, 0.4)";
        ctx.fillRect(0, 0, width, height);
      }
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const effectiveCount = Math.max(10, Math.min(particleCount, 300));
    const angleRad = (windDirectionDeg || 45) * (Math.PI / 180);

    const particles = Array.from({ length: effectiveCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: (Math.random() * particleSpeed + 2) * (windSpeedKmh > 30 ? 1.5 : 1.0),
      length: Math.random() * 25 + 10,
      opacity: Math.random() * particleOpacity + 0.1,
      size: Math.random() * 3.5 + 1,
      waveOffset: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // 1. NIGHT SKY OVERLAY
      if (rendererType === 'night' || isNight) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        for (let i = 0; i < 40; i++) {
          const sx = (i * 97) % width;
          const sy = (i * 43) % (height * 0.7);
          const twinkle = Math.sin(frameCount * 0.05 + i) * 0.4 + 0.6;
          ctx.globalAlpha = twinkle * 0.5;
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // 2. HEAT SHIMMER OVERLAY
      if (rendererType === 'heat') {
        const heatGrad = ctx.createLinearGradient(0, 0, 0, height);
        heatGrad.addColorStop(0, "rgba(245, 158, 11, 0.08)");
        heatGrad.addColorStop(0.7, "rgba(217, 119, 6, 0.2)");
        heatGrad.addColorStop(1, "rgba(180, 83, 9, 0.35)");
        ctx.fillStyle = heatGrad;
        ctx.fillRect(0, 0, width, height);

        // Heat shimmer lines
        ctx.strokeStyle = "rgba(251, 146, 60, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const hy = height * 0.5 + i * 40;
          ctx.moveTo(0, hy + Math.sin(frameCount * 0.08 + i) * 6);
          ctx.lineTo(width, hy + Math.cos(frameCount * 0.08 + i) * 6);
        }
        ctx.stroke();
      }

      // 3. FOG & HAZE OVERLAY
      if (rendererType === 'fog') {
        const fogGrad = ctx.createLinearGradient(0, height * 0.2, 0, height);
        fogGrad.addColorStop(0, "rgba(203, 213, 225, 0.05)");
        fogGrad.addColorStop(1, "rgba(148, 163, 184, 0.35)");
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 4. RAIN / HEAVY RAIN / DUST / SANDSTORM PARTICLES
      if (rendererType === 'rain' || rendererType === 'heavy-rain') {
        ctx.strokeStyle = rendererType === 'heavy-rain' ? "rgba(186, 230, 253, 0.6)" : "rgba(186, 230, 253, 0.35)";
        ctx.lineWidth = rendererType === 'heavy-rain' ? 2.0 : 1.2;
        ctx.beginPath();

        particles.forEach((p) => {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(angleRad) * 6, p.y + p.length);
          p.y += p.speed;
          p.x += Math.sin(angleRad) * 2;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });
        ctx.stroke();
      } else if (rendererType === 'dust' || rendererType === 'sandstorm') {
        ctx.fillStyle = rendererType === 'sandstorm' ? "rgba(217, 119, 6, 0.45)" : "rgba(180, 83, 9, 0.25)";
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.x += Math.cos(angleRad) * (p.speed * 1.2);
          p.y += Math.sin(angleRad) * (p.speed * 0.4);
          if (p.x > width || p.y > height) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
          }
        });
      }

      // 5. WATER ACCUMULATION LEVEL (CAPPED <= 40%)
      const safeWaterPercent = Math.min(waterHeightPercent || 0, 40);
      if (safeWaterPercent > 0) {
        const waterHeight = (safeWaterPercent / 100) * height;
        const waterTop = height - waterHeight;

        const waterGrad = ctx.createLinearGradient(0, waterTop, 0, height);
        waterGrad.addColorStop(0, "rgba(56, 189, 248, 0.3)");
        waterGrad.addColorStop(1, "rgba(14, 165, 233, 0.65)");

        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, waterTop);

        for (let x = 0; x <= width; x += 30) {
          const waveY = waterTop + Math.sin(frameCount * 0.05 + x * 0.02) * 5;
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Reflection highlight line
        ctx.strokeStyle = "rgba(224, 242, 254, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, waterTop);
        for (let x = 0; x <= width; x += 30) {
          const waveY = waterTop + Math.sin(frameCount * 0.05 + x * 0.02) * 5;
          ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }

      // 6. SAND DUNE ACCUMULATION LEVEL (CAPPED <= 30%)
      const safeSandPercent = Math.min(sandHeightPercent || 0, 30);
      if (safeSandPercent > 0) {
        const sandHeight = (safeSandPercent / 100) * height;
        const sandTop = height - sandHeight;

        const sandGrad = ctx.createLinearGradient(0, sandTop, 0, height);
        sandGrad.addColorStop(0, "rgba(217, 119, 6, 0.4)");
        sandGrad.addColorStop(1, "rgba(146, 64, 14, 0.85)");

        ctx.fillStyle = sandGrad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, sandTop);

        for (let x = 0; x <= width; x += 40) {
          const duneY = sandTop + Math.sin(x * 0.015) * 12 + Math.cos(frameCount * 0.02 + x * 0.01) * 3;
          ctx.lineTo(x, duneY);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    rendererType,
    particleCount,
    particleSpeed,
    particleOpacity,
    waterHeightPercent,
    sandHeightPercent,
    windSpeedKmh,
    windDirectionDeg,
    isNight,
    isReducedMotion,
    isWebGlAvailable,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-20 ${className || ""}`}
    />
  );
}
