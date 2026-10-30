import { useState } from 'react'
import { useGameStore, type NavTab } from '../../state/gameStore'
import {
  Building2,
  Presentation,
  Users,
  Briefcase,
  DollarSign,
  AlertOctagon,
  Mail,
  Target,
  FlaskConical,
  LayoutGrid,
  GitPullRequest,
  Workflow,
  Cloud,
  Cpu,
  Share2,
  Rocket,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface NavItem {
  id: NavTab
  number?: string
  label: string
  icon: any
  badge?: (state: any) => number | string | null
}

/**
 * Primary 9 Game Sections (matching reference-ui & reference-interface)
 */
const CORE_SECTIONS: NavItem[] = [
  { id: 'office', number: '01', label: 'Office', icon: Building2 },
  {
    id: 'pitch',
    number: '02',
    label: 'Pitch',
    icon: Presentation,
    badge: (s) => (s?.flags?.lastPitchOutcome === 'full' ? null : 'VC'),
  },
  {
    id: 'employees',
    number: '03',
    label: 'Employees',
    icon: Users,
    badge: (s) => (s ? Object.values(s.employees).filter((e: any) => e.active).length : null),
  },
  { id: 'departments', number: '04', label: 'Departments', icon: Briefcase },
  { id: 'finance', number: '05', label: 'Finance', icon: DollarSign },
  {
    id: 'incidents',
    number: '06',
    label: 'Incidents',
    icon: AlertOctagon,
    badge: (s) => {
      const open = s?.incidents?.filter((i: any) => !i.resolved).length || 0
      return open > 0 ? open : null
    },
  },
  {
    id: 'inbox',
    number: '07',
    label: 'Inbox',
    icon: Mail,
    badge: (s) => {
      const unread = s?.emails?.filter((e: any) => !e.read && !e.archived).length || 0
      return unread > 0 ? unread : null
    },
  },
  {
    id: 'campaign',
    number: '08',
    label: 'Campaign',
    icon: Target,
  },
  { id: 'lab', number: '09', label: 'Sim Lab', icon: FlaskConical },
]

/**
 * Secondary Engineering & Ops Systems (preserved V2 systems)
 */
const OPS_SECTIONS: NavItem[] = [
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { id: 'repo', label: 'GitBub', icon: GitPullRequest },
  { id: 'pipeline', label: 'CI/CD', icon: Workflow },
  { id: 'cloud', label: 'AWSome', icon: Cloud },
  { id: 'gpu', label: 'NVIDIOT', icon: Cpu },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'warroom', label: 'War Room', icon: Rocket },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
]

export function LeftNavRail() {
  const activeTab = useGameStore((s) => s.activeTab)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const state = useGameStore((s) => s.state)
  const [showOps, setShowOps] = useState(false)

  return (
    <nav className="relative z-20 flex w-[76px] shrink-0 flex-col items-center justify-between border-r border-[#d4a84f]/25 bg-gradient-to-b from-[#1a1511] via-[#15110e] to-[#120e0b] py-2.5 select-none overflow-hidden shadow-[6px_0_24px_rgba(0,0,0,0.4)]">
      {/* Primary 9 Sections */}
      <div className="flex flex-1 flex-col gap-1.5 w-full px-1.5 overflow-y-auto no-scrollbar">
        {CORE_SECTIONS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const badgeValue = item.badge ? item.badge(state) : null

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] shadow-[0_4px_14px_rgba(212,168,79,0.35)] border border-[#f5e1b5]'
                  : 'text-[#b5a695] hover:bg-[#26201a] hover:text-[#faf7f0] border border-transparent'
              }`}
              title={`${item.number} — ${item.label}`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#181411]' : 'text-[#d4a84f] group-hover:text-[#e5c478]'
                  }`}
                />

                {badgeValue !== null && (
                  <span
                    className={`absolute -right-3.5 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-extrabold leading-none ${
                      item.id === 'incidents' || item.id === 'inbox'
                        ? 'bg-[#c74234] text-white'
                        : isActive
                          ? 'bg-[#181411] text-[#e5c478]'
                          : 'bg-[#352c25] text-[#e5c478] border border-[#d4a84f]/30'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </div>

              <span
                className={`mt-1 text-[9.5px] font-semibold tracking-tight truncate max-w-full ${
                  isActive ? 'text-[#181411] font-bold' : 'text-[#d8cdc0]'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Collapsible Engineering & Ops Drawer */}
        <div className="mt-1 pt-1.5 border-t border-[#d4a84f]/15">
          <button
            onClick={() => setShowOps(!showOps)}
            className="flex w-full items-center justify-center gap-0.5 rounded-lg py-1 text-[8.5px] font-bold uppercase tracking-wider text-[#8e7c6b] hover:text-[#e5c478] transition cursor-pointer"
            title="Toggle Engineering & Ops Tools"
          >
            <span>Ops</span>
            {showOps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showOps && (
            <div className="mt-1 flex flex-col gap-1">
              {OPS_SECTIONS.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-center transition cursor-pointer ${
                      isActive
                        ? 'btn-gold'
                        : 'text-[#9e8e7c] hover:bg-[#26201a] hover:text-[#faf7f0]'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="mt-0.5 text-[8.5px] font-semibold truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
