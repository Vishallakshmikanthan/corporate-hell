/**
 * CORPORATE HELL™ — Chapter 3: The Garage & Pre-Seed (3D Voxel Scene).
 *
 * Implements the legendary Silicon Valley garage startup incubator:
 * - 3D Voxel concrete garage: roll-up metal door, exposed brick walls, folding tables
 * - Milk crate server racks with blinking LEDs, giant architectural whiteboard
 * - Co-founders working alongside the player (Yuki coding, Gary hacking infra, Ellen marketing)
 * - Interactive milestones: Co-Founder Equity Split, MVP Shipping, and Seed Term Sheet Duel
 */
import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PlayerAvatar } from '../characters/PlayerAvatar'
import { CameraController } from '../CameraController'
import { useGameStore } from '../../state/gameStore'
import { CoFounderNegotiationModal } from '../../components/modals/CoFounderNegotiationModal'
import { TermSheetDuelModal } from '../../components/modals/TermSheetDuelModal'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { audio } from '../../services/audio'
import {
  PieChart,
  FileText,
  Rocket,
  ArrowRight,
  Sparkles,
  Users,
  DollarSign,
  Layers,
} from 'lucide-react'

export const GarageScene: React.FC = () => {
  const career = useGameStore((s) => s.state?.career)
  const cash = useGameStore((s) => s.state?.cash || 0)
  const dispatch = useGameStore((s) => s.dispatch)

  const [showEquityModal, setShowEquityModal] = useState(false)
  const [showTermSheetModal, setShowTermSheetModal] = useState(false)

  const hasEquitySplit = (career?.coFounders?.length || 0) > 0
  const hasSignedTermSheet = !!career?.selectedTermSheetId

  const handleShipMVP = () => {
    audio.playDing()
    dispatch({ type: 'ship_side_project' })
  }

  const handleAdvanceToOffice = () => {
    audio.playLever()
    dispatch({ type: 'advance_chapter', targetChapter: 'scaleup' })
  }

  const allDone = hasEquitySplit && hasSignedTermSheet

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#14121c] font-mono select-none crt-scanlines">
      {/* ------------------------------------------------------------- */}
      {/* 3D Voxel Garage Viewport */}
      {/* ------------------------------------------------------------- */}
      <Canvas
        dpr={[0.45, 0.6]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [11, 12, 13], fov: 38 }}
        className="h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      >
        <ambientLight intensity={0.75} color="#fed7aa" />
        <directionalLight position={[12, 18, 10]} intensity={1.3} color="#fffbeb" castShadow />
        <pointLight position={[0, 3.5, 0]} intensity={0.9} color="#fed7aa" distance={15} />

        {/* Blinking server LEDs in milk crate */}
        <pointLight position={[3.2, 1.2, -3.8]} intensity={1.2} color="#4ade80" distance={4} />

        {/* --- Garage Floor --- */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[14, 0.1, 12]} />
          <meshStandardMaterial color="#474554" roughness={0.9} flatShading />
        </mesh>

        {/* Oil stain patch */}
        <mesh position={[-2, 0.01, 1]}>
          <boxGeometry args={[2.5, 0.01, 2]} />
          <meshStandardMaterial color="#2d2b38" roughness={0.95} flatShading />
        </mesh>

        {/* --- Walls --- */}
        {/* Back Brick Wall */}
        <mesh position={[0, 2.5, -6]}>
          <boxGeometry args={[14, 5, 0.2]} />
          <meshStandardMaterial color="#6e3728" roughness={0.9} flatShading />
        </mesh>

        {/* Left Cinderblock Wall */}
        <mesh position={[-7, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 12]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} flatShading />
        </mesh>

        {/* Right Wall with Roll-Up Garage Door */}
        <mesh position={[7, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 12]} />
          <meshStandardMaterial color="#57534e" roughness={0.9} flatShading />
        </mesh>
        {/* Corrugated Metal Garage Door */}
        <mesh position={[6.85, 2.2, 0]}>
          <boxGeometry args={[0.05, 4.4, 8]} />
          <meshStandardMaterial color="#78716c" roughness={0.6} metalness={0.4} flatShading />
        </mesh>

        {/* --- Startup Furniture --- */}
        {/* Folding Plastic Trestle Table 1 */}
        <group position={[-1.5, 0, -2]}>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[3.2, 0.08, 1.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} flatShading />
          </mesh>
          {/* Table Legs */}
          <mesh position={[-1.4, 0.36, -0.5]}>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#334155" flatShading />
          </mesh>
          <mesh position={[1.4, 0.36, -0.5]}>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#334155" flatShading />
          </mesh>
          <mesh position={[-1.4, 0.36, 0.5]}>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#334155" flatShading />
          </mesh>
          <mesh position={[1.4, 0.36, 0.5]}>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color="#334155" flatShading />
          </mesh>
          {/* Laptops on Table */}
          <mesh position={[-0.8, 0.82, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.4]} />
            <meshStandardMaterial color="#0f172a" flatShading />
          </mesh>
          <mesh position={[0.6, 0.82, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.4]} />
            <meshStandardMaterial color="#0f172a" flatShading />
          </mesh>
        </group>

        {/* Milk Crate Server Stack */}
        <group position={[3.2, 0, -4.5]}>
          {/* Blue milk crate */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.2, 0.6, 1.2]} />
            <meshStandardMaterial color="#1d4ed8" flatShading />
          </mesh>
          {/* Rackmount unit inside */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1.1, 0.3, 1.1]} />
            <meshStandardMaterial color="#1e293b" flatShading />
          </mesh>
          {/* Blinking LEDs */}
          <mesh position={[0.56, 0.75, 0.2]}>
            <boxGeometry args={[0.04, 0.08, 0.3]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        </group>

        {/* Giant Whiteboard on Wheels */}
        <group position={[-4.5, 0, -3.5]} rotation={[0, 0.35, 0]}>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[3.2, 1.8, 0.1]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} flatShading />
          </mesh>
          {/* Frame */}
          <mesh position={[0, 1.8, -0.06]}>
            <boxGeometry args={[3.3, 1.9, 0.04]} />
            <meshStandardMaterial color="#475569" flatShading />
          </mesh>
          {/* Stand */}
          <mesh position={[-1.4, 0.5, 0]}>
            <boxGeometry args={[0.1, 1.0, 0.1]} />
            <meshStandardMaterial color="#475569" flatShading />
          </mesh>
          <mesh position={[1.4, 0.5, 0]}>
            <boxGeometry args={[0.1, 1.0, 0.1]} />
            <meshStandardMaterial color="#475569" flatShading />
          </mesh>
        </group>

        {/* Espresso Machine on Cart */}
        <group position={[-5, 0, 2]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 0.8]} />
            <meshStandardMaterial color="#334155" flatShading />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} flatShading />
          </mesh>
        </group>

        {/* Lawnmower in Corner */}
        <group position={[5.2, 0, 3.8]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[1.2, 0.5, 1.5]} />
            <meshStandardMaterial color="#dc2626" flatShading />
          </mesh>
          <mesh position={[0, 0.9, -0.6]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.6, 0.9, 0.06]} />
            <meshStandardMaterial color="#1e293b" flatShading />
          </mesh>
        </group>

        {/* Controllable Player Avatar (WASD) */}
        <PlayerAvatar />

        {/* Orbit Camera Controller */}
        <CameraController />
      </Canvas>

      {/* ------------------------------------------------------------- */}
      {/* Chapter 3 Garage HUD & Milestone Controls */}
      {/* ------------------------------------------------------------- */}
      {/* Top Left Header Card - Positioned below WorldHud top-left */}
      <div className="absolute top-14 left-3.5 z-20 pointer-events-auto flex items-center justify-between bg-[#14121c]/95 p-2.5 border-2 border-[#4b4a5e] shadow-[4px_4px_0px_#14121c] max-w-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#f2a93b] text-[#14121c]">
              Chapter 3
            </span>
            <h2 className="text-xs font-bold uppercase text-[#f4ecd8] tracking-wider">
              The Garage & Pre-Seed Incubator
            </h2>
          </div>
          <p className="text-[10px] text-[#ded2b6] mt-1">
            Split equity with your co-founders, launch your v1.0 MVP, and close a $1.5M Seed round.
          </p>
        </div>
      </div>

      {/* Top Right Milestones Drawer - Positioned below WorldHud top-right controls */}
      <div className="absolute top-14 right-3.5 z-20 pointer-events-auto bg-[#14121c]/95 p-3 border-2 border-[#4b4a5e] shadow-[4px_4px_0px_#14121c] w-84 space-y-2">
        <h3 className="text-xs font-bold uppercase text-[#8fd3ff] flex items-center gap-1.5 border-b border-[#4b4a5e] pb-1.5">
          <Layers className="h-4 w-4" /> Garage Milestones:
        </h3>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className={hasEquitySplit ? 'text-[#b6e52d] font-bold line-through' : 'text-[#ded2b6]'}>
              1. Settle Co-Founder Equity
            </span>
            <span className={hasEquitySplit ? 'text-[#b6e52d]' : 'text-[#f2a93b]'}>
              {hasEquitySplit ? '✓ Locked' : 'Pending'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#ded2b6]">2. Launch v1.0 MVP Prototype</span>
            <span className="text-[#8fd3ff]">Live</span>
          </div>

          <div className="flex items-center justify-between">
            <span className={hasSignedTermSheet ? 'text-[#b6e52d] font-bold line-through' : 'text-[#ded2b6]'}>
              3. Close $1.5M Seed Term Sheet
            </span>
            <span className={hasSignedTermSheet ? 'text-[#b6e52d]' : 'text-[#f2a93b]'}>
              {hasSignedTermSheet ? '✓ Signed' : 'Needed'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Center Milestone Actions Console - Elevated above WorldHud prompt bar */}
      <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 bg-[#2a2838] border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] p-1.5">
        {/* Equity Split Modal Button */}
        <PixelButton
          onClick={() => {
            audio.playClick()
            setShowEquityModal(true)
          }}
          variant={hasEquitySplit ? 'neutral' : 'warning'}
          size="sm"
        >
          <PieChart className="h-4 w-4 text-[#f2a93b]" />
          <span>{hasEquitySplit ? 'Cap Table (Done)' : '⚖ Equity Split'}</span>
        </PixelButton>

        {/* Ship MVP Button */}
        <PixelButton onClick={handleShipMVP} variant="primary" size="sm">
          <Rocket className="h-4 w-4 text-[#8fd3ff]" />
          <span>Ship MVP Feature</span>
        </PixelButton>

        {/* Term Sheet Modal Button */}
        <PixelButton
          onClick={() => {
            audio.playClick()
            setShowTermSheetModal(true)
          }}
          variant={hasSignedTermSheet ? 'neutral' : 'success'}
          size="sm"
        >
          <FileText className="h-4 w-4 text-[#b6e52d]" />
          <span>{hasSignedTermSheet ? 'Term Sheet (Signed)' : '📜 Seed Term Sheets'}</span>
        </PixelButton>

        {/* Advance to Chapter 4 Button */}
        {allDone && (
          <PixelButton onClick={handleAdvanceToOffice} variant="success" size="sm">
            <Sparkles className="h-4 w-4 text-white" />
            <span>Move to Series A Office</span>
            <ArrowRight className="h-4 w-4" />
          </PixelButton>
        )}
      </div>

      {/* Interactive Modals */}
      {showEquityModal && <CoFounderNegotiationModal onClose={() => setShowEquityModal(false)} />}
      {showTermSheetModal && <TermSheetDuelModal onClose={() => setShowTermSheetModal(false)} />}
    </div>
  )
}
