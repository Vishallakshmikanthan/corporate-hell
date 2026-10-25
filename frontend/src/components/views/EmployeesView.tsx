/**
 * CORPORATE HELL™ — Employee Roster View.
 *
 * Full searchable and filterable table of all company personnel,
 * showing archetypes, roles, vitals, daily salaries, and action triggers.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { ARCHETYPES } from '../../game/engine/archetypes'
import {
  DEPARTMENT_LABELS,
  ROLE_LABELS,
  type Department,
} from '../../game/models/types'
import { Search, UserPlus, Sparkles, Heart, Activity } from 'lucide-react'

export function EmployeesView() {
  const employees = useGameStore((s) => s.state?.employees)
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const selectedId = useGameStore((s) => s.selectedEmployeeId)
  const dispatch = useGameStore((s) => s.dispatch)

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')

  if (!employees) return null

  const list = employeeOrder
    .map((id) => employees[id])
    .filter((e) => e && e.active)
    .filter((e) => {
      if (deptFilter !== 'all' && e.department !== deptFilter) return false
      if (
        search &&
        !e.name.toLowerCase().includes(search.toLowerCase()) &&
        !ARCHETYPES[e.archetype]?.label.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-paper-50 uppercase tracking-wide">
            Personnel Roster
          </h2>
          <p className="text-xs text-ink-400">
            {list.length} active autonomous employees navigating corporate chaos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-500" />
            <input
              type="text"
              placeholder="Search by name or archetype..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-ink-700 bg-ink-850 pl-9 pr-4 py-2 text-xs text-paper-50 placeholder-ink-500 focus:border-corp-400 focus:outline-none w-64"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2 text-xs text-paper-100 focus:border-corp-400 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          {/* Hire Associate */}
          <button
            onClick={() =>
              dispatch({
                type: 'hire',
                department: (deptFilter === 'all' ? 'engineering' : deptFilter) as Department,
                role: 'junior',
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-corp-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-corp-600 active:scale-95 shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Hire Associate</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/60 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-ink-800 bg-ink-850/80 text-[11px] font-bold uppercase tracking-wider text-ink-400">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department & Role</th>
              <th className="py-3 px-4">Archetype</th>
              <th className="py-3 px-4">Morale</th>
              <th className="py-3 px-4">Stress</th>
              <th className="py-3 px-4">Daily Salary</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800/60 text-xs">
            {list.map((emp) => {
              const isSelected = selectedId === emp.id
              const arch = ARCHETYPES[emp.archetype]

              return (
                <tr
                  key={emp.id}
                  onClick={() => selectEmployee(emp.id)}
                  className={`cursor-pointer transition hover:bg-ink-800/50 ${
                    isSelected ? 'bg-corp-500/10' : ''
                  }`}
                >
                  {/* Name and Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: emp.visual.outfit }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow"
                      >
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-paper-100">{emp.name}</div>
                        <div className="text-[10px] text-ink-400">
                          {emp.thought ? `"${emp.thought}"` : emp.action}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-paper-200">
                      {ROLE_LABELS[emp.role]}
                    </div>
                    <div className="text-[11px] text-ink-400">
                      {DEPARTMENT_LABELS[emp.department]}
                    </div>
                  </td>

                  {/* Archetype */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-corp-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-corp-300 border border-corp-500/30">
                      <Sparkles className="h-3 w-3 text-warn-400" />
                      {arch?.label}
                    </span>
                  </td>

                  {/* Morale */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-3.5 w-3.5 text-corp-400" />
                      <span className="mono font-bold text-paper-100">
                        {Math.round(emp.morale)}%
                      </span>
                    </div>
                  </td>

                  {/* Stress */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-alert-400" />
                      <span className="mono font-bold text-paper-100">
                        {Math.round(emp.stress)}%
                      </span>
                    </div>
                  </td>

                  {/* Salary */}
                  <td className="py-3 px-4 mono font-semibold text-paper-200">
                    ${emp.salary}
                  </td>

                  {/* Inspect CTA */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        selectEmployee(emp.id)
                      }}
                      className="rounded-lg border border-ink-700 bg-ink-800 px-3 py-1 text-xs font-semibold text-paper-200 hover:bg-corp-500 hover:text-white transition"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
