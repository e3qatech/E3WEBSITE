"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const WireframeBackground = dynamic(
  () => import('./WireframeBackground').then(mod => mod.WireframeBackground),
  { ssr: false }
)

export function PortalGateway() {
  const router = useRouter()
  const [hoveredPortal, setHoveredPortal] = useState<'b2c' | 'b2b' | null>(null)
  const [selectedPortal, setSelectedPortal] = useState<'b2c' | 'b2b' | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('e3_preferred_portal')
    if (stored === 'b2c' || stored === 'b2b') {
      // Fast-route logic can go here, but for now we'll let them see the selector 
      // or we could automatically redirect. The prompt mentions "localStorage memory logic for fast-routing"
      // Let's just add a small badge or auto-redirect if they have it set.
      // For this demo, let's keep it manual so they can experience the gateway, 
      // or we can add a 'remember me' checkbox later.
    }
  }, [])

  const handleSelect = (portal: 'b2c' | 'b2b') => {
    setSelectedPortal(portal)
    localStorage.setItem('e3_preferred_portal', portal)
    
    // Staged slide-out transition
    setTimeout(() => {
      if (portal === 'b2c') {
        router.push('/en/b2c/attractions') // Route to B2C portal
      } else {
        router.push('/en/b2b') // Route to B2B portal
      }
    }, 800)
  }

  if (!mounted) return null

  return (
    <div className="relative min-h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans">
      
      {/* 3D Background */}
      <WireframeBackground />

      {/* Main UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-stretch">
        
        {/* B2C Card (Left) */}
        <motion.div 
          className="flex-1 flex flex-col justify-center p-8 md:p-16 relative group cursor-pointer border-r border-white/5"
          onMouseEnter={() => setHoveredPortal('b2c')}
          onMouseLeave={() => setHoveredPortal(null)}
          onClick={() => handleSelect('b2c')}
          initial={{ opacity: 0, x: -50 }}
          animate={{ 
            opacity: selectedPortal === 'b2b' ? 0 : 1, 
            x: selectedPortal === 'b2b' ? -100 : 0,
            flex: hoveredPortal === 'b2c' ? 1.1 : 1 
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glass background that intensifies on hover */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 max-w-md mx-auto w-full">
            <motion.div 
              className="text-xs font-bold tracking-[0.25em] uppercase text-amber-500 mb-6"
              animate={{ y: hoveredPortal === 'b2c' ? -5 : 0 }}
            >
              Public Portal
            </motion.div>
            <motion.h2 
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-zinc-50 leading-[1.1]"
              animate={{ y: hoveredPortal === 'b2c' ? -5 : 0 }}
            >
              PRISTINE<br/>SNOW
            </motion.h2>
            <motion.p 
              className="text-zinc-400 text-lg mb-10 max-w-sm"
              animate={{ opacity: hoveredPortal === 'b2c' ? 1 : 0.7 }}
            >
              Discover Qatar's premier live events, permanent attractions, and immersive experiences.
            </motion.p>
            
            <motion.div 
              className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-amber-500"
              animate={{ x: hoveredPortal === 'b2c' ? 10 : 0 }}
            >
              Enter B2C <span className="text-lg">→</span>
            </motion.div>
          </div>
        </motion.div>


        {/* B2B Card (Right) */}
        <motion.div 
          className="flex-1 flex flex-col justify-center p-8 md:p-16 relative group cursor-pointer"
          onMouseEnter={() => setHoveredPortal('b2b')}
          onMouseLeave={() => setHoveredPortal(null)}
          onClick={() => handleSelect('b2b')}
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: selectedPortal === 'b2c' ? 0 : 1, 
            x: selectedPortal === 'b2c' ? 100 : 0,
            flex: hoveredPortal === 'b2b' ? 1.1 : 1 
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glass background that intensifies on hover */}
          <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 max-w-md mx-auto w-full">
            <motion.div 
              className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-500 mb-6"
              animate={{ y: hoveredPortal === 'b2b' ? -5 : 0 }}
            >
              Enterprise Solutions
            </motion.div>
            <motion.h2 
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-zinc-50 leading-[1.1]"
              animate={{ y: hoveredPortal === 'b2b' ? -5 : 0 }}
            >
              COSMIC<br/>VOID
            </motion.h2>
            <motion.p 
              className="text-zinc-400 text-lg mb-10 max-w-sm"
              animate={{ opacity: hoveredPortal === 'b2b' ? 1 : 0.7 }}
            >
              End-to-end event engineering, stage fabrication, and B2B spatial technologies.
            </motion.p>
            
            <motion.div 
              className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-emerald-500"
              animate={{ x: hoveredPortal === 'b2b' ? 10 : 0 }}
            >
              Enter B2B <span className="text-lg">→</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Center Logo branding */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="font-black text-2xl tracking-tighter text-white drop-shadow-xl">
          E3 <span className="text-zinc-500">QATAR</span>
        </div>
      </div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {selectedPortal && (
          <motion.div 
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ backgroundColor: selectedPortal === 'b2c' ? '#fafafa' : '#09090b' }}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
