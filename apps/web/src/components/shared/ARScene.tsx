"use client"

import { useState, useRef, Suspense } from "react"
import { useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, Grid, Html } from "@react-three/drei"
import * as THREE from "three"

// Simple loading indicator inside 3D
function Loader() {
  return (
    <Html center>
      <div className="bg-zinc-950/80 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap">
        Loading Model...
      </div>
    </Html>
  )
}

interface ARSceneProps {
  modelUrl: string
  name: string
  dimensions: string
  powerReq: string
  isARMode: boolean
}

export function ARScene({ modelUrl, name, dimensions, powerReq, isARMode }: ARSceneProps) {
  const { scene } = useGLTF(modelUrl, true, true, (error) => {
    console.error("Failed to load GLTF model", error)
  }) // Add simple error boundary fallback in real app

  const modelGroupRef = useRef<THREE.Group>(null)
  
  // Allow basic rotation of the placed model
  const [rotation, setRotation] = useState(0)

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

      {/* The 3D Model */}
      <Suspense fallback={<Loader />}>
        <group 
          ref={modelGroupRef} 
          rotation-y={rotation}
        >
          <primitive object={scene} />

          {/* Dimension / Info Overlay attached to the model */}
          <Html position={[0, 1.5, 0]} center className="pointer-events-none">
            <div className="bg-zinc-950/90 border border-white/20 p-3 rounded-xl shadow-xl w-48 text-center transition-opacity opacity-0 md:opacity-100">
              <h4 className="font-bold text-white text-sm mb-1">{name}</h4>
              <p className="text-xs text-gray-400">Dim: {dimensions}</p>
              <p className="text-xs text-gray-400">Power: {powerReq}</p>
            </div>
          </Html>
        </group>
      </Suspense>

      {/* Preview Mode Environment */}
      <Grid infiniteGrid fadeDistance={10} sectionColor="#333" cellColor="#222" position={[0, 0, 0]} />
      <OrbitControls makeDefault minDistance={1} maxDistance={10} />
    </>
  )
}

