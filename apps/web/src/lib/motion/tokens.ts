import { MotionTokenConfig } from './types';

export const MOTION_TOKENS: MotionTokenConfig = {
  duration: {
    fast: 0.2,
    base: 0.4,
    smooth: 0.7,
    cinematic: 1.1,
    slow: 1.6,
  },
  ease: {
    smooth: [0.25, 0.1, 0.25, 1.0],
    snappy: [0.16, 1, 0.3, 1],
    cinematic: [0.76, 0, 0.24, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    gsapSmooth: "power2.out",
    gsapSnappy: "power3.out",
    gsapCinematic: "power4.inOut",
  },
  spring: {
    snappy: { stiffness: 400, damping: 30 },
    gentle: { stiffness: 120, damping: 20 },
    bouncy: { stiffness: 300, damping: 15 },
  },
  stagger: {
    fast: 0.04,
    base: 0.08,
    slow: 0.16,
  },
};

/**
 * Returns transition settings adjusted for the active capability tier.
 */
export function getTieredTransition(
  tier: 'full' | 'balanced' | 'minimal',
  type: 'base' | 'smooth' | 'cinematic' = 'base',
  options?: { delay?: number; durationOverride?: number }
): { duration: number; ease: [number, number, number, number]; delay: number } {
  if (tier === 'minimal') {
    return {
      duration: 0.15,
      ease: [0, 0, 1, 1],
      delay: 0,
    };
  }

  const baseDuration = options?.durationOverride ?? MOTION_TOKENS.duration[type];
  const duration = tier === 'balanced' ? Math.min(baseDuration, 0.5) : baseDuration;
  const ease = MOTION_TOKENS.ease[type === 'cinematic' ? 'cinematic' : 'smooth'];

  return {
    duration,
    ease,
    delay: options?.delay || 0,
  };
}
