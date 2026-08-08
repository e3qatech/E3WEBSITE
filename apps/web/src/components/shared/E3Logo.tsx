"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface E3LogoProps {
  isLight?: boolean;
  lightLogoUrl?: string;
  darkLogoUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function E3Logo({
  isLight = false,
  lightLogoUrl,
  darkLogoUrl,
  className,
  size = "md",
  showText = false,
}: E3LogoProps) {
  // If explicit image URLs are provided via CMS or props
  const activeLogoUrl = isLight ? (lightLogoUrl || darkLogoUrl) : (darkLogoUrl || lightLogoUrl);

  if (activeLogoUrl) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <img
          src={activeLogoUrl}
          alt="E3 Qatar Logo"
          className={cn(
            "object-contain w-auto",
            size === "sm" && "h-7",
            size === "md" && "h-9",
            size === "lg" && "h-11",
            size === "xl" && "h-14"
          )}
        />
      </div>
    );
  }

  // Built-in Dynamic Light & Dark Mode SVG Vector Logos
  const iconSize = size === "sm" ? 26 : size === "md" ? 34 : size === "lg" ? 42 : 52;

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none transition-colors duration-300", className)}>
      {/* Emblem SVG */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Light Mode Gradient */}
            <linearGradient id="e3LogoLightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="e3LogoLightAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Dark Mode Gradient */}
            <linearGradient id="e3LogoDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="e3LogoDarkBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
          </defs>

          {isLight ? (
            /* LIGHT MODE SVG MARK */
            <g>
              {/* Outer Shield Frame */}
              <rect x="2" y="2" width="40" height="40" rx="10" fill="url(#e3LogoLightGradient)" />
              
              {/* Stylized 'E' bars */}
              <path d="M12 13H31C32.1046 13 33 13.8954 33 15V16C33 17.1046 32.1046 18 31 18H17V20H27C28.1046 20 29 20.8954 29 22V23C29 24.1046 28.1046 25 27 25H17V27H31C32.1046 27 33 27.8954 33 29V30C33 31.1046 32.1046 32 31 32H12C10.8954 32 10 31.1046 10 30V15C10 13.8954 10.8954 13 12 13Z" fill="#ffffff" />
              
              {/* Vibrant Accent Edge '3' indicator */}
              <path d="M28 13L34 19V21L29 26L34 31V32L28 32" stroke="url(#e3LogoLightAccent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : (
            /* DARK MODE SVG MARK WITH GLOW */
            <g>
              {/* Glowing Ambient Backdrop */}
              <rect x="2" y="2" width="40" height="40" rx="10" fill="url(#e3LogoDarkBg)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              
              {/* Neon Glow Contour */}
              <rect x="3" y="3" width="38" height="38" rx="9" fill="none" stroke="url(#e3LogoDarkGradient)" strokeWidth="1.5" strokeDasharray="60 30" opacity="0.8" />

              {/* Stylized Geometric E3 Emblem */}
              <path d="M12 13H31C32.1046 13 33 13.8954 33 15V16C33 17.1046 32.1046 18 31 18H17V20H27C28.1046 20 29 20.8954 29 22V23C29 24.1046 28.1046 25 27 25H17V27H31C32.1046 27 33 27.8954 33 29V30C33 31.1046 32.1046 32 31 32H12C10.8954 32 10 31.1046 10 30V15C10 13.8954 10.8954 13 12 13Z" fill="#ffffff" />
              <path d="M27 13H33V18H29V25H33V32H27" fill="url(#e3LogoDarkGradient)" opacity="0.95" />
            </g>
          )}
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black tracking-tighter font-display uppercase",
              size === "sm" && "text-base",
              size === "md" && "text-xl",
              size === "lg" && "text-2xl",
              size === "xl" && "text-3xl"
            )}
          >
            <span className={isLight ? "text-zinc-950" : "text-white"}>E3</span>{" "}
            <span
              className={cn(
                "font-extrabold tracking-tight ms-0.5",
                isLight ? "text-emerald-600" : "text-emerald-400"
              )}
            >
              QATAR
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
