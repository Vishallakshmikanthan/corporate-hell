/**
 * CORPORATE HELL™ — Live Activity Log Floating HUD Panel.
 *
 * Real-time event, dialogue, finance, and incident stream matching the reference layout.
 * Includes interactive filtering for All, Events, Dialogue, and Finance.
 */
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Bell, DollarSign, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useGameStore } from '../../state/gameStore'
import { tickToClock } from '../../game/models/types'

type LogFilter = 'all' | 'events' | 'dialogue' | 'finance'

interface LogItem {
  id: string
  time: string
  category: 'event' | 'dialogue' | 'finance' | 'incident'
  name: string
  avatarText?: string
  avatarColor?: string
  message: string
  subtext?: string
  isAlert?: boolean
}

const SEED_LOGS: LogItem[] = [
  {
    id: 'l-1',
    time: '16:15',
    category: 'dialogue',
    name: 'Bianca',
    avatarText: 'BR',
    avatarColor: '#d3f26a',
    message: 'This printer again?!',
    subtext: '(at Printer)',
  },
  {
    id: 'l-2',
    time: '16:14',
    category: 'event',
    name: 'Deborah',
    avatarText: 'DO',
    avatarColor: '#4f6df0',
    message: 'Started a meeting: "Q3 Synergy Alignment"',
  },
  {
    id: 'l-3',
    time: '16:13',
    category: 'finance',
    name: 'System',
    avatarText: '⚙️',
    avatarColor: '#64748b',
    message: 'Cash decreased by $2,400',
    subtext: '(Operational Expenses)',
  },
  {
    id: 'l-4',
    time: '16:12',
    category: 'dialogue',
    name: 'Yuki',
    avatarText: 'YT',
    avatarColor: '#3a3f4b',
    message: 'Thinking... "How to finish this without another meeting..."',
  },
  {
    id: 'l-5',
    time: '16:11',
    category: 'event',
    name: 'Marcus',
    avatarText: 'MV',
    avatarColor: '#21242b',
    message: 'Sent an email to the executive team',
  },
  {
    id: 'l-6',
    time: '16:10',
    category: 'incident',
    name: 'Incident',
    avatarText: '⚠️',
    avatarColor: '#ef4444',
    message: 'The Coffee Machine Uprising has begun!',
    subtext: '(Severity 3)',
    isAlert: true,
  },
  {
    id: 'l-7',
    time: '16:08',
    category: 'dialogue',
    name: 'Priya',
    avatarText: 'PN',
    avatarColor: '#b8e04a',
    message: 'Grabbed a coffee',
    subtext: '(+10 Energy)',
  },
  {
    id: 'l-8',
    time: '16:07',
    category: 'event',
    name: 'Kevin',
    avatarText: 'KB',
    avatarColor: '#97c62e',
    message: 'Almost done...',
    subtext: '(Project Chimera 78%)',
  },
  {
    id: 'l-9',
    time: '16:06',
    category: 'dialogue',
    name: 'Sandra',
    avatarText: 'SK',
    avatarColor: '#e25848',
    message: '"This KPI is fake."',
    subtext: '(Morale -5)',
  },
  {
    id: 'l-10',
    time: '16:05',
    category: 'finance',
    name: 'System',
    avatarText: '⚙️',
    avatarColor: '#64748b',
    message: 'Investor confidence decreased to 67%',
  },
]

export function LiveActivityLog() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [filter, setFilter] = useState<LogFilter>('all')

  const state = useGameStore((s) => s.state)

  // Merge live simulation events with seed activity log
  const items = useMemo(() => {
    if (!state) return SEED_LOGS

    const liveItems: LogItem[] = []

    // Live incidents
    state.incidents.forEach((inc) => {
      liveItems.push({
        id: `inc-${inc.id}`,
        time: tickToClock(state.tick),
        category: 'incident',
        name: 'Incident',
        avatarText: '⚠️',
        avatarColor: '#ef4444',
        message: inc.title,
        subtext: `(Severity ${inc.severity})`,
        isAlert: true,
      })
    })

    // Recent events from state.eventLog
    state.eventLog.slice(0, 8).forEach((evt) => {
      liveItems.push({
        id: evt.uid,
        time: tickToClock(evt.tick),
        category: evt.category === 'finance' ? 'finance' : evt.severity >= 3 ? 'incident' : 'event',
        name: evt.title,
        avatarText: evt.severity >= 3 ? '⚠️' : '📢',
        avatarColor: evt.severity >= 3 ? '#ef4444' : '#3b82f6',
        message: evt.description,
        isAlert: evt.severity >= 3,
      })
    })

    // Combine with seed logs, avoiding duplicates
    const combined = [...liveItems, ...SEED_LOGS]
    const seen = new Set<string>()
    return combined.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [state])

  // Filter items
  const filteredItems = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'events') return items.filter((i) => i.category === 'event' || i.category === 'incident')
    if (filter === 'dialogue') return items.filter((i) => i.category === 'dialogue')
    if (filter === 'finance') return items.filter((i) => i.category === 'finance')
    return items
  }, [items, filter])

  return (
    <div className="w-[380px] rounded-2xl bg-ink-950/90 p-4 text-paper-50 shadow-2xl backdrop-blur-xl border border-ink-700/60 transition-all select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ink-800">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-xs font-black tracking-wider text-paper-100 uppercase font-display">
            LIVE ACTIVITY LOG
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-3 space-y-3 animate-slide-up">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-xl bg-ink-900/90 p-1 border border-ink-800 text-[11px] font-bold">
            {(['all', 'events', 'dialogue', 'finance'] as const).map((cat) => {
              const isActive = filter === cat
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`flex-1 rounded-lg py-1 capitalize transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-ink-400 hover:bg-ink-800 hover:text-paper-100'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Activity Scroll List */}
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-2.5 rounded-xl border p-2 transition ${
                  item.isAlert
                    ? 'border-red-500/40 bg-red-950/20 text-red-200'
                    : 'border-ink-800/80 bg-ink-900/50 hover:bg-ink-850/60 text-paper-200'
                }`}
              >
                {/* Timestamp */}
                <span className="mono text-[10.5px] text-ink-500 font-semibold shrink-0 pt-0.5">
                  {item.time}
                </span>

                {/* Avatar Icon */}
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-ink-950 shadow-sm"
                  style={{ backgroundColor: item.avatarColor || '#38bdf8' }}
                >
                  {item.avatarText}
                </div>

                {/* Message Body */}
                <div className="flex-1 text-[11.5px] leading-tight">
                  <span className={`font-bold ${item.isAlert ? 'text-red-400' : 'text-paper-100'} mr-1.5`}>
                    {item.name}
                  </span>
                  <span className={item.isAlert ? 'text-red-300 font-semibold' : 'text-ink-300'}>
                    {item.message}
                  </span>
                  {item.subtext && (
                    <span className="ml-1 text-[10.5px] text-ink-500 font-medium">
                      {item.subtext}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
