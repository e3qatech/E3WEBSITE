"use client"

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

// ----------------------------------------------------------------------
// TYPES & DATA
// ----------------------------------------------------------------------
export type AttractionMarker = {
  id: string
  name: string
  slug: string
  tagline: string
  lat: number
  lng: number
  status: 'ACTIVE' | 'UPCOMING' | 'COMING_SOON'
  capacityLevel: number // 1 to 5
}

interface SpatialHubProps {
  attractions: AttractionMarker[]
  onAttractionClick?: (slug: string) => void
}

// Center of Qatar (approx Doha)
const CENTER_LAT = 25.3
const CENTER_LNG = 51.5
const MAP_SCALE = 15

// Simplified Qatar coastline for a flat geometric mesh
const QATAR_COASTLINE = [
  [26.15, 51.25], // North
  [25.9, 51.55],
  [25.6, 51.6],
  [25.3, 51.6],   // Doha
  [24.9, 51.65],  // Mesaieed
  [24.6, 51.4],   // South East
  [24.6, 50.8],   // South West
  [25.1, 50.75],
  [25.4, 50.8],   // Dukhan
  [25.8, 51.0],
]

// Convert lat/lng to local 3D coordinates (x, z)
const getCoords = (lat: number, lng: number) => {
  const x = (lng - CENTER_LNG) * MAP_SCALE
  const z = -(lat - CENTER_LAT) * MAP_SCALE
  return new THREE.Vector3(x, 0, z)
}

// ----------------------------------------------------------------------
// 3D COMPONENTS
// ----------------------------------------------------------------------
function GroundMap() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    QATAR_COASTLINE.forEach((point, i) => {
      const pos = getCoords(point[0], point[1])
      if (i === 0) s.moveTo(pos.x, pos.z)
      else s.lineTo(pos.x, pos.z)
    })
    s.closePath()
    return s
  }, [])

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Base Map */}
      <mesh>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#050505" emissive="#000000" />
      </mesh>
      {/* Edge highlight */}
      <lineSegments>
        <edgesGeometry args={[new THREE.ShapeGeometry(shape)]} />
        <lineBasicMaterial color="#333333" linewidth={2} />
      </lineSegments>
      {/* Tron Grid */}
      <gridHelper args={[50, 50, '#111111', '#0a0a0a']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]} />
    </group>
  )
}

