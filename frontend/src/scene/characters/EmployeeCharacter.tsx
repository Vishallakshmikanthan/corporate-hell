/**
 * CORPORATE HELL™ — Authentic 3D Voxel Pixel Character.
 *
 * Constructs fully 3D blocky/voxel pixel characters reflecting the reference assets:
 * - Kevin: Oversized grey hoodie & bright yellow Crocs!
 * - Chad / Marcus: Black business vest over white shirt with rolled sleeves & tie!
 * - Deborah / Sandra: Green blazer & lanyard badge with glasses!
 * - Gary / Nadia: Olive green turtleneck sweater & headset with mic!
 * - Yuki / Steve: Black graphic tee with pixel chest print, beard & studio headphones!
 * - Preston: Backwards cobalt cap, blue hoodie & backpack!
 * - Priya / Ellen / Bianca: Cropped hoodie, long wavy hair & baggy wide-leg jeans!
 *
 * Implements procedural walking animations (swinging voxel arms & legs), seated desk
 * posture, ground shadows, reactive emote speech bubbles, and diegetic ID badge click.
 */
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Employee, Emotion } from '../../game/models/types'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'

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

const SIGNATURE_QUOTES: Record<string, string> = {
  emp_bianca: 'This printer again?!',
  emp_deborah: "Let's align on this.",
  emp_yuki: 'Thinking...',
  emp_priya: 'Need coffee...',
  emp_kevin: 'Check out my yellow Crocs!',
  emp_sandra: 'This KPI is fake.',
  emp_nadia: 'Another meeting?!',
  emp_preston: 'New meme idea',
  emp_steve: 'Where is everyone?',
  emp_ellen: 'BRB 😴',
  emp_chad: 'Great point, CEO!',
  emp_marcus: 'Numbers are up.',
  emp_gary: '10x growth mindset',
}

export const EMPLOYEE_REFERENCE_SPRITES: Record<string, string> = {
  emp_deborah: '/reference/char_woman_lanyard.jpg',
  emp_chad: '/reference/char_vest.jpg',
  emp_yuki: '/reference/char_graphic_tee.jpg',
  emp_gary: '/reference/char_green_sweater.jpg',
  emp_priya: '/reference/char_woman_selfie.jpg',
  emp_sandra: '/reference/char_woman_lanyard.jpg',
  emp_marcus: '/reference/char_vest.jpg',
  emp_ellen: '/reference/char_woman_selfie.jpg',
  emp_preston: '/reference/char_hoodie.jpg',
  emp_kevin: '/reference/char_crocs.jpg',
  emp_nadia: '/reference/char_green_sweater.jpg',
  emp_steve: '/reference/char_graphic_tee.jpg',
  emp_bianca: '/reference/char_woman_selfie.jpg',
}

// Visual archetype configuration matching reference images
interface VoxelArchetype {
  skinColor: string
  hairColor: string
  hairStyle: 'short' | 'bun' | 'long' | 'cap' | 'messy'
  hasBeard?: boolean
  topType: 'vest' | 'crocs_hoodie' | 'blazer' | 'turtleneck' | 'graphic_tee' | 'blue_hoodie' | 'cropped_hoodie'
  topColor: string
  topAccent?: string
  bottomColor: string
  shoeColor: string
  accessory?: 'glasses' | 'headset' | 'headphones' | 'lanyard' | 'backpack'
}

