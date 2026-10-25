/**
 * CORPORATE HELL™ — Application Shell.
 *
 * Full-screen responsive shell coordinating the Top Command Bar,
 * Left Navigation Rail, Center 3D Viewport / Sub-views, Right Contextual
 * Inspector, Bottom Timeline, Modals, and the master fixed simulation clock.
 */
import { useEffect } from 'react'
import { useGameStore } from '../../state/gameStore'
import { LaunchScreen } from '../views/LaunchScreen'
import { SetupScreen } from '../views/SetupScreen'
import { TopCommandBar } from './TopCommandBar'
import { LeftNavRail } from './LeftNavRail'
import { BottomTimeline } from './BottomTimeline'
import { OfficeScene } from '../../scene/OfficeScene'
import { EmployeeDossier } from '../inspector/EmployeeDossier'
import { EmployeesView } from '../views/EmployeesView'
import { DepartmentsView } from '../views/DepartmentsView'
import { FinanceView } from '../views/FinanceView'
import { IncidentsView } from '../views/IncidentsView'
import { InboxView } from '../views/InboxView'
import { CampaignView } from '../views/CampaignView'
import { SimulationLabView } from '../views/SimulationLabView'
import { EndOfDayModal } from '../modals/EndOfDayModal'
import { SettingsModal } from '../modals/SettingsModal'

export function Shell() {
  const phase = useGameStore((s) => s.phase)
  const activeTab = useGameStore((s) => s.activeTab)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const simSpeed = useGameStore((s) => s.simSpeed)
  const tick = useGameStore((s) => s.tick)
  const setPlaying = useGameStore((s) => s.setPlaying)
  const setSimSpeed = useGameStore((s) => s.setSimSpeed)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const isDossierOpen = useGameStore((s) => s.isDossierOpen)
  const setDossierOpen = useGameStore((s) => s.setDossierOpen)

  // Simulation Fixed Tick Loop
  useEffect(() => {
    if (phase !== 'playing' || !isPlaying) return

    // Speed intervals: 1x = 1000ms, 2x = 500ms, 5x = 200ms
    const intervalMs = Math.round(1000 / simSpeed)
    const interval = setInterval(() => {
      tick()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [phase, isPlaying, simSpeed, tick])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying(!isPlaying)
      } else if (e.key === '1') {
        setSimSpeed(1)
      } else if (e.key === '2') {
        setSimSpeed(2)
      } else if (e.key === '5') {
        setSimSpeed(5)
      } else if (e.key === 'r' || e.key === 'R') {
        focusRoom('open_plan')
      } else if (e.key === 'Escape') {
        selectEmployee(null)
        setDossierOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, setPlaying, setSimSpeed, focusRoom, selectEmployee])

  // Phase Router
  if (phase === 'launch') {
    return (
      <>
        <LaunchScreen />
        <SettingsModal />
      </>
    )
  }

  if (phase === 'setup') {
    return (
      <>
        <SetupScreen />
        <SettingsModal />
      </>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-ink-950 font-sans text-paper-50 select-none">
      {/* Top Command Bar */}
      <TopCommandBar />

      {/* Main Central Viewport & Inspector Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Navigation Rail */}
        <LeftNavRail />

        {/* Dynamic Center View */}
        <main className="relative flex-1 overflow-hidden">
          {activeTab === 'office' && <OfficeScene />}
          {activeTab === 'employees' && <EmployeesView />}
          {activeTab === 'departments' && <DepartmentsView />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'incidents' && <IncidentsView />}
          {activeTab === 'inbox' && <InboxView />}
          {activeTab === 'campaign' && <CampaignView />}
          {activeTab === 'lab' && <SimulationLabView />}
        </main>

        {/* Right Slide-Over Dossier Inspector */}
        {isDossierOpen && (
          <div className="absolute right-0 top-0 bottom-0 z-30 shadow-2xl animate-slide-up">
            <EmployeeDossier />
          </div>
        )}
      </div>

      {/* Bottom Timeline on sub-views */}
      {activeTab !== 'office' && <BottomTimeline />}

      {/* Modal Dialogs */}
      <EndOfDayModal />
      <SettingsModal />
    </div>
  )
}
