/**
 * CORPORATE HELL™ — Section 01: 3D Office Hub.
 *
 * High-DPI cinematic 3D corporate environment with warm golden-hour lighting,
 * autonomous animated employees, room & floor navigation, AI Executive Command,
 * Live Activity Log, Active Objectives, and interactive overview cards.
 */
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OfficeFloor } from './environment/OfficeFloor'
import { EmployeeCharacter } from './characters/EmployeeCharacter'
import { PlayerAvatar } from './characters/PlayerAvatar'
import { CameraController } from './CameraController'
import { TacticalFallback } from './TacticalFallback'
import { ExecutiveCommand } from '../components/layout/ExecutiveCommand'
import { LiveActivityLog } from '../components/layout/LiveActivityLog'
import { FloatingEmployeesPanel } from '../components/layout/FloatingEmployeesPanel'
import { useGameStore } from '../state/gameStore'
import { useUiStore } from '../state/uiStore'
import type { Department, RoomId } from '../game/models/types'
import {
  Layers,
  RotateCcw,
  Building2,
  AlertOctagon,
  Mail,
  Briefcase,
  Target,
  Presentation,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
} from 'lucide-react'

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

const FLOOR_ZONES: {
  floor: string
  title: string
  roomId: RoomId
  subtitle: string
}[] = [
  {
    floor: 'Floor 3',
    title: 'CEO Office & Boardroom',
    roomId: 'ceo_office',
    subtitle: 'Executive suite & pitch deck',
  },
  {
    floor: 'Floor 2',
    title: 'Engineering & Bullpen',
    roomId: 'open_plan',
    subtitle: 'Core product & server cluster',
  },
  {
    floor: 'Floor 1',
    title: 'Reception & Lounge',
    roomId: 'reception',
    subtitle: 'Client lobby & espresso bar',
  },
]

