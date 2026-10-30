/**
 * CORPORATE HELL™ — Section 04: Departments Management.
 *
 * Complete organizational management view:
 * - Left selector rail for Engineering, Marketing, Sales, Operations, and People Ops (HR)
 * - Department Hero Showcase with 4 KPI tiles (Productivity, Headcount, Morale, Active Projects)
 * - 4 interactive sub-tabs: Team, Projects, Budget, and Performance
 * - Recruitment by role, project creation & acceleration, and budget allocation sliders
 */
import { useState, useMemo } from 'react'
import { useGameStore } from '../../state/gameStore'
import {
  DEPARTMENT_LABELS,
  ROLE_LABELS,
  type Department,
  type Employee,
  type Role,
} from '../../game/models/types'
import { audio } from '../../services/audio'
import {
  Code,
  DollarSign,
  Megaphone,
  Users,
  Settings,
  UserPlus,
  Rocket,
  TrendingUp,
  Award,
  Briefcase,
  CheckCircle2,
  Plus,
  Zap,
  Calendar,
  BarChart3,
  Sliders,
} from 'lucide-react'

type DeptSubTab = 'team' | 'projects' | 'budget' | 'performance'

const DEPT_META: Record<
  Department,
  {
    icon: any
    mission: string
    capacity: number
    defaultProjectName: string
    defaultClient: string
    defaultReward: number
  }
> = {
  engineering: {
    icon: Code,
    mission: 'Build, scale, and maintain the core AI product and cloud infrastructure.',
    capacity: 8,
    defaultProjectName: 'Neural Inference Engine v2',
    defaultClient: 'Apex Enterprise Cloud',
    defaultReward: 16000,
  },
  marketing: {
    icon: Megaphone,
    mission: 'Drive brand authority, developer community growth, and inbound demand.',
    capacity: 5,
    defaultProjectName: 'Global Category Launch Campaign',
    defaultClient: 'Internal Growth Board',
    defaultReward: 8500,
  },
  sales: {
    icon: DollarSign,
    mission: 'Close six-figure enterprise contracts and expand annual recurring revenue.',
    capacity: 6,
    defaultProjectName: 'Fortune 500 Outbound Blitz',
    defaultClient: 'Vanguard Financial Group',
    defaultReward: 12500,
  },
  operations: {
    icon: Settings,
    mission: 'Maintain office infrastructure, vendor compliance, and operational velocity.',
    capacity: 5,
    defaultProjectName: 'SOC2 Type II & Vendor Audit',
    defaultClient: 'Enterprise Security Board',
    defaultReward: 7000,
  },
  hr: {
    icon: Users,
    mission: 'Recruit top talent, protect company culture, and prevent burnout attrition.',
    capacity: 4,
    defaultProjectName: 'Executive Talent Pipeline',
    defaultClient: 'Leadership Committee',
    defaultReward: 5500,
  },
}

