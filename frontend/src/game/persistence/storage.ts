/**
 * CORPORATE HELL™ — Game Data Persistence.
 *
 * Handles versioned save/load to localStorage, export/import JSON data,
 * and state integrity validation.
 */
import type { CompanyState, SaveData } from '../models/types'

import { createInitialTickets, createInitialSprint } from '../engine/tickets'
import { createInitialRepo, createInitialPRs } from '../engine/repo'
import { createInitialPipeline } from '../engine/pipeline'
import { createInitialInfra } from '../engine/infra'
import { createInitialGpuMarket } from '../engine/gpu'
import { createInitialSuggestions } from '../engine/suggestions'
import { createInitialSocialAccounts, createInitialSocialPosts } from '../engine/social'
import { createInitialGrowthFunnel } from '../engine/growth'
import { createInitialAvatar } from '../engine/avatar'

const SAVE_KEY_PREFIX = 'corp_hell_save_'
export const CURRENT_VERSION = 2

export function saveGame(state: CompanyState, slot = 'autosave'): void {
  try {
    const payload: SaveData = {
      version: CURRENT_VERSION,
      savedAt: new Date().toISOString(),
      game: state,
    }
    localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, JSON.stringify(payload))
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err)
  }
}

export function loadGame(slot = 'autosave'): CompanyState | null {
  try {
    const item = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`)
    if (!item) return null
    const parsed = JSON.parse(item) as SaveData
    if (!parsed || !parsed.game) return null
    return migrateSave(parsed)
  } catch (err) {
    console.error('Failed to load game state from localStorage:', err)
    return null
  }
}

export function listSaves(): {
  slot: string
  name: string
  day: number
  mode: string
  savedAt: string
}[] {
  const result: {
    slot: string
    name: string
    day: number
    mode: string
    savedAt: string
  }[] = []

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(SAVE_KEY_PREFIX)) {
        const slot = key.slice(SAVE_KEY_PREFIX.length)
        const item = localStorage.getItem(key)
        if (item) {
          try {
            const data = JSON.parse(item) as SaveData
            if (data?.game) {
              result.push({
                slot,
                name: data.game.name,
                day: data.game.day,
                mode: data.game.mode,
                savedAt: data.savedAt,
              })
            }
          } catch {
            // ignore corrupt entry
          }
        }
      }
    }
  } catch {
    // localStorage may be disabled
  }

  return result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
}

export function deleteSave(slot: string): void {
  try {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`)
  } catch (err) {
    console.error('Failed to delete save slot:', err)
  }
}

export function exportSaveToJson(state: CompanyState): string {
  const payload: SaveData = {
    version: CURRENT_VERSION,
    savedAt: new Date().toISOString(),
    game: state,
  }
  return JSON.stringify(payload, null, 2)
}

export function importSaveFromJson(jsonStr: string): CompanyState {
  const parsed = JSON.parse(jsonStr) as SaveData
  if (!parsed || !parsed.game) {
    throw new Error('Invalid save file structure')
  }
  return migrateSave(parsed)
}

export function migrateSave(data: SaveData): CompanyState {
  const state = data.game
  if (!state.eventQueue) {
    state.eventQueue = []
  }
  if (!state.eventCooldowns) {
    state.eventCooldowns = {}
  }

  // Migrate to Version 2
  if (!state.stateVersion || state.stateVersion < 2) {
    state.playerRole = state.playerRole || 'developer'
    state.playerAvatar = state.playerAvatar || createInitialAvatar(state.playerRole)
    state.stage = state.stage || 'seed'
    state.techDebt = state.techDebt ?? 15
    state.velocity = state.velocity ?? 24
    state.codeQuality = state.codeQuality ?? 78
    state.testCoverage = state.testCoverage ?? 62
    state.uptime = state.uptime ?? 99.8
    state.culture = state.culture ?? 65
    state.tickets = state.tickets || createInitialTickets()
    state.sprint = state.sprint || createInitialSprint(state.day)
    state.repo = state.repo || createInitialRepo()
    state.prs = state.prs || createInitialPRs()
    state.pipeline = state.pipeline || createInitialPipeline()
    state.infra = state.infra || createInitialInfra()
    state.gpuMarket = state.gpuMarket || createInitialGpuMarket()
    state.gpuJobs = state.gpuJobs || []
    state.suggestions = state.suggestions || createInitialSuggestions()
    state.socialAccounts = state.socialAccounts || createInitialSocialAccounts()
    state.socialPosts = state.socialPosts || createInitialSocialPosts()
    state.growth = state.growth || createInitialGrowthFunnel()
    state.stateVersion = 2
  }

  return state
}

