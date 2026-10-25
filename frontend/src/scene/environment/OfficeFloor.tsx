/**
 * CORPORATE HELL™ — AAA 3D Office Diorama Environment.
 *
 * Visually stunning, warm isometric corporate office diorama featuring:
 * - Honey-amber hardwood parquet flooring with realistic specular sheen
 * - Floor-to-ceiling panoramic glass windows with structural dark metal mullions
 * - Breathtaking 3D nighttime city skyline with lit golden and cyan skyscraper window grids
 * - Glass-enclosed Conference Room with modern boardroom table, chairs & "SYNERGY ROADMAP" display
 * - Mid-century modern Lounge with cognac leather sofa, coffee table & "GOOD IDEAS BAD DECISIONS" neon sign
 * - Pantry with espresso machine, water cooler, bistro table & "FUELED BY CAFFEINE & DELUSION" neon sign
 * - Clustered workstation pods with dual glowing monitors (IDE syntax highlighting + financial charts),
 *   warm desk task lamps, keyboards, coffee mugs, and ergonomic mesh chairs
 * - Commercial copier/printer station with status lights
 * - Server room with blinking LED activity racks
 * - Lush indoor plants (monstera, fiddle-leaf fig, snake plants)
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ROOMS, DESKS, CONFERENCE_CHAIRS } from '../../game/engine/office'
import { useGameStore } from '../../state/gameStore'

// ---------------------------------------------------------------------------
// Procedural Canvas Textures
// ---------------------------------------------------------------------------

function createWoodPlankTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  // Warm honey-caramel base color (unified across the entire office)
  ctx.fillStyle = '#be7e3c'
  ctx.fillRect(0, 0, 1024, 1024)

  const plankHeight = 32 // 1024 / 32 = exactly 32 rows (seamless vertical tiling)
  const plankWidth = 128  // 1024 / 128 = exactly 8 columns (seamless horizontal tiling)
  const numRows = 32

  // Harmonious warm honey-oak parquet tones (close, warm, consistent)
  const plankTones = [
    '#c28448', '#ba7c40', '#bd7f43', '#c5874a',
    '#b87736', '#bf8145', '#c7894c', '#b57433',
  ]

  for (let r = 0; r < numRows; r++) {
    const y = r * plankHeight
    const rowOffset = (r % 2) * 64 // half-plank running bond offset

    for (let c = -1; c <= 9; c++) {
      const x = c * plankWidth + rowOffset
      const toneIndex = Math.abs((c * 7 + r * 13) % plankTones.length)
      ctx.fillStyle = plankTones[toneIndex]
      ctx.fillRect(x + 1, y + 1, plankWidth - 2, plankHeight - 2)

      // Very soft wood grain sheen
      ctx.fillStyle = 'rgba(255, 240, 220, 0.05)'
      ctx.fillRect(x + 2, y + 2, plankWidth - 4, 1)

      // Crisp, thin parquet groove seam
      ctx.fillStyle = 'rgba(40, 20, 8, 0.22)'
      ctx.fillRect(x + plankWidth - 1, y, 1, plankHeight)
      ctx.fillRect(x, y + plankHeight - 1, plankWidth, 1)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 4) // Exact integer repeats for flawless seamlessness
  texture.generateMipmaps = true
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16
  return texture
}

function createIDEScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // VS Code Dark Background
  ctx.fillStyle = '#0f131a'
  ctx.fillRect(0, 0, 512, 256)

  // Editor sidebar
  ctx.fillStyle = '#161b24'
  ctx.fillRect(0, 0, 60, 256)

  // Tab bar
  ctx.fillStyle = '#181e28'
  ctx.fillRect(60, 0, 452, 28)
  ctx.fillStyle = '#4f6df0'
  ctx.fillRect(68, 26, 90, 2)
  ctx.fillStyle = '#e2e8f0'
  ctx.font = '11px monospace'
  ctx.fillText('synergy.ts', 76, 18)

  // Code Lines with syntax colors
  const colors = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#94a3b8']
  const startY = 46
  const lineH = 13

  for (let i = 0; i < 14; i++) {
    const y = startY + i * lineH
    const indent = (i % 4 === 1 || i % 4 === 2 ? 30 : i % 4 === 3 ? 15 : 0)
    let x = 75 + indent

    // Line number
    ctx.fillStyle = '#475569'
    ctx.font = '10px monospace'
    ctx.fillText(`${i + 1}`, 62, y)

    // Token bars
    for (let t = 0; t < 3 + (i % 3); t++) {
      const len = 20 + Math.sin(i * 3 + t * 5) * 15 + 15
      ctx.fillStyle = colors[(i + t) % colors.length]
      ctx.fillRect(x, y - 8, len, 8)
      x += len + 8
    }
  }

  // Mini-map on the right
  ctx.fillStyle = '#141822'
  ctx.fillRect(470, 28, 42, 228)
  ctx.fillStyle = '#334155'
  for (let m = 0; m < 20; m++) {
    ctx.fillRect(475, 38 + m * 8, 25 + (m % 5) * 2, 3)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function createChartScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Dark Analytics Dashboard
  ctx.fillStyle = '#0b0f17'
  ctx.fillRect(0, 0, 512, 256)

  // Header
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, 512, 32)
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText('FINANCIAL VELOCITY // Q3 RUNWAY', 14, 21)

  // Grid lines
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1
  for (let y = 50; y < 240; y += 40) {
    ctx.beginPath()
    ctx.moveTo(14, y)
    ctx.lineTo(498, y)
    ctx.stroke()
  }

  // Candlestick / Bar Chart
  const bars = [40, 55, 35, 70, 85, 60, 95, 110, 80, 125, 140, 115, 160]
  const barWidth = 24
  const startX = 25

  bars.forEach((val, i) => {
    const x = startX + i * 36
    const isUp = i % 3 !== 2
    ctx.fillStyle = isUp ? '#22c55e' : '#ef4444'
    const barH = val * 0.85
    ctx.fillRect(x, 220 - barH, barWidth, barH)

    // Wick line
    ctx.strokeStyle = isUp ? '#4ade80' : '#f87171'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + barWidth / 2, 220 - barH - 8)
    ctx.lineTo(x + barWidth / 2, 220)
    ctx.stroke()
  })

  // Smooth glowing line chart on top
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 3
  ctx.beginPath()
  bars.forEach((val, i) => {
    const x = startX + i * 36 + barWidth / 2
    const y = 220 - val * 0.85 - 12
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  return new THREE.CanvasTexture(canvas)
}

function createSynergyRoadmapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Clean Whiteboard / Presentation Canvas
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, 1024, 512)

  // Header Title
  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText('SYNERGY ROADMAP 2026', 48, 68)

  ctx.fillStyle = '#64748b'
  ctx.font = '18px sans-serif'
  ctx.fillText('Q3 Deliverables • Cross-Functional Alignment', 48, 102)

  // Milestone Progress Line
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(48, 280)
  ctx.lineTo(976, 280)
  ctx.stroke()

  // Rising Trend Line
  ctx.strokeStyle = '#2563eb'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(48, 380)
  ctx.bezierCurveTo(280, 360, 500, 240, 750, 180)
  ctx.lineTo(976, 130)
  ctx.stroke()

  // Milestone Pills
  const milestones = [
    { label: 'Q1: Feasibility', x: 140, y: 320, color: '#3b82f6' },
    { label: 'Q2: Pivot to AI', x: 380, y: 260, color: '#10b981' },
    { label: 'Q3: Paradigm Shift', x: 640, y: 190, color: '#f59e0b' },
    { label: 'Q4: Hyper-Scale', x: 880, y: 140, color: '#8b5cf6' },
  ]

  milestones.forEach((m) => {
    ctx.fillStyle = m.color
    ctx.beginPath()
    ctx.arc(m.x, m.y, 16, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(m.x, m.y, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(m.label, m.x - 50, m.y + 40)
  })

  // Sticky notes on board
  const notes = [
    { text: 'Sync w/ Marcus', color: '#fef08a', x: 780, y: 360 },
    { text: 'Cut 30% meetings', color: '#bbf7d0', x: 120, y: 400 },
    { text: 'Ship v2.0', color: '#fbcfe8', x: 460, y: 380 },
  ]
  notes.forEach((n) => {
    ctx.fillStyle = n.color
    ctx.fillRect(n.x, n.y, 130, 80)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(n.x, n.y + 75, 130, 5)
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(n.text, n.x + 12, n.y + 45)
  })

  return new THREE.CanvasTexture(canvas)
}

function createBuildingFacadeTexture(seed: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Deep midnight tower facade
  ctx.fillStyle = '#0c101a'
  ctx.fillRect(0, 0, 256, 512)

  // Window grid
  const cols = 8
  const rows = 24
  const winW = 18
  const winH = 12
  const gapX = 14
  const gapY = 8

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 12 + c * (winW + gapX)
      const y = 14 + r * (winH + gapY)

      const rand = Math.sin(seed * 99 + r * 17 + c * 31)
      if (rand > 0.35) {
        // Warm lit amber window
        ctx.fillStyle = rand > 0.8 ? '#fef08a' : rand > 0.6 ? '#fde047' : '#f59e0b'
        ctx.fillRect(x, y, winW, winH)
        // subtle glow
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)'
        ctx.fillRect(x - 2, y - 2, winW + 4, winH + 4)
      } else if (rand > 0.15) {
        // Cool cyan lit window
        ctx.fillStyle = '#38bdf8'
        ctx.fillRect(x, y, winW, winH)
      } else {
        // Dark unlit window with subtle reflection
        ctx.fillStyle = '#141a27'
        ctx.fillRect(x, y, winW, winH)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// ---------------------------------------------------------------------------
// 3D Office Environment Component
// ---------------------------------------------------------------------------

export function OfficeFloor() {
  const equipment = useGameStore((s) => s.state?.equipment)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const beaconsRef = useRef<THREE.Group>(null)

  // Animate blinking red aviation hazard beacons on skyscraper rooftops
  useFrame((state) => {
    if (beaconsRef.current) {
      const t = state.clock.getElapsedTime() * 3
      const opacity = (Math.sin(t) + 1) / 2
      beaconsRef.current.children.forEach((child: any) => {
        if (child.material) {
          child.material.opacity = 0.3 + opacity * 0.7
        }
      })
    }
  })

  // Procedural Textures
  const woodTexture = useMemo(() => createWoodPlankTexture(), [])
  const ideTexture = useMemo(() => createIDEScreenTexture(), [])
  const chartTexture = useMemo(() => createChartScreenTexture(), [])
  const roadmapTexture = useMemo(() => createSynergyRoadmapTexture(), [])

  const buildingTextures = useMemo(
    () => [createBuildingFacadeTexture(1), createBuildingFacadeTexture(2), createBuildingFacadeTexture(3)],
    [],
  )

  // Materials
  const floorWoodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.0,
      }),
    [woodTexture],
  )

  const oakWoodMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c48946', roughness: 0.5, metalness: 0.05 }),
    [],
  )

  const darkWalnutMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3d2415', roughness: 0.45, metalness: 0.08 }),
    [],
  )

  const blackMetalMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#161920', roughness: 0.35, metalness: 0.85 }),
    [],
  )

  const chromeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d0d5dd', roughness: 0.2, metalness: 0.9 }),
    [],
  )

  const glassPartitionMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#a5c4ff',
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        transmission: 0.88,
        thickness: 0.4,
      }),
    [],
  )

  const partitionFabricMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2b313d', roughness: 0.9 }),
    [],
  )

  const leatherCognacMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#994d22', roughness: 0.6, metalness: 0.1 }),
    [],
  )

  const plantGreenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2e7d44', roughness: 0.75 }),
    [],
  )

  const potWhiteMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 }),
    [],
  )

  const ideScreenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: ideTexture,
        emissive: '#1e3a8a',
        emissiveIntensity: 0.75,
        roughness: 0.2,
      }),
    [ideTexture],
  )

  const chartScreenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: chartTexture,
        emissive: '#0284c7',
        emissiveIntensity: 0.75,
        roughness: 0.2,
      }),
    [chartTexture],
  )

  const roadmapScreenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: roadmapTexture,
        roughness: 0.3,
        metalness: 0.1,
      }),
    [roadmapTexture],
  )

  const neonYellowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fef08a',
        emissive: '#eab308',
        emissiveIntensity: 2.2,
        roughness: 0.1,
      }),
    [],
  )

  const neonOrangeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffedd5',
        emissive: '#f97316',
        emissiveIntensity: 2.4,
        roughness: 0.1,
      }),
    [],
  )

  return (
    <group>
      {/* ------------------------------------------------------------------- */}
      {/* 1. Main Hardwood Floor Diorama Slab (Solid box, top face at y=0.00) */}
      {/* ------------------------------------------------------------------- */}
      <mesh
        receiveShadow
        position={[0, -0.08, 0]}
        material={floorWoodMat}
      >
        <boxGeometry args={[23, 0.16, 17]} />
      </mesh>

      {/* Decorative Outer Bevel Edging (Positioned strictly beneath the floor) */}
      <mesh position={[0, -0.28, 0]} material={blackMetalMat}>
        <boxGeometry args={[23.3, 0.24, 17.3]} />
      </mesh>

      {/* ------------------------------------------------------------------- */}
      {/* 2. Perimeter Glass Curtain Wall (North & East Skyline Windows) */}
      {/* ------------------------------------------------------------------- */}
      {/* North Wall: Floor-to-Ceiling Windows */}
      <group position={[0, 1.8, -8.5]}>
        {/* Continuous Glass Panel */}
        <mesh material={glassPartitionMat}>
          <boxGeometry args={[23, 3.6, 0.06]} />
        </mesh>
        {/* Bottom Sill */}
        <mesh position={[0, -1.75, 0]} material={blackMetalMat}>
          <boxGeometry args={[23.2, 0.12, 0.25]} />
        </mesh>
        {/* Top Header */}
        <mesh position={[0, 1.75, 0]} material={blackMetalMat}>
          <boxGeometry args={[23.2, 0.12, 0.25]} />
        </mesh>
        {/* Vertical Mullions */}
        {[-9.5, -6.5, -3.5, -0.5, 2.5, 5.5, 8.5].map((x, idx) => (
          <mesh key={idx} position={[x, 0, 0]} material={blackMetalMat}>
            <boxGeometry args={[0.12, 3.6, 0.16]} />
          </mesh>
        ))}
        {/* Horizontal Transom Bar */}
        <mesh position={[0, 0.3, 0]} material={blackMetalMat}>
          <boxGeometry args={[23, 0.08, 0.1]} />
        </mesh>
      </group>

      {/* East Wall: Floor-to-Ceiling Windows */}
      <group position={[11.5, 1.8, 0]}>
        {/* Continuous Glass Panel */}
        <mesh material={glassPartitionMat}>
          <boxGeometry args={[0.06, 3.6, 17]} />
        </mesh>
        {/* Bottom Sill */}
        <mesh position={[0, -1.75, 0]} material={blackMetalMat}>
          <boxGeometry args={[0.25, 0.12, 17.2]} />
        </mesh>
        {/* Top Header */}
        <mesh position={[0, 1.75, 0]} material={blackMetalMat}>
          <boxGeometry args={[0.25, 0.12, 17.2]} />
        </mesh>
        {/* Vertical Mullions */}
        {[-6, -3, 0, 3, 6].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} material={blackMetalMat}>
            <boxGeometry args={[0.16, 3.6, 0.12]} />
          </mesh>
        ))}
        {/* Horizontal Transom Bar */}
        <mesh position={[0, 0.3, 0]} material={blackMetalMat}>
          <boxGeometry args={[0.1, 0.08, 17]} />
        </mesh>
      </group>

      {/* Low Interior Half-Walls on South & West Perimeter */}
      <mesh position={[0, 0.3, 8.5]} material={blackMetalMat}>
        <boxGeometry args={[23.2, 0.6, 0.18]} />
      </mesh>
      <mesh position={[-11.5, 0.3, 0]} material={blackMetalMat}>
        <boxGeometry args={[0.18, 0.6, 17.2]} />
      </mesh>

      {/* ------------------------------------------------------------------- */}
      {/* 4. 3D Night City Skyline Outside Windows */}
      {/* ------------------------------------------------------------------- */}
      <group position={[0, 0, -14]}>
        {/* Backdrop Sky Cylinder / Gradient Screen */}
        <mesh position={[0, 10, -8]}>
          <planeGeometry args={[65, 30]} />
          <meshBasicMaterial color="#070c18" />
        </mesh>

        {/* Layer 1: Skyscraper Towers behind North Wall */}
        {[
          { x: -14, z: -1, w: 3.5, d: 3.5, h: 18, texIdx: 0 },
          { x: -9.5, z: 2, w: 2.8, d: 2.8, h: 14, texIdx: 1 },
          { x: -5.5, z: -2, w: 3.8, d: 3.8, h: 22, texIdx: 2 },
          { x: -1.0, z: 1, w: 3.2, d: 3.2, h: 16, texIdx: 0 },
          { x: 3.5, z: -1, w: 3.6, d: 3.6, h: 20, texIdx: 1 },
          { x: 8.0, z: 2, w: 2.9, d: 2.9, h: 15, texIdx: 2 },
          { x: 12.5, z: -2, w: 4.2, d: 4.2, h: 23, texIdx: 0 },
        ].map((bld, idx) => (
          <group key={idx} position={[bld.x, bld.h / 2 - 2, bld.z]}>
            <mesh castShadow>
              <boxGeometry args={[bld.w, bld.h, bld.d]} />
              <meshStandardMaterial
                map={buildingTextures[bld.texIdx]}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
            {/* Spire with beacon */}
            {idx % 2 === 0 && (
              <mesh position={[0, bld.h / 2 + 1.5, 0]}>
                <cylinderGeometry args={[0.08, 0.2, 3]} />
                <meshStandardMaterial color="#64748b" />
              </mesh>
            )}
          </group>
        ))}

        {/* Layer 2: Skyscraper Towers outside East Wall */}
        <group position={[18, 0, 14]}>
          {[
            { x: 0, z: -10, w: 3.6, d: 3.6, h: 21, texIdx: 1 },
            { x: -2, z: -5, w: 3.0, d: 3.0, h: 16, texIdx: 0 },
            { x: 2, z: 0, w: 4.0, d: 4.0, h: 24, texIdx: 2 },
            { x: -1, z: 5, w: 3.2, d: 3.2, h: 17, texIdx: 1 },
            { x: 2, z: 9, w: 3.5, d: 3.5, h: 19, texIdx: 0 },
          ].map((bld, idx) => (
            <mesh key={idx} position={[bld.x, bld.h / 2 - 2, bld.z]}>
              <boxGeometry args={[bld.w, bld.h, bld.d]} />
              <meshStandardMaterial
                map={buildingTextures[bld.texIdx]}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* Aviation Hazard Blinking Beacons */}
        <group ref={beaconsRef}>
          <mesh position={[-5.5, 20.2, -2]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
          <mesh position={[12.5, 21.2, -2]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
          <mesh position={[20, 22.2, 14]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
        </group>
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* 5. Glass Conference Room (Top Right) */}
      {/* ------------------------------------------------------------------- */}
      <group position={[6.4, 0, -5.2]}>
        {/* Glass Partition Enclosure */}
        {/* West Partition Wall */}
        <mesh position={[-3.6, 1.4, 0]} material={glassPartitionMat}>
          <boxGeometry args={[0.06, 2.8, 4.4]} />
        </mesh>
        {/* West Partition Frame */}
        <mesh position={[-3.6, 1.4, -2.18]} material={blackMetalMat}>
          <boxGeometry args={[0.1, 2.8, 0.1]} />
        </mesh>
        <mesh position={[-3.6, 1.4, 2.18]} material={blackMetalMat}>
          <boxGeometry args={[0.1, 2.8, 0.1]} />
        </mesh>
        <mesh position={[-3.6, 2.76, 0]} material={blackMetalMat}>
          <boxGeometry args={[0.1, 0.08, 4.4]} />
        </mesh>

        {/* South Partition Wall with Glass Door opening */}
        <mesh position={[0.6, 1.4, 2.2]} material={glassPartitionMat}>
          <boxGeometry args={[6.0, 2.8, 0.06]} />
        </mesh>
        <mesh position={[0.6, 2.76, 2.2]} material={blackMetalMat}>
          <boxGeometry args={[6.0, 0.08, 0.1]} />
        </mesh>

        {/* Large Boardroom Table */}
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.74, 0]} material={darkWalnutMat}>
            <boxGeometry args={[4.4, 0.08, 1.6]} />
          </mesh>
          {/* Table Pedestal Legs */}
          <mesh position={[-1.4, 0.37, 0]} material={chromeMat}>
            <cylinderGeometry args={[0.12, 0.18, 0.74]} />
          </mesh>
          <mesh position={[1.4, 0.37, 0]} material={chromeMat}>
            <cylinderGeometry args={[0.12, 0.18, 0.74]} />
          </mesh>
        </group>

        {/* Wall-Mounted Large "SYNERGY ROADMAP" Display Screen */}
        <group position={[0, 1.8, -2.15]}>
          <mesh position={[0, 0, -0.02]} material={blackMetalMat}>
            <boxGeometry args={[3.2, 1.7, 0.06]} />
          </mesh>
          <mesh material={roadmapScreenMat}>
            <planeGeometry args={[3.1, 1.6]} />
          </mesh>
        </group>

        {/* Conference Room Overhead Soft Chandelier Light */}
        <pointLight position={[0, 2.6, 0]} intensity={0.9} color="#e0e7ff" distance={7} />
      </group>

      {/* Conference Room Chairs */}
      {CONFERENCE_CHAIRS.map((chair, idx) => (
        <group key={idx} position={[chair.x + 14.15, 0, chair.z - 11.1]}>
          <mesh castShadow position={[0, 0.44, 0]} material={blackMetalMat}>
            <boxGeometry args={[0.42, 0.08, 0.42]} />
          </mesh>
          <mesh castShadow position={[0, 0.72, chair.z > 5.9 ? -0.18 : 0.18]} material={blackMetalMat}>
            <boxGeometry args={[0.42, 0.52, 0.08]} />
          </mesh>
          <mesh position={[0, 0.22, 0]} material={chromeMat}>
            <cylinderGeometry args={[0.03, 0.03, 0.44]} />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------------------------- */}
      {/* 6. Lounge Area (Top Left) */}
      {/* ------------------------------------------------------------------- */}
      <group position={[-6.8, 0, -5.4]}>
        {/* Cognac Leather Tufted Sofa */}
        <group position={[0, 0, -1.2]}>
          {/* Seat Cushion */}
          <mesh castShadow position={[0, 0.42, 0]} material={leatherCognacMat}>
            <boxGeometry args={[2.6, 0.26, 0.85]} />
          </mesh>
          {/* Backrest */}
          <mesh castShadow position={[0, 0.8, -0.34]} material={leatherCognacMat}>
            <boxGeometry args={[2.6, 0.6, 0.24]} />
          </mesh>
          {/* Left Armrest */}
          <mesh castShadow position={[-1.38, 0.58, 0]} material={leatherCognacMat}>
            <boxGeometry args={[0.22, 0.44, 0.85]} />
          </mesh>
          {/* Right Armrest */}
          <mesh castShadow position={[1.38, 0.58, 0]} material={leatherCognacMat}>
            <boxGeometry args={[0.22, 0.44, 0.85]} />
          </mesh>
          {/* Wooden Tapered Sofa Legs */}
          {[-1.2, 1.2].map((lx) =>
            [-0.3, 0.3].map((lz, li) => (
              <mesh key={`${lx}-${li}`} position={[lx, 0.15, lz]} material={oakWoodMat}>
                <cylinderGeometry args={[0.03, 0.04, 0.3]} />
              </mesh>
            )),
          )}
        </group>

        {/* Round Walnut Coffee Table */}
        <group position={[0, 0, 0.2]}>
          <mesh castShadow position={[0, 0.36, 0]} material={darkWalnutMat}>
            <cylinderGeometry args={[0.55, 0.55, 0.05, 24]} />
          </mesh>
          <mesh position={[0, 0.18, 0]} material={blackMetalMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.36]} />
          </mesh>
          {/* Mugs on Coffee Table */}
          <mesh position={[-0.15, 0.42, 0.05]} material={new THREE.MeshStandardMaterial({ color: '#f59e0b' })}>
            <cylinderGeometry args={[0.04, 0.04, 0.08]} />
          </mesh>
          <mesh position={[0.12, 0.42, -0.08]} material={new THREE.MeshStandardMaterial({ color: '#38bdf8' })}>
            <cylinderGeometry args={[0.04, 0.04, 0.08]} />
          </mesh>
        </group>

        {/* Lounge Leather Armchairs */}
        <group position={[-1.6, 0, 0.4]} rotation={[0, Math.PI / 4, 0]}>
          <mesh castShadow position={[0, 0.4, 0]} material={leatherCognacMat}>
            <boxGeometry args={[0.75, 0.24, 0.75]} />
          </mesh>
          <mesh castShadow position={[0, 0.76, -0.3]} material={leatherCognacMat}>
            <boxGeometry args={[0.75, 0.55, 0.18]} />
          </mesh>
        </group>

        {/* Arched Floor Lamp */}
        <group position={[2.1, 0, -1.2]}>
          <mesh position={[0, 0.04, 0]} material={blackMetalMat}>
            <cylinderGeometry args={[0.22, 0.22, 0.06]} />
          </mesh>
          <mesh position={[0, 1.2, 0]} material={chromeMat}>
            <cylinderGeometry args={[0.03, 0.03, 2.4]} />
          </mesh>
          {/* Lamp Shade */}
          <mesh position={[-0.3, 2.2, 0.2]} material={new THREE.MeshStandardMaterial({ color: '#fef08a' })}>
            <coneGeometry args={[0.26, 0.3, 16]} />
          </mesh>
          {/* Warm floor lamp light */}
          <pointLight position={[-0.3, 2.1, 0.2]} intensity={0.9} color="#fef08a" distance={4.5} />
        </group>

        {/* Wall Accent: Glowing Neon Sign "GOOD IDEAS BAD DECISIONS" */}
        <group position={[0, 2.2, -2.45]}>
          {/* Neon Tube Lettering Backing */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[3.2, 0.8, 0.04]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          {/* Glowing Letters */}
          <mesh position={[0, 0.14, 0.035]} material={neonYellowMat}>
            <boxGeometry args={[2.8, 0.2, 0.02]} />
          </mesh>
          <mesh position={[0, -0.16, 0.035]} material={neonYellowMat}>
            <boxGeometry args={[2.5, 0.18, 0.02]} />
          </mesh>
          {/* Amber Neon Glow Point Light */}
          <pointLight position={[0, 0, 0.4]} intensity={1.5} color="#fbbf24" distance={6} />
        </group>
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* 7. Main Bullpen Workstation Pods (Center) */}
      {/* ------------------------------------------------------------------- */}
      {DESKS.map((desk, idx) => {
        const isExec = desk.kind === 'exec'
        const isReception = desk.kind === 'reception'
        const currentMat = isExec ? darkWalnutMat : isReception ? chromeMat : oakWoodMat

        return (
          <group key={idx} position={[desk.x, 0, desk.z]}>
            {/* Wooden Desk Top */}
            <mesh castShadow receiveShadow position={[0, 0.72, 0]} material={currentMat}>
              <boxGeometry args={[isExec ? 2.3 : isReception ? 2.1 : 1.5, 0.06, isExec ? 1.0 : 0.85]} />
            </mesh>

            {/* Dark Metal Desk Legs */}
            <mesh castShadow position={[-0.65, 0.36, -0.32]} material={blackMetalMat}>
              <boxGeometry args={[0.06, 0.72, 0.06]} />
            </mesh>
            <mesh castShadow position={[0.65, 0.36, -0.32]} material={blackMetalMat}>
              <boxGeometry args={[0.06, 0.72, 0.06]} />
            </mesh>
            <mesh castShadow position={[-0.65, 0.36, 0.32]} material={blackMetalMat}>
              <boxGeometry args={[0.06, 0.72, 0.06]} />
            </mesh>
            <mesh castShadow position={[0.65, 0.36, 0.32]} material={blackMetalMat}>
              <boxGeometry args={[0.06, 0.72, 0.06]} />
            </mesh>

            {/* Privacy Screen Divider (Between Pod Desks) */}
            {!isExec && !isReception && (
              <mesh position={[0, 0.95, 0.42]} material={partitionFabricMat}>
                <boxGeometry args={[1.5, 0.42, 0.04]} />
              </mesh>
            )}

            {/* Dual Glowing Monitor Setup */}
            <group position={[0, 0.75, 0.18]}>
              {/* Heavy Duty Monitor Arm Stand */}
              <mesh position={[0, 0.15, 0]} material={blackMetalMat}>
                <boxGeometry args={[0.08, 0.3, 0.08]} />
              </mesh>

              {/* Monitor 1: Left Screen (Dark IDE Syntax Highlighting) */}
              <group position={[-0.38, 0.28, -0.04]} rotation={[0, 0.15, 0]}>
                <mesh material={blackMetalMat}>
                  <boxGeometry args={[0.68, 0.42, 0.04]} />
                </mesh>
                <mesh position={[0, 0, -0.022]} material={ideScreenMat}>
                  <planeGeometry args={[0.64, 0.38]} />
                </mesh>
              </group>

              {/* Monitor 2: Right Screen (Financial Candlestick Chart) */}
              <group position={[0.38, 0.28, -0.04]} rotation={[0, -0.15, 0]}>
                <mesh material={blackMetalMat}>
                  <boxGeometry args={[0.68, 0.42, 0.04]} />
                </mesh>
                <mesh position={[0, 0, -0.022]} material={chartScreenMat}>
                  <planeGeometry args={[0.64, 0.38]} />
                </mesh>
              </group>
            </group>

            {/* Desk Task Lamp with Warm Glowing Shade */}
            <group position={[0.55, 0.75, -0.2]}>
              <mesh material={blackMetalMat}>
                <cylinderGeometry args={[0.06, 0.06, 0.02]} />
              </mesh>
              <mesh position={[0, 0.18, 0]} material={chromeMat}>
                <cylinderGeometry args={[0.015, 0.015, 0.36]} />
              </mesh>
              {/* Glowing Warm Brass Lamp Shade */}
              <mesh position={[-0.08, 0.34, 0]} rotation={[0, 0, Math.PI / 4]}>
                <coneGeometry args={[0.09, 0.14, 12]} />
                <meshStandardMaterial
                  color="#fef08a"
                  emissive="#f59e0b"
                  emissiveIntensity={0.8}
                  roughness={0.3}
                />
              </mesh>
            </group>

            {/* Keyboard & Mousepad */}
            <mesh position={[0, 0.752, -0.16]} material={new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.9 })}>
              <boxGeometry args={[0.65, 0.005, 0.28]} />
            </mesh>
            <mesh position={[-0.06, 0.758, -0.16]} material={new THREE.MeshStandardMaterial({ color: '#27272a' })}>
              <boxGeometry args={[0.38, 0.01, 0.12]} />
            </mesh>
            <mesh position={[0.22, 0.758, -0.16]} material={new THREE.MeshStandardMaterial({ color: '#3f3f46' })}>
              <boxGeometry args={[0.06, 0.012, 0.09]} />
            </mesh>

            {/* Ergonomic Mesh Office Chair */}
            <group position={[0, 0, -0.65]}>
              {/* Seat Cushion */}
              <mesh castShadow position={[0, 0.44, 0]} material={partitionFabricMat}>
                <boxGeometry args={[0.5, 0.08, 0.5]} />
              </mesh>
              {/* Ergonomic Contoured Backrest */}
              <mesh castShadow position={[0, 0.78, -0.22]} material={partitionFabricMat}>
                <boxGeometry args={[0.48, 0.6, 0.06]} />
              </mesh>
              {/* Armrests */}
              <mesh position={[-0.26, 0.62, 0]} material={blackMetalMat}>
                <boxGeometry args={[0.06, 0.28, 0.3]} />
              </mesh>
              <mesh position={[0.26, 0.62, 0]} material={blackMetalMat}>
                <boxGeometry args={[0.06, 0.28, 0.3]} />
              </mesh>
              {/* Hydraulic Cylinder */}
              <mesh position={[0, 0.22, 0]} material={chromeMat}>
                <cylinderGeometry args={[0.035, 0.035, 0.44]} />
              </mesh>
              {/* 5-Star Caster Base */}
              <mesh position={[0, 0.04, 0]} material={blackMetalMat}>
                <cylinderGeometry args={[0.28, 0.28, 0.04]} />
              </mesh>
            </group>
          </group>
        )
      })}

      {/* ------------------------------------------------------------------- */}
      {/* 8. Pantry & Coffee Bar Area (Bottom Right) */}
      {/* ------------------------------------------------------------------- */}
      <group position={[6.5, 0, 5.2]}>
        {/* Modern Kitchen Cabinet & Countertop */}
        <group position={[0, 0, 1.4]}>
          {/* Base Cabinet */}
          <mesh castShadow position={[0, 0.42, 0]} material={oakWoodMat}>
            <boxGeometry args={[4.2, 0.84, 0.9]} />
          </mesh>
          {/* Quartz / Stone Countertop */}
          <mesh castShadow receiveShadow position={[0, 0.86, 0]} material={new THREE.MeshStandardMaterial({ color: '#181b22', roughness: 0.3 })}>
            <boxGeometry args={[4.3, 0.06, 0.95]} />
          </mesh>

          {/* High-End Stainless Espresso Machine */}
          <group position={[-1.1, 0.9, 0]}>
            <mesh
              castShadow
              material={
                equipment?.coffeeMachineBroken
                  ? new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 0.6 })
                  : chromeMat
              }
            >
              <boxGeometry args={[0.8, 0.65, 0.55]} />
            </mesh>
            {/* Status indicator / Steam */}
            <mesh position={[0, 0.36, 0.2]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color={equipment?.coffeeMachineBroken ? '#ef4444' : '#22c55e'} />
            </mesh>
            <mesh position={[0.2, 0.1, 0.3]} material={blackMetalMat}>
              <cylinderGeometry args={[0.04, 0.04, 0.18]} />
            </mesh>
          </group>

          {/* Water Cooler with Blue Jug */}
          <group position={[1.4, 0.9, 0]}>
            <mesh position={[0, 0.3, 0]} material={potWhiteMat}>
              <boxGeometry args={[0.4, 0.6, 0.4]} />
            </mesh>
            {/* Blue 5-Gallon Water Bottle */}
            <mesh position={[0, 0.72, 0]} material={new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transparent: true, opacity: 0.7, transmission: 0.9 })}>
              <cylinderGeometry args={[0.16, 0.16, 0.38]} />
            </mesh>
          </group>
        </group>

        {/* High Bistro Table & Wooden Barstools */}
        <group position={[-0.8, 0, -0.6]}>
          <mesh position={[0, 0.95, 0]} material={oakWoodMat}>
            <cylinderGeometry args={[0.48, 0.48, 0.05, 20]} />
          </mesh>
          <mesh position={[0, 0.48, 0]} material={blackMetalMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.95]} />
          </mesh>

          {/* Barstools */}
          {[-0.6, 0.6].map((bx, bi) => (
            <group key={bi} position={[bx, 0, 0]}>
              <mesh position={[0, 0.68, 0]} material={oakWoodMat}>
                <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
              </mesh>
              <mesh position={[0, 0.34, 0]} material={blackMetalMat}>
                <cylinderGeometry args={[0.02, 0.02, 0.68]} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Wall Accent: Glowing Neon Sign "FUELED BY CAFFEINE & DELUSION" */}
        <group position={[0, 2.3, 2.45]}>
          <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[3.6, 0.8, 0.04]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          {/* Glowing Letters */}
          <mesh position={[0, 0.14, 0.02]} material={neonOrangeMat}>
            <boxGeometry args={[3.2, 0.2, 0.02]} />
          </mesh>
          <mesh position={[0, -0.16, 0.02]} material={neonOrangeMat}>
            <boxGeometry args={[2.8, 0.18, 0.02]} />
          </mesh>
          {/* Orange Neon Glow Point Light */}
          <pointLight position={[0, 0, -0.4]} intensity={1.6} color="#f97316" distance={6} />
        </group>
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* 9. Copier / Printer Station */}
      {/* ------------------------------------------------------------------- */}
      <group position={[4.6, 0, 2.6]}>
        {/* Commercial Copier Body */}
        <mesh castShadow position={[0, 0.52, 0]} material={blackMetalMat}>
          <boxGeometry args={[0.95, 1.04, 0.85]} />
        </mesh>
        {/* Paper Feed Trays */}
        <mesh position={[0.52, 0.65, 0]} material={chromeMat}>
          <boxGeometry args={[0.2, 0.04, 0.45]} />
        </mesh>
        {/* Scanner Glass Bed */}
        <mesh position={[0, 1.05, 0]} material={new THREE.MeshStandardMaterial({ color: '#27272a' })}>
          <boxGeometry args={[0.9, 0.04, 0.8]} />
        </mesh>
        {/* Display / Jam Warning Light */}
        <mesh position={[-0.25, 1.15, 0.28]}>
          <boxGeometry args={[0.24, 0.16, 0.04]} />
          <meshBasicMaterial color={equipment?.printerJammed ? '#ef4444' : '#22c55e'} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* 10. Server Room Racks with Blinking Activity LEDs */}
      {/* ------------------------------------------------------------------- */}
      <group position={[9.2, 0, 3.8]}>
        {[-1.3, 0, 1.3].map((zOff, rIdx) => (
          <group key={rIdx} position={[0, 1.15, zOff]}>
            <mesh castShadow material={blackMetalMat}>
              <boxGeometry args={[0.9, 2.3, 0.95]} />
            </mesh>
            {/* Server LED Grille */}
            <mesh position={[-0.46, 0.3, 0]}>
              <boxGeometry args={[0.02, 1.2, 0.8]} />
              <meshBasicMaterial color={equipment?.serverRoomHot ? '#ef4444' : '#10b981'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------------- */}
      {/* 11. Lush Indoor Plants (Monstera, Fiddle Leaf Figs, Planters) */}
      {/* ------------------------------------------------------------------- */}
      {[
        { x: -9.8, z: -2.8, scale: 1.4 },
        { x: -3.5, z: -2.5, scale: 1.1 },
        { x: 3.2, z: -2.2, scale: 1.2 },
        { x: -5.2, z: 2.8, scale: 1.3 },
        { x: 1.8, z: 3.2, scale: 1.0 },
        { x: 9.8, z: -2.4, scale: 1.3 },
        { x: 3.4, z: 4.8, scale: 1.2 },
      ].map((plant, pIdx) => (
        <group key={pIdx} position={[plant.x, 0, plant.z]} scale={plant.scale}>
          {/* Ceramic Pot */}
          <mesh castShadow position={[0, 0.3, 0]} material={potWhiteMat}>
            <cylinderGeometry args={[0.26, 0.2, 0.6, 16]} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.58, 0]} material={darkWalnutMat}>
            <cylinderGeometry args={[0.24, 0.24, 0.05]} />
          </mesh>
          {/* Stem & Leaves */}
          <mesh castShadow position={[0, 0.85, 0]} material={plantGreenMat}>
            <sphereGeometry args={[0.38, 8, 8]} />
          </mesh>
          <mesh castShadow position={[0.15, 1.1, 0.1]} material={plantGreenMat}>
            <sphereGeometry args={[0.28, 8, 8]} />
          </mesh>
          <mesh castShadow position={[-0.12, 1.05, -0.1]} material={plantGreenMat}>
            <sphereGeometry args={[0.25, 8, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