function getArchetype(empId: string): VoxelArchetype {
  switch (empId) {
    case 'emp_kevin':
      // Grey hoodie & yellow crocs
      return {
        skinColor: '#f2cca0',
        hairColor: '#2b231d',
        hairStyle: 'messy',
        topType: 'crocs_hoodie',
        topColor: '#9ca3af', // Heather grey
        bottomColor: '#1f242d', // Dark sweatpants
        shoeColor: '#facc15', // Bright Yellow Crocs!
      }
    case 'emp_chad':
    case 'emp_marcus':
      // Black vest over white shirt & red tie
      return {
        skinColor: '#eec798',
        hairColor: '#854d0e',
        hairStyle: 'short',
        topType: 'vest',
        topColor: '#18181b', // Black vest
        topAccent: '#b91c1c', // Red tie
        bottomColor: '#374151', // Charcoal trousers
        shoeColor: '#09090b', // Black dress shoes
      }
    case 'emp_deborah':
    case 'emp_sandra':
      // Espresso blazer, gold lanyard & glasses
      return {
        skinColor: '#e0b080',
        hairColor: '#1c1917',
        hairStyle: 'bun',
        topType: 'blazer',
        topColor: '#2d241e', // Espresso blazer
        topAccent: '#d4a84f', // Gold lanyard
        bottomColor: '#181411', // Charcoal slacks
        shoeColor: '#09090b',
        accessory: 'lanyard',
      }
    case 'emp_gary':
    case 'emp_nadia':
      // Olive green turtleneck & studio headset
      return {
        skinColor: '#f0caa3',
        hairColor: '#78350f',
        hairStyle: 'short',
        topType: 'turtleneck',
        topColor: '#3f5238', // Warm olive turtleneck
        bottomColor: '#c7b99e', // Warm beige chinos
        shoeColor: '#573a24', // Brown loafers
        accessory: 'headset',
      }
    case 'emp_yuki':
    case 'emp_steve':
      // Graphic tee, beard & gold-accent studio headphones
      return {
        skinColor: '#eed2b6',
        hairColor: '#18181b',
        hairStyle: 'messy',
        hasBeard: true,
        topType: 'graphic_tee',
        topColor: '#1f1a16', // Charcoal tee
        topAccent: '#d4a84f', // Muted gold chest print
        bottomColor: '#332b24', // Dark espresso denim
        shoeColor: '#27272a',
        accessory: 'headphones',
      }
    case 'emp_preston':
      // Backwards warm camel cap, warm charcoal hoodie & backpack
      return {
        skinColor: '#e6be94',
        hairColor: '#451a03',
        hairStyle: 'cap',
        topType: 'blue_hoodie',
        topColor: '#68594c', // Warm taupe hoodie
        bottomColor: '#352c25', // Dark mocha trousers
        shoeColor: '#faf7f0', // Ivory sneakers
        accessory: 'backpack',
      }
    case 'emp_priya':
    case 'emp_ellen':
    case 'emp_bianca':
    default:
      // Warm cream/beige blazer-sweater & dark tailored trousers
      return {
        skinColor: '#dfb288',
        hairColor: '#18181b',
        hairStyle: 'long',
        topType: 'cropped_hoodie',
        topColor: '#e6decb', // Warm cream knit
        bottomColor: '#27211c', // Tailored dark charcoal
        shoeColor: '#faf7f0', // Ivory loafers
      }
  }
}

