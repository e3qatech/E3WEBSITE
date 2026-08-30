import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-level-1)]/90 backdrop-blur-xl transition-all duration-500">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-emerald-500/10 rounded-full blur-2xl animate-ping opacity-30" />
      </div>

      {/* Center Brand Pulse & Spinner */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Geometric Glowing Emblem */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer rotating neon ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/30 border-t-emerald-400 animate-spin [animation-duration:1.8s] shadow-[0_0_25px_rgba(16,185,129,0.3)]" />
          
          {/* Inner counter-rotating ring */}
          <div className="absolute inset-2 rounded-2xl border-2 border-blue-500/20 border-b-teal-400 animate-spin [animation-duration:2.5s] [animation-direction:reverse]" />

          {/* Core E3 Logo Badge */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-[var(--surface-raised)] to-[var(--surface-default)] border border-emerald-500/40 flex items-center justify-center shadow-xl backdrop-blur-md">
            <span className="text-xl font-black font-syne text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-white tracking-tighter">
              E3
            </span>
          </div>
        </div>

        {/* Loading Text & Modern Shimmer Bar */}
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-xs font-mono font-extrabold uppercase tracking-[0.25em] text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse">
            EXPERIENCE LOADING
          </span>
          
          {/* Progress Shimmer */}
          <div className="w-48 h-1 bg-[var(--surface-raised)] rounded-full overflow-hidden border border-white/5">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
