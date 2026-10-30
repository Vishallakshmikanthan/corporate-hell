/**
 * CORPORATE HELL™ — CorpOS Kanban App (Section 6).
 *
 * Corkboard design with colorful sticky notes, chunky sprint progress bar,
 * quick assignment to teammates, WIP limit indicator, and Nerd Mode details drawer.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Ticket, TicketState, TicketKind } from '../../game/models/types'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { Plus, UserPlus, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { audio } from '../../services/audio'

export const KanbanApp: React.FC = () => {
  const sprint = useGameStore((s) => s.state?.sprint)
  const tickets = useGameStore((s) => s.state?.tickets || [])
  const employees = useGameStore((s) => s.state?.employees || {})
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const dispatch = useGameStore((s) => s.dispatch)
  const nerdMode = useUiStore((s) => s.nerdMode)

  const [activeLaneTab, setActiveLaneTab] = useState<'main' | 'all'>('main')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null)

  // Color mapping for sticky notes
  const stickyColor = (kind: TicketKind) => {
    switch (kind) {
      case 'bug':
        return 'bg-[#d9453d] text-white border-[#8b231d]'
      case 'feature':
        return 'bg-[#3e6ec0] text-white border-[#274782]'
      case 'design':
        return 'bg-[#8b5cf6] text-white border-[#5b2db8]'
      case 'infra':
        return 'bg-[#b6e52d] text-[#14121c] border-[#7a9c17]'
      case 'chore':
      default:
        return 'bg-[#f2a93b] text-[#14121c] border-[#b87618]'
    }
  }

  // Move ticket action
  const handleMoveTicket = (ticketId: string, nextState: TicketState) => {
    audio.playStamp()
    dispatch({
      type: 'pick_ticket',
      ticketId,
    })
  }

  // Assign ticket to teammate
  const handleAssign = (ticketId: string, employeeId: string) => {
    audio.playStamp()
    dispatch({
      type: 'pick_ticket',
      ticketId,
      assigneeId: employeeId,
    })
    setAssigningTicketId(null)
  }

  // Lanes
  const todoTickets = tickets.filter((t) => t.state === 'todo' || t.state === 'backlog')
  const doingTickets = tickets.filter((t) => t.state === 'doing' || t.state === 'review')
  const doneTickets = tickets.filter((t) => t.state === 'done')

  const totalPoints = sprint?.committedPoints || 24
  const donePoints = sprint?.donePoints || 12
  const wipCount = doingTickets.length
  const isWipOverloaded = wipCount >= 5

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Sprint Progress Bar (≤ 5 numbers total!) */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            Sprint #{sprint?.number || 1}
          </span>
          {isWipOverloaded && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-[#d9453d] text-white px-2 py-0.5 border border-[#14121c] animate-pulse">
              <AlertTriangle className="h-3 w-3" /> WIP LIMIT REACHED
            </span>
          )}
        </div>

        {/* Chunky Sprint Progress */}
        <div className="flex items-center gap-2 w-64">
          <span className="text-[10px] text-[#ded2b6] uppercase">Progress:</span>
          <div className="flex-1">
            <PixelBar
              value={donePoints}
              max={Math.max(1, totalPoints)}
              color="lime"
              size="sm"
            />
          </div>
          <span className="text-[10px] font-bold text-[#b6e52d]">
            {donePoints}/{totalPoints} pts
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Corkboard Workspace */}
      {/* ----------------------------------------------------------- */}
      <div className="flex-1 overflow-auto p-3 bg-[#c58a55] border-4 border-[#7a4a2d] shadow-[inset_3px_3px_0px_#ded2b6,inset_-3px_-3px_0px_#5c3722] pixel-scrollbar">
        <div className="grid grid-cols-3 gap-3 min-h-full">
          {/* ---------------- COLUMN 1: TO DO ---------------- */}
          <div className="flex flex-col bg-[#14121c]/30 p-2 border-2 border-[#7a4a2d] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center pb-1.5 mb-2 border-b-2 border-[#7a4a2d] text-white font-bold text-xs uppercase">
              <span>📌 To Do ({todoTickets.length})</span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pixel-scrollbar pr-1">
              {todoTickets.map((ticket) => {
                const assignee = ticket.assigneeId ? employees[ticket.assigneeId] : null
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`
                      relative p-2.5 border-2 shadow-[2px_2px_0px_#14121c]
                      cursor-pointer active:top-[1px] hover:brightness-105 transition-none
                      ${stickyColor(ticket.kind)}
                    `}
                  >
                    {/* Push Pin */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#d9453d] border border-[#14121c] shadow-[1px_1px_0px_rgba(0,0,0,0.6)]" />

                    <div className="flex justify-between items-start gap-1 mt-1 mb-1">
                      <span className="font-bold text-[11px] leading-tight line-clamp-2">
                        {ticket.title}
                      </span>
                      <span className="shrink-0 text-[9px] font-bold px-1 bg-black/30 border border-black/40">
                        {ticket.complexity}p
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-black/20">
                      <span className="uppercase text-[9px] opacity-80">{ticket.kind}</span>
                      {assignee ? (
                        <span className="text-[9px] font-bold truncate max-w-[80px]">
                          👤 {assignee.name.split(' ')[0]}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAssigningTicketId(ticket.id)
                          }}
                          className="px-1.5 py-0.5 bg-black/30 hover:bg-black/50 text-[9px] uppercase border border-black/40 flex items-center gap-0.5"
                        >
                          <UserPlus className="h-2.5 w-2.5" /> Assign
                        </button>
                      )}
                    </div>

                    {/* Quick Move to Doing */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveTicket(ticket.id, 'doing')
                      }}
                      className="mt-1.5 w-full py-1 bg-black/30 hover:bg-black/50 text-[9px] font-bold uppercase flex items-center justify-center gap-1 border border-black/30"
                    >
                      Start Doing <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )
              })}
              {todoTickets.length === 0 && (
                <div className="text-center py-8 text-white/50 text-xs italic">
                  No pending sticky notes!
                </div>
              )}
            </div>
          </div>

          {/* ---------------- COLUMN 2: IN PROGRESS ---------------- */}
          <div className="flex flex-col bg-[#14121c]/30 p-2 border-2 border-[#7a4a2d] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center pb-1.5 mb-2 border-b-2 border-[#7a4a2d] text-white font-bold text-xs uppercase">
              <span>⚡ Doing ({doingTickets.length})</span>
              <span className="text-[10px] text-[#ded2b6]">Max 4 WIP</span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pixel-scrollbar pr-1">
              {doingTickets.map((ticket) => {
                const assignee = ticket.assigneeId ? employees[ticket.assigneeId] : null
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`
                      relative p-2.5 border-2 shadow-[2px_2px_0px_#14121c]
                      cursor-pointer active:top-[1px] hover:brightness-105 transition-none
                      ${stickyColor(ticket.kind)}
                    `}
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#f2a93b] border border-[#14121c]" />

                    <div className="flex justify-between items-start gap-1 mt-1 mb-1">
                      <span className="font-bold text-[11px] leading-tight line-clamp-2">
                        {ticket.title}
                      </span>
                      <span className="shrink-0 text-[9px] font-bold px-1 bg-black/30 border border-black/40">
                        {ticket.complexity}p
                      </span>
                    </div>

                    {/* Progress bar inside card */}
                    <div className="w-full bg-black/30 h-1.5 my-1">
                      <div
                        className="bg-white h-full"
                        style={{ width: `${ticket.progress || 50}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-[9px]">
                        👤 {assignee ? assignee.name.split(' ')[0] : 'Unassigned'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveTicket(ticket.id, 'done')
                        }}
                        className="px-2 py-0.5 bg-black/30 hover:bg-black/50 text-[9px] uppercase border border-black/40 flex items-center gap-1 font-bold"
                      >
                        <CheckCircle2 className="h-3 w-3 text-[#b6e52d]" /> Finish
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ---------------- COLUMN 3: DONE ---------------- */}
          <div className="flex flex-col bg-[#14121c]/30 p-2 border-2 border-[#7a4a2d] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center pb-1.5 mb-2 border-b-2 border-[#7a4a2d] text-white font-bold text-xs uppercase">
              <span>✅ Shipped ({doneTickets.length})</span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] pixel-scrollbar pr-1 opacity-90">
              {doneTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-2 border-2 border-[#14121c] bg-[#2a2838] text-[#8c8aa0] line-through shadow-[1px_1px_0px_#14121c]"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="truncate">{ticket.title}</span>
                    <span className="text-[9px] text-[#b6e52d] font-bold no-underline">
                      +{ticket.complexity}p
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Teammate Assignment Bar at Bottom */}
      {/* ----------------------------------------------------------- */}
      {assigningTicketId && (
        <div className="flex items-center gap-2 p-2 bg-[#2a2838] border-2 border-[#14121c] mt-2 shadow-[2px_2px_0px_#14121c] animate-slide-up">
          <span className="text-xs font-bold text-[#b6e52d] uppercase">
            Click Teammate to Assign:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pixel-scrollbar py-1">
            {employeeOrder.map((empId) => {
              const emp = employees[empId]
              if (!emp || !emp.active) return null
              return (
                <button
                  key={emp.id}
                  onClick={() => handleAssign(assigningTicketId, emp.id)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-[#4b4a5e] hover:bg-[#3e6ec0] text-[#f4ecd8] border border-[#14121c] text-xs font-bold shrink-0 shadow-[1px_1px_0px_#14121c]"
                >
                  <span>👤</span>
                  <span>{emp.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setAssigningTicketId(null)}
            className="text-xs px-2 py-1 bg-[#d9453d] text-white ml-auto"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* Nerd Mode Details Drawer */}
      {/* ----------------------------------------------------------- */}
      {nerdMode && (
        <div className="mt-2 p-2 bg-[#14121c] border-2 border-[#3e6ec0] text-[10px] text-[#ded2b6]">
          <div className="flex justify-between border-b border-[#3e6ec0]/40 pb-1 mb-1 font-bold text-[#8fd3ff]">
            <span>NERD MODE: DETAILED METRICS</span>
            <span>Sprint #{sprint?.number} Raw Telemetry</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>Velocity: {Math.round((donePoints / Math.max(1, totalPoints)) * 100)}%</div>
            <div>Active WIP: {wipCount} / 4</div>
            <div>Tech Debt Delta: +{tickets.reduce((acc, t) => acc + (t.techDebtDelta || 0), 0)}</div>
            <div>Bug Risk Factor: {(sprint?.committedPoints || 0) * 0.04}</div>
          </div>
        </div>
      )}
    </div>
  )
}
