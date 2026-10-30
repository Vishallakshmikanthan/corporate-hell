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
  Smartphone,
  HardDrive,
  Laptop as LaptopIcon,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
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
  const setSaveLoadModalOpen = useGameStore((s) => s.setSaveLoadModalOpen)
  const activeTab = useGameStore((s) => s.activeTab)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen)
  const setPhoneOpen = useGameStore((s) => s.setPhoneOpen)
  const openLaptop = useUiStore((s) => s.openLaptop)

  if (!state) return null

  const activeEmployees = Object.values(state.employees).filter((e) => e.active)
  const avgMorale =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((acc, e) => acc + e.morale, 0) / activeEmployees.length)
      : 68
  const avgProductivity =
    activeEmployees.length > 0
      ? Math.round(
          activeEmployees.reduce((acc, e) => acc + e.productivity, 0) / activeEmployees.length,
        )
      : 72

  const currentRoom = focusedRoomId || 'open_plan'
  const unreadEmails = state.emails.filter((e) => !e.read && !e.archived).length
  const openIncidents = state.incidents.filter((i) => !i.resolved).length

  return (
    <header className="relative z-30 flex h-14 w-full items-center justify-between border-b border-[#d4a84f]/25 bg-gradient-to-r from-[#16120e] via-[#1d1813] to-[#16120e] px-4 backdrop-blur-xl select-none shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
      {/* ----------------------------------------------------------------- */}
      {/* 1. Left: Golden Crest, Serif Brand & Company Meta */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-3.5">
        {/* Golden Hexagonal Crest */}
        <button
          onClick={() => setActiveTab('office')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#33291f] to-[#1d1712] border border-[#d4a84f]/50 shadow-[0_0_14px_rgba(212,168,79,0.2)] cursor-pointer transition hover:border-[#e5c478]"
          title="Return to 3D Office Hub"
        >
          <span className="font-serif-title text-base font-extrabold text-[#e5c478]">V</span>
        </button>

        {/* Brand Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-serif-title font-bold text-base tracking-wider">
            <span className="text-[#faf7f0]">CORPORATE</span>
            <span className="text-[#d4a84f]">HELL</span>
            <span className="text-[9px] text-[#b5a695] font-sans font-semibold">™</span>
          </div>
          <span className="text-[10px] font-medium text-[#9e8e7c] tracking-wide">
            Synergy is mandatory. Sanity is optional.
          </span>
        </div>

        {/* Company & Clock Pill */}
        <div className="hidden xl:flex items-center gap-3 rounded-xl bg-[#241e18]/90 border border-[#d4a84f]/20 px-3 py-1.5 ml-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#faf7f0] truncate max-w-[140px]">
              {state.name || 'Vishal Corp'}
            </span>
            <span className="text-[10px] font-medium text-[#b5a695]">
              {state.industry || 'AI Infrastructure'} • Day {state.day} — {tickToClock(state.tick)}
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. Center: Room Navigation Pills & Playback Controls */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2.5">
        {/* Clickable Room Selector Pills */}
        <div className="hidden lg:flex items-center gap-1 rounded-xl bg-[#181410]/95 p-1 border border-[#d4a84f]/20 shadow-inner">
          {ROOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === 'office' && currentRoom === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  focusRoom(item.id)
                  setActiveTab('office')
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'btn-gold shadow-sm'
                    : 'text-[#b5a695] hover:bg-[#2a231c] hover:text-[#faf7f0]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Simulation Playback & Speed Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-[#181410]/95 p-1 border border-[#d4a84f]/25 shadow-inner">
          <button
            onClick={() => setPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Simulation (Space)' : 'Resume Simulation (Space)'}
            className={`flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              isPlaying
                ? 'btn-gold'
                : 'bg-[#2a231c] text-[#d8cdc0] hover:bg-[#352c25]'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
            )}
          </button>

          {([1, 2, 5] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`flex h-7 px-2 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                simSpeed === spd
                  ? 'bg-[#352c25] text-[#e5c478] border border-[#d4a84f]/45 shadow-sm'
                  : 'text-[#9e8e7c] hover:bg-[#26201a] hover:text-[#faf7f0]'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. Right: Executive KPIs, Save/Load, Phone & CEO Profile */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2">
        {/* Treasury Pill */}
        <button
          onClick={() => setActiveTab('finance')}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#221c17]/95 px-3 py-1.5 border border-[#d4a84f]/25 transition hover:border-[#d4a84f]/60"
          title="Open Section 05: Finance & Treasury"
        >
          <div className="flex flex-col items-end leading-tight">
            <div className="flex items-center gap-1">
              <span
                className={`mono text-xs font-bold ${
                  state.cash < 0 ? 'text-[#f08578]' : 'text-[#e5c478]'
                }`}
              >
                ${state.cash.toLocaleString()}
              </span>
              {state.cash < 0 ? (
                <TrendingDown className="h-3 w-3 text-[#f08578]" />
              ) : (
                <TrendingUp className="h-3 w-3 text-[#65b87b]" />
              )}
            </div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#9e8e7c]">
              Treasury
            </span>
          </div>
        </button>

        {/* Morale Pill */}
        <button
          onClick={() => setActiveTab('employees')}
          className="hidden sm:flex cursor-pointer items-center gap-2 rounded-xl bg-[#221c17]/95 px-3 py-1.5 border border-[#d4a84f]/20 transition hover:border-[#d4a84f]/55"
          title="Open Section 03: Employee Interaction"
        >
          <Smile className="h-4 w-4 text-[#65b87b]" />
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="mono text-xs font-bold text-[#faf7f0]">{avgMorale}%</span>
              <div className="w-8 h-1.5 rounded-full bg-[#352c25] overflow-hidden">
                <div
                  className="h-full bg-[#65b87b] transition-all duration-300"
                  style={{ width: `${avgMorale}%` }}
                />
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#9e8e7c]">
              Morale
            </span>
          </div>
        </button>

        {/* Productivity Pill */}
        <button
          onClick={() => setActiveTab('departments')}
          className="hidden md:flex cursor-pointer items-center gap-2 rounded-xl bg-[#221c17]/95 px-3 py-1.5 border border-[#d4a84f]/20 transition hover:border-[#d4a84f]/55"
          title="Open Section 04: Departments Management"
        >
          <BarChart3 className="h-4 w-4 text-[#d4a84f]" />
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="mono text-xs font-bold text-[#faf7f0]">{avgProductivity}%</span>
              <div className="w-8 h-1.5 rounded-full bg-[#352c25] overflow-hidden">
                <div
                  className="h-full bg-[#d4a84f] transition-all duration-300"
                  style={{ width: `${avgProductivity}%` }}
                />
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#9e8e7c]">
              Productivity
            </span>
          </div>
        </button>

        {/* Alerts Quick Bell */}
        <button
          onClick={() => setActiveTab(openIncidents > 0 ? 'incidents' : 'inbox')}
          className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#221c17]/95 text-[#d8cdc0] border border-[#d4a84f]/20 hover:border-[#d4a84f]/60 hover:text-[#e5c478] transition cursor-pointer"
          title={`${openIncidents} Active Incidents · ${unreadEmails} Unread Emails`}
        >
          <Bell className="h-4 w-4" />
          {openIncidents + unreadEmails > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#c74234] px-1 text-[9px] font-bold text-white">
              {openIncidents + unreadEmails}
            </span>
          )}
        </button>

        {/* Save / Load Vault Button */}
        <button
          onClick={() => setSaveLoadModalOpen(true)}
          className="flex h-8 items-center gap-1.5 px-2.5 rounded-xl bg-[#221c17]/95 text-[#d8cdc0] border border-[#d4a84f]/20 hover:border-[#d4a84f]/60 hover:text-[#e5c478] transition cursor-pointer"
          title="Save / Load Game Slots"
        >
          <HardDrive className="h-3.5 w-3.5 text-[#d4a84f]" />
          <span className="hidden xl:inline text-[11px] font-semibold">Save</span>
        </button>

        {/* CorpOS Laptop Toggle */}
        <button
          onClick={openLaptop}
          className="hidden sm:flex h-8 items-center gap-1.5 px-2.5 rounded-xl bg-[#221c17]/95 text-[#d8cdc0] border border-[#d4a84f]/20 hover:border-[#d4a84f]/60 hover:text-[#e5c478] transition cursor-pointer"
          title="Open Executive Laptop OS [E]"
        >
          <LaptopIcon className="h-3.5 w-3.5 text-[#d4a84f]" />
          <span className="hidden 2xl:inline text-[11px] font-semibold">OS</span>
        </button>

        {/* In-Game Phone Trigger */}
        <button
          onClick={() => setPhoneOpen(!isPhoneOpen)}
          className={`flex h-8 items-center gap-1.5 px-2.5 rounded-xl border transition cursor-pointer ${
            isPhoneOpen
              ? 'btn-gold'
              : 'bg-[#221c17]/95 text-[#d8cdc0] border-[#d4a84f]/20 hover:border-[#d4a84f]/60 hover:text-[#e5c478]'
          }`}
          title="Toggle In-Game Smartphone [Tab]"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span className="hidden 2xl:inline text-[11px] font-semibold">Phone</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#221c17]/95 text-[#b5a695] border border-[#d4a84f]/20 hover:border-[#d4a84f]/60 hover:text-[#faf7f0] transition cursor-pointer"
          title="Game Settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
