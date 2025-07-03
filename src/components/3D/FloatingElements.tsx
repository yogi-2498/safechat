import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingParticlesProps {
  count?: number
  color?: string
}

function FloatingParticles({ count = 100, color = '#ff6b6b' }: FloatingParticlesProps) {
  const ref = useRef<THREE.Points>(null!)
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      temp.set([
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ], i * 3)
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  )
}

export const FloatingElements: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <FloatingParticles count={50} color="#ff6b6b" />
        <FloatingParticles count={30} color="#4ecdc4" />
        <FloatingParticles count={40} color="#45b7d1" />
      </Canvas>
    </div>
  )
}