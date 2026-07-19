import { create } from 'zustand';

interface B2CThemeState {
  scrollYProgress: number;
  activeSection: string | null;
  immersiveMode: boolean; // True for cinematic/RESN style, False for clean Apple/IBM style
  setScrollYProgress: (progress: number) => void;
  setActiveSection: (sectionId: string | null) => void;
  setImmersiveMode: (isImmersive: boolean) => void;
}

export const useB2CThemeStore = create<B2CThemeState>((set) => ({
  scrollYProgress: 0,
  activeSection: null,
  immersiveMode: true, // Default to immersive for B2C
  setScrollYProgress: (progress) => set({ scrollYProgress: progress }),
  setActiveSection: (sectionId) => set({ activeSection: sectionId }),
  setImmersiveMode: (isImmersive) => set({ immersiveMode: isImmersive }),
}));
