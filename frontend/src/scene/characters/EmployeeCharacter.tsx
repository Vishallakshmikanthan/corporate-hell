/**
 * CORPORATE HELL™ — AAA Stylized 3D Employee Character.
 *
 * Procedurally assembled stylized character model matching the reference visual style:
 * - Expressive hair styles, skin tones, outfit colors, accessories (glasses, headphones, tie, badge, beard)
 * - Walking, typing, meeting, and reactive emotion animations
 * - Floating rounded speech bubbles with emoji & witty dialogue
 * - Dark floating name badges below speech bubbles matching reference layout
 * - Interactive selection ring and click handling
 */
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Employee, Emotion } from '../../game/models/types'
import { useGameStore } from '../../state/gameStore'

interface Props {
  employee: Employee
}

const EMOTION_ICONS: Record<Emotion, string> = {
  neutral: '💭',
  happy: '✨',
  excited: '⚡',
  celebratory: '🎉',
  smug: '😏',
  sad: '🌧️',
  angry: '🔥',
  frustrated: '😤',
  confused: '❓',
  exhausted: '☕',
  panicked: '🚨',
  embarrassed: '😳',
}

// Characteristic default quotes per employee matching the reference image
const SIGNATURE_QUOTES: Record<string, string> = {
  emp_bianca: 'This printer again?!',
  emp_deborah: "Let's align on this.",
  emp_yuki: 'Thinking...',
  emp_priya: 'Need coffee...',
  emp_kevin: 'Almost done...',
  emp_sandra: 'This KPI is fake.',
  emp_nadia: 'Another meeting?!',
  emp_preston: 'New meme idea',
  emp_steve: 'Where is everyone?',
  emp_ellen: 'BRB 😴',
  emp_chad: 'Great point, CEO!',
  emp_marcus: 'Numbers are up.',
  emp_gary: '10x growth mindset',
}