export function DepartmentsView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [selectedDept, setSelectedDept] = useState<Department>('engineering')
  const [subTab, setSubTab] = useState<DeptSubTab>('team')
  const [newProjName, setNewProjName] = useState('')
  const [newProjClient, setNewProjClient] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!state) return null

  const activeEmployees = useMemo(
    () =>
      state.employeeOrder
        .map((id) => state.employees[id])
        .filter((e): e is Employee => !!e && e.active),
    [state.employeeOrder, state.employees],
  )

  const deptOrder: Department[] = ['engineering', 'marketing', 'sales', 'operations', 'hr']
  const currentMeta = DEPT_META[selectedDept]

  const deptTeam = activeEmployees.filter((e) => e.department === selectedDept)
  const deptProjects = state.projects.filter((p) => p.department === selectedDept)
  const activeDeptProjects = deptProjects.filter((p) => p.status === 'active')

  const avgProd =
    deptTeam.length > 0
      ? Math.round(deptTeam.reduce((a, b) => a + b.productivity, 0) / deptTeam.length)
      : 72
  const avgMorale =
    deptTeam.length > 0
      ? Math.round(deptTeam.reduce((a, b) => a + b.morale, 0) / deptTeam.length)
      : 68
  const avgStress =
    deptTeam.length > 0
      ? Math.round(deptTeam.reduce((a, b) => a + b.stress, 0) / deptTeam.length)
      : 35
  const dailyPayroll = deptTeam.reduce((a, b) => a + b.salary, 0)
  const extraBudget = Number(state.flags[`budget_${selectedDept}`] ?? 800)

  const notify = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleHire = (role: Role) => {
    audio.playClick()
    const res = dispatch({ type: 'hire', department: selectedDept, role })
    if (res.message) notify(res.message)
    else if (res.reason) notify(res.reason)
  }

  const handleLaunchProject = () => {
    audio.playClick()
    const name = newProjName.trim() || currentMeta.defaultProjectName
    const client = newProjClient.trim() || currentMeta.defaultClient
    const res = dispatch({
      type: 'create_project',
      name,
      department: selectedDept,
      clientName: client,
      pointsTotal: 80,
      deadlineDay: state.day + 6,
      revenueOnDone: currentMeta.defaultReward,
    })
    setNewProjName('')
    setNewProjClient('')
    if (res.message) notify(res.message)
  }

  const handleBoostProject = (projectId: string) => {
    audio.playClick()
    const res = dispatch({
      type: 'boost_project',
      projectId,
      cost: 1000,
      pointsGain: 25,
    })
    if (res.message) notify(res.message)
    else if (res.reason) notify(res.reason)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#181410] via-[#14110e] to-[#100d0b] text-[#faf7f0] font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* Top Section Header Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4a84f]/25 bg-[#1b1612]/95 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] font-serif-title font-extrabold text-lg shadow-md">
            04
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
              DEPARTMENTS MANAGEMENT
            </h1>
            <p className="text-xs text-[#b5a695]">
              Manage cross-functional teams, allocate operating budgets, and accelerate deliverables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <div className="flex items-center gap-1.5 rounded-xl bg-[#65b87b]/20 border border-[#65b87b]/40 px-3.5 py-1.5 text-xs font-bold text-[#65b87b] animate-slide-up">
              <CheckCircle2 className="h-4 w-4" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={() => {
              const res = dispatch({
                type: 'schedule_meeting',
                title: `${DEPARTMENT_LABELS[selectedDept]} Alignment Sync`,
                roomId: 'conference',
                durationTicks: 4,
                attendeeIds: deptTeam.map((e) => e.id).slice(0, 5),
              })
              if (res.message) notify(res.message)
              else if (res.reason) notify(res.reason)
            }}
            className="rounded-xl bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/35 px-3.5 py-2 text-xs font-semibold text-[#e5c478] flex items-center gap-1.5 cursor-pointer transition"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Call Dept Standup</span>
          </button>

          <button
            onClick={() => handleHire('specialist')}
            className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Hire to {DEPARTMENT_LABELS[selectedDept]}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main 12-Column Workspace */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-y-auto">
        {/* ================================================================= */}
        {/* LEFT COLUMN (3 cols): Department Selector Cards & Comparison      */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="panel-dark p-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
              Departments (5)
            </div>

            {deptOrder.map((dept) => {
              const Icon = DEPT_META[dept].icon
              const team = activeEmployees.filter((e) => e.department === dept)
              const prod =
                team.length > 0
                  ? Math.round(team.reduce((a, b) => a + b.productivity, 0) / team.length)
                  : 70
              const active = dept === selectedDept

              return (
                <button
                  key={dept}
                  onClick={() => {
                    audio.playClick()
                    setSelectedDept(dept)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all cursor-pointer border ${
                    active
                      ? 'bg-gradient-to-r from-[#dfc075] to-[#c4953d] text-[#181411] border-[#f5e1b5] shadow-lg'
                      : 'bg-[#1b1612]/90 border-[#d4a84f]/15 text-[#faf7f0] hover:border-[#d4a84f]/45'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        active
                          ? 'bg-[#181411]/15 text-[#181411]'
                          : 'bg-[#2a231c] text-[#d4a84f]'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold">{DEPARTMENT_LABELS[dept]}</div>
                      <div
                        className={`text-[10.5px] font-semibold ${
                          active ? 'text-[#27211c]' : 'text-[#b5a695]'
                        }`}
                      >
                        {team.length} Staff • {prod}% Output
                      </div>
                    </div>
                  </div>

                  <span
                    className={`mono text-xs font-extrabold ${
                      active ? 'text-[#181411]' : 'text-[#e5c478]'
                    }`}
                  >
                    {prod}%
                  </span>
                </button>
              )
            })}
          </div>

          {/* Department Output Comparison Chart */}
          <div className="panel-dark p-4 flex-1">
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-[#d4a84f]/20 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
              <BarChart3 className="h-4 w-4 text-[#d4a84f]" />
              <span>Cross-Dept Output Matrix</span>
            </div>
            <div className="space-y-3">
              {deptOrder.map((dept) => {
                const team = activeEmployees.filter((e) => e.department === dept)
                const prod =
                  team.length > 0
                    ? Math.round(team.reduce((a, b) => a + b.productivity, 0) / team.length)
                    : 70
                const morale =
                  team.length > 0
                    ? Math.round(team.reduce((a, b) => a + b.morale, 0) / team.length)
                    : 65
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-[#faf7f0]">
                        {DEPARTMENT_LABELS[dept]}
                      </span>
                      <span className="mono text-[#e5c478]">
                        {prod}% Prod / {morale}% Morale
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#352c25] overflow-hidden flex">
                      <div
                        className="h-full bg-[#d4a84f]"
                        style={{ width: `${prod}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT WORKSPACE (9 cols): Hero Banner, 4 KPIs & 4 Sub-Tabs        */}
        {/* ================================================================= */}
        <div className="lg:col-span-9 flex flex-col gap-4 overflow-y-auto">
          {/* Department Showcase Header Card (matches reference-ui #04) */}
          <div className="panel-dark p-6 relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-md bg-[#d4a84f]/20 border border-[#d4a84f]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e5c478]">
                  Department Command
                </span>
                <h2 className="mt-1.5 font-serif-title text-2xl font-bold text-[#faf7f0]">
                  {DEPARTMENT_LABELS[selectedDept]}
                </h2>
                <p className="mt-1 text-xs text-[#b5a695] max-w-xl">
                  {currentMeta.mission}
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                  Daily Dept Burn (Payroll + Ops)
                </div>
                <div className="mono text-xl font-extrabold text-[#e5c478]">
                  ${(dailyPayroll + extraBudget).toLocaleString()}/day
                </div>
              </div>
            </div>

            {/* 4 Luxury KPI Tiles */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-[#181410]/90 p-3.5 border border-[#d4a84f]/25">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                  Productivity
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="mono text-xl font-extrabold text-[#65b87b]">
                    {avgProd}%
                  </span>
                  <span className="text-[10px] text-[#65b87b]">Optimal</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#181410]/90 p-3.5 border border-[#d4a84f]/25">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                  Employees
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="mono text-xl font-extrabold text-[#faf7f0]">
                    {deptTeam.length}/{currentMeta.capacity}
                  </span>
                  <span className="text-[10px] text-[#b5a695]">Active Seats</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#181410]/90 p-3.5 border border-[#d4a84f]/25">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                  Team Morale
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="mono text-xl font-extrabold text-[#e5c478]">
                    {avgMorale >= 70 ? 'High' : avgMorale >= 45 ? 'Stable' : 'Low'} ({avgMorale}%)
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#181410]/90 p-3.5 border border-[#d4a84f]/25">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                  Active Projects
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="mono text-xl font-extrabold text-[#faf7f0]">
                    {activeDeptProjects.length}
                  </span>
                  <span className="text-[10px] text-[#e5c478]">In Flight</span>
                </div>
              </div>
            </div>

            {/* 4 Sub-Tab Pills (Team | Projects | Budget | Performance) */}
            <div className="mt-5 flex items-center gap-2 border-t border-[#d4a84f]/20 pt-4">
              {(
                [
                  { id: 'team', label: `Team (${deptTeam.length})` },
                  { id: 'projects', label: `Projects (${deptProjects.length})` },
                  { id: 'budget', label: 'Budget & Allocation' },
                  { id: 'performance', label: 'Performance & Velocity' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    audio.playClick()
                    setSubTab(t.id)
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    subTab === t.id
                      ? 'btn-gold'
                      : 'bg-[#181410] text-[#b5a695] border border-[#d4a84f]/20 hover:text-[#faf7f0]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* SUB-TAB 1: TEAM & RECRUITMENT                                   */}
          {/* --------------------------------------------------------------- */}
          {subTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
              {/* Department Staff Cards (2 cols) */}
              <div className="md:col-span-2 panel-dark p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#d4a84f]/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                    Assigned {DEPARTMENT_LABELS[selectedDept]} Specialists
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {deptTeam.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex flex-col justify-between rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#faf7f0] border border-[#d4a84f]/40"
                            style={{ backgroundColor: emp.visual.outfit }}
                          >
                            {emp.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#faf7f0]">{emp.name}</div>
                            <div className="text-[10.5px] text-[#b5a695]">
                              {ROLE_LABELS[emp.role]} • ${emp.salary}/d
                            </div>
                          </div>
                        </div>
                        <span className="mono text-xs font-bold text-[#65b87b]">
                          {Math.round(emp.productivity)}%
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            selectEmployee(emp.id)
                            setActiveTab('employees')
                          }}
                          className="flex-1 rounded-lg bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/25 py-1.5 text-[10.5px] font-semibold text-[#faf7f0] cursor-pointer transition"
                        >
                          1:1 Conversation
                        </button>
                        <button
                          onClick={() => {
                            const res = dispatch({ type: 'bonus', employeeId: emp.id })
                            if (res.message) notify(res.message)
                            else if (res.reason) notify(res.reason)
                          }}
                          className="rounded-lg bg-[#d4a84f]/20 hover:bg-[#d4a84f]/35 border border-[#d4a84f]/40 px-2.5 py-1.5 text-[10.5px] font-bold text-[#e5c478] cursor-pointer transition"
                        >
                          Bonus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruitment Bench (1 col) */}
              <div className="panel-dark p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
                  Recruit New Talent
                </div>
                <p className="text-xs text-[#b5a695]">
                  Expand {DEPARTMENT_LABELS[selectedDept]} capacity to accelerate project completion.
                </p>

                <div className="space-y-2">
                  {(
                    [
                      { role: 'junior', label: 'Associate Specialist', fee: 800, salary: 200 },
                      { role: 'specialist', label: 'Core Specialist', fee: 1500, salary: 260 },
                      { role: 'senior', label: 'Senior Architect', fee: 2400, salary: 380 },
                      { role: 'manager', label: 'Department Lead', fee: 3500, salary: 480 },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleHire(r.role)}
                      className="flex w-full items-center justify-between rounded-xl bg-[#181410] hover:bg-[#26201a] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#faf7f0]">{r.label}</div>
                        <div className="text-[10px] text-[#b5a695]">
                          Salary ~${r.salary}/day
                        </div>
                      </div>
                      <span className="btn-gold rounded-lg px-2.5 py-1 text-[10.5px] font-bold">
                        Hire (${r.fee.toLocaleString()})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-TAB 2: PROJECTS & DELIVERABLES                              */}
          {/* --------------------------------------------------------------- */}
          {subTab === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
              <div className="md:col-span-2 panel-dark p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
                  Department Projects & Contracts ({deptProjects.length})
                </div>

                <div className="space-y-3">
                  {deptProjects.map((p) => {
                    const pct = Math.min(100, Math.round((p.pointsDone / p.pointsTotal) * 100))
                    return (
                      <div
                        key={p.id}
                        className="rounded-xl bg-[#181410] p-4 border border-[#d4a84f]/25"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#faf7f0]">{p.name}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase ${
                                  p.status === 'completed'
                                    ? 'bg-[#65b87b]/20 text-[#65b87b]'
                                    : p.status === 'failed'
                                      ? 'bg-[#c74234]/20 text-[#f08578]'
                                      : 'bg-[#d4a84f]/20 text-[#e5c478]'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            <div className="text-xs text-[#b5a695] mt-0.5">
                              Client: {p.clientName} • Deadline: Day {p.deadlineDay}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="mono text-sm font-extrabold text-[#65b87b]">
                              +${p.revenueOnDone.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-[#b5a695]">
                              {Math.round(p.pointsDone)}/{p.pointsTotal} pts ({pct}%)
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 h-2 w-full rounded-full bg-[#352c25] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#b88933] to-[#65b87b] transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {p.status === 'active' && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleBoostProject(p.id)}
                              className="btn-gold flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              <span>Accelerate Deliverable ($1,000 → +25 pts)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {deptProjects.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#8e7c6b]">
                      No projects assigned to {DEPARTMENT_LABELS[selectedDept]} yet. Launch one on the right!
                    </div>
                  )}
                </div>
              </div>

              {/* Launch New Project Card */}
              <div className="panel-dark p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
                  + Commission New Project
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10.5px] text-[#b5a695] font-semibold">
                      Project Deliverable Title
                    </label>
                    <input
                      type="text"
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      placeholder={currentMeta.defaultProjectName}
                      className="mt-1 w-full rounded-xl bg-[#16120e] border border-[#d4a84f]/25 px-3 py-2 text-xs text-[#faf7f0] focus:border-[#d4a84f] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] text-[#b5a695] font-semibold">
                      Sponsor / Enterprise Client
                    </label>
                    <input
                      type="text"
                      value={newProjClient}
                      onChange={(e) => setNewProjClient(e.target.value)}
                      placeholder={currentMeta.defaultClient}
                      className="mt-1 w-full rounded-xl bg-[#16120e] border border-[#d4a84f]/25 px-3 py-2 text-xs text-[#faf7f0] focus:border-[#d4a84f] focus:outline-none"
                    />
                  </div>
                  <div className="rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/15 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#b5a695]">Completion Payout</span>
                      <span className="mono font-bold text-[#65b87b]">
                        +${currentMeta.defaultReward.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#b5a695]">Target Scope</span>
                      <span className="mono font-bold text-[#faf7f0]">80 Story Points</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLaunchProject}
                    className="btn-gold w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Launch Department Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-TAB 3: BUDGET & RESOURCE ALLOCATION                         */}
          {/* --------------------------------------------------------------- */}
          {subTab === 'budget' && (
            <div className="panel-dark p-5 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-[#d4a84f]/20 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#faf7f0]">
                    {DEPARTMENT_LABELS[selectedDept]} Operating Budget & Tooling
                  </h3>
                  <p className="text-xs text-[#b5a695]">
                    Higher tooling budgets boost department morale and daily output velocity.
                  </p>
                </div>
                <span className="mono text-lg font-extrabold text-[#e5c478]">
                  ${extraBudget.toLocaleString()}/day
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={200}
                  max={2500}
                  step={100}
                  value={extraBudget}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    const res = dispatch({
                      type: 'adjust_dept_budget',
                      department: selectedDept,
                      budgetPerDay: val,
                    })
                    if (res.message) notify(res.message)
                  }}
                  className="w-full accent-[#d4a84f] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#b5a695]">
                  <span>Austerity ($200/d)</span>
                  <span>Balanced ($1,000/d)</span>
                  <span>Maximum Velocity ($2,500/d)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/20">
                  <div className="text-[10px] font-bold uppercase text-[#b5a695]">
                    Daily Salaries
                  </div>
                  <div className="mono text-base font-extrabold text-[#faf7f0] mt-1">
                    ${dailyPayroll.toLocaleString()}/day
                  </div>
                </div>
                <div className="rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/20">
                  <div className="text-[10px] font-bold uppercase text-[#b5a695]">
                    Tooling & Cloud Allocation
                  </div>
                  <div className="mono text-base font-extrabold text-[#e5c478] mt-1">
                    ${extraBudget.toLocaleString()}/day
                  </div>
                </div>
                <div className="rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/20">
                  <div className="text-[10px] font-bold uppercase text-[#b5a695]">
                    Monthly Run-Rate
                  </div>
                  <div className="mono text-base font-extrabold text-[#f5c66b] mt-1">
                    ${((dailyPayroll + extraBudget) * 30).toLocaleString()}/mo
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* SUB-TAB 4: PERFORMANCE & DIAGNOSTICS                            */}
          {/* --------------------------------------------------------------- */}
          {subTab === 'performance' && (
            <div className="panel-dark p-5 space-y-4 animate-slide-up">
              <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
                Department Telemetry & Bottleneck Analysis
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-[#181410] p-4 border border-[#d4a84f]/20">
                  <div className="text-xs font-bold text-[#faf7f0]">Output Efficiency</div>
                  <div className="mono text-2xl font-extrabold text-[#65b87b] mt-1">
                    {avgProd}%
                  </div>
                  <p className="mt-1 text-[11px] text-[#b5a695]">
                    Driven by technical skill average and active sprint alignment buffs.
                  </p>
                </div>
                <div className="rounded-xl bg-[#181410] p-4 border border-[#d4a84f]/20">
                  <div className="text-xs font-bold text-[#faf7f0]">Burnout & Stress Index</div>
                  <div className="mono text-2xl font-extrabold text-[#e8a33d] mt-1">
                    {avgStress}%
                  </div>
                  <p className="mt-1 text-[11px] text-[#b5a695]">
                    {avgStress > 60
                      ? 'Warning: High stress risks sudden resignations.'
                      : 'Healthy stress levels across current sprint.'}
                  </p>
                </div>
                <div className="rounded-xl bg-[#181410] p-4 border border-[#d4a84f]/20">
                  <div className="text-xs font-bold text-[#faf7f0]">Retention Health</div>
                  <div className="mono text-2xl font-extrabold text-[#e5c478] mt-1">
                    {avgMorale >= 60 ? '96% Safe' : '74% At Risk'}
                  </div>
                  <p className="mt-1 text-[11px] text-[#b5a695]">
                    Use 1:1 conversations or bonuses in Section 03 to retain key staff.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
