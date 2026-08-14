"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMotionCapability } from '@/lib/motion/capability-context';
import { MOTION_TOKENS } from '@/lib/motion/tokens';

export interface SplitHeadlineProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'span';
  delay?: number;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
}

export function SplitHeadline({
  text,
  as: Component = 'h1',
  delay = 0,
  className = '',
  wordClassName = 'inline-block',
  staggerDelay = 0.05,
}: SplitHeadlineProps) {
  const { tier, isReducedMotion } = useMotionCapability();
  const isMinimal = tier === 'minimal' || isReducedMotion;

  const words = useMemo(() => {
    return text.split(/\s+/).filter(Boolean);
  }, [text]);

  if (isMinimal) {
    return (
      <Component className={className} aria-label={text}>
        {text}
      </Component>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 18,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: MOTION_TOKENS.duration.smooth,
        ease: MOTION_TOKENS.ease.cinematic,
      },
    },
  };

  return (
    <Component className={className} aria-label={text}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="inline-block"
        aria-hidden="true"
      >
        {words.map((word, idx) => (
          <React.Fragment key={`${word}-${idx}`}>
            <motion.span
              variants={wordVariants}
              className={wordClassName}
            >
              {word}
            </motion.span>
            {idx < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </motion.span>
    </Component>
  );
}
