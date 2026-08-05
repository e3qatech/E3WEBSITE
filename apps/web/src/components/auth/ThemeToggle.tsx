"use client";

import React from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
      aria-label="Toggle Theme"
    >
      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
