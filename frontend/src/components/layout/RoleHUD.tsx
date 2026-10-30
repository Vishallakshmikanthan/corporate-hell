/**
 * CORPORATE HELL™ — Role HUD & Player Avatar Vitals.
 *
 * Floating in the 3D office viewport. Shows player role badge, energy/focus/stress meters,
 * daily obligations checklist, and proximity interactable prompt ('E').
 */
import { useGameStore } from '../../state/gameStore'
import { ROLE_DEFINITIONS } from '../../game/engine/roles'
import {
  Zap,
  Coffee,
  CheckCircle2,
  Circle,
  AlertCircle,
  Activity,
  Heart,
  Compass,
  Smile,
  ShieldAlert,
} from 'lucide-react'

export function RoleHUD() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const setPhoneOpen = useGameStore((s) => s.setPhoneOpen)

  if (!state) return null

  const avatar = state.playerAvatar
  const role = state.playerRole || 'developer'
  const def = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.developer
  const hasJitters = (avatar?.coffeesToday || 0) > 3

  const handleInteract = () => {
    if (!avatar?.currentInteractable) return
    if (avatar.currentInteractable === 'coffee_machine') {
      dispatch({ type: 'office_break', activity: 'coffee' })
    } else if (avatar.currentInteractable === 'ping_pong_table') {
      dispatch({ type: 'office_break', activity: 'ping_pong' })
    } else if (avatar.currentInteractable === 'kanban_wall') {
      setActiveTab('kanban')
    } else if (avatar.currentInteractable === 'laptop_desk') {
      setActiveTab('repo')
    } else if (avatar.currentInteractable === 'server_rack') {
      setActiveTab('cloud')
    } else if (avatar.currentInteractable === 'gpu_cluster') {
      setActiveTab('gpu')
    } else if (avatar.currentInteractable === 'ceo_desk') {
      setActiveTab('growth')
    }
  }

  return (
    <div className="pointer-events-auto flex flex-col gap-3 max-w-xs animate-slide-up select-none">
      {/* Role Profile & Avatar Vitals Card */}
      <div className="rounded-2xl border border-ink-850/80 bg-ink-950/85 p-3.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-ink-800 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-black uppercase tracking-wider text-paper-100">
                {avatar?.name || 'Alex Vance'}
              </span>
              <span className="rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                {def.title}
              </span>
            </div>
            <p className="text-[10px] text-ink-400 mt-0.5">{def.subtitle}</p>
          </div>

          {/* Coffee Tracker with Jitter Warning */}
          <button
            onClick={() => dispatch({ type: 'office_break', activity: 'coffee' })}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-mono font-bold transition ${
              hasJitters
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-ink-850 text-ink-300 hover:bg-ink-800'
            }`}
            title="Drink Coffee (+30 Energy)"
          >
            <Coffee className="h-3 w-3" />
            <span>{avatar?.coffeesToday || 0}/3</span>
          </button>
        </div>

        {/* Vital Meters (Energy, Focus, Stress) */}
        <div className="mt-3 space-y-2 text-[10px] font-mono">
          <div>
            <div className="flex justify-between text-ink-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>Energy</span>
              </span>
              <span className="text-paper-100">{avatar?.energy || 85}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink-900 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${avatar?.energy || 85}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-ink-400 mb-0.5">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-blue-400" />
                <span>Focus</span>
              </span>
              <span className="text-paper-100">{avatar?.focus || 90}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink-900 overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${avatar?.focus || 90}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-ink-400 mb-0.5">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-red-400" />
                <span>Stress</span>
              </span>
              <span className={(avatar?.stress || 20) > 60 ? 'text-red-400' : 'text-paper-100'}>
                {avatar?.stress || 20}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-ink-900 overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-300"
                style={{ width: `${avatar?.stress || 20}%` }}
              />
            </div>
          </div>
        </div>

        {/* Proximity Interaction Prompt */}
        {avatar?.currentInteractable && (
          <div className="mt-3 rounded-xl border border-blue-500/40 bg-blue-950/40 p-2 text-center animate-pulse">
            <button
              onClick={handleInteract}
              className="text-xs font-bold text-blue-300 hover:text-white flex items-center justify-center gap-1.5 w-full"
            >
              <kbd className="rounded bg-blue-600 px-1.5 py-0.5 font-mono text-[10px] text-white">E</kbd>
              <span>Interact with {avatar.currentInteractable.replace('_', ' ')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Daily Obligations Checklist */}
      <div className="rounded-2xl border border-ink-850/80 bg-ink-950/85 p-3.5 shadow-xl backdrop-blur-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block mb-2">
          Daily Obligations: {def.title}
        </span>
        <div className="space-y-1.5 text-xs text-paper-200">
          {def.dailyObligations.map((obl, i) => (
            <div key={i} className="flex items-center gap-2">
              <Circle className="h-3 w-3 text-ink-500 shrink-0" />
              <span className="text-[11px] leading-snug">{obl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
