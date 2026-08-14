"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useMotionCapability } from '@/lib/motion/capability-context';
import { getTieredTransition } from '@/lib/motion/tokens';
import { RevealDirection } from '@/lib/motion/types';
import { useLocale } from '@/components/layout/LocaleProvider';

export interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
}

export function Reveal({
  children,
  direction = 'slide-up',
  delay = 0,
  duration,
  distance = 24,
  once = true,
  className,
  ...props
}: RevealProps) {
  const { tier, isReducedMotion } = useMotionCapability();
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  const isMinimal = tier === 'minimal' || isReducedMotion;

  // Calculate initial transform offsets based on direction and RTL
  const getInitialOffsets = () => {
    if (isMinimal) {
      return { opacity: 0, x: 0, y: 0, scale: 1 };
    }

    switch (direction) {
      case 'slide-up':
        return { opacity: 0, x: 0, y: distance, scale: 1 };
      case 'slide-down':
        return { opacity: 0, x: 0, y: -distance, scale: 1 };
      case 'slide-start':
        // In RTL, start is on the right (+distance), in LTR on the left (-distance)
        return { opacity: 0, x: isAr ? distance : -distance, y: 0, scale: 1 };
      case 'slide-end':
        return { opacity: 0, x: isAr ? -distance : distance, y: 0, scale: 1 };
      case 'scale':
        return { opacity: 0, x: 0, y: 0, scale: 0.95 };
      case 'fade':
      default:
        return { opacity: 0, x: 0, y: 0, scale: 1 };
    }
  };

  const initial = getInitialOffsets();
  const animate = { opacity: 1, x: 0, y: 0, scale: 1 };
  const transition = getTieredTransition(tier, 'base', { delay, durationOverride: duration });

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-40px" }}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
