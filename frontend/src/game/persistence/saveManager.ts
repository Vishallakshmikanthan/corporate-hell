/**
 * CORPORATE HELL™ — 3-Slot Save Game & Chapter Checkpoint Manager.
 *
 * Implements:
 * - 3 dedicated persistent save slots in localStorage
 * - Slot metadata preview (Company name, Chapter title, Day count, Cash, Timestamp)
 * - Auto-save on day end and manual quick-save
 * - Chapter checkpoint snapshots allowing branching playthroughs
 */
import type { CompanyState } from '../models/types'

export interface SaveSlotMetadata {
  slotId: 'slot_1' | 'slot_2' | 'slot_3'
  isEmpty: boolean
  companyName: string
  founderName: string
  chapterId: string
  chapterTitle: string
  day: number
  cash: number
  savedAt: string
}

const STORAGE_PREFIX = 'corp_hell_save_'
const CHECKPOINT_PREFIX = 'corp_hell_checkpoint_'

export const saveManager = {
  /**
   * Reads metadata for all 3 save slots without loading full state trees.
   */
  getSlotSummaries(): SaveSlotMetadata[] {
    const slots: ('slot_1' | 'slot_2' | 'slot_3')[] = ['slot_1', 'slot_2', 'slot_3']
    return slots.map((slotId) => {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${slotId}`)
      if (!raw) {
        return {
          slotId,
          isEmpty: true,
          companyName: 'Empty Slot',
          founderName: 'None',
          chapterId: 'bedroom',
          chapterTitle: 'Unused',
          day: 1,
          cash: 0,
          savedAt: '',
        }
      }

      try {
        const parsed = JSON.parse(raw)
        const state: CompanyState = parsed.game || parsed
        return {
          slotId,
          isEmpty: false,
          companyName: state.name || 'Silicon Startup',
          founderName: state.playerAvatar?.name || 'Founder',
          chapterId: state.career?.currentChapter || 'bedroom',
          chapterTitle: state.career?.currentChapter?.toUpperCase() || 'BEDROOM HACKER',
          day: state.day || 1,
          cash: state.cash || 0,
          savedAt: parsed.savedAt || new Date().toLocaleString(),
        }
      } catch (err) {
        console.error(`Failed to parse save slot ${slotId}`, err)
        return {
          slotId,
          isEmpty: true,
          companyName: 'Corrupted Slot',
          founderName: 'None',
          chapterId: 'bedroom',
          chapterTitle: 'Error',
          day: 1,
          cash: 0,
          savedAt: '',
        }
      }
    })
  },

  /**
   * Saves company state to a specific slot.
   */
  saveToSlot(slotId: 'slot_1' | 'slot_2' | 'slot_3', state: CompanyState): boolean {
    try {
      const payload = {
        version: state.stateVersion || 2,
        savedAt: new Date().toLocaleString(),
        game: state,
      }
      localStorage.setItem(`${STORAGE_PREFIX}${slotId}`, JSON.stringify(payload))
      return true
    } catch (err) {
      console.error(`Failed to save to slot ${slotId}`, err)
      return false
    }
  },

  /**
   * Loads state from a specific slot.
   */
  loadFromSlot(slotId: 'slot_1' | 'slot_2' | 'slot_3'): CompanyState | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${slotId}`)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return (parsed.game || parsed) as CompanyState
    } catch (err) {
      console.error(`Failed to load from slot ${slotId}`, err)
      return null
    }
  },

  /**
   * Clears a specific save slot.
   */
  deleteSlot(slotId: 'slot_1' | 'slot_2' | 'slot_3'): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${slotId}`)
  },

  /**
   * Saves a chapter checkpoint snapshot.
   */
  saveCheckpoint(chapterId: string, state: CompanyState): void {
    try {
      const payload = {
        chapterId,
        savedAt: new Date().toLocaleString(),
        game: state,
      }
      localStorage.setItem(`${CHECKPOINT_PREFIX}${chapterId}`, JSON.stringify(payload))
    } catch (err) {
      console.error(`Failed to save checkpoint for ${chapterId}`, err)
    }
  },
}
