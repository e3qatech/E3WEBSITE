"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Html, useProgress, ContactShadows, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { XR, createXRStore, useXRHitTest } from '@react-three/xr'
import { Maximize, Camera, RefreshCcw, X, Info } from 'lucide-react'

// Create XR store outside the component
const store = createXRStore()

// ----------------------------------------------------------------------
// TYPES & PROPS
// ----------------------------------------------------------------------
interface ARViewerProps {
  modelUrl: string
  modelName: string
  dimensions?: { w: number, h: number, d: number }
  powerReq?: string
  onClose?: () => void
}

// ----------------------------------------------------------------------
// MODEL LOADER COMPONENT
// ----------------------------------------------------------------------
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/80 backdrop-blur rounded-xl border border-white/10 w-48">
        <div className="text-white font-bold text-sm mb-2">Loading Model</div>
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div className="bg-[var(--color-primary)] h-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-white/50 text-xs mt-2">{Math.round(progress)}%</div>
      </div>
    </Html>
  )
}

function Model({ url, position, rotation, scale }: { url: string, position: THREE.Vector3, rotation: THREE.Euler, scale: number }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene.clone()} position={position} rotation={rotation} scale={scale} />
}

// ----------------------------------------------------------------------
// AR HIT TESTER COMPONENT
// ----------------------------------------------------------------------
function HitTestReticle({ onPlace }: { onPlace: (pos: THREE.Vector3) => void }) {
  const reticleRef = useRef<THREE.Mesh>(null)
  
  // @ts-ignore - Ignoring type error due to v6 signature changes
  useXRHitTest((hitMatrix: THREE.Matrix4) => {
    if (reticleRef.current) {
      hitMatrix.decompose(
        reticleRef.current.position,
        reticleRef.current.quaternion,
        reticleRef.current.scale
      )
    }
  })

  // Hook into pointer down (tap) on the canvas to place the model at the reticle
  useEffect(() => {
    const handlePointerDown = () => {
      if (reticleRef.current && reticleRef.current.visible) {
        onPlace(reticleRef.current.position.clone())
      }
    }
    // We bind to document because useHitTest operates on XR session
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onPlace])

  return (
    <mesh ref={reticleRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00e676" opacity={0.8} transparent />
    </mesh>
  )
}

// ----------------------------------------------------------------------
// MAIN VIEWER COMPONENT
// ----------------------------------------------------------------------
export default function ARViewer({ modelUrl, modelName, dimensions, powerReq, onClose }: ARViewerProps) {
  const [xrSupported, setXrSupported] = useState(false)
  const [inAR, setInAR] = useState(false)
  const [modelPlaced, setModelPlaced] = useState(false)
  const [modelPosition, setModelPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [showTooltip, setShowTooltip] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setXrSupported(supported)
      })
    }
    
    // Hide tooltip after 5 seconds
    const t = setTimeout(() => setShowTooltip(false), 5000)
    return () => clearTimeout(t)
  }, [])

  const handlePlace = (pos: THREE.Vector3) => {
    setModelPosition(pos)
    setModelPlaced(true)
  }

  const handleReset = () => {
    setModelPlaced(false)
  }

  const takeScreenshot = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `E3_${modelName.replace(/\s+/g, '_')}_AR.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    }
  }

  return (
    <div className="relative w-full h-[60vh] bg-zinc-950/90 rounded-2xl overflow-hidden border border-white/10 font-sans flex flex-col">
      
      {/* HEADER */}
      <div className="absolute top-0 start-0 end-0 p-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-zinc-950/80 backdrop-blur border border-white/10 rounded-xl p-3 pointer-events-auto">
          <h3 className="text-white font-black text-sm">{modelName}</h3>
          {dimensions && (
            <p className="text-white/70 text-xs mt-1">
              W: {dimensions.w}m × H: {dimensions.h}m × D: {dimensions.d}m
            </p>
          )}
          {powerReq && (
            <p className="text-yellow-500 font-bold text-[10px] mt-1">POWER: {powerReq}</p>
          )}
        </div>
        
        {onClose && (
          <button onClick={onClose} className="p-2 bg-zinc-950/80 border border-white/10 rounded-full text-white/70 hover:text-white pointer-events-auto">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CANVAS */}
      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[var(--color-primary)] animate-spin" />
          </div>
        }>
          <Canvas ref={canvasRef} gl={{ preserveDrawingBuffer: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            
            {xrSupported ? (
              <XR store={store}>
                {inAR && !modelPlaced && <HitTestReticle onPlace={handlePlace} />}
                {(!inAR || modelPlaced) && (
                  <Model 
                    url={modelUrl} 
                    position={inAR ? modelPosition : new THREE.Vector3(0, 0, 0)} 
                    rotation={new THREE.Euler(0, 0, 0)} 
                    scale={1} 
                  />
                )}
                {!inAR && (
                  <>
                    <OrbitControls makeDefault minDistance={2} maxDistance={20} />
                    <Grid position={[0, -0.01, 0]} args={[10, 10]} cellColor="#333" sectionColor="#666" />
                    <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                  </>
                )}
              </XR>
            ) : (
              // Fallback 3D Preview (No XR)
              <>
                <Model url={modelUrl} position={new THREE.Vector3(0, 0, 0)} rotation={new THREE.Euler(0, 0, 0)} scale={1} />
                <OrbitControls makeDefault autoRotate autoRotateSpeed={1} minDistance={2} maxDistance={20} />
                <Grid position={[0, -0.01, 0]} args={[10, 10]} cellColor="#333" sectionColor="#666" />
                <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} />
              </>
            )}
          </Canvas>
        </Suspense>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="absolute bottom-4 start-4 end-4 flex justify-between items-end z-10 pointer-events-none">
        
        <div className="flex gap-2 pointer-events-auto">
          {inAR && modelPlaced && (
            <button onClick={handleReset} className="p-3 bg-zinc-950/80 backdrop-blur border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors tooltip-trigger relative group">
              <RefreshCcw className="w-5 h-5" />
              <span className="absolute -top-8 start-1/2 -translate-x-1/2 bg-zinc-950 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Reset</span>
            </button>
          )}
          
          <button onClick={takeScreenshot} className="p-3 bg-zinc-950/80 backdrop-blur border border-white/10 rounded-full text-white hover:bg-white/10 transition-colors tooltip-trigger relative group">
            <Camera className="w-5 h-5" />
            <span className="absolute -top-8 start-1/2 -translate-x-1/2 bg-zinc-950 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Snapshot</span>
          </button>
        </div>

        <div className="pointer-events-auto flex flex-col items-end">
          {showTooltip && xrSupported && !inAR && (
            <div className="bg-[var(--color-primary)] text-zinc-950 text-xs font-bold px-3 py-2 rounded-lg mb-2 shadow-lg animate-bounce flex items-center">
              <Info className="w-4 h-4 me-1" /> Tap to view in your space
            </div>
          )}
          
          {xrSupported ? (
            <div className="xr-button-container">
              <button 
                onClick={() => {
                  setInAR(true)
                  store.enterAR()
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors shadow-xl"
              >
                Enter AR
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 bg-white/10 backdrop-blur border border-white/10 text-white/50 font-bold text-xs rounded-lg">
              AR Not Supported on this Device
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