export function EmployeeCharacter({ employee }: Props) {
  const selectedId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const isSelected = selectedId === employee.id

  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Group>(null)

  // Materials
  const skinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: employee.visual.skin, roughness: 0.75 }),
    [employee.visual.skin],
  )
  const hairMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: employee.visual.hair, roughness: 0.85 }),
    [employee.visual.hair],
  )
  const outfitMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: employee.visual.outfit, roughness: 0.65 }),
    [employee.visual.outfit],
  )
  const pantsMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#232731', roughness: 0.8 }),
    [],
  )
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: employee.visual.outfitAccent, roughness: 0.55 }),
    [employee.visual.outfitAccent],
  )
  const selectionMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#3b82f6',
        transparent: true,
        opacity: 0.85,
      }),
    [],
  )

  // Procedural Animation Loop
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Position interpolation towards simulation coordinates
    const targetX = employee.position.x
    const targetZ = employee.position.z
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      12 * delta,
    )
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      12 * delta,
    )

    const isWalking =
      employee.path &&
      employee.pathIndex < employee.path.length &&
      (Math.abs(groupRef.current.position.x - targetX) > 0.05 ||
        Math.abs(groupRef.current.position.z - targetZ) > 0.05)

    const isSeated =
      (employee.action === 'work' || employee.action === 'meeting') && !isWalking

    // Facing direction
    if (isWalking) {
      const angle = Math.atan2(
        targetX - groupRef.current.position.x,
        targetZ - groupRef.current.position.z,
      )
      groupRef.current.rotation.y = angle
    } else if (isSeated) {
      groupRef.current.rotation.y = employee.facing
    }

    const time = state.clock.getElapsedTime() * 7

    // Walking animation
    if (isWalking) {
      const legSwing = Math.sin(time) * 0.4
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing
      if (leftArmRef.current) leftArmRef.current.rotation.x = -legSwing * 0.65
      if (rightArmRef.current) rightArmRef.current.rotation.x = legSwing * 0.65
      groupRef.current.position.y = Math.abs(Math.sin(time * 2)) * 0.08
    } else if (employee.reaction) {
      // Expressive Reaction Animations
      const kind = employee.reaction.kind
      if (kind === 'celebratory') {
        groupRef.current.position.y = Math.abs(Math.sin(time * 2.5)) * 0.25
        if (leftArmRef.current) leftArmRef.current.rotation.x = 2.4
        if (rightArmRef.current) rightArmRef.current.rotation.x = 2.4
      } else if (kind === 'frustrated' || kind === 'angry') {
        groupRef.current.position.y = 0
        if (headRef.current) headRef.current.rotation.x = 0.35
        if (leftArmRef.current) leftArmRef.current.rotation.x = 1.2
        if (rightArmRef.current) rightArmRef.current.rotation.x = 1.2
      } else if (kind === 'exhausted') {
        groupRef.current.position.y = 0
        if (headRef.current) headRef.current.rotation.x = 0.45
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0.1
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0.1
      }
    } else if (isSeated) {
      // Typing / working at desk
      groupRef.current.position.y = -0.15
      if (leftLegRef.current) leftLegRef.current.rotation.x = 1.4
      if (rightLegRef.current) rightLegRef.current.rotation.x = 1.4
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.95 + Math.sin(time * 3) * 0.06
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.95 + Math.cos(time * 3) * 0.06
      if (headRef.current) headRef.current.rotation.x = 0.15 + Math.sin(time * 0.8) * 0.04
    } else {
      // Idle standing / breathing
      groupRef.current.position.y = 0
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      if (headRef.current) headRef.current.rotation.x = Math.sin(time * 0.4) * 0.06
    }
  })

  // Display text: either live thought, reaction, or signature character quote
  const displayText = employee.thought || SIGNATURE_QUOTES[employee.id] || 'Working...'
  const firstName = employee.name.split(' ')[0]
  const iconEmoji = employee.reaction
    ? EMOTION_ICONS[employee.reaction.kind] || '✨'
    : '💭'

  return (
    <group
      ref={groupRef}
      position={[employee.position.x, 0, employee.position.z]}
      onClick={(e) => {
        e.stopPropagation()
        selectEmployee(employee.id)
      }}
    >
      {/* Selection Ring */}
      {isSelected && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={selectionMat}>
            <ringGeometry args={[0.38, 0.52, 32]} />
          </mesh>
          <pointLight color="#3b82f6" intensity={1.2} distance={2.5} />
        </group>
      )}

      {/* Legs */}
      <mesh ref={leftLegRef} castShadow position={[-0.1, 0.26, 0]} material={pantsMat}>
        <boxGeometry args={[0.13, 0.46, 0.13]} />
      </mesh>
      <mesh ref={rightLegRef} castShadow position={[0.1, 0.26, 0]} material={pantsMat}>
        <boxGeometry args={[0.13, 0.46, 0.13]} />
      </mesh>

      {/* Torso */}
      <mesh castShadow position={[0, 0.68, 0]} material={outfitMat}>
        <boxGeometry args={[0.35, 0.45, 0.22]} />
      </mesh>

      {/* Accessory: Necktie or ID Badge */}
      {employee.visual.accessory === 'tie' && (
        <mesh position={[0, 0.68, 0.12]} material={accentMat}>
          <boxGeometry args={[0.07, 0.28, 0.02]} />
        </mesh>
      )}
      {employee.visual.accessory === 'badge' && (
        <mesh position={[0.1, 0.72, 0.12]} material={accentMat}>
          <boxGeometry args={[0.06, 0.08, 0.02]} />
        </mesh>
      )}

      {/* Arms */}
      <mesh ref={leftArmRef} castShadow position={[-0.23, 0.66, 0]} material={skinMat}>
        <boxGeometry args={[0.09, 0.42, 0.09]} />
      </mesh>
      <mesh ref={rightArmRef} castShadow position={[0.23, 0.66, 0]} material={skinMat}>
        <boxGeometry args={[0.09, 0.42, 0.09]} />
      </mesh>

      {/* Head & Hair Group */}
      <group ref={headRef} position={[0, 1.06, 0]}>
        {/* Head Cube/Sphere */}
        <mesh castShadow material={skinMat}>
          <boxGeometry args={[0.27, 0.27, 0.27]} />
        </mesh>

        {/* Hair Styles */}
        {employee.visual.hairStyle === 'short' && (
          <mesh position={[0, 0.13, -0.02]} material={hairMat}>
            <boxGeometry args={[0.29, 0.11, 0.29]} />
          </mesh>
        )}
        {employee.visual.hairStyle === 'bun' && (
          <group>
            <mesh position={[0, 0.13, -0.02]} material={hairMat}>
              <boxGeometry args={[0.29, 0.11, 0.29]} />
            </mesh>
            <mesh position={[0, 0.23, -0.1]} material={hairMat}>
              <sphereGeometry args={[0.1, 10, 10]} />
            </mesh>
          </group>
        )}
        {employee.visual.hairStyle === 'long' && (
          <group>
            <mesh position={[0, 0.13, -0.02]} material={hairMat}>
              <boxGeometry args={[0.29, 0.11, 0.29]} />
            </mesh>
            <mesh position={[0, -0.08, -0.13]} material={hairMat}>
              <boxGeometry args={[0.29, 0.32, 0.08]} />
            </mesh>
          </group>
        )}
        {employee.visual.hairStyle === 'ponytail' && (
          <group>
            <mesh position={[0, 0.13, -0.02]} material={hairMat}>
              <boxGeometry args={[0.29, 0.11, 0.29]} />
            </mesh>
            <mesh position={[0, 0.06, -0.19]} material={hairMat}>
              <cylinderGeometry args={[0.04, 0.06, 0.22]} />
            </mesh>
          </group>
        )}
        {employee.visual.hairStyle === 'spiky' && (
          <group>
            <mesh position={[0, 0.13, -0.02]} material={hairMat}>
              <boxGeometry args={[0.29, 0.11, 0.29]} />
            </mesh>
            <mesh position={[0, 0.22, 0]} material={hairMat}>
              <coneGeometry args={[0.14, 0.16, 6]} />
            </mesh>
          </group>
        )}

        {/* Glasses Accessory */}
        {employee.visual.accessory === 'glasses' && (
          <mesh position={[0, 0.02, 0.14]}>
            <boxGeometry args={[0.25, 0.06, 0.02]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        )}

        {/* Headphones Accessory */}
        {employee.visual.accessory === 'headphones' && (
          <group position={[0, 0.04, 0]}>
            <mesh position={[-0.15, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.05]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
            <mesh position={[0.15, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.05]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
          </group>
        )}
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* Floating Speech Bubble & Name Tag (Matching the Reference Image) */}
      {/* ------------------------------------------------------------------- */}
      <Html position={[0, 1.48, 0]} center distanceFactor={14}>
        <div
          onClick={(e) => {
            e.stopPropagation()
            selectEmployee(employee.id)
          }}
          className="flex flex-col items-center select-none cursor-pointer group transition-transform hover:scale-105"
        >
          {/* Rounded White Speech Bubble */}
          <div className="relative flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 shadow-xl border border-slate-200/80 backdrop-blur-sm transition-all group-hover:bg-white group-hover:shadow-2xl">
            <span className="text-[12px] shrink-0">{iconEmoji}</span>
            <span className="text-[11.5px] font-semibold text-slate-900 tracking-tight whitespace-nowrap">
              {displayText}
            </span>

            {/* Downward Speech Bubble Pointer Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-white/95" />
          </div>

          {/* Crisp Dark Name Tag Badge */}
          <div className="mt-1.5 rounded-md bg-slate-950/85 px-2 py-0.5 shadow-md border border-slate-700/60 backdrop-blur-sm transition-colors group-hover:bg-slate-900">
            <span className="text-[10px] font-bold text-slate-100 tracking-wide">
              {firstName}
            </span>
          </div>
        </div>
      </Html>
    </group>
  )
}
