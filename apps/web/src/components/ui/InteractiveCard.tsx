'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './AnimatedText';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tiltStrength?: number;
}

export function InteractiveCard({ 
  children, 
  className, 
  glowColor = 'rgba(176, 19, 184, 0.4)', // e3-magenta default
  tiltStrength = 15 
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });
  
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [tiltStrength, -tiltStrength]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-tiltStrength, tiltStrength]);
  
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to center of card (-0.5 to 0.5)
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    const xPct = clientX / rect.width - 0.5;
    const yPct = clientY / rect.height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-primary)]',
        'overflow-hidden transform-gpu will-change-transform',
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Background glow effect tracking mouse */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])} ${useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])}, ${glowColor}, transparent 40%)`,
        }}
      />
      
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
