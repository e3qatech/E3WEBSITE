"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMotionCapability } from '@/lib/motion/capability-context';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export interface B2BInteractiveCtaProps {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
  iconType?: 'arrow-right' | 'arrow-up-right';
  className?: string;
}

export function B2BInteractiveCta({
  href,
  label,
  variant = 'primary',
  iconType = 'arrow-right',
  className = '',
}: B2BInteractiveCtaProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { tier, isReducedMotion, isTouch } = useMotionCapability();

  const isMagnetic = tier === 'full' && !isReducedMotion && !isTouch;

  // Magnetic button displacement
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 200 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMagnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Displace up to 8px towards mouse
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    if (!isMagnetic) return;
    x.set(0);
    y.set(0);
  };

  const isPrimary = variant === 'primary';

  const baseStyles = isPrimary
    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]'
    : 'bg-zinc-900/80 backdrop-blur-md border border-zinc-700/80 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800';

  return (
    <motion.div
      style={{
        x: isMagnetic ? smoothX : 0,
        y: isMagnetic ? smoothY : 0,
      }}
      className="inline-block"
    >
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`group relative inline-flex items-center gap-3 px-8 py-4 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-0.5 outline-none focus:ring-2 focus:ring-emerald-400 ${baseStyles} ${className}`}
      >
        <span>{label}</span>
        {iconType === 'arrow-right' ? (
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
        ) : (
          <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
        )}
      </Link>
    </motion.div>
  );
}
