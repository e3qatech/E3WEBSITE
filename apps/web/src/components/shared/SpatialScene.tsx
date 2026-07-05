"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Grid } from "@react-three/drei"
import * as THREE from "three"
import { AttractionData } from "./SpatialFallback"
import Link from "next/link"
import { Info, Ticket } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface SpatialSceneProps {
  attractions: AttractionData[]
  onAttractionClick?: (slug: string) => void
}

// Map 0-100% coordinates to 3D space (-10 to 10)
const mapCoord = (val: number, max: number = 20) => (val / 100) * max - (max / 2)

// A highly simplified shape representing Qatar for extrusion
const QATAR_POINTS = [
  [45, 15], [60, 5], [75, 10], [80, 25], [85, 40], [70, 60], [85, 80], 
  [90, 90], [70, 105], [50, 110], [45, 100], [30, 90], [25, 70], [20, 50], [30, 30]
]

export function SpatialScene({ attractions, onAttractionClick }: SpatialSceneProps) {
  const { camera, size, gl } = useThree()
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const targetCamPos = useRef(new THREE.Vector3(0, 12, 12))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))

  // Base Map Geometry
  const mapGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    QATAR_POINTS.forEach((pt, i) => {
      const x = mapCoord(pt[0], 12)
      const z = mapCoord(pt[1], 15) // Flip Y to Z
      if (i === 0) shape.moveTo(x, z)
      else shape.lineTo(x, z)
    })
    shape.lineTo(mapCoord(QATAR_POINTS[0][0], 12), mapCoord(QATAR_POINTS[0][1], 15))

    const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 }
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    // Rotate to lie flat on XZ plane
    geo.rotateX(Math.PI / 2)
    geo.translate(0, -0.25, 0)
    return geo
  }, [])

  // Instanced Mesh Setup
  const object = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  
  useEffect(() => {
    if (!instancedMeshRef.current) return
    
    attractions.forEach((attr, i) => {
      const x = mapCoord(attr.location[0], 12)
      const z = mapCoord(attr.location[1], 15)
      const h = attr.capacity > 5000 ? 2 : 1
      
      object.position.set(x, h/2, z)
      object.scale.set(1, h, 1)
      object.updateMatrix()
      instancedMeshRef.current!.setMatrixAt(i, object.matrix)
      
      let hex = "#ffffff"
      if (attr.status === 'active') hex = "#10b981"
      else if (attr.status === 'upcoming') hex = "#f59e0b"
      else if (attr.status === 'coming_soon') hex = "#3b82f6"
      
      instancedMeshRef.current!.setColorAt(i, color.set(hex))
    })
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
    if (instancedMeshRef.current.instanceColor) instancedMeshRef.current.instanceColor.needsUpdate = true
  }, [attractions, object, color])

  // Animation Loop
  useFrame((state, delta) => {
    // Pulse animation for active markers
    if (instancedMeshRef.current) {
      const time = state.clock.getElapsedTime()
      attractions.forEach((attr, i) => {
        if (attr.status === 'active') {
          instancedMeshRef.current!.getMatrixAt(i, object.matrix)
          object.matrix.decompose(object.position, object.quaternion, object.scale)
          
          const scaleY = (attr.capacity > 5000 ? 2 : 1) * (1 + Math.sin(time * 3 + i) * 0.1)
          object.scale.set(1, scaleY, 1)
          
          object.updateMatrix()
          instancedMeshRef.current!.setMatrixAt(i, object.matrix)
        }
      })
      instancedMeshRef.current.instanceMatrix.needsUpdate = true
    }

    // Camera Fly-to
    camera.position.lerp(targetCamPos.current, 0.05)
    
    // Parallax on mouse move (if not selected)
    if (selectedIdx === null) {
      targetLookAt.current.x = THREE.MathUtils.lerp(targetLookAt.current.x, (state.pointer.x * 2), 0.05)
      targetLookAt.current.z = THREE.MathUtils.lerp(targetLookAt.current.z, (-state.pointer.y * 2), 0.05)
    }

    camera.lookAt(targetLookAt.current)
  })

  // Handlers
  const handleClick = (e: any) => {
    e.stopPropagation()
    if (e.instanceId === undefined) return
    
    setSelectedIdx(e.instanceId)
    const attr = attractions[e.instanceId]
    const x = mapCoord(attr.location[0], 12)
    const z = mapCoord(attr.location[1], 15)
    
    // Fly camera near the marker
    targetCamPos.current.set(x, 4, z + 6)
    targetLookAt.current.set(x, 0, z)
  }

  const handlePointerMissed = () => {
    setSelectedIdx(null)
    targetCamPos.current.set(0, 12, 12)
    targetLookAt.current.set(0, 0, 0)
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Grid Floor */}
      <Grid infiniteGrid fadeDistance={40} sectionColor="#333" cellColor="#222" position={[0, -0.26, 0]} />

      {/* Qatar Base Model */}
      <mesh geometry={mapGeometry} onPointerMissed={handlePointerMissed}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Markers */}
      <instancedMesh 
        ref={instancedMeshRef} 
        args={[undefined, undefined, attractions.length]} 
        onPointerOver={(e) => { e.stopPropagation(); setHoveredIdx(e.instanceId ?? null); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHoveredIdx(null); document.body.style.cursor = 'auto' }}
        onClick={handleClick}
        onDoubleClick={(e) => { if (e.instanceId !== undefined) onAttractionClick?.(attractions[e.instanceId].slug) }}
      >
        <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
        <meshStandardMaterial emissiveIntensity={2} toneMapped={false} />
      </instancedMesh>

      {/* Tooltips / Info Panels */}
      {attractions.map((attr, i) => {
        const x = mapCoord(attr.location[0], 12)
        const z = mapCoord(attr.location[1], 15)
        
        return (
          <group key={attr.id} position={[x, 1, z]}>
            {/* Hover Tooltip */}
            {hoveredIdx === i && selectedIdx !== i && (
              <Html center position={[0, 1.5, 0]} className="pointer-events-none">
                <div className="bg-zinc-950/80 backdrop-blur border border-white/20 text-white px-3 py-1.5 rounded-sg text-sm font-bold whitespace-nowrap">
                  {attr.name}
                </div>
              </Html>
            )}

            {/* Clicked Info Panel */}
            {selectedIdx === i && (
              <Html position={[1, 0, 0]} className="pointer-events-auto">
                <div className="bg-zinc-950/90 backdrop-blur-md border border-[var(--color-primary)]/50 p-5 rounded-2xl w-64 shadow-2xl animate-in slide-in-from-start-4 fade-in">
                  <h3 className="text-xl font-black text-white mb-1">{attr.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{attr.tagline}</p>
                  
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => onAttractionClick?.(attr.slug)} className="w-full gap-2">
                      <Info className="w-4 h-4" /> Micro-site
                    </Button>
                    <Button size="sm" variant="outline" className="w-full gap-2 bg-transparent text-white border-white/20 hover:bg-white/10">
                      <Ticket className="w-4 h-4" /> Book Tickets
                    </Button>
                  </div>
                </div>
              </Html>
            )}
          </group>
        )
      })}

      <OrbitControls 
        enablePan={false}
        enableZoom={selectedIdx === null}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={25}
      />
    </>
  )
}
