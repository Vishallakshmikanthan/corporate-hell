/**
 * CORPORATE HELL™ — 3D Viewport & Interactive HUD Root.
 *
 * Full-screen interactive Three.js Canvas with cinematic lighting,
 * procedural office diorama, animated employees, camera controls,
 * and floating HUD panels (Executive Command, Live Activity Log, Employees Roster).
 */
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OfficeFloor } from './environment/OfficeFloor'
import { EmployeeCharacter } from './characters/EmployeeCharacter'
import { CameraController } from './CameraController'
import { TacticalFallback } from './TacticalFallback'
import { ExecutiveCommand } from '../components/layout/ExecutiveCommand'
import { LiveActivityLog } from '../components/layout/LiveActivityLog'
import { FloatingEmployeesPanel } from '../components/layout/FloatingEmployeesPanel'
import { useGameStore } from '../state/gameStore'
import { Video, RotateCcw } from 'lucide-react'

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

export function OfficeScene() {
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [useFallbackMode, setUseFallbackMode] = useState(false)

  const employees = useGameStore((s) => s.state?.employees)
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const graphicsQuality = useGameStore((s) => s.graphicsQuality)
  const focusRoom = useGameStore((s) => s.focusRoom)

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable())
  }, [])

  if (!webGLSupported || useFallbackMode) {
    return (
      <div className="relative h-full w-full">
        <TacticalFallback />
        <button
          onClick={() => setUseFallbackMode(false)}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-lg bg-ink-800 px-3 py-1.5 text-xs text-paper-200 border border-ink-600 hover:bg-ink-700 transition"
        >
          <Video className="h-3.5 w-3.5 text-corp-400" />
          <span>Switch to 3D View</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950">
      {/* ----------------------------------------------------------------- */}
      {/* 3D Scene Viewport */}
      {/* ----------------------------------------------------------------- */}
      <Canvas
        shadows={graphicsQuality !== 'low'}
        camera={{ position: [13, 14.5, 15], fov: 40 }}
        className="h-full w-full"
      >
        {/* Ambient Interior & Window Light */}
        <ambientLight intensity={0.8} color="#f8fafc" />

        {/* Primary Warm Sun / Key Directional Light with Acne Prevention */}
        <directionalLight
          castShadow={graphicsQuality === 'high'}
          position={[14, 22, 12]}
          intensity={1.35}
          color="#fff5e6"
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-mapSize-width={graphicsQuality === 'high' ? 2048 : 1024}
          shadow-mapSize-height={graphicsQuality === 'high' ? 2048 : 1024}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
        />

        {/* Soft Cool Window Bounce Fill Light */}
        <directionalLight position={[-14, 12, -10]} intensity={0.45} color="#94a3b8" />

        {/* Stable Warm Room & Bullpen Lighting */}
        <pointLight position={[0, 3.8, 0]} intensity={0.8} color="#fed7aa" distance={15} />
        <pointLight position={[6.4, 3.2, -5.2]} intensity={0.8} color="#e0e7ff" distance={8} />
        <pointLight position={[-6.8, 2.5, -5.4]} intensity={1.1} color="#fbbf24" distance={7} />
        <pointLight position={[6.5, 2.5, 5.2]} intensity={1.1} color="#f97316" distance={7} />

        {/* Interactive Diorama Floor, Architecture, and Furniture */}
        <OfficeFloor />

        {/* Autonomous Animated Employees with Speech Bubbles */}
        {employeeOrder.map((id) => {
          const emp = employees?.[id]
          if (!emp || !emp.active) return null
          return <EmployeeCharacter key={emp.id} employee={emp} />
        })}

        {/* Camera Orbit Controls and Smooth Navigation Lerp */}
        <CameraController />
      </Canvas>

      {/* ----------------------------------------------------------------- */}
      {/* Floating HUD Panels Layer (Pointer-events-none wrapper) */}
      {/* ----------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 z-10 flex justify-between p-4 overflow-hidden">
        {/* Left Floating Column: Executive Command & Live Activity Log */}
        <div className="pointer-events-auto flex flex-col gap-3 max-h-full overflow-y-auto pr-2 pb-2">
          <ExecutiveCommand />
          <LiveActivityLog />
        </div>

        {/* Right Floating Column: Employees Roster */}
        <div className="pointer-events-auto pl-2">
          <FloatingEmployeesPanel />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom Floating Utilities: Reset Camera & 2.5D Fallback Toggle */}
      {/* ----------------------------------------------------------------- */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        <button
          onClick={() => focusRoom('open_plan')}
          className="flex items-center gap-1.5 rounded-full bg-ink-900/80 px-3 py-1 text-[11px] font-semibold text-ink-300 backdrop-blur-md border border-ink-700/60 hover:bg-ink-800 hover:text-paper-100 transition shadow-lg"
          title="Reset Camera View"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset View</span>
        </button>

        <button
          onClick={() => setUseFallbackMode(true)}
          className="flex items-center gap-1.5 rounded-full bg-ink-900/80 px-3 py-1 text-[11px] font-semibold text-ink-400 backdrop-blur-md border border-ink-700/60 hover:bg-ink-800 hover:text-paper-200 transition shadow-lg"
          title="Switch to 2.5D Fallback"
        >
          <span>2.5D Mode</span>
        </button>
      </div>
    </div>
  )
}
