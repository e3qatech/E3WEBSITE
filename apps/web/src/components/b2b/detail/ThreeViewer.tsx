"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"

// A simple spinning abstract shape to act as a placeholder for a real 3D model.
// In a real scenario, you would use `useGLTF` from @react-three/drei to load a model.
function AbstractModel() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
      <meshStandardMaterial 
        color="#ff3366" 
        wireframe={true}
        emissive="#ff3366"
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

export default function ThreeViewer() {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <AbstractModel />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={true} 
          autoRotateSpeed={0.5} 
        />
        <Environment preset="city" />
      </Canvas>
      
      {/* Overlay to ensure text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
