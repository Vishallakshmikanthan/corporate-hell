/**
 * CORPORATE HELL™ — Pixel UI & CorpOS Focus Store.
 *
 * Coordinates modal focus (World vs Laptop vs Phone vs Meeting),
 * CorpOS windows, HUD toasts, Nerd Mode, and Accessibility settings.
 */
import { create } from 'zustand'
import { audio } from '../services/audio'

export type FocusMode = 'world' | 'laptop' | 'phone' | 'meeting' | 'minigame' | 'pause'

export interface UiWindow {
  appId: string
  x: number
  y: number
  width?: number
  height?: number
  z: number
  isMinimized?: boolean
}

export interface ToastMessage {
  id: string
  title: string
  description: string
  appId?: string
  icon?: string
  severity?: 'info' | 'warn' | 'alert' | 'celebrate'
  timestamp: number
}

interface UiStore {
  focus: FocusMode
  v3Enabled: boolean
  openWindows: UiWindow[]
  activeAppId: string | null
  nerdMode: boolean
  readableFont: boolean
  reducedMotion: boolean
  scale: number
  toasts: ToastMessage[]
  inspectedEmployeeId: string | null
  mascotTip: string | null

  // Actions
  setFocus: (focus: FocusMode) => void
  openApp: (appId: string) => void
  closeApp: (appId: string) => void
  minimizeApp: (appId: string) => void
  bringToFront: (appId: string) => void
  toggleNerdMode: () => void
  toggleReadableFont: () => void
  setV3Enabled: (enabled: boolean) => void
  pushToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void
  dismissToast: (id: string) => void
  inspectEmployee: (id: string | null) => void
  setMascotTip: (tip: string | null) => void
  openLaptop: () => void
  closeLaptop: () => void
}

let toastCounter = 0
let maxZ = 10

export const useUiStore = create<UiStore>((set, get) => ({
  focus: 'world',
  v3Enabled: false, // Default to the 9-Section Executive Simulation Hub!
  openWindows: [],
  activeAppId: null,
  nerdMode: false,
  readableFont: false,
  reducedMotion: false,
  scale: 4,
  toasts: [],
  inspectedEmployeeId: null,
  mascotTip: "Welcome to CorpOS! Press [E] to sit at your desk and run the company.",

  setFocus: (focus) => {
    if (focus === 'laptop') {
      audio.playBoot()
    } else {
      audio.playClick()
    }
    set({ focus })
  },

  openApp: (appId) => {
    audio.playClick()
    const { openWindows } = get()
    maxZ += 1

    const existing = openWindows.find((w) => w.appId === appId)
    if (existing) {
      set({
        openWindows: openWindows.map((w) =>
          w.appId === appId ? { ...w, isMinimized: false, z: maxZ } : w
        ),
        activeAppId: appId,
        focus: 'laptop',
      })
    } else {
      // Offset position for cascading windows
      const cascadeOffset = (openWindows.length % 5) * 20
      const newWin: UiWindow = {
        appId,
        x: Math.min(window.innerWidth - 360, 30 + cascadeOffset),
        y: Math.min(window.innerHeight - 260, 30 + cascadeOffset),
        z: maxZ,
        isMinimized: false,
      }
      set({
        openWindows: [...openWindows, newWin],
        activeAppId: appId,
        focus: 'laptop',
      })
    }
  },

  closeApp: (appId) => {
    audio.playClick()
    const { openWindows, activeAppId } = get()
    const nextWindows = openWindows.filter((w) => w.appId !== appId)
    const nextActive = activeAppId === appId
      ? (nextWindows.length > 0 ? nextWindows[nextWindows.length - 1].appId : null)
      : activeAppId

    set({
      openWindows: nextWindows,
      activeAppId: nextActive,
    })
  },

  minimizeApp: (appId) => {
    audio.playClick()
    const { openWindows } = get()
    set({
      openWindows: openWindows.map((w) =>
        w.appId === appId ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    })
  },

  bringToFront: (appId) => {
    maxZ += 1
    const { openWindows } = get()
    set({
      openWindows: openWindows.map((w) =>
        w.appId === appId ? { ...w, isMinimized: false, z: maxZ } : w
      ),
      activeAppId: appId,
    })
  },

  toggleNerdMode: () => {
    audio.playLever()
    set((s) => ({ nerdMode: !s.nerdMode }))
  },

  toggleReadableFont: () => {
    audio.playClick()
    set((s) => ({ readableFont: !s.readableFont }))
  },

  setV3Enabled: (enabled) => {
    audio.playLever()
    set({ v3Enabled: enabled })
  },

  pushToast: (toast) => {
    toastCounter += 1
    const id = `toast-${toastCounter}`
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: Date.now(),
    }

    if (toast.severity === 'alert') {
      audio.playZap()
    } else if (toast.severity === 'celebrate') {
      audio.playCelebration()
    } else {
      audio.playChime()
    }

    set((s) => ({
      toasts: [newToast, ...s.toasts].slice(0, 4),
    }))

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      get().dismissToast(id)
    }, 4500)
  },

  dismissToast: (id) => {
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    }))
  },

  inspectEmployee: (id) => {
    if (id) audio.playClick()
    set({ inspectedEmployeeId: id })
  },

  setMascotTip: (tip) => set({ mascotTip: tip }),

  openLaptop: () => {
    audio.playWhoosh()
    setTimeout(() => {
      audio.playBoot()
    }, 200)
    set({ focus: 'laptop' })
  },

  closeLaptop: () => {
    audio.playWhoosh()
    set({ focus: 'world' })
  },
}))
