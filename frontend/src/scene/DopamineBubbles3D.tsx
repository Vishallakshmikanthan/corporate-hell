/**
 * CORPORATE HELL™ — 3D Collectible Dopamine Bubbles (Option D Core Loop).
 *
 * Spawns bobbing, glowing pixel orbs above desks & employees in 3D space.
 * Players click them directly in the office/bedroom to collect Code, UX, Hype,
 * Cash, or squash Bugs — chaining combos and charging the Launch Rocket!
 */
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import {
  useGamificationStore,
  WorldBubble,
  BubbleKind,
} from '../state/gamificationStore'
import { useGameStore } from '../state/gameStore'

const BUBBLE_STYLES: Record<
  BubbleKind,
  { color: string; emissive: string; badgeBg: string; icon: string }
> = {
  code: {
    color: '#8fd3ff',
    emissive: '#3e6ec0',
    badgeBg: 'bg-[#1a2f52] border-[#8fd3ff] text-[#8fd3ff]',
    icon: '💡',
  },
  design: {
    color: '#c084fc',
    emissive: '#7e22ce',
    badgeBg: 'bg-[#2c1646] border-[#c084fc] text-[#e9d5ff]',
    icon: '🎨',
  },
  hype: {
    color: '#f2a93b',
    emissive: '#d97706',
    badgeBg: 'bg-[#3d2508] border-[#f2a93b] text-[#fde68a]',
    icon: '🔥',
  },
  cash: {
    color: '#b6e52d',
    emissive: '#65a30d',
    badgeBg: 'bg-[#1f3309] border-[#b6e52d] text-[#d9f99d]',
    icon: '💰',
  },
  bug: {
    color: '#ff4d4d',
    emissive: '#b91c1c',
    badgeBg: 'bg-[#450a0a] border-[#ff6b6b] text-[#fecaca]',
    icon: '🐞',
  },
}

const SingleBubble3D: React.FC<{
  bubble: WorldBubble
  onCollect: (id: string) => void
}> = ({ bubble, onCollect }) => {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const style = BUBBLE_STYLES[bubble.kind]

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    const phase = bubble.spawnedAt * 0.001
    groupRef.current.position.y = bubble.position[1] + Math.sin(t * 3.2 + phase) * 0.22
    groupRef.current.rotation.y = t * (bubble.kind === 'bug' ? 3.5 : 1.6)
    const targetScale = hovered ? 1.35 : bubble.kind === 'bug' ? 1.12 + Math.sin(t * 8) * 0.08 : 1.0
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.18)
  })

  return (
    <group
      ref={groupRef}
      position={bubble.position}
      onClick={(e) => {
        e.stopPropagation()
        onCollect(bubble.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Voxel Octahedron / Cube Core */}
      <mesh castShadow>
        {bubble.kind === 'bug' ? (
          <octahedronGeometry args={[0.32, 0]} />
        ) : (
          <boxGeometry args={[0.42, 0.42, 0.42]} />
        )}
        <meshStandardMaterial
          color={style.color}
          emissive={style.emissive}
          emissiveIntensity={hovered ? 1.3 : 0.75}
          flatShading
        />
      </mesh>

      {/* Outer Pixel Wireframe Ring */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[0.56, 0.56, 0.56]} />
        <meshBasicMaterial color={style.color} wireframe transparent opacity={0.45} />
      </mesh>

      {/* Clickable Pixel Label Pill */}
      <Html center distanceFactor={13} position={[0, 0.55, 0]}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCollect(bubble.id)
          }}
          className={`flex items-center gap-1 px-1.5 py-0.5 border-2 font-mono text-[10px] font-bold uppercase whitespace-nowrap shadow-[2px_2px_0px_#14121c] cursor-pointer hover:scale-110 active:scale-95 transition-transform ${style.badgeBg} ${
            bubble.kind === 'bug' ? 'animate-pulse' : ''
          }`}
        >
          <span>{style.icon}</span>
          <span>{bubble.label}</span>
        </button>
      </Html>
    </group>
  )
}

export const DopamineBubbles3D: React.FC<{ sceneType?: 'bedroom' | 'office' }> = ({
  sceneType = 'office',
}) => {
  const activeBubbles = useGamificationStore((s) => s.activeBubbles)
  const spawnBubble = useGamificationStore((s) => s.spawnBubble)
  const collectBubble = useGamificationStore((s) => s.collectBubble)
  const decayComboIfExpired = useGamificationStore((s) => s.decayComboIfExpired)
  const isPlaying = useGameStore((s) => s.isPlaying)

  // Spawn bubbles rhythmically while playing
  useEffect(() => {
    // Immediate seed so the room feels alive on second 1
    if (useGamificationStore.getState().activeBubbles.length === 0) {
      spawnBubble(sceneType)
      spawnBubble(sceneType)
    }

    const spawnInterval = setInterval(() => {
      if (isPlaying) {
        spawnBubble(sceneType)
      }
      decayComboIfExpired()
    }, 3200)

    return () => clearInterval(spawnInterval)
  }, [isPlaying, sceneType, spawnBubble, decayComboIfExpired])

  const handleCollect = (id: string) => {
    collectBubble(id, (cashDelta) => {
      const st = useGameStore.getState().state
      if (st) {
        st.cash += cashDelta
        useGameStore.setState({ state: { ...st } })
      }
    })
  }

  return (
    <group name="dopamine-bubbles-layer">
      {activeBubbles.map((bubble) => (
        <SingleBubble3D key={bubble.id} bubble={bubble} onCollect={handleCollect} />
      ))}
    </group>
  )
}
