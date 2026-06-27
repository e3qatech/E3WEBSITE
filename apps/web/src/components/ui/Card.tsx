"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export type CardVariant = "flat" | "elevated" | "glass" | "bordered" | "gradient-border";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: CardVariant;
  interactive?: boolean;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  flat: "bg-[var(--surface-default)]",
  elevated: "bg-[var(--surface-default)] shadow-lg shadow-[var(--shadow-1)]",
  glass: "glass",
  bordered: "bg-[var(--surface-default)] border border-[var(--border-level-2)]",
  "gradient-border": "border-gradient p-[1px] bg-[var(--surface-default)]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "flat",
      interactive = false,
      className,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    ref
  ) => {
    // 3D Tilt Physics state
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const [isHovered, setIsHovered] = React.useState(false);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      
      // Disable tilt on touch devices/small viewports where pointerType is touch or pen
      if (e.pointerType !== "mouse") return;

      const rect = e.currentTarget.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;

      x.set(xPct);
      y.set(yPct);

      setIsHovered(true);
      onPointerMove?.(e);
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      x.set(0);
      y.set(0);
      setIsHovered(false);
      onPointerLeave?.(e);
    };

    return (
      <motion.div
        ref={ref as any}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={
          interactive
            ? {
                rotateX,
                rotateY,
                transformPerspective: 1000,
              }
            : undefined
        }
        className={cn(
          "relative rounded-xl overflow-hidden transition-all duration-300",
          variantStyles[variant],
          interactive && "cursor-pointer transform-gpu hover:-translate-y-1 hover:shadow-2xl",
          // Dark Mode specific hover glow using the CSS variable defined in globals.css
          interactive && isHovered && "dark:glow",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
