/**
 * CORPORATE HELL™ — AAA Top Command Bar.
 *
 * Visual replica of the reference design:
 * - Brand: CORPORATE HELL™ + "Synergy is mandatory. Sanity is optional."
 * - Company Metadata: Company Name + Industry · Day X · HH:MM
 * - Center-Left Room Navigation Pills: Office, Reception, CEO Office, Conference, Pantry, Server Room
 * - Playback Controls: Pause/Play pill (glowing green indicator), Speed 1x, 2x, 5x
 * - Metrics Pills: Treasury ($ in red/green with sparkline), Morale (% with green smiley), Productivity (% with yellow chart)
 * - Settings modal trigger
 */
import {
  Building2,
  Bell,
  Briefcase,
  Users,
  Coffee,
  Server,
  Play,
  Pause,
  TrendingDown,
  TrendingUp,
  Smile,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useGameStore } from '../../state/gameStore'
import { tickToClock } from '../../game/models/types'

const ROOM_NAV_ITEMS = [
  { id: 'open_plan', label: 'Office', icon: Building2 },
  { id: 'reception', label: 'Reception', icon: Bell },
  { id: 'ceo_office', label: 'CEO Office', icon: Briefcase },
  { id: 'conference', label: 'Conference', icon: Users },
  { id: 'pantry', label: 'Pantry', icon: Coffee },
  { id: 'server_room', label: 'Server Room', icon: Server },
] as const

export function TopCommandBar() {
  const state = useGameStore((s) => s.state)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const simSpeed = useGameStore((s) => s.simSpeed)
  const setPlaying = useGameStore((s) => s.setPlaying)
  const setSimSpeed = useGameStore((s) => s.setSimSpeed)
  const focusedRoomId = useGameStore((s) => s.focusedRoomId)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const setSettingsModalOpen = useGameStore((s) => s.setSettingsModalOpen)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  if (!state) return null

  // Compute live average morale & productivity
  const activeEmployees = Object.values(state.employees).filter((e) => e.active)
  const avgMorale =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((acc, e) => acc + e.morale, 0) / activeEmployees.length)
      : 65
  const avgProductivity =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((acc, e) => acc + e.productivity, 0) / activeEmployees.length)
      : 76

  const currentRoom = focusedRoomId || 'open_plan'

  return (
    <header className="relative z-30 flex h-14 w-full items-center justify-between border-b border-ink-800/80 bg-ink-950/95 px-4 backdrop-blur-xl select-none">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Left: Brand & Company Meta */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-4">
        {/* Logo and Tagline */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-display font-black text-sm tracking-wide text-amber-400">
            <span>CORPORATE HELL</span>
            <span className="text-[10px] text-amber-300">™</span>
          </div>
          <span className="text-[10px] font-medium text-ink-400 tracking-tight">
            Synergy is mandatory. Sanity is optional.
          </span>
        </div>

        {/* Company and Clock Metadata */}
        <div className="hidden lg:flex flex-col border-l border-ink-800 pl-4">
          <span className="text-xs font-bold text-paper-100 truncate max-w-[150px]">
            {state.name || 'HellWorks Inc.'}
          </span>
          <span className="text-[10.5px] font-medium text-ink-400">
            <span className="capitalize">{state.industry || 'Tech'}</span> • Day {state.day} — {tickToClock(state.tick)}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Center: Room Navigation Pills & Playback Controls */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-3">
        {/* Clickable Room Selector Pills */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-ink-900/90 p-1 border border-ink-800/80 shadow-inner">
          {ROOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentRoom === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  focusRoom(item.id)
                  setActiveTab('office')
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-ink-400 hover:bg-ink-800 hover:text-paper-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Simulation Playback & Speed Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-ink-900/90 p-1 border border-ink-800/80 shadow-inner">
          {/* Pause / Resume Button */}
          <button
            onClick={() => setPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulation (Space)' : 'Resume Simulation (Space)'}
            className={`flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg text-xs font-bold transition ${
              isPlaying
                ? 'bg-emerald-500 text-ink-950 shadow-[0_0_10px_rgba(16,185,129,0.35)]'
                : 'bg-ink-800 text-paper-200 hover:bg-ink-750'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Speed Pills: 1x, 2x, 5x */}
          {([1, 2, 5] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`flex h-7 px-2 items-center justify-center rounded-lg text-xs font-bold transition ${
                simSpeed === spd
                  ? 'bg-corp-600 text-white shadow-sm'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-paper-100'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Right: Metrics Pills (Treasury, Morale, Productivity, Settings) */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2.5">
        {/* Treasury Pill */}
        <div
          onClick={() => setActiveTab('finance')}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-ink-900/90 px-3 py-1.5 border border-ink-800/80 transition hover:border-ink-700"
          title="Corporate Treasury Balance"
        >
          <div className="flex items-center gap-1">
            <span
              className={`mono text-xs font-black ${
                state.cash < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              ${state.cash.toLocaleString()}
            </span>
            {state.cash < 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>
          <span className="hidden sm:inline text-[10px] uppercase font-bold text-ink-500">
            Treasury
          </span>
        </div>

        {/* Morale Pill */}
        <div
          className="hidden sm:flex items-center gap-2 rounded-xl bg-ink-900/90 px-3 py-1.5 border border-ink-800/80"
          title={`Average Employee Morale: ${avgMorale}%`}
        >
          <div className="flex items-center gap-1.5">
            <Smile className="h-3.5 w-3.5 text-emerald-400" />
            <span className="mono text-xs font-black text-emerald-400">{avgMorale}%</span>
          </div>
          <div className="w-8 h-1.5 rounded-full bg-ink-800 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${avgMorale}%` }}
            />
          </div>
          <span className="text-[10px] uppercase font-bold text-ink-500">Morale</span>
        </div>

        {/* Productivity Pill */}
        <div
          className="hidden md:flex items-center gap-2 rounded-xl bg-ink-900/90 px-3 py-1.5 border border-ink-800/80"
          title={`Average Department Productivity: ${avgProductivity}%`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
            <span className="mono text-xs font-black text-amber-400">{avgProductivity}%</span>
          </div>
          <div className="w-8 h-1.5 rounded-full bg-ink-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${avgProductivity}%` }}
            />
          </div>
          <span className="text-[10px] uppercase font-bold text-ink-500">Productivity</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-900/90 text-ink-400 border border-ink-800/80 hover:bg-ink-800 hover:text-paper-100 transition"
          title="Game Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
