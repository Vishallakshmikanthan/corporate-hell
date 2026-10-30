/**
 * CORPORATE HELL™ — Minimalist World HUD (Section 3.1).
 *
 * Replaces all 17-icon sidebars, bulky headers, and screen-filling panels.
 * World occupies ~90% of screen. Only diegetic chips and minimal corners remain.
 */
import React, { useState } from 'react'
import { Play, Pause, FastForward, Laptop, Phone, Volume2, VolumeX, Sparkles, MapPin, Save, Hammer, Building2, Gavel, Bell } from 'lucide-react'
import { useGameStore } from '../state/gameStore'
import { useUiStore } from '../state/uiStore'
import { PixelBar } from '../ui/pixel/PixelBar'
import { PixelToastContainer } from '../ui/pixel/PixelToast'
import { PixelIdCard } from '../ui/pixel/PixelIdCard'
import { SaveLoadModal } from '../components/modals/SaveLoadModal'
import { OfficeBuilderOverlay } from '../components/modals/OfficeBuilderOverlay'
import { HostileTakeoverModal } from '../components/modals/HostileTakeoverModal'
import { SenateHearingModal } from '../components/modals/SenateHearingModal'
import { GameOverModal, GameOverReason } from '../components/modals/GameOverModal'
import { CHAPTER_DEFINITIONS } from '../game/engine/career'
import { audio } from '../services/audio'

