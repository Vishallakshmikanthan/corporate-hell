/**
 * CORPORATE HELL™ — Parody Smartphone Overlay ("iSynergy Pro").
 *
 * Toggled via 'Tab' key or header button. Provides quick access to Slackk,
 * GitBub, AWSome Cloud, Chirper, Tickets, and Calendar on the go!
 */
import { useGameStore, type PhoneApp } from '../../state/gameStore'
import {
  MessageSquare,
  GitBranch,
  Cloud,
  Layers,
  Calendar,
  X,
  BatteryMedium,
  Wifi,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react'

export function PhoneOverlay() {
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen)
  const setPhoneOpen = useGameStore((s) => s.setPhoneOpen)
  const activeApp = useGameStore((s) => s.activePhoneApp)
  const setActiveApp = useGameStore((s) => s.setActivePhoneApp)
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  if (!isPhoneOpen || !state) return null

  const avatar = state.playerAvatar
  const sprint = state.sprint
  const myTicket = state.tickets.find((t) => t.id === avatar?.currentTicketId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm animate-fade-in">
      {/* Smartphone Frame */}
      <div className="relative flex h-[620px] w-[340px] flex-col overflow-hidden rounded-[42px] border-[6px] border-ink-700 bg-ink-950 shadow-2xl ring-1 ring-ink-600/50">
        {/* Dynamic Island / Notch */}
        <div className="relative flex h-8 w-full items-center justify-between px-6 pt-2 text-[11px] font-mono text-ink-300">
          <span>09:42</span>
          <div className="h-4 w-20 rounded-full bg-black shadow-inner" />
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3" />
            <BatteryMedium className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Close Button Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-ink-800/80">
          <span className="font-bold text-xs text-paper-200">iSynergy 16 Pro</span>
          <button
            onClick={() => setPhoneOpen(false)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-ink-400 hover:text-paper-100 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* App Content Window */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          {activeApp === 'slackk' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-ink-800 pb-2">
                <span className="font-bold text-paper-100">#general-announcements</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="rounded-xl bg-ink-900 p-2.5">
                  <strong className="text-paper-100">Deborah Overbyte:</strong>
                  <p className="text-ink-300 mt-0.5">Friendly reminder that synergy alignment begins at 9:00 AM sharp.</p>
                </div>
                <div className="rounded-xl bg-ink-900 p-2.5">
                  <strong className="text-paper-100">Chad Sterling:</strong>
                  <p className="text-ink-300 mt-0.5">Who spilled almond milk on the server room rack?</p>
                </div>
                <div className="rounded-xl bg-ink-900 p-2.5">
                  <strong className="text-paper-100">Gary Chen:</strong>
                  <p className="text-ink-300 mt-0.5">staging database lock released. PR #104 ready.</p>
                </div>
              </div>
            </div>
          )}

          {activeApp === 'tickets' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="font-bold text-paper-100">My Active Ticket</span>
                <span className="font-mono text-blue-400 text-[10px]">Sprint #{sprint?.number || 1}</span>
              </div>

              {myTicket ? (
                <div className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
                  <span className="rounded bg-blue-500/20 text-blue-400 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    {myTicket.kind}
                  </span>
                  <h4 className="mt-2 font-bold text-paper-100">{myTicket.title}</h4>
                  <div className="mt-2 text-ink-400 text-[11px]">
                    Complexity: {myTicket.complexity} story points
                  </div>

                  <button
                    onClick={() => {
                      setPhoneOpen(false)
                      setActiveTab('kanban')
                    }}
                    className="mt-4 w-full rounded-xl bg-blue-600 py-2 font-bold text-white shadow-md text-xs"
                  >
                    Open Kanban Board
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-ink-400">
                  <p>No ticket currently picked.</p>
                  <button
                    onClick={() => {
                      setPhoneOpen(false)
                      setActiveTab('kanban')
                    }}
                    className="mt-3 rounded-lg bg-ink-800 border border-ink-700 px-3 py-1.5 text-paper-200"
                  >
                    Browse Backlog
                  </button>
                </div>
              )}
            </div>
          )}

          {activeApp === 'gitbub' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="font-bold text-paper-100">GitBub Mobile</span>
                <span className="text-emerald-400 font-mono text-[10px]">Main: {state.repo.mainHealth}%</span>
              </div>
              <div className="text-[11px] text-ink-300">
                Open PRs: <strong className="text-paper-100">{state.prs.length}</strong>
              </div>
              <div className="space-y-2">
                {state.prs.slice(0, 3).map((pr) => (
                  <div key={pr.id} className="rounded-xl border border-ink-800 bg-ink-900 p-2.5">
                    <div className="font-bold text-paper-100 truncate">{pr.title}</div>
                    <div className="mt-1 flex justify-between text-[10px] text-ink-400 font-mono">
                      <span>{pr.branch}</span>
                      <span className="text-purple-400">{pr.state}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setPhoneOpen(false)
                  setActiveTab('repo')
                }}
                className="w-full rounded-xl bg-purple-600 py-2 font-bold text-white text-xs mt-2"
              >
                Go to Repository
              </button>
            </div>
          )}

          {activeApp === 'awsome' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="font-bold text-paper-100">AWSome Mobile</span>
                <span className="text-emerald-400 font-mono text-[10px]">{state.uptime.toFixed(1)}% SLA</span>
              </div>
              <div className="rounded-xl border border-ink-800 bg-ink-900 p-3 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Current Traffic:</span>
                  <span className="text-paper-100">{state.infra.currentTraffic} req/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="text-paper-100">{state.infra.capacity} req/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Instances:</span>
                  <span className="text-paper-100">{state.infra.instances} EC2</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setPhoneOpen(false)
                  setActiveTab('cloud')
                }}
                className="w-full rounded-xl bg-orange-600 py-2 font-bold text-white text-xs mt-2"
              >
                Open Cloud Console
              </button>
            </div>
          )}

          {activeApp === 'chirper' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="font-bold text-paper-100">Chirper App</span>
                <span className="text-blue-400 font-mono text-[10px]">
                  {state.socialAccounts.chirper.followers.toLocaleString()} followers
                </span>
              </div>
              <div className="rounded-xl border border-ink-800 bg-ink-900 p-3">
                <div className="text-[11px] text-paper-200">
                  {state.socialPosts[0]?.content || 'Welcome to Corporate Hell!'}
                </div>
              </div>
              <button
                onClick={() => {
                  setPhoneOpen(false)
                  setActiveTab('social')
                }}
                className="w-full rounded-xl bg-blue-600 py-2 font-bold text-white text-xs mt-2"
              >
                Open Social War Room
              </button>
            </div>
          )}

          {activeApp === 'calendar' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                <span className="font-bold text-paper-100">Calendar & Meetings</span>
                <span className="text-ink-400 font-mono text-[10px]">Day {state.day}</span>
              </div>
              <div className="space-y-2">
                {state.meetings.map((m) => (
                  <div key={m.id} className="rounded-xl border border-ink-800 bg-ink-900 p-2.5">
                    <div className="font-bold text-paper-100">{m.title}</div>
                    <div className="text-[10px] text-ink-400 mt-0.5">{m.topic}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Dock App Icons */}
        <div className="flex items-center justify-around border-t border-ink-800/80 bg-ink-900/90 py-3 px-2">
          {[
            { id: 'tickets', icon: Layers, label: 'Jira' },
            { id: 'gitbub', icon: GitBranch, label: 'Git' },
            { id: 'slackk', icon: MessageSquare, label: 'Slack' },
            { id: 'awsome', icon: Cloud, label: 'Cloud' },
            { id: 'calendar', icon: Calendar, label: 'Cal' },
          ].map((app) => {
            const Icon = app.icon
            const isSelected = activeApp === app.id

            return (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id as PhoneApp)}
                className={`flex flex-col items-center gap-1 p-1 rounded-xl transition ${
                  isSelected ? 'text-blue-400 scale-110' : 'text-ink-400 hover:text-paper-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-bold">{app.label}</span>
              </button>
            )
          })}
        </div>

        {/* Home Indicator Bar */}
        <div className="flex justify-center pb-2 pt-1 bg-ink-950">
          <div className="h-1 w-28 rounded-full bg-ink-600" />
        </div>
      </div>
    </div>
  )
}