function Markers({ attractions, onMarkerClick, hoveredId, setHoveredId }: any) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  // Base geometry for markers (Hexagonal pillar)
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.1, 0.1, 1, 6), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#ffffff',
    emissive: '#00e676',
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.9
  }), [])

  const getColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return new THREE.Color('#00e676') // Green
      case 'UPCOMING': return new THREE.Color('#ffc107') // Yellow
      case 'COMING_SOON': return new THREE.Color('#2196f3') // Blue
      default: return new THREE.Color('#666666')
    }
  }

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    
    attractions.forEach((attr: AttractionMarker, i: number) => {
      const pos = getCoords(attr.lat, attr.lng)
      const height = attr.capacityLevel * 0.4
      
      // Pulsing effect for active
      const pulse = attr.status === 'ACTIVE' ? Math.sin(time * 3 + i) * 0.1 + 1 : 1
      const scaleY = height * pulse
      
      dummy.position.set(pos.x, scaleY / 2, pos.z)
      
      // If hovered, make it slightly thicker
      const scaleXZ = hoveredId === attr.id ? 1.5 : 1
      dummy.scale.set(scaleXZ, scaleY, scaleXZ)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      
      const c = getColor(attr.status)
      if (hoveredId === attr.id) c.multiplyScalar(2) // Brighten on hover
      meshRef.current!.setColorAt(i, c)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh 
        ref={meshRef} 
        args={[geometry, material, attractions.length]}
        onPointerMove={(e) => {
          e.stopPropagation()
          const id = attractions[e.instanceId!].id
          if (hoveredId !== id) setHoveredId(id)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHoveredId(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onMarkerClick(attractions[e.instanceId!])
        }}
      />
      {/* Lights & Tooltips */}
      {attractions.map((attr: AttractionMarker) => {
        const pos = getCoords(attr.lat, attr.lng)
        const isHovered = hoveredId === attr.id
        const isActive = attr.status === 'ACTIVE'
        return (
          <group key={attr.id} position={[pos.x, 0, pos.z]}>
            {isActive && <pointLight position={[0, 1, 0]} intensity={1.5} distance={3} color="#00e676" />}
            <Html position={[0, (attr.capacityLevel * 0.4) + 0.5, 0]} center style={{ pointerEvents: 'none', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
              <div className="bg-black/90 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                <div className="text-white font-bold text-xs">{attr.name}</div>
                <div className="text-[var(--color-primary)] font-bold text-[10px]">{attr.status}</div>
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}

function CameraController({ targetPosition }: { targetPosition: THREE.Vector3 | null }) {
  const { camera } = useThree()
  
  useFrame((state, delta) => {
    // Subtle mouse parallax if no target
    if (!targetPosition) {
      const mouseX = (state.pointer.x * 2) // -2 to 2
      const mouseY = (state.pointer.y * 2)
      
      // Interpolate camera position slightly based on mouse
      camera.position.x += (mouseX - camera.position.x) * 0.05 * delta * 10
      camera.position.z += (mouseY + 8 - camera.position.z) * 0.05 * delta * 10
      camera.lookAt(0, 0, 0)
      return
    }

    // Fly to target
    const targetCamPos = new THREE.Vector3(targetPosition.x, 3, targetPosition.z + 4)
    camera.position.lerp(targetCamPos, 0.05)
    
    // Look at target
    const currentLookAt = new THREE.Vector3(0,0,0) // Assuming we started looking at center
    // We should ideally track the lookAt point, but for simplicity we'll interpolate the rotation
    // by using a dummy object or just lerping the position and looking at the target
    camera.lookAt(targetPosition)
  })

  return <OrbitControls 
    enablePan={false} 
    enableZoom={true} 
    minDistance={2} 
    maxDistance={15}
    maxPolarAngle={Math.PI / 2.2}
    enableDamping
    dampingFactor={0.05}
  />
}

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export default function SpatialHub({ attractions, onAttractionClick }: SpatialHubProps) {
  const [isLowEnd, setIsLowEnd] = useState(false)
  const [activeAttraction, setActiveAttraction] = useState<AttractionMarker | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  
  // Hardware capabilities check & Intersection Observer
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const cores = navigator.hardwareConcurrency || 2
    if (isMobile && cores <= 4) {
      setIsLowEnd(true)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleMarkerClick = (attr: AttractionMarker) => {
    setActiveAttraction(attr)
    setCameraTarget(getCoords(attr.lat, attr.lng))
  }

  const handleClosePanel = () => {
    setActiveAttraction(null)
    setCameraTarget(null) // Resets to default parallax
  }

  const handleActionClick = (slug: string) => {
    if (onAttractionClick) onAttractionClick(slug)
  }

  // Graceful degradation fallback
  if (isLowEnd) {
    return (
      <div className="w-full h-[40vh] md:h-[60vh] bg-black border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative w-full max-w-sm aspect-square border border-white/5 rounded-full flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="text-white font-bold mb-2">2D Map Mode</h3>
            <p className="text-white/50 text-xs mb-6">Running in low-power mode to save battery.</p>
            
            <div className="flex flex-col gap-2">
              {attractions.map(attr => (
                <button 
                  key={attr.id}
                  onClick={() => handleActionClick(attr.slug)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-left transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-bold text-sm">{attr.name}</div>
                    <div className="text-[var(--color-primary)] font-bold text-[10px]">{attr.status}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${attr.status === 'ACTIVE' ? 'bg-[var(--color-primary)] animate-pulse' : 'bg-yellow-500'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-[40vh] md:h-[60vh] bg-[#020202] rounded-2xl overflow-hidden border border-white/10 group cursor-crosshair">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-bold uppercase tracking-widest">Initializing Spatial Engine...</div>}>
        <Canvas camera={{ position: [0, 8, 8], fov: 45 }} dpr={[1, 1.5]} frameloop={inView ? 'always' : 'never'}>
          <color attach="background" args={['#020202']} />
          <ambientLight intensity={0.2} />
          
          <GroundMap />
          <Markers 
            attractions={attractions} 
            onMarkerClick={handleMarkerClick}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
          <CameraController targetPosition={cameraTarget} />
          
          {/* Add a subtle fog for depth */}
          <fog attach="fog" args={['#020202', 5, 25]} />
        </Canvas>
      </Suspense>

      {/* Info Panel Overlay */}
      <div 
        className={`absolute top-4 right-4 bottom-4 w-72 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${activeAttraction ? 'translate-x-0' : 'translate-x-[120%]'}`}
      >
        {activeAttraction && (
          <>
            <button onClick={handleClosePanel} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="inline-flex px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black tracking-widest rounded mb-3 w-fit">
              {activeAttraction.status}
            </div>
            <h3 className="text-xl font-black text-white mb-2">{activeAttraction.name}</h3>
            <p className="text-sm text-white/70 mb-6">{activeAttraction.tagline}</p>
            
            <div className="mt-auto space-y-2">
              <button 
                onClick={() => handleActionClick(activeAttraction.slug)}
                onDoubleClick={() => {
                   window.open(`/b2b/services/${activeAttraction.slug}`, '_blank')
                }}
                className="w-full py-2.5 bg-white text-black font-bold text-sm rounded-lg hover:bg-white/90 transition-colors"
              >
                View Attraction (Double-click to open)
              </button>
              <button 
                className="w-full py-2.5 bg-transparent text-white border border-white/20 font-bold text-sm rounded-lg hover:bg-white/10 transition-colors"
              >
                Book Tickets
              </button>
            </div>
          </>
        )}
      </div>

      {/* Control Hint */}
      <div className="absolute bottom-4 left-4 text-[10px] font-bold text-white/30 uppercase tracking-widest pointer-events-none">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
