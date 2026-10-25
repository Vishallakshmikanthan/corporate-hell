/**
 * CORPORATE HELL™ — Central Zustand Game Store.
 *
 * Bridges the simulation engine, UI state, active selection,
 * camera focus, audio, and settings.
 */
import { create } from 'zustand'
import type {
  ActionResult,
  CompanyState,
  EngineConfig,
  PlayerAction,
  RoomId,
} from '../game/models/types'
import { SimulationEngine } from '../game/engine/engine'
import { audio } from '../services/audio'
import { saveGame, loadGame } from '../game/persistence/storage'

export type NavTab =
  | 'office'
  | 'employees'
  | 'departments'
  | 'finance'
  | 'incidents'
  | 'inbox'
  | 'campaign'
  | 'lab'

export type GamePhase = 'launch' | 'setup' | 'playing'
export type GraphicsQuality = 'high' | 'medium' | 'low'

interface GameStore {
  phase: GamePhase
  engine: SimulationEngine | null
  state: CompanyState | null
  selectedEmployeeId: string | null
  focusedRoomId: RoomId | null
  activeTab: NavTab
  isPlaying: boolean
  simSpeed: number // 1, 2, 5
  audioMuted: boolean
  audioVolume: number
  graphicsQuality: GraphicsQuality
  isEndOfDayModalOpen: boolean
  isSettingsModalOpen: boolean
  isDossierOpen: boolean
  lastEventMessage: string | null

  // Actions
  setPhase: (phase: GamePhase) => void
  startNewGame: (config: EngineConfig) => void
  loadState: (savedState: CompanyState) => void
  resumeLastSave: () => boolean
  tick: () => void
  setPlaying: (playing: boolean) => void
  setSimSpeed: (speed: number) => void
  selectEmployee: (id: string | null) => void
  setDossierOpen: (open: boolean) => void
  focusRoom: (roomId: RoomId | null) => void
  setActiveTab: (tab: NavTab) => void
  dispatch: (action: PlayerAction) => ActionResult
  closeEndOfDayModal: () => void
  setGraphicsQuality: (quality: GraphicsQuality) => void
  toggleAudioMute: () => void
  setAudioVolume: (volume: number) => void
  setSettingsModalOpen: (open: boolean) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'launch',
  engine: null,
  state: null,
  selectedEmployeeId: null,
  focusedRoomId: null,
  activeTab: 'office',
  isPlaying: true,
  simSpeed: 1,
  audioMuted: false,
  audioVolume: 0.5,
  graphicsQuality: 'high',
  isEndOfDayModalOpen: false,
  isSettingsModalOpen: false,
  isDossierOpen: false,
  lastEventMessage: null,

  setPhase: (phase) => set({ phase }),

  startNewGame: (config) => {
    const engine = new SimulationEngine(config, {
      onTick: (nextState) => {
        set({ state: { ...nextState } })
      },
      onDayEnd: (nextState) => {
        audio.playCash()
        set({ state: { ...nextState }, isEndOfDayModalOpen: true, isPlaying: false })
        saveGame(nextState, 'autosave')
      },
      onEvent: (record) => {
        if (record.severity >= 3) {
          audio.playAlert()
        } else {
          audio.playChime()
        }
        set({ lastEventMessage: `${record.title}: ${record.description}` })
      },
      onEnding: (ending) => {
        if (ending.kind === 'victory') {
          audio.playCelebration()
        } else {
          audio.playAlert()
        }
      },
    })

    const initial = engine.getState()
    saveGame(initial, 'autosave')

    set({
      engine,
      state: { ...initial },
      phase: 'playing',
      isPlaying: true,
      selectedEmployeeId: initial.employeeOrder[0],
      activeTab: 'office',
      isEndOfDayModalOpen: false,
    })
  },

  loadState: (savedState) => {
    const config: EngineConfig = {
      seed: savedState.seed,
      mode: savedState.mode,
      companyName: savedState.name,
      industry: savedState.industry,
      difficulty: savedState.difficulty,
      scenarioId: savedState.scenarioId || 'standard',
    }

    const engine = new SimulationEngine(config, {
      onTick: (nextState) => set({ state: { ...nextState } }),
      onDayEnd: (nextState) => {
        audio.playCash()
        set({ state: { ...nextState }, isEndOfDayModalOpen: true, isPlaying: false })
        saveGame(nextState, 'autosave')
      },
      onEvent: (record) => {
        if (record.severity >= 3) audio.playAlert()
        else audio.playChime()
        set({ lastEventMessage: `${record.title}: ${record.description}` })
      },
      onEnding: (ending) => {
        if (ending.kind === 'victory') audio.playCelebration()
        else audio.playAlert()
      },
    })

    // Hydrate loaded state directly
    Object.assign(engine.getState(), savedState)
    engine.getRng().setState(savedState.rngState)

    set({
      engine,
      state: { ...savedState },
      phase: 'playing',
      isPlaying: false,
      selectedEmployeeId: savedState.employeeOrder[0] || null,
      activeTab: 'office',
    })
  },

  resumeLastSave: () => {
    const saved = loadGame('autosave')
    if (saved) {
      get().loadState(saved)
      return true
    }
    return false
  },

  tick: () => {
    const { engine } = get()
    if (engine) {
      engine.tick()
      const currentState = engine.getState()
      set({ state: { ...currentState } })
    }
  },

  setPlaying: (playing) => {
    audio.playClick()
    set({ isPlaying: playing })
  },

  setSimSpeed: (speed) => {
    audio.playClick()
    set({ simSpeed: speed })
  },

  selectEmployee: (id) => {
    if (id) audio.playClick()
    set({ selectedEmployeeId: id })
  },

  setDossierOpen: (open) => {
    audio.playClick()
    set({ isDossierOpen: open })
  },

  focusRoom: (roomId) => {
    if (roomId) audio.playClick()
    set({ focusedRoomId: roomId })
  },

  setActiveTab: (tab) => {
    audio.playClick()
    set({ activeTab: tab })
  },

  dispatch: (action) => {
    const { engine } = get()
    if (!engine) return { ok: false, reason: 'Engine not started' }

    audio.playClick()
    const result = engine.dispatchAction(action)
    if (result.ok) {
      set({ state: { ...engine.getState() } })
      if (action.type === 'bonus' || action.type === 'bonus_all' || action.type === 'promote') {
        audio.playCelebration()
      }
    } else {
      audio.playAlert()
    }
    return result
  },

  closeEndOfDayModal: () => {
    audio.playClick()
    set({ isEndOfDayModalOpen: false, isPlaying: true })
  },

  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),

  toggleAudioMute: () => {
    const nextMuted = !get().audioMuted
    audio.setMuted(nextMuted)
    set({ audioMuted: nextMuted })
  },

  setAudioVolume: (vol) => {
    audio.setVolume(vol)
    set({ audioVolume: vol })
  },

  setSettingsModalOpen: (open) => {
    audio.playClick()
    set({ isSettingsModalOpen: open })
  },
}))
