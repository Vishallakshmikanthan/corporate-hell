/**
 * CORPORATE HELL™ — 3D Voxel Pixel Player Avatar (CEO).
 *
 * Constructs a full 3D voxel pixel avatar representing the CEO (matching char_vest.jpg):
 * - Black tailored vest over crisp white shirt with rolled sleeves & red tie
 * - Charcoal trousers & black dress shoes
 * - Real-time WASD movement with swinging voxel arms and legs
 * - Golden glowing halo ring on the floor & proximity prompt
 */
import { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { validateAvatarMove, checkProximityInteractable } from '../../game/engine/avatar'

export function PlayerAvatar() {
  const avatar = useGameStore((s) => s.state?.playerAvatar)
  const dispatch = useGameStore((s) => s.dispatch)

  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)

  // WASD Key listener state
  const [keys, setKeys] = useState<{ [k: string]: boolean }>({})

  // Materials with flatShading for crisp voxel look
  const mats = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({ color: '#f2cca0', roughness: 0.85, flatShading: true }),
      hair: new THREE.MeshStandardMaterial({ color: '#854d0e', roughness: 0.9, flatShading: true }),
      whiteShirt: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7, flatShading: true }),
      vest: new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8, flatShading: true }),
      tie: new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.7, flatShading: true }),
      pants: new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.85, flatShading: true }),
      shoes: new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.7, flatShading: true }),
      eyes: new THREE.MeshBasicMaterial({ color: '#111827' }),
      selection: new THREE.MeshBasicMaterial({ color: '#fabc3c' }),
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(k)) {
        setKeys((prev) => ({ ...prev, [k]: true }))
      }
      if (k === 'e' || e.code === 'KeyE') {
        const currentPos = groupRef.current?.position
        if (currentPos) {
          const interactable = checkProximityInteractable({ x: currentPos.x, z: currentPos.z })
          if (interactable) {
            dispatch({ type: 'avatar_interact', targetId: interactable.id })
            if (interactable.id === 'coffee_machine') {
              dispatch({ type: 'office_break', activity: 'coffee' })
            } else if (interactable.id === 'ping_pong_table') {
              dispatch({ type: 'office_break', activity: 'ping_pong' })
            }
          }
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      setKeys((prev) => ({ ...prev, [k]: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [dispatch])

  // Movement & Animation Frame Loop
  useFrame((state, delta) => {
    if (!groupRef.current || !avatar) return

    let dx = 0
    let dz = 0
    const speed = 5.2 * delta

    if (keys['w'] || keys['arrowup']) dz -= speed
    if (keys['s'] || keys['arrowdown']) dz += speed
    if (keys['a'] || keys['arrowleft']) dx -= speed
    if (keys['d'] || keys['arrowright']) dx += speed

    const isMoving = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001

    if (isMoving) {
      const currentPos = { x: groupRef.current.position.x, z: groupRef.current.position.z }
      const moveRes = validateAvatarMove(currentPos, { x: dx, z: dz })

      groupRef.current.position.x = moveRes.position.x
      groupRef.current.position.z = moveRes.position.z
      groupRef.current.rotation.y = moveRes.facing

      // Dispatch position update periodically
      dispatch({ type: 'avatar_move', position: moveRes.position, facing: moveRes.facing })

      // Walking leg/arm swing
      const time = state.clock.getElapsedTime() * 10
      const legSwing = Math.sin(time) * 0.55
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing
      if (leftArmRef.current) leftArmRef.current.rotation.x = -legSwing * 0.7
      if (rightArmRef.current) rightArmRef.current.rotation.x = legSwing * 0.7
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(time * 2)) * 0.06
      }
    } else {
      // Idle pose
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.015
      }
    }
  })

  const openLaptop = useUiStore((s) => s.openLaptop)

  return (
    <group
      ref={groupRef}
      position={[avatar?.position.x || -3.5, 0, avatar?.position.z || -1.0]}
      onClick={() => openLaptop()}
    >
      {/* ------------------------------------------------------------------- */}
      {/* Elliptical Ground Pixel Shadow */}
      {/* ------------------------------------------------------------------- */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 16]} />
        <meshBasicMaterial color="#0b0a12" opacity={0.6} transparent />
      </mesh>

      {/* Golden Highlight Selection Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.42, 0.5, 24]} />
        <primitive object={mats.selection} />
      </mesh>

      {/* ------------------------------------------------------------------- */}
      {/* 3D Voxel Rig for CEO (Vest, Shirt, Tie, Slacks) */}
      {/* ------------------------------------------------------------------- */}
      <group ref={bodyRef}>
        {/* Torso Box */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.32, 0.38, 0.18]} />
          <primitive object={mats.vest} />
        </mesh>

        {/* Inner White Shirt Collar */}
        <mesh position={[0, 0.72, 0.092]}>
          <boxGeometry args={[0.14, 0.08, 0.02]} />
          <primitive object={mats.whiteShirt} />
        </mesh>

        {/* Red Tie Voxel */}
        <mesh position={[0, 0.64, 0.095]}>
          <boxGeometry args={[0.04, 0.18, 0.02]} />
          <primitive object={mats.tie} />
        </mesh>

        {/* Head Skin Cube */}
        <group position={[0, 0.94, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <primitive object={mats.skin} />
          </mesh>

          {/* Pixel Eyes */}
          <mesh position={[-0.065, 0.02, 0.132]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <primitive object={mats.eyes} />
          </mesh>
          <mesh position={[0.065, 0.02, 0.132]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <primitive object={mats.eyes} />
          </mesh>

          {/* Stepped Parted Hair Cap */}
          <mesh position={[0, 0.11, -0.02]}>
            <boxGeometry args={[0.28, 0.1, 0.28]} />
            <primitive object={mats.hair} />
          </mesh>
        </group>

        {/* Left Arm Rig (Rolled white shirt sleeve) */}
        <group ref={leftArmRef} position={[-0.21, 0.72, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.09, 0.3, 0.09]} />
            <primitive object={mats.whiteShirt} />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <primitive object={mats.skin} />
          </mesh>
        </group>

        {/* Right Arm Rig (Rolled white shirt sleeve) */}
        <group ref={rightArmRef} position={[0.21, 0.72, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.09, 0.3, 0.09]} />
            <primitive object={mats.whiteShirt} />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <primitive object={mats.skin} />
          </mesh>
        </group>
      </group>

      {/* Left Leg & Dress Shoe Rig */}
      <group ref={leftLegRef} position={[-0.08, 0.3, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.1]} />
          <primitive object={mats.pants} />
        </mesh>
        <mesh position={[0, -0.3, 0.02]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.15]} />
          <primitive object={mats.shoes} />
        </mesh>
      </group>

      {/* Right Leg & Dress Shoe Rig */}
      <group ref={rightLegRef} position={[0.08, 0.3, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.1]} />
          <primitive object={mats.pants} />
        </mesh>
        <mesh position={[0, -0.3, 0.02]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.15]} />
          <primitive object={mats.shoes} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* Floating Pixel Player Tag & Interaction Hint */}
      {/* ------------------------------------------------------------------- */}
      <Html position={[0, 1.45, 0]} center distanceFactor={14} zIndexRange={[50, 0]}>
        <div className="flex flex-col items-center select-none font-mono pointer-events-none">
          <div className="flex items-center gap-1 bg-[#14121c] border-2 border-[#b6e52d] px-1.5 py-0.5 shadow-[2px_2px_0px_#14121c]">
            <span className="text-[#b6e52d] text-[9px] font-bold">★ YOU (CEO)</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
