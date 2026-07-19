import React from 'react';
import { cn } from './AnimatedText';

interface B2CGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function B2CGrid({ children, className, columns = 3, gap = 'md' }: B2CGridProps) {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapStyles = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  return (
    <div className={cn('grid', colStyles[columns], gapStyles[gap], className)}>
      {children}
    </div>
  );
}

interface B2CBentoItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

export function B2CBentoItem({ children, className, colSpan = 1, rowSpan = 1 }: B2CBentoItemProps) {
  const colStyles = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
  };

  const rowStyles = {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
  };

  return (
    <div className={cn(
      colStyles[colSpan], 
      rowStyles[rowSpan], 
      'h-full w-full',
      className
    )}>
      {children}
    </div>
  );
}
