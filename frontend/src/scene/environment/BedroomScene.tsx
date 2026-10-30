/**
 * CORPORATE HELL™ — Chapter 1: The Bedroom Hacker (3D Voxel Environment).
 *
 * Implements the authentic solo indie developer environment:
 * - 3D Voxel single dorm room: wooden desk, glowing retro CRT PC, instant ramen, energy drinks
 * - Bed with unmade blanket, bookshelf with tech manuals, sticky note wall
 * - Controllable 3D voxel avatar (WASD)
 * - Quick action console: Code Sprint minigame, Study Docs, Ship Side Project, Hackathon unlock
 */
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PlayerAvatar } from '../characters/PlayerAvatar'
import { CameraController } from '../CameraController'
import { useGameStore } from '../../state/gameStore'
import { CodeSprintMinigame } from '../../components/modals/CodeSprintMinigame'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { audio } from '../../services/audio'
import {
  Code2,
  BookOpen,
  Coffee,
  Moon,
  Sparkles,
  Trophy,
  ArrowRight,
  Flame,
} from 'lucide-react'

export const BedroomScene: React.FC = () => {
  const career = useGameStore((s) => s.state?.career)
  const dispatch = useGameStore((s) => s.dispatch)

  const [showCodeSprint, setShowCodeSprint] = useState(false)

  const handleStudyDocs = () => {
    audio.playClick()
    dispatch({ type: 'study_docs' })
  }

  const handleShipProject = () => {
    audio.playBoot()
    dispatch({ type: 'ship_side_project' })
  }

  const handleEnterHackathon = () => {
    audio.playLever()
    dispatch({ type: 'advance_chapter', targetChapter: 'hackathon' })
  }

  const canAdvance =
    (career?.learningLevel || 0) >= 50 &&
    (career?.sideProjectsShipped || 0) >= 3 &&
    (career?.githubStars || 0) >= 300

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#14121c] font-mono select-none crt-scanlines">
      {/* ------------------------------------------------------------- */}
      {/* 3D Voxel Bedroom Viewport */}
      {/* ------------------------------------------------------------- */}
      <Canvas
        dpr={[0.45, 0.6]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [8, 9, 10], fov: 38 }}
        className="h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      >
        <ambientLight intensity={0.7} color="#fdf4dc" />
        <directionalLight position={[10, 16, 8]} intensity={1.2} color="#fff1db" castShadow />
        <pointLight position={[0, 2.8, 0]} intensity={0.9} color="#fed7aa" distance={12} />
        {/* Glowing Green CRT Screen Light */}
        <pointLight position={[-2.2, 1.2, -1.8]} intensity={1.4} color="#4ade80" distance={4} />

        {/* --- 3D Voxel Room Architecture --- */}
        {/* Floor */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[10, 0.1, 10]} />
          <meshStandardMaterial color="#3f2e21" roughness={0.9} flatShading />
        </mesh>

        {/* Cozy Pixel Rug */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[4.2, 0.02, 3.8]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.8} flatShading />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, 2.5, -5]}>
          <boxGeometry args={[10, 5, 0.2]} />
          <meshStandardMaterial color="#2d283e" roughness={0.9} flatShading />
        </mesh>

        {/* Left Wall */}
        <mesh position={[-5, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 10]} />
          <meshStandardMaterial color="#262235" roughness={0.9} flatShading />
        </mesh>

        {/* --- Bedroom Furniture --- */}
        {/* Developer Desk */}
        <group position={[-2.2, 0.5, -3.8]}>
          {/* Tabletop */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[2.4, 0.08, 1.2]} />
            <meshStandardMaterial color="#6b4423" flatShading />
          </mesh>
          {/* Desk Legs */}
          <mesh position={[-1.0, -0.25, -0.45]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#18181b" flatShading />
          </mesh>
          <mesh position={[1.0, -0.25, -0.45]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#18181b" flatShading />
          </mesh>
          <mesh position={[-1.0, -0.25, 0.45]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#18181b" flatShading />
          </mesh>
          <mesh position={[1.0, -0.25, 0.45]}>
            <boxGeometry args={[0.1, 0.9, 0.1]} />
            <meshStandardMaterial color="#18181b" flatShading />
          </mesh>

          {/* Bulky Retro CRT Monitor */}
          <mesh position={[0, 0.6, -0.1]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.7]} />
            <meshStandardMaterial color="#ded2b6" roughness={0.7} flatShading />
          </mesh>
          {/* Glowing Green Monitor Screen */}
          <mesh position={[0, 0.6, 0.26]}>
            <boxGeometry args={[0.68, 0.48, 0.02]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>

          {/* Keyboard & Mouse */}
          <mesh position={[0, 0.31, 0.2]}>
            <boxGeometry args={[0.65, 0.03, 0.22]} />
            <meshStandardMaterial color="#ded2b6" flatShading />
          </mesh>

          {/* Energy Drink Can */}
          <mesh position={[0.7, 0.38, 0.1]}>
            <cylinderGeometry args={[0.04, 0.04, 0.14]} />
            <meshStandardMaterial color="#06b6d4" flatShading />
          </mesh>
          {/* Ramen Cup */}
          <mesh position={[-0.7, 0.37, 0.1]}>
            <cylinderGeometry args={[0.07, 0.05, 0.12]} />
            <meshStandardMaterial color="#f8fafc" flatShading />
          </mesh>
        </group>

        {/* Developer Bed with unmade blanket */}
        <group position={[3.2, 0.35, -3.6]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[2.2, 0.4, 3.2]} />
            <meshStandardMaterial color="#1e3a8a" flatShading />
          </mesh>
          {/* White Pillow */}
          <mesh position={[0, 0.26, -1.1]}>
            <boxGeometry args={[1.6, 0.16, 0.6]} />
            <meshStandardMaterial color="#f8fafc" flatShading />
          </mesh>
          {/* Unmade Blanket fold */}
          <mesh position={[0, 0.22, 0.3]}>
            <boxGeometry args={[2.1, 0.12, 1.8]} />
            <meshStandardMaterial color="#3b82f6" flatShading />
          </mesh>
        </group>

        {/* Bookshelf with Tech Manuals */}
        <group position={[-4.7, 1.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 2.8, 1.8]} />
            <meshStandardMaterial color="#4a2e18" flatShading />
          </mesh>
          {/* Colored Book Spines */}
          <mesh position={[0.15, 0.4, 0]}>
            <boxGeometry args={[0.1, 0.4, 1.2]} />
            <meshStandardMaterial color="#ef4444" flatShading />
          </mesh>
          <mesh position={[0.15, -0.3, 0]}>
            <boxGeometry args={[0.1, 0.38, 1.4]} />
            <meshStandardMaterial color="#f59e0b" flatShading />
          </mesh>
        </group>

        {/* Player Avatar */}
        <PlayerAvatar />

        <CameraController />
      </Canvas>

      {/* ------------------------------------------------------------- */}
      {/* Chapter 1 HUD & Mission Dashboard */}
      {/* ------------------------------------------------------------- */}

      {/* Top Right Objectives Drawer - Positioned below WorldHud top bar */}
      <div className="absolute top-14 right-3.5 z-20 w-80 bg-[#1a1824] border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] p-3 text-xs text-[#f4ecd8]">
        <div className="flex items-center justify-between border-b border-[#4b4a5e] pb-1.5 mb-2">
          <span className="font-bold uppercase text-[#facc15] flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5" />
            <span>CHAPTER OBJECTIVES</span>
          </span>
          <span className="text-[10px] text-[#8fd3ff]">
            {career?.objectives.filter((o) => o.completed).length} / {career?.objectives.length} Done
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {career?.objectives.map((obj) => (
            <div key={obj.id} className="flex flex-col gap-1 bg-[#2a2838] p-2 border border-[#14121c]">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold ${obj.completed ? 'text-[#b6e52d] line-through' : 'text-[#f4ecd8]'}`}>
                  {obj.completed ? '✓ ' : '○ '} {obj.title}
                </span>
                <span className="text-[10px] font-mono text-[#ded2b6]">
                  {obj.current} / {obj.target} {obj.unit}
                </span>
              </div>
              <PixelBar value={obj.current} max={obj.target} color={obj.completed ? 'lime' : 'amber'} />
            </div>
          ))}
        </div>

        {canAdvance && (
          <button
            onClick={handleEnterHackathon}
            className="mt-3 w-full flex items-center justify-center gap-1.5 p-2 bg-[#b6e52d] hover:bg-[#c9f538] text-[#14121c] font-bold text-xs uppercase border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] cursor-pointer animate-pulse"
          >
            <span>Enter the 48h Hackathon</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Bottom Center Founder Actions Deck - Elevated above WorldHud prompt bar */}
      <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#2a2838] border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] p-1.5">
        <PixelButton
          variant="lime"
          onClick={() => setShowCodeSprint(true)}
          title="Launch 30-second rapid bug squashing sprint"
        >
          <Code2 className="h-4 w-4 mr-1 text-[#14121c]" />
          <span>Code Sprint</span>
        </PixelButton>

        <PixelButton
          variant="primary"
          onClick={handleStudyDocs}
          title="Read technical docs to increase Tech Skill"
        >
          <BookOpen className="h-4 w-4 mr-1 text-white" />
          <span>Study Docs (+Tech)</span>
        </PixelButton>

        <PixelButton
          variant="amber"
          onClick={handleShipProject}
          title="Ship side project to GitHub to earn stars"
        >
          <Sparkles className="h-4 w-4 mr-1 text-[#14121c]" />
          <span>Ship Side Project</span>
        </PixelButton>
      </div>

      {/* Interactive Code Sprint Minigame Modal */}
      {showCodeSprint && <CodeSprintMinigame onClose={() => setShowCodeSprint(false)} />}
    </div>
  )
}
