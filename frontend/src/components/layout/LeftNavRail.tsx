/**
 * CORPORATE HELL™ — Left Navigation Rail.
 *
 * Primary navigation matching the reference layout:
 * Compact vertical strip with icon on top, label below, and notification badges.
 */
import { useGameStore, type NavTab } from '../../state/gameStore'
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  AlertOctagon,
  Mail,
  Target,
  FlaskConical,
} from 'lucide-react'

interface NavItem {
  id: NavTab
  label: string
  icon: any
  badge?: (state: any) => number | string | null
}

const NAV_ITEMS: NavItem[] = [
  { id: 'office', label: 'Office', icon: Building2 },
  {
    id: 'employees',
    label: 'Employees',
    icon: Users,
    badge: (s) => (s ? Object.values(s.employees).filter((e: any) => e.active).length : null),
  },
  { id: 'departments', label: 'Departments', icon: Briefcase },
  { id: 'finance', label: 'Finance', icon: TrendingUp },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertOctagon,
    badge: (s) => {
      const open = s?.incidents.filter((i: any) => !i.resolved).length || 0
      return open > 0 ? open : null
    },
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Mail,
    badge: (s) => {
      const unread = s?.emails.filter((e: any) => !e.read).length || 0
      return unread > 0 ? unread : null
    },
  },
  {
    id: 'campaign',
    label: 'Campaign',
    icon: Target,
    badge: (s) => (s?.mode === 'campaign' ? 'OBJ' : null),
  },
  { id: 'lab', label: 'Sim Lab', icon: FlaskConical },
]

export function LeftNavRail() {
  const activeTab = useGameStore((s) => s.activeTab)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const state = useGameStore((s) => s.state)

  return (
    <nav className="relative z-20 flex w-[68px] shrink-0 flex-col items-center border-r border-ink-800/80 bg-ink-950/95 py-3 select-none">
      <div className="flex flex-1 flex-col gap-2 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const badgeValue = item.badge ? item.badge(state) : null

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-ink-400 hover:bg-ink-900 hover:text-paper-100'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-ink-400 group-hover:text-blue-400'
                  }`}
                />

                {/* Notification Badge */}
                {badgeValue !== null && (
                  <span
                    className={`absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-black leading-none ${
                      item.id === 'incidents'
                        ? 'bg-red-500 text-white animate-pulse'
                        : item.id === 'inbox'
                          ? 'bg-red-500 text-white'
                          : 'bg-ink-800 text-paper-200'
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </div>

              <span className="mt-1 text-[9.5px] font-bold tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
