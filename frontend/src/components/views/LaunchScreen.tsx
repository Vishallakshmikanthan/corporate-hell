/**
 * CORPORATE HELL™ — Launch / Title Screen.
 *
 * Cinematic corporate branding reveal, Start Game, Resume Autosave,
 * and quick-select scenario presets.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { SCENARIOS } from '../../game/scenarios/presets'
import { audio } from '../../services/audio'
import { Play, RotateCcw, Flame, Settings as SettingsIcon, Award } from 'lucide-react'

export function LaunchScreen() {
  const setPhase = useGameStore((s) => s.setPhase)
  const resumeLastSave = useGameStore((s) => s.resumeLastSave)
  const startNewGame = useGameStore((s) => s.startNewGame)
  const setSettingsModalOpen = useGameStore((s) => s.setSettingsModalOpen)

  const [hasSave] = useState(() => {
    try {
      return !!localStorage.getItem('corp_hell_save_autosave')
    } catch {
      return false
    }
  })

  const handleStartStandard = () => {
    audio.playClick()
    setPhase('setup')
  }

  const handleQuickPreset = (presetId: string) => {
    audio.playClick()
    startNewGame({
      seed: Math.floor(Math.random() * 100000),
      mode: 'sandbox',
      companyName: 'Corporate Hell Inc.',
      industry: 'Enterprise SaaS',
      difficulty: 'normal',
      scenarioId: presetId,
    })
  }

  const handleResume = () => {
    audio.playClick()
    const ok = resumeLastSave()
    if (!ok) {
      setPhase('setup')
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink-950 px-4 text-paper-50 select-none">
      {/* Background Decorative Tech Grid / Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-ink-800)_0%,_var(--color-ink-950)_75%)] opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f232b_1px,transparent_1px),linear-gradient(to_bottom,#1f232b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />

      {/* Hero Container */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        {/* Satirical Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-corp-500/40 bg-corp-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-corp-300 backdrop-blur">
          <Flame className="h-3.5 w-3.5 text-warn-400" />
          <span>Absurdly Realistic 3D Chaos Simulator</span>
        </div>

        {/* Main Logo */}
        <h1 className="font-display text-5xl font-black tracking-tight sm:text-7xl">
          CORPORATE HELL<span className="align-super text-xl text-acid-400">™</span>
        </h1>

        {/* Tagline */}
        <p className="mt-4 max-w-md text-base text-paper-200/80 sm:text-lg">
          “Synergy is mandatory. Sanity is strictly optional.”
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartStandard}
            className="flex items-center gap-2 rounded-xl bg-corp-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-corp-500/25 transition hover:bg-corp-600 hover:scale-105 active:scale-95"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>New Game</span>
          </button>

          {hasSave && (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-800/80 px-6 py-3.5 text-base font-semibold text-paper-100 backdrop-blur transition hover:bg-ink-700 hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-5 w-5 text-acid-400" />
              <span>Resume Save</span>
            </button>
          )}

          <button
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/60 p-3.5 text-paper-300 transition hover:bg-ink-800 hover:text-white"
            title="Settings"
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Launch Scenarios Presets */}
        <div className="mt-12 w-full">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-warn-400" />
              Quick Launch Disaster Scenarios
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.values(SCENARIOS)
              .filter((s) => s.id !== 'standard')
              .slice(0, 4)
              .map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleQuickPreset(sc.id)}
                  className="flex flex-col items-start rounded-xl border border-ink-700/80 bg-ink-900/70 p-3 text-left transition hover:border-corp-500/50 hover:bg-ink-850 hover:scale-[1.02]"
                >
                  <span className="text-xs font-bold text-paper-100">{sc.name}</span>
                  <span className="text-[11px] text-ink-400 line-clamp-1">{sc.tagline}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Version info */}
        <div className="mt-10 text-[11px] text-ink-500">
          Corporate Hell™ v1.0.0 • Powered by React Three Fiber & NVIDIA GLM-5.3
        </div>
      </div>
    </div>
  )
}
