'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from './AnimatedText';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function MagneticButton({ 
  children, 
  strength = 30, 
  className,
  variant = 'primary',
  size = 'md',
  href,
  ...props 
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Use GSAP quickTo for highly performant animations
    const xTo = gsap.quickTo(button, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(button, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });
    
    const xTextTo = textRef.current ? gsap.quickTo(textRef.current, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' }) : null;
    const yTextTo = textRef.current ? gsap.quickTo(textRef.current, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' }) : null;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo(x * (strength / 100));
      yTo(y * (strength / 100));
      
      if (xTextTo && yTextTo) {
        xTextTo(x * (strength / 200));
        yTextTo(y * (strength / 200));
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      if (xTextTo && yTextTo) {
        xTextTo(0);
        yTextTo(0);
      }
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  const variantStyles = {
    primary: 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-primary)]/20',
    secondary: 'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)]',
    outline: 'border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-medium'
  };

  const Component: any = href ? 'a' : 'button';

  return (
    <Component
      ref={buttonRef}
      href={href}
      className={cn(
        'relative overflow-hidden rounded-full font-sans transition-colors duration-300',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span ref={textRef} className="relative z-10 inline-block pointer-events-none">
        {children}
      </span>
    </Component>
  );
}
