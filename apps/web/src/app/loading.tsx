import React from "react";

export default function GlobalLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--surface-default)]">
      <div className="flex flex-col items-center gap-4">
        {/* Terminal cursor style loader matching gstack design system */}
        <div className="flex items-center gap-1">
          <div className="h-5 w-3 bg-[var(--color-primary)] animate-pulse" style={{ animationDuration: '800ms' }}></div>
          <span className="text-[var(--color-primary)] font-mono text-sm tracking-widest uppercase font-bold ml-2">Loading System</span>
        </div>
      </div>
    </div>
  );
}
