/**
 * CORPORATE HELL™ — Floating Employees Roster Panel.
 *
 * Right floating panel displaying real-time employee status cards,
 * avatars, morale/stress vitals, activity badges, search, and quick inspector actions.
 */
import { useState, useMemo } from 'react'
import {
  Briefcase,
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Award,
  TrendingUp,
  UserX,
  Coffee,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { useGameStore } from '../../state/gameStore'
import type { Employee } from '../../game/models/types'

export function FloatingEmployeesPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const state = useGameStore((s) => s.state)
  const selectedEmployeeId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const setDossierOpen = useGameStore((s) => s.setDossierOpen)
  const dispatch = useGameStore((s) => s.dispatch)

  if (!state) return null

  const activeEmployees = useMemo(
    () => state.employeeOrder.map((id) => state.employees[id]).filter((e): e is Employee => !!e && e.active),
    [state.employeeOrder, state.employees],
  )

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return activeEmployees
    const q = searchQuery.toLowerCase()
    return activeEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    )
  }, [activeEmployees, searchQuery])

  // Helper to determine status badge label and color
  const getStatusBadge = (emp: Employee) => {
    if (emp.stress > 70) {
      return { label: 'Stressed', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-500' }
    }
    if (emp.action === 'meeting') {
      return { label: 'In Meeting', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' }
    }
    if (emp.action === 'coffee') {
      return { label: 'At Pantry', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' }
    }
    if (emp.action === 'break') {
      return { label: 'On Break', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' }
    }
    if (emp.id === 'emp_bianca') {
      return { label: 'At Printer', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' }
    }
    return { label: 'Working', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' }
  }

  return (
    <div className="w-80 rounded-2xl bg-ink-950/90 p-4 text-paper-50 shadow-2xl backdrop-blur-xl border border-ink-700/60 transition-all select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ink-800">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-corp-400" />
          <span className="text-xs font-black tracking-wider text-paper-100 uppercase font-display">
            EMPLOYEES ({activeEmployees.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded p-1 text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3 space-y-3 animate-slide-up">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-ink-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-xl border border-ink-700/80 bg-ink-900/90 py-1.5 pl-8 pr-3 text-xs text-paper-100 placeholder:text-ink-500 focus:border-corp-500 focus:outline-none focus:ring-1 focus:ring-corp-500/50"
            />
          </div>

          {/* Employee Cards List */}
          <div className="max-h-[calc(100vh-270px)] space-y-2 overflow-y-auto pr-1">
            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmployeeId === emp.id
              const status = getStatusBadge(emp)

              return (
                <div
                  key={emp.id}
                  onClick={() => selectEmployee(emp.id)}
                  className={`group relative flex items-center justify-between rounded-xl p-2.5 cursor-pointer border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-500/10'
                      : 'border-ink-800/80 bg-ink-900/60 hover:border-ink-700 hover:bg-ink-850/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Stylized Illustrated Avatar */}
                    <div
                      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 shadow-sm"
                      style={{ backgroundColor: emp.visual.outfit }}
                    >
                      {/* Hair overlay */}
                      <div
                        className="absolute top-0 h-4 w-7 rounded-t-full"
                        style={{ backgroundColor: emp.visual.hair }}
                      />
                      {/* Face skin */}
                      <div
                        className="relative z-10 h-5 w-5 rounded-full"
                        style={{ backgroundColor: emp.visual.skin }}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-paper-100 group-hover:text-corp-300 transition-colors">
                        {emp.name}
                      </div>
                      <div className="truncate text-[10.5px] text-ink-400 capitalize">
                        {emp.role} • {emp.department}
                      </div>

                      {/* Vitals Pills */}
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1 font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {Math.round(emp.morale)}%
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          {Math.round(emp.stress)}%
                        </span>
                        {/* Status badge */}
                        <span
                          className={`flex items-center gap-1 rounded-full px-1.5 py-0.2 border text-[9.5px] font-bold ${status.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Context Actions Menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === emp.id ? null : emp.id)
                      }}
                      className="rounded p-1 text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition"
                      title="Quick Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {/* Popover Menu */}
                    {activeMenuId === emp.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-ink-700 bg-ink-900 p-1.5 shadow-2xl animate-slide-up"
                      >
                        <button
                          onClick={() => {
                            selectEmployee(emp.id)
                            setDossierOpen(true)
                            setActiveMenuId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-paper-200 hover:bg-ink-800 transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-corp-400" />
                          <span>Inspect Dossier</span>
                        </button>
                        <button
                          onClick={() => {
                            dispatch({ type: 'bonus', employeeId: emp.id })
                            setActiveMenuId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-paper-200 hover:bg-ink-800 transition"
                        >
                          <Award className="h-3.5 w-3.5 text-acid-400" />
                          <span>Award $1,000 Bonus</span>
                        </button>
                        <button
                          onClick={() => {
                            dispatch({ type: 'promote', employeeId: emp.id })
                            setActiveMenuId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-paper-200 hover:bg-ink-800 transition"
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-warn-400" />
                          <span>Promote</span>
                        </button>
                        <button
                          onClick={() => {
                            dispatch({ type: 'reprimand', employeeId: emp.id })
                            setActiveMenuId(null)
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-alert-400 hover:bg-ink-800 transition"
                        >
                          <AlertCircle className="h-3.5 w-3.5 text-alert-400" />
                          <span>Reprimand</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
