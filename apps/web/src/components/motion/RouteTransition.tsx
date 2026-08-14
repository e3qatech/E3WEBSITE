"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMotionCapability } from '@/lib/motion/capability-context';
import { getTieredTransition } from '@/lib/motion/tokens';

export interface RouteTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide-up' | 'scale';
  className?: string;
}

export function RouteTransition({
  children,
  variant = 'fade',
  className = '',
}: RouteTransitionProps) {
  const pathname = usePathname();
  const { tier, isReducedMotion } = useMotionCapability();
  const isMinimal = tier === 'minimal' || isReducedMotion;

  const transition = getTieredTransition(tier, 'base');

  const getVariants = () => {
    if (isMinimal) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    switch (variant) {
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -16 },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.98 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.01 },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
