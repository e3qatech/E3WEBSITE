"use client";

import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isAr?: boolean;
  placeholder?: string;
  label?: string;
}

export function PasswordField({
  value,
  onChange,
  disabled = false,
  isAr = false,
  placeholder = '••••••••',
  label,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400">
          <Lock className="w-4 h-4" />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-zinc-950 border border-white/15 rounded-xl ps-10 pe-11 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-zinc-400 hover:text-white transition-colors"
          aria-label={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
