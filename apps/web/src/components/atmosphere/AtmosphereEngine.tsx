"use client";

import React, { useEffect, useRef } from "react";
import { WeatherState, WeatherData } from "./WeatherResolver";

interface AtmosphereEngineProps {
  weather: WeatherData;
  className?: string;
}

export function AtmosphereEngine({ weather, className }: AtmosphereEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const count = weather.state === "HEAVY_RAIN" ? 120 : weather.state === "RAIN" ? 60 : weather.state === "DUST" ? 90 : 35;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * (weather.state === "HEAVY_RAIN" ? 15 : 6) + 3,
      length: Math.random() * 20 + 10,
      opacity: Math.random() * 0.5 + 0.2,
      size: Math.random() * 3 + 1,
      angle: (weather.windDirection || 45) * (Math.PI / 180),
    }));

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (weather.state === "RAIN" || weather.state === "HEAVY_RAIN") {
        ctx.strokeStyle = "rgba(180, 220, 255, 0.4)";
        ctx.lineWidth = weather.state === "HEAVY_RAIN" ? 1.8 : 1.2;
        ctx.beginPath();
        particles.forEach((p) => {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + Math.sin(p.angle) * 5, p.y + p.length);
          p.y += p.speed;
          p.x += Math.sin(p.angle) * 2;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        });
        ctx.stroke();

        const grad = ctx.createLinearGradient(0, height - 16, 0, height);
        grad.addColorStop(0, "rgba(56, 189, 248, 0)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.15)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, height - 16, width, 16);
      } else if (weather.state === "DUST") {
        ctx.fillStyle = "rgba(217, 119, 6, 0.3)";
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.x += Math.cos(p.angle) * (p.speed * 0.8);
          p.y += Math.sin(p.angle) * (p.speed * 0.3);
          if (p.x > width || p.y > height) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [weather]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-20 ${className || ""}`}
    />
  );
}
