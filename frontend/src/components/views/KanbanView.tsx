/**
 * CORPORATE HELL™ — Agile Kanban Board View.
 *
 * Implements story point backlog, sprint columns (Backlog, Todo, Doing, Review, QA, Done),
 * ticket assignment, and bug risk indicators.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import type { Ticket, TicketKind, TicketState } from '../../game/models/types'
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Flame,
  Cpu,
  Palette,
  Server,
  Bug,
  GitBranch,
} from 'lucide-react'

const COLUMNS: { id: TicketState; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-ink-700 bg-ink-900/40 text-ink-400' },
  { id: 'todo', label: 'Sprint Todo', color: 'border-blue-900/50 bg-blue-950/20 text-blue-400' },
  { id: 'doing', label: 'In Progress', color: 'border-amber-900/50 bg-amber-950/20 text-amber-400' },
  { id: 'review', label: 'Code Review', color: 'border-purple-900/50 bg-purple-950/20 text-purple-400' },
  { id: 'qa', label: 'Staging QA', color: 'border-cyan-900/50 bg-cyan-950/20 text-cyan-400' },
  { id: 'done', label: 'Done (Merged)', color: 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400' },
]

const KIND_ICONS: Record<TicketKind, any> = {
  feature: Layers,
  bug: Bug,
  chore: Server,
  design: Palette,
  infra: Server,
  ml: Cpu,
}

export function KanbanView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const [filterKind, setFilterKind] = useState<string>('all')

  if (!state) return null

  const tickets = state.tickets || []
  const sprint = state.sprint
  const filteredTickets = filterKind === 'all' ? tickets : tickets.filter((t) => t.kind === filterKind)

  const handlePickTicket = (ticket: Ticket) => {
    dispatch({ type: 'pick_ticket', ticketId: ticket.id })
    dispatch({ type: 'create_branch', ticketId: ticket.id })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header & Sprint Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                Sprint Board: #{sprint?.number || 1}
              </h1>
              <p className="text-xs text-ink-400 mt-0.5">
                {sprint?.goal || 'Deliver committed sprint scope on time.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sprint Metrics Pills */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Committed</div>
            <div className="font-mono text-sm font-bold text-blue-400">{sprint?.committedPoints || 0} pts</div>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Done</div>
            <div className="font-mono text-sm font-bold text-emerald-400">
              {tickets.filter((t) => t.state === 'done').reduce((a, b) => a + b.complexity, 0)} pts
            </div>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3.5 py-1.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Rolling Velocity</div>
            <div className="font-mono text-sm font-bold text-amber-400">{state.velocity || 24} pts/sprint</div>
          </div>

          <button
            onClick={() => setActiveTab('repo')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Open GitBub</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 py-3">
        {['all', 'feature', 'bug', 'design', 'infra', 'ml', 'chore'].map((k) => (
          <button
            key={k}
            onClick={() => setFilterKind(k)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
              filterKind === k
                ? 'bg-ink-800 text-blue-400 border border-blue-500/30'
                : 'text-ink-400 hover:bg-ink-900 hover:text-paper-200'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* 6 Kanban Columns */}
      <div className="flex flex-1 gap-3.5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTickets = filteredTickets.filter((t) => t.state === col.id)
          const colPoints = colTickets.reduce((acc, t) => acc + t.complexity, 0)

          return (
            <div
              key={col.id}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border ${col.color} backdrop-blur-md p-3.5 shadow-xl`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ink-800/80">
                <span className="text-xs font-black tracking-wide uppercase">{col.label}</span>
                <span className="rounded-full bg-ink-800/80 px-2 py-0.5 font-mono text-[11px] font-bold text-paper-200">
                  {colTickets.length} ({colPoints} pts)
                </span>
              </div>

              {/* Cards List */}
              <div className="mt-3 flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                {colTickets.map((ticket) => {
                  const Icon = KIND_ICONS[ticket.kind] || Layers
                  const isDoing = ticket.state === 'doing'

                  return (
                    <div
                      key={ticket.id}
                      className="group relative rounded-xl border border-ink-700/80 bg-ink-850/90 p-3.5 shadow-md hover:border-ink-600 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${
                              ticket.kind === 'bug'
                                ? 'bg-red-500/20 text-red-400'
                                : ticket.kind === 'ml'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : ticket.kind === 'design'
                                    ? 'bg-pink-500/20 text-pink-400'
                                    : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            {ticket.kind}
                          </span>
                        </div>

                        {/* Complexity Badge */}
                        <span className="rounded bg-ink-900 border border-ink-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-paper-300">
                          {ticket.complexity} pts
                        </span>
                      </div>

                      {/* Ticket Title */}
                      <h4 className="mt-2 text-xs font-bold text-paper-100 leading-snug line-clamp-2">
                        {ticket.title}
                      </h4>

                      {/* Progress Bar for Doing */}
                      {isDoing && (
                        <div className="mt-2.5">
                          <div className="flex justify-between text-[10px] text-ink-400 font-mono mb-1">
                            <span>Progress</span>
                            <span>{ticket.progress || 0}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-ink-900 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-300"
                              style={{ width: `${ticket.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer & Actions */}
                      <div className="mt-3 flex items-center justify-between border-t border-ink-800/60 pt-2 text-[10px] text-ink-400">
                        <span className="truncate max-w-[120px]">
                          {ticket.assigneeId ? `@${ticket.assigneeId}` : 'Unassigned'}
                        </span>

                        {ticket.state === 'todo' && (
                          <button
                            onClick={() => handlePickTicket(ticket)}
                            className="flex items-center gap-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold hover:bg-amber-500/30 transition"
                          >
                            <Play className="h-2.5 w-2.5" />
                            <span>Pick Up</span>
                          </button>
                        )}

                        {ticket.state === 'review' && (
                          <button
                            onClick={() => setActiveTab('repo')}
                            className="flex items-center gap-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold hover:bg-purple-500/30 transition"
                          >
                            <span>Review PR</span>
                          </button>
                        )}

                        {ticket.state === 'done' && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Merged</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
