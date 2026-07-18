"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type TransitionVariant = "fade" | "slideUp" | "scale";

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: TransitionVariant;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    enter: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  },
};

export function PageTransition({ children, variant = "fade" }: PageTransitionProps) {
  // Use pathname as key so motion.div triggers enter animation on route change
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="enter"
      variants={variants[variant] as any}
      className="w-full h-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
