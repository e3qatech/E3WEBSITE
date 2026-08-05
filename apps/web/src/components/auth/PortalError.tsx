"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PortalErrorProps {
  message: string;
}

export function PortalError({ message }: PortalErrorProps) {
  if (!message) return null;

  return (
    <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-medium flex items-center gap-2.5 shadow-md">
      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
