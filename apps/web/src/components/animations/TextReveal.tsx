"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion, Variants } from "framer-motion"

interface TextRevealProps {
  text: string
  type?: "character" | "word"
  className?: string
  delay?: number
}

export function TextReveal({ text, type = "word", className = "", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>
  }

  // Split text into an array based on type
  const elements = type === "word" ? text.split(" ") : text.split("")

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i },
    }),
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {elements.map((element, index) => (
        <motion.span 
          key={index} 
          variants={child}
          className="inline-block"
        >
          {element === " " ? "\u00A0" : element}
          {type === "word" && index < elements.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </motion.span>
  )
}
