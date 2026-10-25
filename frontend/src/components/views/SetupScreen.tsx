/**
 * CORPORATE HELL™ — Company Setup & Mode Selection.
 *
 * Customize company name, industry, difficulty, game mode (Sandbox vs Campaign),
 * and starting disaster scenario.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { SCENARIOS } from '../../game/scenarios/presets'
import type { Difficulty, GameMode } from '../../game/models/types'
import { audio } from '../../services/audio'
import { Building2, Dices, ArrowLeft, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'

const RANDOM_NAMES = [
  'SynergyPulse Technologies',
  'OmniDynamic Global Corp',
  'Deliverable Paradigm Inc.',
  'PivotFlow Solutions',
  'Quantum Synergistics Ltd.',
  'Agile Disruption Capital',
]

const INDUSTRIES = [
  'Enterprise SaaS',
  'FinTech Disruption',
  'Autonomous AI Agents',
  'Cloud Infrastructure Consulting',
  'Crypto Web3 Metaverse',
]

export function SetupScreen() {
  const setPhase = useGameStore((s) => s.setPhase)
  const startNewGame = useGameStore((s) => s.startNewGame)

  const [companyName, setCompanyName] = useState('Corporate Hell Inc.')
  const [industry, setIndustry] = useState('Enterprise SaaS')
  const [mode, setMode] = useState<GameMode>('campaign')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [scenarioId, setScenarioId] = useState('standard')

  const handleRandomizeName = () => {
    audio.playClick()
    const next = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
    setCompanyName(next)
  }

  const handleLaunch = () => {
    audio.playCelebration()
    startNewGame({
      seed: Math.floor(Math.random() * 1000000),
      mode,
      companyName,
      industry,
      difficulty,
      scenarioId,
    })
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-y-auto bg-ink-950 p-6 select-none">
      <div className="w-full max-w-2xl rounded-2xl border border-ink-700 bg-ink-900/95 p-8 shadow-2xl backdrop-blur animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-800 pb-5">
          <button
            onClick={() => {
              audio.playClick()
              setPhase('launch')
            }}
            className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-paper-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Title</span>
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-corp-400" />
            <h2 className="font-display text-lg font-bold text-paper-50 uppercase tracking-wide">
              Incorporation Filing
            </h2>
          </div>
          <div className="w-16" />
        </div>

        <div className="mt-6 space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400">
              Legal Entity Name
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="flex-1 rounded-xl border border-ink-700 bg-ink-850 px-4 py-2.5 text-sm text-paper-50 focus:border-corp-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRandomizeName}
                title="Random corporate name"
                className="flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-800 px-3.5 py-2.5 text-xs text-ink-300 hover:bg-ink-700 hover:text-paper-100 transition"
              >
                <Dices className="h-4 w-4" />
                <span>Random</span>
              </button>
            </div>
          </div>

          {/* Industry Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400">
              Sector / Vertical
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-700 bg-ink-850 px-4 py-2.5 text-sm text-paper-50 focus:border-corp-400 focus:outline-none cursor-pointer"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind} className="bg-ink-900 text-paper-100">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Game Mode: Sandbox vs CEO Campaign */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              Select Game Mode
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  audio.playClick()
                  setMode('campaign')
                }}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                  mode === 'campaign'
                    ? 'border-corp-400 bg-corp-500/15 ring-2 ring-corp-400/30'
                    : 'border-ink-700 bg-ink-850/60 hover:border-ink-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-corp-400" />
                  <span className="text-sm font-bold text-paper-100">CEO Campaign</span>
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  Survive escalating corporate crises, meet quarterly board objectives, and prevent
                  bankruptcy.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick()
                  setMode('sandbox')
                }}
                className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                  mode === 'sandbox'
                    ? 'border-acid-400 bg-acid-400/10 ring-2 ring-acid-400/30'
                    : 'border-ink-700 bg-ink-850/60 hover:border-ink-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-acid-400" />
                  <span className="text-sm font-bold text-paper-100">Sandbox Playground</span>
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  Total autonomous freedom. Trigger events, alter workplace policies, hire/fire, and
                  watch chaos unfold.
                </p>
              </button>
            </div>
          </div>

          {/* Difficulty Tuning */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
              Capitalization Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'easy', label: 'Angel Funded', sub: '$60k starting cash' },
                  { id: 'normal', label: 'Series A', sub: '$32k starting cash' },
                  { id: 'hard', label: 'Bootstrapped', sub: '$16k starting cash' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    audio.playClick()
                    setDifficulty(d.id)
                  }}
                  className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                    difficulty === d.id
                      ? 'border-corp-400 bg-corp-500/15 font-semibold text-paper-50'
                      : 'border-ink-700 bg-ink-850 text-ink-400 hover:border-ink-600'
                  }`}
                >
                  <span className="text-xs font-bold">{d.label}</span>
                  <span className="text-[10px] opacity-75">{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Scenario Preset */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400">
              Starting Scenario
            </label>
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-700 bg-ink-850 px-4 py-2.5 text-sm text-paper-50 focus:border-corp-400 focus:outline-none cursor-pointer"
            >
              {Object.values(SCENARIOS).map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-ink-900 text-paper-100">
                  {sc.name} — {sc.tagline}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Launch Button */}
        <div className="mt-8 border-t border-ink-800 pt-5 flex justify-end">
          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 rounded-xl bg-corp-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-corp-500/25 transition hover:bg-corp-600 active:scale-95"
          >
            <span>Found Corporation & Enter Office</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
