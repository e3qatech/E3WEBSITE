"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMotionCapability } from '@/lib/motion/capability-context';

export interface ParallaxProps {
  children: React.ReactNode;
  offset?: number; // Total pixels to shift (e.g. 50, -50)
  className?: string;
}

export function Parallax({
  children,
  offset = 40,
  className = '',
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { tier, isReducedMotion, isTouch } = useMotionCapability();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  // Only enable real parallax on high-performance desktop without reduced motion
  const isParallaxEnabled = tier === 'full' && !isReducedMotion && !isTouch;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {isParallaxEnabled ? (
        <motion.div style={{ y, willChange: 'transform' }}>
          {children}
        </motion.div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
