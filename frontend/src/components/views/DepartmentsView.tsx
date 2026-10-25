/**
 * CORPORATE HELL™ — Departments View.
 *
 * Detailed departmental breakdown: headcount, payroll, output velocity,
 * active client projects, and cross-functional synergy metrics.
 */
import { useGameStore } from '../../state/gameStore'
import { DEPARTMENT_LABELS, type Department } from '../../game/models/types'
import { Briefcase, Code, DollarSign, Megaphone, Users, Settings, Award } from 'lucide-react'

const DEPT_ICONS: Record<Department, any> = {
  engineering: Code,
  sales: DollarSign,
  marketing: Megaphone,
  hr: Users,
  operations: Settings,
}

export function DepartmentsView() {
  const employees = useGameStore((s) => s.state?.employees)
  const projects = useGameStore((s) => s.state?.projects || [])
  const selectEmployee = useGameStore((s) => s.selectEmployee)

  if (!employees) return null

  const activeEmployees = Object.values(employees).filter((e) => e.active)

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none">
      <div className="border-b border-ink-800 pb-5">
        <h2 className="font-display text-xl font-bold text-paper-50 uppercase tracking-wide">
          Organizational Matrix
        </h2>
        <p className="text-xs text-ink-400">
          Cross-functional silos, project deliverables, and resource allocation
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((dept) => {
          const Icon = DEPT_ICONS[dept]
          const team = activeEmployees.filter((e) => e.department === dept)
          const deptProjects = projects.filter((p) => p.department === dept)
          const totalPayroll = team.reduce((acc, e) => acc + e.salary, 0)
          const avgMorale =
            team.length > 0
              ? Math.round(team.reduce((acc, e) => acc + e.morale, 0) / team.length)
              : 0

          return (
            <div
              key={dept}
              className="flex flex-col justify-between rounded-2xl border border-ink-800 bg-ink-900/70 p-5 shadow-xl transition hover:border-corp-500/40"
            >
              <div>
                {/* Dept Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-corp-500/15 text-corp-400 border border-corp-500/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-paper-50">
                        {DEPARTMENT_LABELS[dept]}
                      </h3>
                      <span className="text-[11px] text-ink-400">
                        {team.length} staff members
                      </span>
                    </div>
                  </div>
                  <span className="mono text-xs font-semibold text-paper-300">
                    ${totalPayroll}/day
                  </span>
                </div>

                {/* Team Members Chips */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    Assigned Personnel
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {team.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => selectEmployee(emp.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-850 px-2 py-1 text-xs text-paper-200 transition hover:bg-corp-500 hover:text-white"
                      >
                        <span
                          style={{ backgroundColor: emp.visual.outfit }}
                          className="h-2 w-2 rounded-full"
                        />
                        <span>{emp.name.split(' ')[0]}</span>
                      </button>
                    ))}
                    {team.length === 0 && (
                      <span className="text-xs text-ink-500 italic">No assigned staff</span>
                    )}
                  </div>
                </div>

                {/* Active Department Projects */}
                <div className="mt-5 border-t border-ink-800/80 pt-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                    Active Deliverables
                  </span>
                  <div className="mt-2 space-y-2">
                    {deptProjects.map((p) => {
                      const pct = Math.min(100, Math.round((p.pointsDone / p.pointsTotal) * 100))
                      return (
                        <div
                          key={p.id}
                          className="rounded-xl border border-ink-700/80 bg-ink-850 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-paper-100">{p.name}</span>
                            <span className="mono font-bold text-corp-300">{pct}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="h-full bg-corp-400" />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-ink-400">
                            <span>Deadline: Day {p.deadlineDay}</span>
                            <span className="mono font-semibold text-acid-400">
                              +${p.revenueOnDone.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {deptProjects.length === 0 && (
                      <span className="text-xs text-ink-500 italic">
                        No active client contracts
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Metric */}
              <div className="mt-5 border-t border-ink-800/80 pt-3 flex items-center justify-between text-xs text-ink-400">
                <span>Team Morale</span>
                <span className="mono font-bold text-paper-100">{avgMorale}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
