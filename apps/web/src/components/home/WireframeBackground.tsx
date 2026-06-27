"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const QATAR_POINTS = [
  [45, 15], [60, 5], [75, 10], [80, 25], [85, 40], [70, 60], [85, 80], 
  [90, 90], [70, 105], [50, 110], [45, 100], [30, 90], [25, 70], [20, 50], [30, 30]
]
const mapCoord = (val: number, max: number = 20) => (val / 100) * max - (max / 2)

export function WireframeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene Setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#09090b')
    scene.fog = new THREE.Fog('#09090b', 10, 30)

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 8, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
    // Limit pixel ratio for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)
    const directional = new THREE.DirectionalLight(0xffffff, 1)
    directional.position.set(10, 10, 5)
    scene.add(directional)

    // Grid Floor
    const grid = new THREE.GridHelper(40, 40, '#18181b', '#09090b')
    grid.position.y = -2
    scene.add(grid)

    // Map Wireframe Setup
    const shape = new THREE.Shape()
    QATAR_POINTS.forEach((pt, i) => {
      const x = mapCoord(pt[0], 15)
      const z = mapCoord(pt[1], 20)
      if (i === 0) shape.moveTo(x, z)
      else shape.lineTo(x, z)
    })
    shape.lineTo(mapCoord(QATAR_POINTS[0][0], 15), mapCoord(QATAR_POINTS[0][1], 20))

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.1,
      bevelThickness: 0.1
    })
    geo.rotateX(Math.PI / 2)
    const edgesGeo = new THREE.EdgesGeometry(geo)
    const material = new THREE.LineBasicMaterial({ color: '#3f3f46', transparent: true, opacity: 0.6 })
    const mapMesh = new THREE.LineSegments(edgesGeo, material)
    scene.add(mapMesh)

    // Parallax & Animation State
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Render Loop
    const clock = new THREE.Clock()
    let frameId: number

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = clock.getElapsedTime()

      // Map idle animation
      mapMesh.position.y = Math.sin(time * 0.5) * 0.2
      mapMesh.rotation.y = time * 0.05

      // Camera Parallax
      targetX = mouseX * 2
      targetY = mouseY * 2

      camera.position.x += (targetX - camera.position.x) * 0.05
      camera.position.y += ((8 + targetY) - camera.position.y) * 0.05
      
      const lookTarget = new THREE.Vector3(targetX * 0.5, 0, targetY * 0.5)
      camera.lookAt(lookTarget)

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      geo.dispose()
      edgesGeo.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#09090b]" />
  )
}
