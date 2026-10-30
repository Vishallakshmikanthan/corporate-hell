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
import { OfficeScene } from '../../scene/OfficeScene'
import { EmployeeDossier } from '../inspector/EmployeeDossier'
import { InvestorPitchView } from '../views/InvestorPitchView'
import { EmployeesView } from '../views/EmployeesView'
import { DepartmentsView } from '../views/DepartmentsView'
import { FinanceView } from '../views/FinanceView'
import { IncidentsView } from '../views/IncidentsView'
import { InboxView } from '../views/InboxView'
import { CampaignView } from '../views/CampaignView'
import { SimulationLabView } from '../views/SimulationLabView'
import { KanbanView } from '../views/KanbanView'
import { RepoView } from '../views/RepoView'
import { PipelineView } from '../views/PipelineView'
import { CloudView } from '../views/CloudView'
import { GpuMarketView } from '../views/GpuMarketView'
import { SocialView } from '../views/SocialView'
import { LaunchWarRoom } from '../views/LaunchWarRoom'
import { GrowthView } from '../views/GrowthView'
import { PhoneOverlay } from './PhoneOverlay'
import { MiniGamesOverlay } from '../modals/MiniGamesOverlay'
import { EndOfDayModal } from '../modals/EndOfDayModal'
import { SettingsModal } from '../modals/SettingsModal'
import { SaveLoadModal } from '../modals/SaveLoadModal'
import { WorldHud } from '../../hud/WorldHud'
import { Laptop } from '../../os/Laptop'
import { useUiStore } from '../../state/uiStore'
import { BedroomScene } from '../../scene/environment/BedroomScene'
import { HackathonScene } from '../../scene/environment/HackathonScene'
import { GarageScene } from '../../scene/environment/GarageScene'

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
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen)
  const setPhoneOpen = useGameStore((s) => s.setPhoneOpen)
  const isSaveLoadModalOpen = useGameStore((s) => s.isSaveLoadModalOpen)
  const setSaveLoadModalOpen = useGameStore((s) => s.setSaveLoadModalOpen)

  const v3Enabled = useUiStore((s) => s.v3Enabled)
  const currentChapter = useGameStore((s) => s.state?.career?.currentChapter || 'bedroom')

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
      } else if (e.key === 'Tab') {
        e.preventDefault()
        setPhoneOpen(!isPhoneOpen)
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        const focus = useUiStore.getState().focus
        if (focus === 'laptop') {
          useUiStore.getState().closeLaptop()
        } else {
          useUiStore.getState().openLaptop()
        }
      } else if (e.key === '1') {
        setSimSpeed(1)
      } else if (e.key === '2') {
        setSimSpeed(2)
      } else if (e.key === '5') {
        setSimSpeed(5)
      } else if (e.key === 'r' || e.key === 'R') {
        focusRoom('open_plan')
      } else if (e.key === 'Escape') {
        const ui = useUiStore.getState()
        if (ui.focus === 'laptop') {
          if (ui.activeAppId) {
            ui.closeApp(ui.activeAppId)
          } else {
            ui.closeLaptop()
          }
        } else if (ui.inspectedEmployeeId) {
          ui.inspectEmployee(null)
        } else if (isPhoneOpen) {
          setPhoneOpen(false)
        } else {
          selectEmployee(null)
          setDossierOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isPhoneOpen, setPlaying, setSimSpeed, focusRoom, selectEmployee, setDossierOpen, setPhoneOpen])

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

  // V3 Pixel-Art Production-Ready UI Flow (Section 3)
  if (v3Enabled) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-[#14121c] select-none font-mono">
        {/* Full-Screen 3D Career Chapter Viewport */}
        <main className="absolute inset-0 z-0">
          {currentChapter === 'bedroom' && <BedroomScene />}
          {currentChapter === 'hackathon' && <HackathonScene />}
          {currentChapter === 'garage' && <GarageScene />}
          {(currentChapter === 'scaleup' || currentChapter === 'megacorp') && (
            <OfficeScene />
          )}
        </main>

        {/* Minimalist World HUD (corners only, ~10% screen) */}
        <WorldHud />

        {/* CorpOS Laptop Overlay [E] */}
        <Laptop />

        {/* In-Game Phone & Mini-Game Overlays */}
        <PhoneOverlay />
        <MiniGamesOverlay />

        {/* Modal Dialogs */}
        <EndOfDayModal />
        <SettingsModal />
      </div>
    )
  }

  // Classic Fallback Multi-Tab SaaS Interface
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
          {activeTab === 'pitch' && <InvestorPitchView />}
          {activeTab === 'kanban' && <KanbanView />}
          {activeTab === 'repo' && <RepoView />}
          {activeTab === 'pipeline' && <PipelineView />}
          {activeTab === 'cloud' && <CloudView />}
          {activeTab === 'gpu' && <GpuMarketView />}
          {activeTab === 'social' && <SocialView />}
          {activeTab === 'warroom' && <LaunchWarRoom />}
          {activeTab === 'growth' && <GrowthView />}
          {activeTab === 'employees' && <EmployeesView />}
          {activeTab === 'departments' && <DepartmentsView />}
          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'incidents' && <IncidentsView />}
          {activeTab === 'inbox' && <InboxView />}
          {activeTab === 'campaign' && <CampaignView />}
          {activeTab === 'lab' && <SimulationLabView />}
        </main>

        {/* Right Slide-Over Dossier Inspector (when on 3D Office Hub) */}
        {isDossierOpen && activeTab === 'office' && (
          <div className="absolute right-0 top-0 bottom-0 z-30 shadow-2xl animate-slide-up">
            <EmployeeDossier />
          </div>
        )}
      </div>

      {/* CorpOS Laptop Overlay [E] */}
      <Laptop />

      {/* In-Game Phone & Mini-Game Overlays */}
      <PhoneOverlay />
      <MiniGamesOverlay />

      {/* Modal Dialogs */}
      <EndOfDayModal />
      <SettingsModal />
      {isSaveLoadModalOpen && <SaveLoadModal onClose={() => setSaveLoadModalOpen(false)} />}
    </div>
  )
}