export function EmployeeCharacter({ employee }: Props) {
  const selectedId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const isSelected = selectedId === employee.id

  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)

  const archetype = useMemo(() => getArchetype(employee.id), [employee.id])

  // Materials with flatShading for crisp voxel look
  const mats = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({ color: archetype.skinColor, roughness: 0.85, flatShading: true }),
      hair: new THREE.MeshStandardMaterial({ color: archetype.hairColor, roughness: 0.9, flatShading: true }),
      top: new THREE.MeshStandardMaterial({ color: archetype.topColor, roughness: 0.8, flatShading: true }),
      topAccent: new THREE.MeshStandardMaterial({ color: archetype.topAccent || '#ffffff', roughness: 0.7, flatShading: true }),
      whiteShirt: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7, flatShading: true }),
      bottom: new THREE.MeshStandardMaterial({ color: archetype.bottomColor, roughness: 0.85, flatShading: true }),
      shoes: new THREE.MeshStandardMaterial({ color: archetype.shoeColor, roughness: 0.7, flatShading: true }),
      eyes: new THREE.MeshBasicMaterial({ color: '#111827' }),
      glasses: new THREE.MeshBasicMaterial({ color: '#09090b' }),
      headset: new THREE.MeshStandardMaterial({ color: '#f97316', roughness: 0.5, flatShading: true }),
      backpack: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9, flatShading: true }),
      selection: new THREE.MeshBasicMaterial({ color: '#fabc3c' }),
    }
  }, [archetype])

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

    const time = state.clock.getElapsedTime() * 8

    // 3D Voxel Walking Animation
    if (isWalking) {
      const legSwing = Math.sin(time) * 0.5
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing
      if (leftArmRef.current) leftArmRef.current.rotation.x = -legSwing * 0.7
      if (rightArmRef.current) rightArmRef.current.rotation.x = legSwing * 0.7
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.abs(Math.sin(time * 2)) * 0.06
        bodyRef.current.rotation.z = Math.sin(time) * 0.03
      }
    } else if (isSeated) {
      // Seated posture at desk
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -Math.PI / 2.2
        leftLegRef.current.position.y = 0.28
        leftLegRef.current.position.z = 0.12
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.PI / 2.2
        rightLegRef.current.position.y = 0.28
        rightLegRef.current.position.z = 0.12
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 3
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 3
      if (bodyRef.current) {
        bodyRef.current.position.y = -0.12
        bodyRef.current.rotation.z = 0
      }
    } else {
      // Idle breathing
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = 0
        leftLegRef.current.position.y = 0.3
        leftLegRef.current.position.z = 0
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = 0
        rightLegRef.current.position.y = 0.3
        rightLegRef.current.position.z = 0
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(time * 0.3) * 0.015
        bodyRef.current.rotation.z = 0
      }
    }
  })

  // Dialogue & emote data
  const displayText =
    employee.thought ||
    employee.lastDialogue?.text ||
    SIGNATURE_QUOTES[employee.id] ||
    'Busy coding...'

  const iconEmoji =
    employee.reaction?.kind
      ? EMOTION_ICONS[employee.reaction.kind] || '✨'
      : employee.morale < 40
        ? '💢'
        : employee.stress > 70
          ? '🚨'
          : employee.action === 'coffee'
            ? '☕'
            : employee.action === 'meeting'
              ? '🗣️'
              : '💡'

  const firstName = employee.name.split(' ')[0]

  return (
    <group
      ref={groupRef}
      position={[employee.position.x, 0, employee.position.z]}
      onClick={(e) => {
        e.stopPropagation()
        selectEmployee(employee.id)
        useGameStore.getState().setDossierOpen(true)
        useUiStore.getState().inspectEmployee(employee.id)
      }}
    >
      {/* ------------------------------------------------------------------- */}
      {/* Ground Pixel Shadow */}
      {/* ------------------------------------------------------------------- */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 16]} />
        <meshBasicMaterial color="#0b0a12" opacity={0.5} transparent />
      </mesh>

      {/* Selected Golden Floor Ring */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.46, 24]} />
          <primitive object={mats.selection} />
        </mesh>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Main 3D Voxel Rig (Body, Head, Limbs) */}
      {/* ------------------------------------------------------------------- */}
      <group ref={bodyRef}>
        {/* Torso Voxel Block */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.3, 0.36, 0.18]} />
          <primitive object={mats.top} />
        </mesh>

        {/* --- Specific Outfit Layering --- */}
        {archetype.topType === 'vest' && (
          <group position={[0, 0.58, 0]}>
            {/* Inner White Shirt Collar */}
            <mesh position={[0, 0.14, 0.092]}>
              <boxGeometry args={[0.14, 0.08, 0.02]} />
              <primitive object={mats.whiteShirt} />
            </mesh>
            {/* Red Tie */}
            <mesh position={[0, 0.06, 0.095]}>
              <boxGeometry args={[0.04, 0.18, 0.02]} />
              <primitive object={mats.topAccent} />
            </mesh>
          </group>
        )}

        {archetype.topType === 'blazer' && (
          <group position={[0, 0.58, 0]}>
            {/* Blouse V */}
            <mesh position={[0, 0.12, 0.092]}>
              <boxGeometry args={[0.12, 0.1, 0.02]} />
              <primitive object={mats.whiteShirt} />
            </mesh>
            {/* Lanyard Ribbon */}
            <mesh position={[0, 0.04, 0.095]}>
              <boxGeometry args={[0.05, 0.22, 0.02]} />
              <primitive object={mats.topAccent} />
            </mesh>
            {/* Badge card */}
            <mesh position={[0, -0.05, 0.1]}>
              <boxGeometry args={[0.08, 0.06, 0.015]} />
              <meshStandardMaterial color="#facc15" />
            </mesh>
          </group>
        )}

        {archetype.topType === 'graphic_tee' && (
          /* Cyan pixel graphic print on chest */
          <mesh position={[0, 0.62, 0.092]}>
            <boxGeometry args={[0.16, 0.14, 0.01]} />
            <primitive object={mats.topAccent} />
          </mesh>
        )}

        {archetype.topType === 'crocs_hoodie' && (
          /* Oversized hoodie pocket / fold */
          <mesh position={[0, 0.52, 0.095]}>
            <boxGeometry args={[0.22, 0.12, 0.03]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        )}

        {archetype.accessory === 'backpack' && (
          /* Backpack cube on back */
          <mesh position={[0, 0.58, -0.13]}>
            <boxGeometry args={[0.22, 0.28, 0.1]} />
            <primitive object={mats.backpack} />
          </mesh>
        )}

        {/* --- Head & Face Voxels --- */}
        <group position={[0, 0.92, 0]}>
          {/* Head Skin Cube */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <primitive object={mats.skin} />
          </mesh>

          {/* Pixel Eyes (Black cubes) */}
          <mesh position={[-0.065, 0.02, 0.132]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <primitive object={mats.eyes} />
          </mesh>
          <mesh position={[0.065, 0.02, 0.132]}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
            <primitive object={mats.eyes} />
          </mesh>

          {/* Beard / Stubble */}
          {archetype.hasBeard && (
            <mesh position={[0, -0.09, 0.08]}>
              <boxGeometry args={[0.24, 0.08, 0.14]} />
              <primitive object={mats.hair} />
            </mesh>
          )}

          {/* Glasses */}
          {(archetype.accessory === 'glasses' || employee.id === 'emp_deborah') && (
            <mesh position={[0, 0.02, 0.135]}>
              <boxGeometry args={[0.22, 0.045, 0.02]} />
              <primitive object={mats.glasses} />
            </mesh>
          )}

          {/* Gaming Headset */}
          {(archetype.accessory === 'headset' || archetype.accessory === 'headphones') && (
            <group>
              {/* Headband */}
              <mesh position={[0, 0.14, 0]}>
                <boxGeometry args={[0.3, 0.04, 0.06]} />
                <primitive object={mats.headset} />
              </mesh>
              {/* Left & Right Ear Cushions */}
              <mesh position={[-0.14, 0.02, 0]}>
                <boxGeometry args={[0.04, 0.09, 0.09]} />
                <primitive object={mats.headset} />
              </mesh>
              <mesh position={[0.14, 0.02, 0]}>
                <boxGeometry args={[0.04, 0.09, 0.09]} />
                <primitive object={mats.headset} />
              </mesh>
            </group>
          )}

          {/* Hair Styles */}
          {archetype.hairStyle === 'short' && (
            <mesh position={[0, 0.11, -0.02]}>
              <boxGeometry args={[0.28, 0.09, 0.28]} />
              <primitive object={mats.hair} />
            </mesh>
          )}

          {archetype.hairStyle === 'bun' && (
            <group>
              <mesh position={[0, 0.11, -0.02]}>
                <boxGeometry args={[0.28, 0.09, 0.28]} />
                <primitive object={mats.hair} />
              </mesh>
              {/* Top Bun Voxel */}
              <mesh position={[0, 0.19, -0.06]}>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                <primitive object={mats.hair} />
              </mesh>
            </group>
          )}

          {archetype.hairStyle === 'long' && (
            <group>
              <mesh position={[0, 0.11, -0.02]}>
                <boxGeometry args={[0.28, 0.09, 0.28]} />
                <primitive object={mats.hair} />
              </mesh>
              {/* Wavy hair sides */}
              <mesh position={[-0.14, -0.06, 0]}>
                <boxGeometry args={[0.05, 0.24, 0.24]} />
                <primitive object={mats.hair} />
              </mesh>
              <mesh position={[0.14, -0.06, 0]}>
                <boxGeometry args={[0.05, 0.24, 0.24]} />
                <primitive object={mats.hair} />
              </mesh>
            </group>
          )}

          {archetype.hairStyle === 'messy' && (
            <mesh position={[0, 0.12, -0.01]}>
              <boxGeometry args={[0.29, 0.11, 0.29]} />
              <primitive object={mats.hair} />
            </mesh>
          )}

          {archetype.hairStyle === 'cap' && (
            <group>
              {/* Backwards Cap Base */}
              <mesh position={[0, 0.11, -0.02]}>
                <boxGeometry args={[0.28, 0.1, 0.28]} />
                <meshStandardMaterial color="#b88933" />
              </mesh>
              {/* Backwards Visor jutting out */}
              <mesh position={[0, 0.07, -0.16]}>
                <boxGeometry args={[0.16, 0.025, 0.1]} />
                <meshStandardMaterial color="#966c22" />
              </mesh>
            </group>
          )}
        </group>

        {/* --- Left Arm Rig --- */}
        <group ref={leftArmRef} position={[-0.2, 0.72, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.09, 0.3, 0.09]} />
            <primitive object={archetype.topType === 'vest' ? mats.whiteShirt : mats.top} />
          </mesh>
          {/* Hand Skin Voxel */}
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <primitive object={mats.skin} />
          </mesh>
        </group>

        {/* --- Right Arm Rig --- */}
        <group ref={rightArmRef} position={[0.2, 0.72, 0]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <boxGeometry args={[0.09, 0.3, 0.09]} />
            <primitive object={archetype.topType === 'vest' ? mats.whiteShirt : mats.top} />
          </mesh>
          {/* Hand Skin Voxel */}
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <primitive object={mats.skin} />
          </mesh>
        </group>
      </group>

      {/* --- Left Leg & Shoe Rig --- */}
      <group ref={leftLegRef} position={[-0.08, 0.3, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.1]} />
          <primitive object={mats.bottom} />
        </mesh>
        {/* Foot / Shoe / Yellow Crocs Voxel */}
        <mesh position={[0, -0.3, 0.02]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.15]} />
          <primitive object={mats.shoes} />
        </mesh>
      </group>

      {/* --- Right Leg & Shoe Rig --- */}
      <group ref={rightLegRef} position={[0.08, 0.3, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.1]} />
          <primitive object={mats.bottom} />
        </mesh>
        {/* Foot / Shoe / Yellow Crocs Voxel */}
        <mesh position={[0, -0.3, 0.02]} castShadow>
          <boxGeometry args={[0.11, 0.08, 0.15]} />
          <primitive object={mats.shoes} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* Luxury Cream/Gold Floating Callout & Name Chip (matches reference-ui) */}
      {/* ------------------------------------------------------------------- */}
      <Html position={[0, 1.4, 0]} center distanceFactor={14}>
        <div className="flex flex-col items-center select-none cursor-pointer group font-sans">
          {isSelected || employee.id === 'emp_priya' || employee.id === 'emp_deborah' || employee.thoughtTicksLeft > 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#faf7f0]/95 px-2.5 py-1.5 text-[#1f1a16] border border-[#d4a84f] shadow-[0_6px_20px_rgba(0,0,0,0.45)] whitespace-nowrap transition-transform group-hover:scale-105">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#27211c] text-[11px]">
                {iconEmoji}
              </span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-bold text-[#181411]">{employee.name}</span>
                <span className="text-[9px] font-medium text-[#5c4e41] max-w-[145px] truncate">
                  {displayText}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center gap-1 rounded-full bg-[#1b1612]/90 px-2 py-0.5 border border-[#d4a84f]/40 shadow-md group-hover:scale-110 transition-transform">
              <span className="text-[10px]">{iconEmoji}</span>
              <span className="text-[9px] font-semibold text-[#faf7f0] tracking-tight">
                {firstName}
              </span>
              <div className="hidden group-hover:flex absolute bottom-7 left-1/2 -translate-x-1/2 rounded-lg bg-[#faf7f0] text-[#181411] px-2.5 py-1 border border-[#d4a84f] shadow-lg whitespace-nowrap z-50 text-[10px] font-semibold">
                <span>{displayText}</span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}
