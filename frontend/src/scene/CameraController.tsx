/**
 * CORPORATE HELL™ — 3D Camera Controller.
 *
 * Smooth, butter-soft orbit controls with unrestricted, seamless zoom in and zoom out.
 * Programmatic room transitions only run when triggered and immediately yield control
 * whenever the user scrolls or drags.
 */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useGameStore } from '../state/gameStore'

const ROOM_CAMERA_TARGETS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  open_plan: { position: [13, 14.5, 15], target: [0, 0.4, 0] },
  office: { position: [13, 14.5, 15], target: [0, 0.4, 0] },
  reception: { position: [-8, 8, 0], target: [-6.8, 0.6, -5.4] },
  ceo_office: { position: [12, 8, -1], target: [8.25, 0.6, -5.75] },
  conference: { position: [3.5, 8.5, 0.5], target: [6.4, 0.8, -5.2] },
  pantry: { position: [6.5, 8.2, 10.5], target: [6.5, 0.8, 5.2] },
  server_room: { position: [13.5, 7.5, 8], target: [9.2, 0.8, 3.8] },
}

export function CameraController() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  const focusedRoomId = useGameStore((s) => s.focusedRoomId)
  const selectedEmployeeId = useGameStore((s) => s.selectedEmployeeId)
  const employees = useGameStore((s) => s.state?.employees)

  const targetCamPos = useRef(new THREE.Vector3(13, 14.5, 15))
  const targetLookAt = useRef(new THREE.Vector3(0, 0.4, 0))
  const isTransitioning = useRef(false)

  const prevRoomId = useRef<string | null>(null)
  // When room focus changes
  useEffect(() => {
    if (focusedRoomId && focusedRoomId !== prevRoomId.current && ROOM_CAMERA_TARGETS[focusedRoomId]) {
      prevRoomId.current = focusedRoomId
      const room = ROOM_CAMERA_TARGETS[focusedRoomId]
      targetCamPos.current.set(room.position[0], room.position[1], room.position[2])
      targetLookAt.current.set(room.target[0], room.target[1], room.target[2])
      isTransitioning.current = true
    }
  }, [focusedRoomId])

  const prevEmpId = useRef<string | null>(null)
  // When employee selection changes
  useEffect(() => {
    if (selectedEmployeeId && selectedEmployeeId !== prevEmpId.current && employees && employees[selectedEmployeeId]) {
      prevEmpId.current = selectedEmployeeId
      const emp = employees[selectedEmployeeId]
      targetLookAt.current.set(emp.position.x, 0.8, emp.position.z)
      targetCamPos.current.set(emp.position.x + 4.5, 5.5, emp.position.z + 5.5)
      isTransitioning.current = true
    } else if (!selectedEmployeeId) {
      prevEmpId.current = null
    }
  }, [selectedEmployeeId])

  // Intercept any user wheel or drag action to immediately unlock manual zoom/orbit
  useEffect(() => {
    const handleUserInteraction = () => {
      isTransitioning.current = false
    }

    const controls = controlsRef.current
    if (controls) {
      controls.addEventListener('start', handleUserInteraction)
    }

    window.addEventListener('wheel', handleUserInteraction, { passive: true })
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true })
    window.addEventListener('touchstart', handleUserInteraction, { passive: true })

    return () => {
      if (controls) {
        controls.removeEventListener('start', handleUserInteraction)
      }
      window.removeEventListener('wheel', handleUserInteraction)
      window.removeEventListener('pointerdown', handleUserInteraction)
      window.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  useFrame((_, delta) => {
    if (!controlsRef.current) return

    if (isTransitioning.current) {
      // Smooth lerp during active navigation jump
      camera.position.lerp(targetCamPos.current, 5 * delta)
      controlsRef.current.target.lerp(targetLookAt.current, 5 * delta)
      controlsRef.current.update()

      // Stop programmatic animation once close enough so user has 100% free control
      if (
        camera.position.distanceTo(targetCamPos.current) < 0.1 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.08
      ) {
        isTransitioning.current = false
      }
    } else {
      // Normal smooth orbit/zoom damping without any rubberbanding
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableZoom={true}
      zoomSpeed={1.3}
      minDistance={2.0}
      maxDistance={45.0}
      enablePan={true}
      panSpeed={1.0}
      screenSpacePanning={true}
      maxPolarAngle={Math.PI / 2.05} // don't go beneath floor
      minPolarAngle={Math.PI / 12}
      enableDamping={true}
      dampingFactor={0.07}
    />
  )
}