export const WorldHud: React.FC = () => {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const simSpeed = useGameStore((s) => s.simSpeed)
  const setPlaying = useGameStore((s) => s.setPlaying)
  const setSimSpeed = useGameStore((s) => s.setSimSpeed)
  const audioMuted = useGameStore((s) => s.audioMuted)
  const toggleAudioMute = useGameStore((s) => s.toggleAudioMute)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const setPhoneOpen = useGameStore((s) => s.setPhoneOpen)
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen)

  const openLaptop = useUiStore((s) => s.openLaptop)
  const v3Enabled = useUiStore((s) => s.v3Enabled)
  const setV3Enabled = useUiStore((s) => s.setV3Enabled)
  const mascotTip = useUiStore((s) => s.mascotTip)
  const setMascotTip = useUiStore((s) => s.setMascotTip)
  const pushToast = useUiStore((s) => s.pushToast)

  const [showSaveLoad, setShowSaveLoad] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [showTakeovers, setShowTakeovers] = useState(false)
  const [showSenate, setShowSenate] = useState(false)
  const [gameOverReason, setGameOverReason] = useState<GameOverReason | null>(null)

  // Bankruptcy Game-Over Check
  React.useEffect(() => {
    if (state && state.cash < 0 && !gameOverReason) {
      audio.playBuzzer()
      setGameOverReason('bankruptcy')
    }
  }, [state?.cash, gameOverReason])

  const handleRewindChapter = () => {
    if (state) {
      state.cash = 50000
    }
    setGameOverReason(null)
    pushToast({
      title: 'Chapter Rewound!',
      description: 'Emergency angel rescue loan deposited ($50k). Retry chapter objectives!',
      severity: 'celebrate',
    })
  }

  if (!state) return null

  // Company core numbers
  const treasury = Math.round((state.cash || 0) / 1000)
  const allEmployees = Object.values(state.employees || {})
  const morale = allEmployees.length > 0 ? Math.round(allEmployees.reduce((acc, e) => acc + (e.morale || 70), 0) / allEmployees.length) : 75
  const productivity = allEmployees.length > 0 ? Math.round(allEmployees.reduce((acc, e) => acc + (e.productivity || 65), 0) / allEmployees.length) : 65

  // Player Vitals (or founder stats)
  const energy = Math.round(state.playerAvatar?.energy ?? 85)
  const focusVal = Math.round(state.playerAvatar?.focus ?? 75)
  const stressVal = Math.round(state.playerAvatar?.stress ?? 25)

  // Day & Time
  const day = state.day
  const timeStr = `${String(Math.floor(9 + state.tick / 6)).padStart(2, '0')}:${String((state.tick % 6) * 10).padStart(2, '0')}`
  const runwayMonths = Math.max(1, Math.round((state.cash || 50000) / Math.max(1, (state.infra?.monthlyCost || 5000))))

  return (
    <>
      {/* ----------------------------------------------------------- */}
      {/* Toast Alert Queue at Top Center */}
      {/* ----------------------------------------------------------- */}
      <PixelToastContainer />

      {/* ----------------------------------------------------------- */}
      {/* Click-on Employee ID Card if selected */}
      {/* ----------------------------------------------------------- */}
      <PixelIdCard />

      {/* ----------------------------------------------------------- */}
      {/* Main HUD Overlays (Pointer-events-none container) */}
      {/* ----------------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3.5 select-none font-mono">
        {/* --------------------------------------------------------- */}
        {/* TOP BAR: Tiny Corners Only */}
        {/* --------------------------------------------------------- */}
        <div className="flex items-start justify-between w-full">
          {/* Top-Left: Company Name & Career Chapter Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-[#14121c]/90 px-3 py-1.5 border-2 border-[#4b4a5e] shadow-[3px_3px_0px_#14121c]">
            <span className="text-sm">🚀</span>
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-wider text-[#f4ecd8]">
                {state.name || 'Silicon Empire'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#b6e52d] font-bold">
                  {state.career
                    ? `Ch ${CHAPTER_DEFINITIONS[state.career.currentChapter]?.number || 1}: ${CHAPTER_DEFINITIONS[state.career.currentChapter]?.title || 'Bedroom Hacker'}`
                    : `Stage: ${state.stage || 'Pre-Seed'}`}
                </span>
                {state.career && state.career.unlockedChapters.length > 1 && (
                  <select
                    value={state.career.currentChapter}
                    onChange={(e) => dispatch({ type: 'advance_chapter', targetChapter: e.target.value as any })}
                    className="bg-[#14121c] text-[#8fd3ff] text-[9px] border border-[#4b4a5e] px-1 py-0.2 cursor-pointer uppercase font-bold"
                  >
                    {state.career.unlockedChapters.map((ch) => (
                      <option key={ch} value={ch}>
                        Ch {CHAPTER_DEFINITIONS[ch].number}: {CHAPTER_DEFINITIONS[ch].title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Top-Right: Time, Day, Simulation Controls & Disk Slots */}
          <div className="pointer-events-auto flex items-center gap-2 bg-[#14121c]/90 px-3 py-1.5 border-2 border-[#4b4a5e] shadow-[3px_3px_0px_#14121c]">
            <div className="flex items-center gap-1.5 text-xs text-[#f4ecd8] font-bold mr-1">
              <span>Day {day}</span>
              <span className="text-[#8c8aa0]">•</span>
              <span className="text-[#8fd3ff]">{timeStr}</span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setPlaying(!isPlaying)}
              className={`p-1 border border-[#14121c] shadow-[1px_1px_0px_#14121c] ${
                isPlaying ? 'bg-[#b6e52d] text-[#14121c]' : 'bg-[#f2a93b] text-[#14121c]'
              }`}
              title="Spacebar: Play/Pause"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>

            {/* Speeds 1x, 2x, 5x */}
            <div className="flex items-center gap-1">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold border border-[#14121c] shadow-[1px_1px_0px_#14121c] ${
                    simSpeed === speed
                      ? 'bg-[#3e6ec0] text-white'
                      : 'bg-[#2a2838] text-[#ded2b6] hover:bg-[#4b4a5e]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudioMute}
              className="p-1 bg-[#2a2838] text-[#ded2b6] hover:bg-[#4b4a5e] border border-[#14121c] shadow-[1px_1px_0px_#14121c] ml-1"
              title="Toggle Audio"
            >
              {audioMuted ? <VolumeX className="h-3.5 w-3.5 text-[#d9453d]" /> : <Volume2 className="h-3.5 w-3.5 text-[#b6e52d]" />}
            </button>

            {/* Save/Load Slots Button */}
            <button
              onClick={() => setShowSaveLoad(true)}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#2a2838] hover:bg-[#3e6ec0] text-[#f4ecd8] border border-[#14121c] text-[10px] font-bold uppercase ml-1 cursor-pointer shadow-[1px_1px_0px_#14121c]"
              title="Save & Load Disk Storage (3 Slots)"
            >
              <Save className="h-3 w-3 text-[#b6e52d]" />
              <span>Slots</span>
            </button>

            {/* Mode Toggle (V3 Pixel vs Classic) */}
            <button
              onClick={() => setV3Enabled(!v3Enabled)}
              className="px-1.5 py-0.5 bg-[#4b4a5e] hover:bg-[#5c5b70] text-[9px] uppercase border border-[#14121c] text-[#f4ecd8] ml-1"
              title="Toggle V3 Pixel UI / Classic UI"
            >
              v3 UI: ON
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* OPTIONAL MASCOT TIP: "Synergy" from reference/mascot_clawd.jpg */}
        {/* --------------------------------------------------------- */}
        {mascotTip && (
          <div className="pointer-events-auto self-start flex items-end gap-2 bg-[#14121c]/95 p-2 border-2 border-[#b6e52d] shadow-[4px_4px_0px_#14121c] max-w-sm ml-2 animate-slide-up">
            <img
              src="/reference/mascot_clawd.jpg"
              alt="Synergy Mascot"
              className="w-10 h-10 object-contain pixelated shrink-0 border border-[#14121c] bg-[#c58a55]/20"
            />
            <div className="flex flex-col text-[11px] text-[#f4ecd8] overflow-hidden">
              <span className="font-bold text-[#b6e52d] uppercase text-[9px]">
                Synergy the Mascot:
              </span>
              <p className="leading-tight">{mascotTip}</p>
            </div>
            <button
              onClick={() => setMascotTip(null)}
              className="text-[#8c8aa0] hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* BOTTOM HUD: Vitals Left, Prompts Center, Chips Right */}
        {/* --------------------------------------------------------- */}
        <div className="flex items-end justify-between w-full">
          {/* Bottom-Left: Player Vitals (♥ energy, ◆ focus, ! stress) */}
          <div className="pointer-events-auto flex flex-col gap-1.5 bg-[#14121c]/90 p-2.5 border-2 border-[#4b4a5e] shadow-[4px_4px_0px_#14121c] w-52">
            <PixelBar
              value={energy}
              max={100}
              color={energy < 30 ? 'red' : 'green'}
              size="sm"
              label="Energy"
              icon="♥"
              showNumber
            />
            <PixelBar
              value={focusVal}
              max={100}
              color="blue"
              size="sm"
              label="Focus"
              icon="◆"
              showNumber
            />
            <PixelBar
              value={stressVal}
              max={100}
              color={stressVal > 70 ? 'red' : 'amber'}
              size="sm"
              label="Stress"
              icon="!"
              showNumber
            />
          </div>

          {/* Bottom-Center: Big Interaction Prompts */}
          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              onClick={openLaptop}
              className="flex items-center gap-2 bg-[#3e6ec0] hover:bg-[#4d7dd4] active:top-[2px] text-white px-4 py-2 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c,inset_1px_1px_0px_rgba(255,255,255,0.4)] cursor-pointer group"
            >
              <Laptop className="h-4 w-4 text-[#8fd3ff] group-hover:animate-bounce" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs uppercase tracking-wider">
                  [E] Open Laptop
                </span>
                <span className="text-[9px] text-[#8fd3ff]">
                  CorpOS Apps & Kanban
                </span>
              </div>
            </button>

            <button
              onClick={() => setPhoneOpen(!isPhoneOpen)}
              className="flex items-center gap-1.5 bg-[#2a2838] hover:bg-[#3a374b] active:top-[2px] text-[#f4ecd8] px-3 py-2 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c,inset_1px_1px_0px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-[#b6e52d]" />
              <span className="font-bold text-xs uppercase tracking-wider">
                [Tab] Phone
              </span>
            </button>

            <button
              onClick={() => focusRoom('open_plan')}
              className="flex items-center gap-1 bg-[#2a2838] hover:bg-[#3a374b] text-[#ded2b6] px-2.5 py-2 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] text-xs"
              title="Reset Room Focus"
            >
              <MapPin className="h-3.5 w-3.5 text-[#f2a93b]" />
            </button>

            {/* Chapter 4: Office Builder Button */}
            {state.career?.currentChapter === 'scaleup' && (
              <button
                onClick={() => setShowBuilder(true)}
                className="flex items-center gap-1.5 bg-[#f2a93b] hover:bg-[#ffb94d] active:top-[2px] text-[#14121c] px-3 py-2 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] cursor-pointer font-bold text-xs uppercase"
              >
                <Hammer className="h-3.5 w-3.5 text-[#14121c]" />
                <span>Office Builder</span>
              </button>
            )}

            {/* Chapter 5 & 6: Megacorp Hegemony Buttons */}
            {state.career?.currentChapter === 'megacorp' && (
              <>
                {!state.career.ipoBellRung && (
                  <button
                    onClick={() => {
                      audio.playFanfare()
                      if (state.career) state.career.ipoBellRung = true
                      state.cash += 50000000
                      pushToast({
                        title: 'Wall Street IPO Opening Bell Rung!',
                        description: 'Public listing complete! Injected $50M proceeds at $10B market cap!',
                        severity: 'celebrate',
                      })
                    }}
                    className="flex items-center gap-1.5 bg-[#b6e52d] hover:bg-[#cbf443] active:top-[2px] text-[#14121c] px-3 py-2 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] cursor-pointer font-bold text-xs uppercase animate-pulse"
                  >
                    <Bell className="h-3.5 w-3.5 text-[#14121c]" />
                    <span>Ring IPO Bell</span>
                  </button>
                )}

                <button
                  onClick={() => setShowTakeovers(true)}
                  className="flex items-center gap-1.5 bg-[#3e6ec0] hover:bg-[#4d7dd4] active:top-[2px] text-white px-3 py-2 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] cursor-pointer font-bold text-xs uppercase"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#8fd3ff]" />
                  <span>Hostile M&A</span>
                </button>

                <button
                  onClick={() => setShowSenate(true)}
                  className="flex items-center gap-1.5 bg-[#2a2838] hover:bg-[#3a374b] active:top-[2px] text-[#f4ecd8] px-3 py-2 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] cursor-pointer font-bold text-xs uppercase"
                >
                  <Gavel className="h-3.5 w-3.5 text-[#f2a93b]" />
                  <span>Senate Hearing</span>
                </button>
              </>
            )}
          </div>

          {/* Bottom-Right: 3 Essential Metric Chips ($58k, ☺69%, ⚙65%) */}
          <div className="pointer-events-auto flex items-center gap-2 bg-[#14121c]/90 px-3 py-2 border-2 border-[#4b4a5e] shadow-[4px_4px_0px_#14121c]">
            {/* Treasury */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#4b4a5e]">
              <span className="text-[#b6e52d] font-bold text-sm">$</span>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs text-[#b6e52d]">
                  ${treasury}k
                </span>
                <span className="text-[8px] text-[#8c8aa0] uppercase">
                  Runway {runwayMonths}m
                </span>
              </div>
            </div>

            {/* Morale */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#4b4a5e]">
              <span className="text-sm">☺</span>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs text-[#8fd3ff]">
                  {morale}%
                </span>
                <span className="text-[8px] text-[#8c8aa0] uppercase">
                  Morale
                </span>
              </div>
            </div>

            {/* Productivity */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚙</span>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xs text-[#f2a93b]">
                  {productivity}%
                </span>
                <span className="text-[8px] text-[#8c8aa0] uppercase">
                  Output
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Slot Save / Load Game Modal */}
      {showSaveLoad && <SaveLoadModal onClose={() => setShowSaveLoad(false)} />}

      {/* Office Builder Mode Modal (Chapter 4) */}
      {showBuilder && <OfficeBuilderOverlay onClose={() => setShowBuilder(false)} />}

      {/* Hostile M&A Takeovers Modal (Chapter 5) */}
      {showTakeovers && <HostileTakeoverModal onClose={() => setShowTakeovers(false)} />}

      {/* Senate Antitrust Inquiry Modal (Chapter 5) */}
      {showSenate && <SenateHearingModal onClose={() => setShowSenate(false)} />}

      {/* Satirical TechCrunch Obituary & Game Over Modal */}
      {gameOverReason && (
        <GameOverModal
          reason={gameOverReason}
          onRewindChapter={handleRewindChapter}
          onOpenSaveSlots={() => {
            setGameOverReason(null)
            setShowSaveLoad(true)
          }}
        />
      )}
    </>
  )
}
