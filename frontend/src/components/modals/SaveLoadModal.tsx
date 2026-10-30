/**
 * CORPORATE HELL™ — 3-Slot Save / Load Game Modal.
 *
 * Provides retro pixel UI for managing 3 persistent save game slots:
 * - Preview metadata: Company Name, Founder, Chapter Title, Day, Cash, Saved Date
 * - Save, Load, and Clear actions with sound effects
 */
import React, { useState, useEffect } from 'react'
import { saveManager, SaveSlotMetadata } from '../../game/persistence/saveManager'
import { useGameStore } from '../../state/gameStore'
import { audio } from '../../services/audio'
import { Save, Download, Trash2, X, HardDrive, Check } from 'lucide-react'

interface Props {
  onClose: () => void
}

export const SaveLoadModal: React.FC<Props> = ({ onClose }) => {
  const state = useGameStore((s) => s.state)
  const [slots, setSlots] = useState<SaveSlotMetadata[]>([])
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save')
  const [feedback, setFeedback] = useState<string | null>(null)

  const refreshSlots = () => {
    setSlots(saveManager.getSlotSummaries())
  }

  useEffect(() => {
    refreshSlots()
  }, [])

  const handleSave = (slotId: 'slot_1' | 'slot_2' | 'slot_3') => {
    if (!state) return
    audio.playStamp()
    saveManager.saveToSlot(slotId, state)
    setFeedback(`Game saved to ${slotId.toUpperCase()}!`)
    refreshSlots()
    setTimeout(() => setFeedback(null), 2000)
  }

  const handleLoad = (slotId: 'slot_1' | 'slot_2' | 'slot_3') => {
    audio.playBoot()
    const loaded = saveManager.loadFromSlot(slotId)
    if (loaded) {
      useGameStore.getState().loadState(loaded)
      setFeedback(`Loaded ${slotId.toUpperCase()} successfully!`)
      setTimeout(() => {
        onClose()
      }, 600)
    }
  }

  const handleDelete = (slotId: 'slot_1' | 'slot_2' | 'slot_3') => {
    audio.playZap()
    saveManager.deleteSlot(slotId)
    refreshSlots()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans select-none">
      <div className="relative flex flex-col w-full max-w-xl panel-dark border border-[#d4a84f]/40 shadow-2xl p-6 text-[#faf7f0]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4a84f]/25 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-[#d4a84f]" />
            <div>
              <h2 className="font-serif-title font-bold text-base tracking-wide text-[#faf7f0]">
                Executive Save Vault (3 Slots)
              </h2>
              <p className="text-[11px] text-[#b5a695]">
                Persist or restore your full company simulation state
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#27211c] hover:bg-[#c74234] text-[#faf7f0] border border-[#d4a84f]/25 cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher: Save vs Load */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab('save')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'save'
                ? 'btn-gold'
                : 'bg-[#27211c] text-[#d8cdc0] border border-[#d4a84f]/20 hover:border-[#d4a84f]/50'
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Game</span>
          </button>

          <button
            onClick={() => setActiveTab('load')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'load'
                ? 'btn-gold'
                : 'bg-[#27211c] text-[#d8cdc0] border border-[#d4a84f]/20 hover:border-[#d4a84f]/50'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Load Game</span>
          </button>

          {feedback && (
            <span className="ml-auto text-xs font-semibold text-[#e5c478] flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              <span>{feedback}</span>
            </span>
          )}
        </div>

        {/* 3 Save Slots List */}
        <div className="flex flex-col gap-3">
          {slots.map((slot, index) => (
            <div
              key={slot.slotId}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#241e19]/90 border border-[#d4a84f]/25"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase text-[#d4a84f]">
                    SLOT 0{index + 1}
                  </span>
                  <span className="font-semibold text-sm text-[#faf7f0]">
                    {slot.isEmpty ? 'Empty Executive Slot' : slot.companyName}
                  </span>
                </div>

                {!slot.isEmpty && (
                  <div className="flex items-center gap-3 text-xs text-[#b5a695]">
                    <span>{slot.chapterTitle}</span>
                    <span>•</span>
                    <span>Day {slot.day}</span>
                    <span>•</span>
                    <span className="text-[#e5c478] font-semibold">
                      ${slot.cash.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="text-[#8e7c6b]">{slot.savedAt}</span>
                  </div>
                )}
              </div>

              {/* Slot Actions */}
              <div className="flex items-center gap-2">
                {activeTab === 'save' ? (
                  <button
                    onClick={() => handleSave(slot.slotId)}
                    className="btn-gold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer"
                  >
                    {slot.isEmpty ? 'Save Here' : 'Overwrite'}
                  </button>
                ) : (
                  <button
                    disabled={slot.isEmpty}
                    onClick={() => handleLoad(slot.slotId)}
                    className="btn-gold px-3.5 py-1.5 rounded-lg text-xs cursor-pointer disabled:opacity-40"
                  >
                    Load
                  </button>
                )}

                {!slot.isEmpty && (
                  <button
                    onClick={() => handleDelete(slot.slotId)}
                    title="Delete save file"
                    className="p-1.5 rounded-lg bg-[#c74234]/20 hover:bg-[#c74234] text-[#f08578] hover:text-white border border-[#c74234]/40 cursor-pointer transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
