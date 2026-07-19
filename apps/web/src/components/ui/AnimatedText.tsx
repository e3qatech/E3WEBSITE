'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
  delay?: number;
  as?: React.ElementType;
}

export function AnimatedText({ text, className, once = true, delay = 0, as = 'div' }: AnimatedTextProps) {
  const Component = as as any;
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, margin: '-10% 0px' });

  // Split text into words for staggered reveal
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay * i },
    }),
  };

  const child: any = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <Component
      ref={ref}
      className={cn('flex flex-wrap m-0', className)}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="flex flex-wrap"
      >
        {words.map((word, index) => (
          <motion.span
            variants={child}
            style={{ marginRight: '0.25em', display: 'inline-block' }}
            key={index}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}