export function OfficeScene() {
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [useDioramaMode, setUseDioramaMode] = useState(false)
  const [showBottomCards, setShowBottomCards] = useState(true)
  const [showRightStats, setShowRightStats] = useState(true)

  const state = useGameStore((s) => s.state)
  const employees = useGameStore((s) => s.state?.employees)
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const graphicsQuality = useGameStore((s) => s.graphicsQuality)
  const focusedRoomId = useGameStore((s) => s.focusedRoomId)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const v3Enabled = useUiStore((s) => s.v3Enabled)

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable())
  }, [])

  if (!webGLSupported || useDioramaMode) {
    return (
      <div className="relative h-full w-full">
        <TacticalFallback onSwitchTo3D={() => setUseDioramaMode(false)} />
      </div>
    )
  }

  const openIncidents = state?.incidents.filter((i) => !i.resolved) || []
  const unreadEmails = state?.emails.filter((e) => !e.archived).slice(0, 3) || []
  const objectives = state?.campaign?.objectives.slice(0, 3) || []

  const deptList: Department[] = ['engineering', 'sales', 'marketing', 'operations']

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#16120e] select-none font-sans">
      {/* ----------------------------------------------------------------- */}
      {/* High-DPI Crisp 3D Scene Viewport with Warm Sunset Lighting */}
      {/* ----------------------------------------------------------------- */}
      <Canvas
        dpr={graphicsQuality === 'low' ? [1, 1] : [1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [13, 14.5, 15], fov: 38 }}
        className="h-full w-full"
      >
        {/* Warm Ivory & Golden-Hour Ambient Light */}
        <ambientLight intensity={0.95} color="#fff6e8" />

        {/* Primary Warm Golden-Hour Sun Directional Light */}
        <directionalLight
          castShadow={graphicsQuality === 'high'}
          position={[14, 22, 12]}
          intensity={1.5}
          color="#ffe6be"
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-mapSize-width={graphicsQuality === 'high' ? 2048 : 1024}
          shadow-mapSize-height={graphicsQuality === 'high' ? 2048 : 1024}
        />

        {/* Warm Champagne Bounce Fill Light */}
        <directionalLight position={[-14, 12, -10]} intensity={0.5} color="#e5c478" />

        {/* Warm Interior Pendant & Architectural Accent Lights */}
        <pointLight position={[0, 3.8, 0]} intensity={0.95} color="#ffd9a0" distance={16} />
        <pointLight position={[6.4, 3.2, -5.2]} intensity={0.85} color="#f5e1b5" distance={9} />
        <pointLight position={[-6.8, 2.5, -5.4]} intensity={1.15} color="#e8a33d" distance={8} />
        <pointLight position={[6.5, 2.5, 5.2]} intensity={1.1} color="#d4a84f" distance={8} />

        {/* Interactive 3D Office Architecture & Furniture */}
        <OfficeFloor />

        {/* Autonomous Animated Employees */}
        {employeeOrder.map((id) => {
          const emp = employees?.[id]
          if (!emp || !emp.active) return null
          return <EmployeeCharacter key={emp.id} employee={emp} />
        })}

        {/* Playable Player Avatar */}
        <PlayerAvatar />

        {/* Camera Orbit Controls and Smooth Navigation Lerp */}
        <CameraController />
      </Canvas>

      {/* Subtle Warm Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(18,14,10,0.68)] z-10" />

      {/* ----------------------------------------------------------------- */}
      {/* Floating HUD Panels Layer */}
      {/* ----------------------------------------------------------------- */}
      {!v3Enabled && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 overflow-hidden">
          {/* Top / Middle Row: Left Command & Activity Log + Right Floor Nav, Objectives & Employees */}
          <div className="flex flex-1 justify-between overflow-hidden min-h-0">
            {/* Left Stack */}
            <div className="pointer-events-auto flex flex-col gap-3 max-h-full overflow-y-auto pr-1 pb-2 no-scrollbar">
              <ExecutiveCommand />
              <LiveActivityLog />
            </div>

            {/* Right Stack: Floor Switcher + Active Objectives + Employees */}
            <div className="pointer-events-auto flex flex-col items-end gap-2.5 max-h-full overflow-y-auto pl-1 pb-2 no-scrollbar">
              {/* Top Utility Row: 2.5D Toggle + Pitch Boardroom CTA + Floor Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pitch')}
                  className="btn-gold flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer shadow-lg"
                >
                  <Presentation className="h-3.5 w-3.5" />
                  <span>Enter Investor Pitch</span>
                </button>
                <button
                  onClick={() => setUseDioramaMode(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#221c17]/95 hover:bg-[#332a22] text-[#faf7f0] px-2.5 py-1.5 text-xs font-semibold border border-[#d4a84f]/30 cursor-pointer transition"
                  title="Switch to 2.5D Tactical Floor View"
                >
                  <Layers className="h-3.5 w-3.5 text-[#d4a84f]" />
                  <span>2.5D View</span>
                </button>
              </div>

              {/* Floor / Zone Navigation Stack (matches reference-ui #01) */}
              <div className="w-80 rounded-2xl panel-dark p-3 text-[#faf7f0]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#e5c478]">
                    <Building2 className="h-3.5 w-3.5 text-[#d4a84f]" />
                    <span>Tower Floors & Zones</span>
                  </div>
                  <button
                    onClick={() => focusRoom('open_plan')}
                    className="flex items-center gap-1 text-[10px] text-[#b5a695] hover:text-[#faf7f0] cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Reset Camera</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {FLOOR_ZONES.map((z) => {
                    const active = (focusedRoomId || 'open_plan') === z.roomId
                    return (
                      <button
                        key={z.floor}
                        onClick={() => focusRoom(z.roomId)}
                        className={`flex flex-col items-start rounded-xl p-2 text-left transition cursor-pointer border ${
                          active
                            ? 'bg-gradient-to-b from-[#dfc075]/25 to-[#b88933]/20 border-[#d4a84f] text-[#faf7f0]'
                            : 'bg-[#1b1612]/80 border-[#d4a84f]/15 text-[#b5a695] hover:border-[#d4a84f]/40 hover:text-[#faf7f0]'
                        }`}
                      >
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#d4a84f]">
                          {z.floor}
                        </span>
                        <span className="text-[11px] font-bold leading-tight truncate w-full mt-0.5">
                          {z.title.split(' ')[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Objectives & Live Company Stats Card */}
              <div className="w-80 rounded-2xl panel-dark p-3.5 text-[#faf7f0]">
                <div className="flex items-center justify-between pb-2 border-b border-[#d4a84f]/15">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-[#d4a84f]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#faf7f0]">
                      Active Objectives
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRightStats(!showRightStats)}
                    className="text-[#b5a695] hover:text-[#faf7f0] p-0.5 cursor-pointer"
                  >
                    {showRightStats ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {showRightStats && (
                  <div className="mt-2.5 space-y-2">
                    {objectives.map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() => setActiveTab('campaign')}
                        className="flex flex-col gap-1 rounded-xl bg-[#181410]/85 p-2 border border-[#d4a84f]/15 hover:border-[#d4a84f]/45 cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#faf7f0] flex items-center gap-1.5 truncate">
                            {obj.status === 'done' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#65b87b] shrink-0" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-[#d4a84f] shrink-0" />
                            )}
                            <span className="truncate">{obj.title}</span>
                          </span>
                          <span className="mono text-[10px] font-bold text-[#e5c478]">
                            {Math.round(obj.progress)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#352c25] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#b88933] to-[#e5c478] transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.round(obj.progress))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating Employees Roster */}
              <FloatingEmployeesPanel />
            </div>
          </div>

          {/* Bottom Bar: Section 01 Title Watermark + Cream Summary Cards */}
          <div className="pointer-events-auto mt-2 flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-3 bg-[#16120e]/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#d4a84f]/30">
                <span className="font-serif-title text-2xl font-bold text-[#d4a84f]">01</span>
                <div>
                  <h2 className="font-serif-title text-base font-bold tracking-wider text-[#faf7f0] uppercase">
                    3D OFFICE HUB
                  </h2>
                  <p className="text-[11px] text-[#b5a695]">
                    Explore, interact and command a living corporate world.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBottomCards(!showBottomCards)}
                className="flex items-center gap-1.5 rounded-xl bg-[#1f1a16]/90 px-3 py-1.5 text-xs font-semibold text-[#e5c478] border border-[#d4a84f]/30 hover:border-[#d4a84f] cursor-pointer transition"
              >
                <span>{showBottomCards ? 'Hide Overview Cards' : 'Show Overview Cards'}</span>
                {showBottomCards ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {showBottomCards && state && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-slide-up">
                {/* Card 1: Recent Incidents */}
                <div
                  onClick={() => setActiveTab('incidents')}
                  className="panel-cream p-3 cursor-pointer transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#181411]">
                      <AlertOctagon className="h-3.5 w-3.5 text-[#c74234]" />
                      <span>Active Incidents ({openIncidents.length})</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#966c22]">Resolve →</span>
                  </div>
                  {openIncidents.length > 0 ? (
                    <div className="space-y-1">
                      {openIncidents.slice(0, 2).map((inc) => (
                        <div
                          key={inc.id}
                          className="flex items-center justify-between rounded-lg bg-[#e6decb]/70 px-2.5 py-1 text-xs"
                        >
                          <span className="font-semibold text-[#181411] truncate">
                            {inc.title}
                          </span>
                          <span className="rounded bg-[#c74234]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#a63428]">
                            Sev {inc.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#68594c]">All systems nominal. Zero active crises.</p>
                  )}
                </div>

                {/* Card 2: Department Status */}
                <div
                  onClick={() => setActiveTab('departments')}
                  className="panel-cream p-3 cursor-pointer transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#181411]">
                      <Briefcase className="h-3.5 w-3.5 text-[#966c22]" />
                      <span>Department Output</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#966c22]">Manage →</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {deptList.map((dept) => {
                      const emps = Object.values(state.employees).filter(
                        (e) => e.active && e.department === dept,
                      )
                      const prod =
                        emps.length > 0
                          ? Math.round(emps.reduce((a, b) => a + b.productivity, 0) / emps.length)
                          : 75
                      return (
                        <div
                          key={dept}
                          className="flex flex-col items-center rounded-lg bg-[#e6decb]/70 px-1.5 py-1"
                        >
                          <span className="text-[9.5px] font-semibold capitalize text-[#4a3e34] truncate w-full text-center">
                            {dept === 'engineering' ? 'Eng' : dept}
                          </span>
                          <span className="mono text-xs font-extrabold text-[#181411]">
                            {prod}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Card 3: Corporate Inbox Preview */}
                <div
                  onClick={() => setActiveTab('inbox')}
                  className="panel-cream p-3 cursor-pointer transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#181411]">
                      <Mail className="h-3.5 w-3.5 text-[#966c22]" />
                      <span>Priority Inbox ({unreadEmails.filter((e) => !e.read).length} Unread)</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#966c22]">Open Inbox →</span>
                  </div>
                  <div className="space-y-1">
                    {unreadEmails.slice(0, 2).map((em) => (
                      <div
                        key={em.id}
                        className="flex items-center justify-between rounded-lg bg-[#e6decb]/70 px-2.5 py-1 text-xs"
                      >
                        <span className="font-bold text-[#181411] shrink-0 mr-2">
                          {em.fromName}:
                        </span>
                        <span className="text-[#4a3e34] truncate flex-1">{em.subject}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
