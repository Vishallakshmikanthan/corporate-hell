/**
 * CORPORATE HELL™ — Chapter 2: The 48-Hour Hackathon (3D Voxel Environment).
 *
 * Implements the energetic hackathon convention hall:
 * - Long banquet folding tables with laptops and energy drinks
 * - Sponsor banners, beanbag lounges, and judges presentation stage
 * - Co-founder candidates to network with & recruit
 * - 48-Hour live countdown crunch clock
 * - Pitch Duel launch against venture judges to win $25,000 Angel prize
 */
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PlayerAvatar } from '../characters/PlayerAvatar'
import { CameraController } from '../CameraController'
import { useGameStore } from '../../state/gameStore'
import { PitchDuelModal } from '../../components/modals/PitchDuelModal'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { audio } from '../../services/audio'
import {
  Users,
  Flame,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react'

export const HackathonScene: React.FC = () => {
  const career = useGameStore((s) => s.state?.career)
  const dispatch = useGameStore((s) => s.dispatch)

  const [showPitchDuel, setShowPitchDuel] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  const handleCrunch = (hours: number) => {
    audio.playClick()
    dispatch({ type: 'crunch_hackathon', hours })
  }

  const handleRecruit = (candidateId: string) => {
    audio.playBoot()
    dispatch({ type: 'recruit_cofounder', candidateId })
    setSelectedCandidate(null)
  }

  const handleAdvanceToGarage = () => {
    audio.playLever()
    dispatch({ type: 'advance_chapter', targetChapter: 'garage' })
  }

  const recruitedCount = career?.recruitedCoFounders.length || 0
  const prototypePercent = career?.prototypeCompleteness || 0
  const hoursLeft = career?.hackathonHoursLeft || 0
  const won = career?.wonHackathon || false

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#14121c] font-mono select-none crt-scanlines">
      {/* ------------------------------------------------------------- */}
      {/* 3D Voxel Hackathon Convention Hall */}
      {/* ------------------------------------------------------------- */}
      <Canvas
        dpr={[0.45, 0.6]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [11, 13, 14], fov: 42 }}
        className="h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      >
        <ambientLight intensity={0.9} color="#e0f2fe" />
        <directionalLight position={[14, 20, 10]} intensity={1.3} color="#ffffff" castShadow />
        <pointLight position={[0, 4, 0]} intensity={1.1} color="#38bdf8" distance={16} />
        {/* Stage Spotlights */}
        <pointLight position={[0, 3.5, -5.5]} intensity={1.5} color="#facc15" distance={10} />

        {/* --- Floor: Polished Convention Hall Concrete --- */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[16, 0.1, 16]} />
          <meshStandardMaterial color="#27272a" roughness={0.8} flatShading />
        </mesh>

        {/* --- Hackathon Stage at Back --- */}
        <group position={[0, 0.4, -6.5]}>
          {/* Wooden Stage Platform */}
          <mesh castShadow>
            <boxGeometry args={[10, 0.8, 3]} />
            <meshStandardMaterial color="#18181b" flatShading />
          </mesh>
          {/* Main Giant Presentation Screen */}
          <mesh position={[0, 2.2, -1.2]}>
            <boxGeometry args={[6.8, 3.2, 0.1]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          {/* Judges Table */}
          <mesh position={[0, 0.6, 0.5]}>
            <boxGeometry args={[4.5, 0.6, 0.8]} />
            <meshStandardMaterial color="#3f3f46" flatShading />
          </mesh>
        </group>

        {/* --- Hacker Team Banquet Tables --- */}
        {[-3.5, 3.5].map((xOffset, idx) => (
          <group key={idx} position={[xOffset, 0.45, 0]}>
            {/* Long Tabletop */}
            <mesh castShadow>
              <boxGeometry args={[4.2, 0.1, 1.4]} />
              <meshStandardMaterial color="#f8fafc" flatShading />
            </mesh>
            {/* Table Legs */}
            <mesh position={[-1.9, -0.25, 0]}>
              <boxGeometry args={[0.1, 0.8, 1.2]} />
              <meshStandardMaterial color="#18181b" flatShading />
            </mesh>
            <mesh position={[1.9, -0.25, 0]}>
              <boxGeometry args={[0.1, 0.8, 1.2]} />
              <meshStandardMaterial color="#18181b" flatShading />
            </mesh>

            {/* Glowing Laptops & Energy Drinks */}
            <mesh position={[-1.2, 0.15, -0.2]}>
              <boxGeometry args={[0.45, 0.05, 0.35]} />
              <meshStandardMaterial color="#38bdf8" flatShading />
            </mesh>
            <mesh position={[0, 0.15, -0.2]}>
              <boxGeometry args={[0.45, 0.05, 0.35]} />
              <meshStandardMaterial color="#4ade80" flatShading />
            </mesh>
            <mesh position={[1.2, 0.15, -0.2]}>
              <boxGeometry args={[0.45, 0.05, 0.35]} />
              <meshStandardMaterial color="#f43f5e" flatShading />
            </mesh>
          </group>
        ))}

        {/* --- Beanbag Chill Zone --- */}
        <group position={[-5.5, 0.3, 4.5]}>
          <mesh castShadow>
            <sphereGeometry args={[0.7, 8, 8]} />
            <meshStandardMaterial color="#f97316" roughness={0.9} flatShading />
          </mesh>
        </group>
        <group position={[-4.0, 0.3, 5.2]}>
          <mesh castShadow>
            <sphereGeometry args={[0.65, 8, 8]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.9} flatShading />
          </mesh>
        </group>

        {/* Player Avatar */}
        <PlayerAvatar />

        <CameraController />
      </Canvas>

      {/* ------------------------------------------------------------- */}
      {/* Chapter 2 HUD: 48h Countdown & Hackathon Dashboard */}
      {/* ------------------------------------------------------------- */}
      {/* Top Banner with Countdown - Positioned below WorldHud top-left */}
      <div className="absolute top-14 left-3.5 z-20 flex items-center gap-2">
        <div className="bg-[#2a2838] border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] p-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#b6e52d] uppercase">
            <Clock className="h-4 w-4 text-[#facc15] animate-spin" />
            <span>TIME LEFT: {hoursLeft} HOURS</span>
          </div>
          <span className="text-[10px] text-[#ded2b6] border-l border-[#4b4a5e] pl-2">
            CHAPTER 2: 48H HACKATHON
          </span>
        </div>
      </div>

      {/* Top Right Objectives Drawer - Positioned below WorldHud top-right controls */}
      <div className="absolute top-14 right-3.5 z-20 w-84 bg-[#1a1824] border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] p-3 text-xs text-[#f4ecd8]">
        <div className="flex items-center justify-between border-b border-[#4b4a5e] pb-1.5 mb-2">
          <span className="font-bold uppercase text-[#facc15] flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5" />
            <span>HACKATHON GOALS</span>
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

        {won && (
          <button
            onClick={handleAdvanceToGarage}
            className="mt-3 w-full flex items-center justify-center gap-1.5 p-2 bg-[#b6e52d] hover:bg-[#c9f538] text-[#14121c] font-bold text-xs uppercase border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] cursor-pointer animate-pulse"
          >
            <span>Incorporate Startup & Move to Garage (Ch 3)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Co-Founder Candidates Roster (Left Floating Drawer) */}
      <div className="absolute top-28 left-3.5 z-20 w-72 bg-[#1a1824] border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] p-2.5 text-xs text-[#f4ecd8]">
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#b6e52d] border-b border-[#4b4a5e] pb-1 mb-2">
          <Users className="h-3.5 w-3.5" />
          <span>CO-FOUNDER TALENT POOL ({recruitedCount}/2)</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Candidate: Yuki */}
          <div className="flex items-center justify-between p-2 bg-[#2a2838] border border-[#14121c]">
            <div>
              <div className="font-bold text-xs text-[#f4ecd8]">Yuki Tanaka</div>
              <div className="text-[10px] text-[#8fd3ff]">10x Silent Genius (CTO)</div>
            </div>
            {career?.recruitedCoFounders.some((c) => c.id === 'cand_yuki') ? (
              <span className="text-[10px] text-[#b6e52d] font-bold">RECRUITED</span>
            ) : (
              <button
                onClick={() => handleRecruit('cand_yuki')}
                className="px-2 py-1 bg-[#3e6ec0] hover:bg-[#4d80d9] text-white text-[10px] font-bold uppercase border border-[#14121c] cursor-pointer"
              >
                Team Up
              </button>
            )}
          </div>

          {/* Candidate: Gary */}
          <div className="flex items-center justify-between p-2 bg-[#2a2838] border border-[#14121c]">
            <div>
              <div className="font-bold text-xs text-[#f4ecd8]">Gary Sparks</div>
              <div className="text-[10px] text-[#facc15]">LinkedIn Hustler (Growth)</div>
            </div>
            {career?.recruitedCoFounders.some((c) => c.id === 'cand_gary') ? (
              <span className="text-[10px] text-[#b6e52d] font-bold">RECRUITED</span>
            ) : (
              <button
                onClick={() => handleRecruit('cand_gary')}
                className="px-2 py-1 bg-[#3e6ec0] hover:bg-[#4d80d9] text-white text-[10px] font-bold uppercase border border-[#14121c] cursor-pointer"
              >
                Team Up
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Center Crunch Deck - Elevated above WorldHud prompt bar */}
      <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#2a2838] border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] p-1.5">
        <PixelButton
          variant="amber"
          onClick={() => handleCrunch(4)}
          title="Crunch MVP coding for 4 hours"
          disabled={hoursLeft <= 0}
        >
          <Flame className="h-4 w-4 mr-1 text-[#14121c]" />
          <span>Crunch Prototype (4h)</span>
        </PixelButton>

        <PixelButton
          variant="lime"
          onClick={() => setShowPitchDuel(true)}
          title="Step onto the stage to pitch the venture judges"
        >
          <Trophy className="h-4 w-4 mr-1 text-[#14121c]" />
          <span>Pitch to Judges!</span>
        </PixelButton>
      </div>

      {/* Interactive Pitch Duel Minigame Modal */}
      {showPitchDuel && <PitchDuelModal onClose={() => setShowPitchDuel(false)} />}
    </div>
  )
}
