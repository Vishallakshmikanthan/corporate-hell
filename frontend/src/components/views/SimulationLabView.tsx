/**
 * CORPORATE HELL™ — Section 09: Simulation Lab & Chaos Experiments.
 *
 * Custom scenario builder, what-if workforce/budget simulations,
 * A/B strategy comparisons, workplace policy toggles, 30+ chaos event injectors,
 * and historical replay timeline.
 */
import { useState, useMemo } from 'react'
import { useGameStore } from '../../state/gameStore'
import { EVENT_DEFINITIONS } from '../../game/engine/events'
import {
  DEPARTMENT_LABELS,
  type Department,
  type Policies,
} from '../../game/models/types'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  FlaskConical,
  Zap,
  Sliders,
  Play,
  GitCompare,
  History,
  Flame,
  CheckCircle2,
  Sparkles,
  Globe,
} from 'lucide-react'

type LabMode = 'scenarios' | 'whatif' | 'policies' | 'ab' | 'replay'

interface ScenarioPreset {
  id: string
  title: string
  subtitle: string
  layoffPct: number
  budgetShiftPct: number
  durationMonths: number
  deptFocus: 'all' | Department
  badge: string
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'mass_layoff_30',
    title: 'Mass Layoff (30%)',
    subtitle: 'Simulate the impact of 30% workforce reduction across all departments.',
    layoffPct: 30,
    budgetShiftPct: -20,
    durationMonths: 3,
    deptFocus: 'all',
    badge: 'High Contagion Risk',
  },
  {
    id: 'hyperblitz_growth',
    title: 'Hyper-Blitz R&D Expansion',
    subtitle: 'Double down on engineering headcount and R&D spend to capture market share.',
    layoffPct: 0,
    budgetShiftPct: 35,
    durationMonths: 3,
    deptFocus: 'engineering',
    badge: 'Aggressive Burn',
  },
  {
    id: 'austerity_bridge',
    title: 'Surgical Cost Optimization (10%)',
    subtitle: 'Trim non-core operational overhead and freeze hiring to extend cash runway.',
    layoffPct: 10,
    budgetShiftPct: -15,
    durationMonths: 6,
    deptFocus: 'operations',
    badge: 'Runway Extension',
  },
  {
    id: 'sales_surge',
    title: 'Enterprise Go-To-Market Surge',
    subtitle: 'Reallocate capital into Enterprise Sales and Demand Generation.',
    layoffPct: 0,
    budgetShiftPct: 25,
    durationMonths: 3,
    deptFocus: 'sales',
    badge: 'Revenue Catalyst',
  },
]

export function SimulationLabView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  const [labMode, setLabMode] = useState<LabMode>('scenarios')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mass_layoff_30')

  // Interactive Scenario Parameters (matches reference-ui #09)
  const [layoffPct, setLayoffPct] = useState<number>(30)
  const [budgetShiftPct, setBudgetShiftPct] = useState<number>(-15)
  const [durationMonths, setDurationMonths] = useState<number>(3)
  const [deptFocus, setDeptFocus] = useState<'all' | Department>('all')

  const [simRunCount, setSimRunCount] = useState<number>(1)
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null)
  const [replayIndex, setReplayIndex] = useState<number>(0)

  if (!state) return null

  const policies = state.policies
  const activeEmployees = Object.values(state.employees).filter((e) => e.active)

  const avgMorale =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((sum, e) => sum + e.morale, 0) / activeEmployees.length)
      : 50
  const avgProductivity =
    activeEmployees.length > 0
      ? Math.round(
          activeEmployees.reduce((sum, e) => sum + e.productivity, 0) / activeEmployees.length
        )
      : 50
  const dailyPayroll = activeEmployees.reduce((sum, e) => sum + e.salary, 0)
  const dailyRevenue = state.baseRetainer + Math.round((state.growth?.mrr || 24000) / 30)
  const dailyBurn = dailyPayroll + 950

  const showToast = (msg: string) => {
    setFeedbackBanner(msg)
    setTimeout(() => setFeedbackBanner(null), 4000)
  }

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPresetId(preset.id)
    setLayoffPct(preset.layoffPct)
    setBudgetShiftPct(preset.budgetShiftPct)
    setDurationMonths(preset.durationMonths)
    setDeptFocus(preset.deptFocus)
    setSimRunCount((c) => c + 1)
  }

  // Deterministic Projected Impact Calculation (bound to real company metrics + sliders)
  const projection = useMemo(() => {
    const timeFactor = durationMonths / 3
    const focusMultiplier = deptFocus === 'all' ? 1.0 : 0.65

    // Revenue % delta
    const revFromLayoffs = -Math.round(layoffPct * 0.6 * focusMultiplier * timeFactor)
    const revFromBudget = Math.round(budgetShiftPct * 0.45 * timeFactor)
    const revenueDeltaPct = Math.max(-65, Math.min(80, revFromLayoffs + revFromBudget))

    // Expenses % delta
    const expFromLayoffs = -Math.round(layoffPct * 1.15 * focusMultiplier)
    const expFromBudget = Math.round(budgetShiftPct * 0.6)
    const expensesDeltaPct = Math.max(-75, Math.min(85, expFromLayoffs + expFromBudget))

    // Employee Morale % delta
    const moraleDeltaPct = Math.max(
      -70,
      Math.min(45, Math.round(-layoffPct * 1.4 * focusMultiplier + budgetShiftPct * 0.25))
    )

    // Productivity % delta
    const productivityDeltaPct = Math.max(
      -60,
      Math.min(50, Math.round(-layoffPct * 0.85 * focusMultiplier + budgetShiftPct * 0.35))
    )

    // Investor Confidence % delta
    const netSavingsBonus = expensesDeltaPct < -20 ? 12 : 0
    const investorDeltaPct = Math.max(
      -60,
      Math.min(
        60,
        Math.round(revenueDeltaPct * 0.6 + moraleDeltaPct * 0.35 + netSavingsBonus)
      )
    )

    // 12-Week Simulated Trajectory Series
    const baseMonthlyRev = Math.round(dailyRevenue * 30)
    const baseMonthlyBurn = Math.round(dailyBurn * 30)
    const series = Array.from({ length: durationMonths * 4 }, (_, i) => {
      const progress = (i + 1) / (durationMonths * 4)
      const simRev = Math.round(baseMonthlyRev * (1 + (revenueDeltaPct / 100) * progress))
      const simBurn = Math.round(baseMonthlyBurn * (1 + (expensesDeltaPct / 100) * progress))
      const simMorale = Math.max(5, Math.min(100, Math.round(avgMorale + moraleDeltaPct * progress)))
      return {
        week: `Wk ${i + 1}`,
        revenue: simRev,
        expenses: simBurn,
        morale: simMorale,
      }
    })

    return {
      revenueDeltaPct,
      expensesDeltaPct,
      moraleDeltaPct,
      productivityDeltaPct,
      investorDeltaPct,
      series,
    }
  }, [
    layoffPct,
    budgetShiftPct,
    durationMonths,
    deptFocus,
    dailyRevenue,
    dailyBurn,
    avgMorale,
    simRunCount,
  ])

  const handleRunSimulation = () => {
    setSimRunCount((c) => c + 1)
    showToast(
      `Monte Carlo Sandbox Simulation #${simRunCount + 1} completed (${durationMonths}-month horizon).`
    )
  }

  const handleApplyToLiveCompany = () => {
    // Apply budget adjustment or workforce reduction deterministically to live state
    if (layoffPct > 0) {
      const candidates = activeEmployees.filter((e) =>
        deptFocus === 'all' ? true : e.department === deptFocus
      )
      const toFireCount = Math.max(
        1,
        Math.min(3, Math.round((candidates.length * layoffPct) / 100))
      )
      const targets = candidates.slice(0, toFireCount)
      targets.forEach((emp) => {
        dispatch({ type: 'fire', employeeId: emp.id })
      })
      showToast(
        `Executed restructuring in live company: ${targets.length} staff member(s) released.`
      )
    } else if (budgetShiftPct !== 0) {
      const targetDepts: Department[] =
        deptFocus === 'all'
          ? ['engineering', 'marketing', 'sales', 'operations', 'hr']
          : [deptFocus]
      targetDepts.forEach((d) => {
        const current = Number(state.flags[`dept_budget_${d}`] ?? 1200)
        const nextBudget = Math.max(200, Math.round(current * (1 + budgetShiftPct / 100)))
        dispatch({ type: 'adjust_dept_budget', department: d, budgetPerDay: nextBudget })
      })
      showToast(
        `Applied ${budgetShiftPct > 0 ? '+' : ''}${budgetShiftPct}% budget shift to live departments.`
      )
    } else {
      showToast('Simulation parameters match current live baseline.')
    }
  }

  const handlePolicyToggle = (key: keyof Policies) => {
    const res = dispatch({ type: 'set_policy', policy: key, value: !policies[key] })
    if (res.message) showToast(res.message)
  }

  const handleTriggerEvent = (eventId: string) => {
    const res = dispatch({ type: 'trigger_event', eventId })
    if (res.message) showToast(res.message)
  }

  const policyItems: { key: keyof Policies; label: string; desc: string; impact: string }[] = [
    {
      key: 'fourDayWeek',
      label: 'Four-Day Workweek',
      desc: 'Reduces burnout and stress while slightly scaling weekly sprint velocity.',
      impact: '+12 Morale / -8% Burnout',
    },
    {
      key: 'meetingFreeDay',
      label: 'Mandatory Meeting-Free Days',
      desc: 'Cancels recurring status syncs. Deep-work engineers thrive.',
      impact: '+10 Deep Focus',
    },
    {
      key: 'hiringFrozen',
      label: 'Total Hiring Freeze',
      desc: 'Halts new headcount requisitions to preserve treasury runway.',
      impact: 'Saves Recruiting Burn',
    },
    {
      key: 'productivityTracking',
      label: 'Keystroke & Telemetry Surveillance',
      desc: 'Artificially spikes short-term output while eroding leadership trust.',
      impact: '+8 Output / -18 Trust',
    },
    {
      key: 'casualFridays',
      label: 'Executive Casual Fridays',
      desc: 'Relaxes dress code and sponsors afternoon craft espresso.',
      impact: '+5 Morale / $0 Cost',
    },
    {
      key: 'remoteFriendly',
      label: 'Hybrid Remote-Friendly Flex',
      desc: 'Allows flexible remote work days and reduces office congestion.',
      impact: '+8 Retention',
    },
  ]

  // A/B Comparison dataset
  const abComparisonData = [
    {
      metric: 'Revenue Growth',
      StrategyA: projection.revenueDeltaPct,
      StrategyB: 18,
    },
    {
      metric: 'Cost Change',
      StrategyA: projection.expensesDeltaPct,
      StrategyB: 12,
    },
    {
      metric: 'Team Morale',
      StrategyA: projection.moraleDeltaPct,
      StrategyB: 14,
    },
    {
      metric: 'Productivity',
      StrategyA: projection.productivityDeltaPct,
      StrategyB: 16,
    },
    {
      metric: 'Investor Trust',
      StrategyA: projection.investorDeltaPct,
      StrategyB: 22,
    },
  ]

  // Historical Replay series from live company state
  const historyLength = Math.max(1, state.history.length)
  const currentReplayIdx =
    replayIndex >= 0 && replayIndex < historyLength ? replayIndex : historyLength - 1
  const currentSnapshot = state.history[currentReplayIdx]

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#14110E] text-[#FAF7F0] select-none">
      {/* Ambient Warm Architectural Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 52% 28%, rgba(212, 168, 79, 0.22), transparent 60%), radial-gradient(circle at 80% 75%, rgba(196, 90, 62, 0.14), transparent 55%)',
        }}
      />

      {/* Toast Notification */}
      {feedbackBanner && (
        <div className="absolute top-4 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#D4A84F]/50 bg-[#1C1814]/95 px-4 py-2.5 text-xs font-semibold text-[#E3B963] shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-[#4C9A6A]" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 overflow-hidden p-5 gap-5">
        {/* LEFT RAIL: 5 Simulation Lab Modes (Matches reference-ui #09) */}
        <aside className="flex w-64 shrink-0 flex-col justify-between rounded-2xl border border-[#D4A84F]/25 bg-[#1C1814]/90 p-4 backdrop-blur-md">
          <div className="space-y-4">
            <div className="border-b border-[#D4A84F]/15 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A84F]">
                Predictive Sandbox
              </span>
              <h3 className="font-serif-title mt-0.5 text-lg font-bold text-[#FAF7F0]">
                Simulation Lab
              </h3>
            </div>

            <nav className="space-y-2">
              {(
                [
                  {
                    id: 'scenarios',
                    label: 'Scenario Simulator',
                    icon: Globe,
                    desc: 'Stress-test workforce & budget moves',
                  },
                  {
                    id: 'whatif',
                    label: 'What-If Analysis',
                    icon: Sliders,
                    desc: 'Multi-week trajectory curves',
                  },
                  {
                    id: 'policies',
                    label: 'Policy Testing',
                    icon: FlaskConical,
                    desc: '6 policies & 30+ chaos disasters',
                  },
                  {
                    id: 'ab',
                    label: 'A/B Decisions',
                    icon: GitCompare,
                    desc: 'Compare restructuring vs growth',
                  },
                  {
                    id: 'replay',
                    label: 'Historical Replay',
                    icon: History,
                    desc: 'Scrub past company telemetry',
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon
                const active = labMode === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setLabMode(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-[#D4A84F]/60 bg-gradient-to-r from-[#D4A84F]/25 to-[#D4A84F]/10 text-[#FAF7F0] shadow-md'
                        : 'border-[#332B22] bg-[#14110E]/60 text-[#C8C0B3] hover:border-[#D4A84F]/30 hover:text-[#FAF7F0]'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        active
                          ? 'border-[#D4A84F] bg-[#D4A84F] text-[#14110E]'
                          : 'border-[#332B22] bg-[#1C1814] text-[#D4A84F]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight">{tab.label}</div>
                      <div className="truncate text-[10px] text-[#9E9484]">{tab.desc}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Live Company Baseline Box */}
          <div className="rounded-xl border border-[#332B22] bg-[#14110E]/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#D4A84F]">
              <span>Live Baseline (Day {state.day})</span>
              <Sparkles className="h-3 w-3" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[10px] text-[#9E9484]">Treasury</div>
                <div className="mono font-bold text-[#FAF7F0]">
                  ${Math.round(state.cash).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#9E9484]">Staff Count</div>
                <div className="mono font-bold text-[#FAF7F0]">{activeEmployees.length} Active</div>
              </div>
              <div>
                <div className="text-[10px] text-[#9E9484]">Avg Morale</div>
                <div className="mono font-bold text-[#4C9A6A]">{avgMorale}%</div>
              </div>
              <div>
                <div className="text-[10px] text-[#9E9484]">Productivity</div>
                <div className="mono font-bold text-[#E3B963]">{avgProductivity}%</div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER & RIGHT STAGE */}
        <div className="flex flex-1 gap-5 overflow-y-auto pr-1">
          {labMode === 'scenarios' || labMode === 'whatif' ? (
            <>
              {/* Center Visual Globe / Trajectory Command Stage */}
              <div className="flex flex-1 flex-col justify-between rounded-2xl border border-[#D4A84F]/25 bg-[#1C1814]/85 p-5 backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between border-b border-[#332B22] pb-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A84F]">
                        Global Corporate Contagion & Cashflow Model
                      </span>
                      <h3 className="font-serif-title text-xl font-bold text-[#FAF7F0]">
                        {SCENARIO_PRESETS.find((p) => p.id === selectedPresetId)?.title ||
                          'Custom Executive Scenario'}
                      </h3>
                    </div>
                    <span className="rounded-full border border-[#D4A84F]/40 bg-[#D4A84F]/15 px-3 py-1 text-[11px] font-bold text-[#E3B963]">
                      Run #{simRunCount} • Deterministic Sandbox
                    </span>
                  </div>

                  {/* Scenario Preset Selector Pills */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {SCENARIO_PRESETS.map((preset) => {
                      const isSel = selectedPresetId === preset.id
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                            isSel
                              ? 'border-[#D4A84F] bg-[#D4A84F]/15'
                              : 'border-[#332B22] bg-[#14110E]/60 hover:border-[#D4A84F]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FAF7F0]">{preset.title}</span>
                            <span className="rounded bg-[#25201B] px-1.5 py-0.5 text-[9px] font-semibold text-[#D4A84F]">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-[#9E9484] line-clamp-2">
                            {preset.subtitle}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Trajectory Chart */}
                  <div className="mt-5 rounded-xl border border-[#332B22] bg-[#14110E]/90 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C8C0B3]">
                        Projected {durationMonths}-Month Revenue vs. Burn Trajectory
                      </span>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="flex items-center gap-1.5 text-[#E3B963]">
                          <span className="h-2 w-2 rounded-full bg-[#D4A84F]" /> Projected Revenue
                        </span>
                        <span className="flex items-center gap-1.5 text-[#D96B52]">
                          <span className="h-2 w-2 rounded-full bg-[#C45A3E]" /> Projected Expenses
                        </span>
                      </div>
                    </div>

                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projection.series}>
                          <defs>
                            <linearGradient id="simRevGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D4A84F" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#D4A84F" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="simBurnGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C45A3E" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#C45A3E" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#25201B" strokeDasharray="3 3" />
                          <XAxis dataKey="week" stroke="#9E9484" fontSize={10} />
                          <YAxis
                            stroke="#9E9484"
                            fontSize={10}
                            tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1C1814',
                              borderColor: '#D4A84F',
                              borderRadius: '10px',
                              fontSize: '11px',
                              color: '#FAF7F0',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#D4A84F"
                            strokeWidth={2}
                            fill="url(#simRevGrad)"
                            name="Monthly Revenue"
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#C45A3E"
                            strokeWidth={2}
                            fill="url(#simBurnGrad)"
                            name="Monthly Burn"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D4A84F]/25 bg-[#14110E]/80 px-4 py-3">
                  <div className="text-xs text-[#C8C0B3]">
                    Want to commit this simulated restructuring to your live company?
                  </div>
                  <button
                    onClick={handleApplyToLiveCompany}
                    className="rounded-xl border border-[#D4A84F]/50 bg-[#25201B] px-4 py-2 text-xs font-bold text-[#E3B963] transition hover:bg-[#D4A84F] hover:text-[#14110E]"
                  >
                    Execute Strategy in Live Company
                  </button>
                </div>
              </div>

              {/* RIGHT INSPECTOR CARD: Matches reference-ui #09 "Mass Layoff (30%)" Card */}
              <div className="flex w-96 shrink-0 flex-col justify-between rounded-2xl border border-[#D4A84F]/35 bg-[#1C1814]/95 p-5 shadow-2xl backdrop-blur-md">
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start gap-3 border-b border-[#332B22] pb-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C45A3E]/50 bg-[#C45A3E]/15 text-[#D96B52]">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-serif-title text-lg font-bold text-[#FAF7F0]">
                        {layoffPct > 0
                          ? `Mass Layoff (${layoffPct}%)`
                          : `Growth Allocation (${budgetShiftPct > 0 ? '+' : ''}${budgetShiftPct}%)`}
                      </h4>
                      <p className="text-xs text-[#C8C0B3]">
                        Simulate the impact of {layoffPct}% workforce reduction across selected
                        departments.
                      </p>
                    </div>
                  </div>

                  {/* Controls + Projected Impact (Matches reference-ui #09) */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Sliders & Dropdowns */}
                    <div className="space-y-3 rounded-xl border border-[#332B22] bg-[#14110E]/75 p-3.5">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#C8C0B3]">Layoff Percentage</span>
                          <span className="mono font-bold text-[#E3B963]">{layoffPct}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={60}
                          step={5}
                          value={layoffPct}
                          onChange={(e) => setLayoffPct(Number(e.target.value))}
                          className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#D4A84F]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#C8C0B3]">Budget Shift</span>
                          <span className="mono font-bold text-[#E3B963]">
                            {budgetShiftPct > 0 ? `+${budgetShiftPct}%` : `${budgetShiftPct}%`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-40}
                          max={50}
                          step={5}
                          value={budgetShiftPct}
                          onChange={(e) => setBudgetShiftPct(Number(e.target.value))}
                          className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#D4A84F]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9E9484]">
                            Duration
                          </label>
                          <select
                            value={durationMonths}
                            onChange={(e) => setDurationMonths(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-[#332B22] bg-[#1C1814] px-2.5 py-1.5 text-xs font-semibold text-[#FAF7F0] outline-none focus:border-[#D4A84F]"
                          >
                            <option value={1}>1 month</option>
                            <option value={3}>3 months</option>
                            <option value={6}>6 months</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9E9484]">
                            Department Focus
                          </label>
                          <select
                            value={deptFocus}
                            onChange={(e) => setDeptFocus(e.target.value as 'all' | Department)}
                            className="mt-1 w-full rounded-lg border border-[#332B22] bg-[#1C1814] px-2.5 py-1.5 text-xs font-semibold text-[#FAF7F0] outline-none focus:border-[#D4A84F]"
                          >
                            <option value="all">All Departments</option>
                            {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((d) => (
                              <option key={d} value={d}>
                                {DEPARTMENT_LABELS[d]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Projected Impact (3 months) Card */}
                    <div className="rounded-xl border border-[#D4A84F]/25 bg-[#14110E]/90 p-3.5">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FAF7F0]">
                          Projected Impact ({durationMonths} months)
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#D4A84F]">
                          Delta vs Live
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <ImpactRow
                          label="Revenue"
                          value={projection.revenueDeltaPct}
                          invertGood={false}
                        />
                        <ImpactRow
                          label="Expenses"
                          value={projection.expensesDeltaPct}
                          invertGood={true}
                        />
                        <ImpactRow
                          label="Employee Morale"
                          value={projection.moraleDeltaPct}
                          invertGood={false}
                        />
                        <ImpactRow
                          label="Productivity"
                          value={projection.productivityDeltaPct}
                          invertGood={false}
                        />
                        <ImpactRow
                          label="Investor Confidence"
                          value={projection.investorDeltaPct}
                          invertGood={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Buttons: Run Simulation + Compare Strategies (Matches reference-ui #09) */}
                <div className="mt-4 flex items-center gap-2.5">
                  <button
                    onClick={handleRunSimulation}
                    className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg transition active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Simulation</span>
                  </button>
                  <button
                    onClick={() => setLabMode('ab')}
                    className="rounded-xl border border-[#332B22] bg-[#14110E] px-3.5 py-2.5 text-xs font-bold text-[#C8C0B3] transition hover:border-[#D4A84F]/50 hover:text-[#FAF7F0]"
                  >
                    Compare Strategies
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {labMode === 'policies' ? (
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
              {/* Workplace Policies Matrix */}
              <div className="rounded-2xl border border-[#D4A84F]/25 bg-[#1C1814]/90 p-5">
                <div className="flex items-center justify-between border-b border-[#332B22] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A84F]">
                      Live Executive Directives
                    </span>
                    <h3 className="font-serif-title text-lg font-bold text-[#FAF7F0]">
                      Corporate Workplace Policies
                    </h3>
                  </div>
                  <span className="text-xs text-[#9E9484]">
                    Toggling a policy immediately updates your live company rules
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {policyItems.map((p) => {
                    const isActive = policies[p.key]
                    return (
                      <div
                        key={p.key}
                        onClick={() => handlePolicyToggle(p.key)}
                        className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition ${
                          isActive
                            ? 'border-[#D4A84F] bg-[#D4A84F]/15 shadow-md'
                            : 'border-[#332B22] bg-[#14110E]/70 hover:border-[#D4A84F]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FAF7F0]">{p.label}</span>
                            <span
                              className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                                isActive
                                  ? 'bg-[#D4A84F] text-[#14110E]'
                                  : 'bg-[#25201B] text-[#9E9484]'
                              }`}
                            >
                              {isActive ? 'ACTIVE' : 'OFF'}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[11px] text-[#C8C0B3]">{p.desc}</p>
                        </div>
                        <div className="mt-3 border-t border-[#332B22] pt-2 text-[10px] font-semibold text-[#E3B963]">
                          Effect: {p.impact}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 30+ Inject Simulated Office Disasters */}
              <div className="rounded-2xl border border-[#D4A84F]/25 bg-[#1C1814]/90 p-5">
                <div className="flex items-center justify-between border-b border-[#332B22] pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#D4A84F]" />
                    <h3 className="font-serif-title text-lg font-bold text-[#FAF7F0]">
                      Inject Simulated Office Disasters ({Object.keys(EVENT_DEFINITIONS).length}{' '}
                      Events)
                    </h3>
                  </div>
                  <span className="text-xs text-[#9E9484]">
                    Fires immediately in your live company & Section 06 Incidents
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(EVENT_DEFINITIONS).map((def) => (
                    <div
                      key={def.id}
                      className="flex items-center justify-between rounded-xl border border-[#332B22] bg-[#14110E]/80 p-3 transition hover:border-[#D4A84F]/40"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="truncate text-xs font-bold text-[#FAF7F0]">{def.title}</h4>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9484]">
                          {def.category} • Severity {def.severity}
                        </span>
                      </div>

                      <button
                        onClick={() => handleTriggerEvent(def.id)}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-[#D4A84F]/40 bg-[#25201B] px-2.5 py-1.5 text-[11px] font-bold text-[#E3B963] transition hover:bg-[#D4A84F] hover:text-[#14110E] active:scale-95"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Trigger</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {labMode === 'ab' ? (
            <div className="flex flex-1 flex-col justify-between rounded-2xl border border-[#D4A84F]/25 bg-[#1C1814]/90 p-5">
              <div>
                <div className="flex items-center justify-between border-b border-[#332B22] pb-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A84F]">
                      Side-by-Side Executive Tradeoff Matrix
                    </span>
                    <h3 className="font-serif-title text-xl font-bold text-[#FAF7F0]">
                      A/B Strategy Decision Comparison
                    </h3>
                  </div>
                  <button
                    onClick={() => setLabMode('scenarios')}
                    className="rounded-xl border border-[#D4A84F]/40 bg-[#25201B] px-3 py-1.5 text-xs font-bold text-[#E3B963]"
                  >
                    ← Edit Strategy A Sliders
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#D4A84F]/40 bg-[#14110E]/80 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A84F]">
                      Strategy A (Your Custom Scenario)
                    </span>
                    <h4 className="mt-1 text-base font-bold text-[#FAF7F0]">
                      {layoffPct}% Workforce Reduction / {budgetShiftPct}% Budget Delta
                    </h4>
                    <p className="mt-1 text-xs text-[#9E9484]">
                      Focus: {deptFocus === 'all' ? 'All Departments' : DEPARTMENT_LABELS[deptFocus]}{' '}
                      over {durationMonths} months.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#4C9A6A]/40 bg-[#14110E]/80 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5BB37D]">
                      Strategy B (Balanced Organic Benchmark)
                    </span>
                    <h4 className="mt-1 text-base font-bold text-[#FAF7F0]">
                      0% Layoffs / +15% Targeted R&D & Sales Investment
                    </h4>
                    <p className="mt-1 text-xs text-[#9E9484]">
                      Preserves institutional knowledge while steadily scaling enterprise ARR.
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-64 w-full rounded-xl border border-[#332B22] bg-[#14110E]/90 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={abComparisonData}>
                      <CartesianGrid stroke="#25201B" strokeDasharray="3 3" />
                      <XAxis dataKey="metric" stroke="#9E9484" fontSize={11} />
                      <YAxis stroke="#9E9484" fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1C1814',
                          borderColor: '#D4A84F',
                          borderRadius: '10px',
                          fontSize: '11px',
                          color: '#FAF7F0',
                        }}
                      />
                      <Bar
                        dataKey="StrategyA"
                        fill="#D4A84F"
                        name="Strategy A (%)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="StrategyB"
                        fill="#4C9A6A"
                        name="Strategy B (%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : null}

          {labMode === 'replay' ? (
            <div className="flex flex-1 flex-col justify-between rounded-2xl border border-[#D4A84F]/25 bg-[#1C1814]/90 p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#332B22] pb-3.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A84F]">
                      Chronological Audit Trail
                    </span>
                    <h3 className="font-serif-title text-xl font-bold text-[#FAF7F0]">
                      Historical Telemetry Replay (Day 1 to Day {state.day})
                    </h3>
                  </div>
                  <span className="mono rounded-lg border border-[#D4A84F]/30 bg-[#14110E] px-3 py-1 text-xs font-bold text-[#E3B963]">
                    Snapshot #{currentReplayIdx + 1} of {historyLength}
                  </span>
                </div>

                {/* Scrubber Slider */}
                <div className="rounded-xl border border-[#332B22] bg-[#14110E]/80 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#C8C0B3]">Timeline Scrubber</span>
                    <span className="mono text-[#D4A84F]">
                      Treasury: $
                      {Math.round(currentSnapshot?.cashAfter ?? state.cash).toLocaleString()} •
                      Morale: {Math.round(currentSnapshot?.moraleAvg ?? avgMorale)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, historyLength - 1)}
                    value={currentReplayIdx}
                    onChange={(e) => setReplayIndex(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer accent-[#D4A84F]"
                  />
                </div>

                {/* Event Log History */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#9E9484]">
                    Recorded Executive & Office Events ({state.eventLog.length})
                  </h4>
                  {state.eventLog.map((ev) => (
                    <div
                      key={ev.uid}
                      className="flex items-center justify-between rounded-xl border border-[#332B22] bg-[#14110E]/75 px-3.5 py-2.5 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#FAF7F0]">{ev.title}</span>
                        <p className="text-[11px] text-[#9E9484]">{ev.description}</p>
                      </div>
                      <span className="mono shrink-0 text-[10px] text-[#D4A84F]">Day {ev.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom Editorial Title Banner (Matches reference-ui #09) */}
      <div className="relative z-10 flex items-center justify-between border-t border-[#D4A84F]/20 bg-[#14110E]/95 px-6 py-3">
        <div className="flex items-baseline gap-4">
          <span className="font-serif-title text-3xl font-bold tracking-tight text-[#D4A84F]">
            09
          </span>
          <div>
            <h2 className="font-serif-title text-lg font-bold uppercase tracking-wider text-[#FAF7F0]">
              SIMULATION LAB & CHAOS EXPERIMENTS
            </h2>
            <p className="text-xs text-[#9E9484]">
              Test strategies, run what-if scenarios and experiment without risk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#C8C0B3]">
          <span className="rounded-lg border border-[#332B22] bg-[#1C1814] px-3 py-1.5">
            Active Policies:{' '}
            <strong className="text-[#E3B963]">
              {Object.values(policies).filter(Boolean).length} / 6
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}

function ImpactRow({
  label,
  value,
  invertGood,
}: {
  label: string
  value: number
  invertGood: boolean
}) {
  const isPositiveGood = invertGood ? value <= 0 : value >= 0
  const formatted = value > 0 ? `+${value}%` : `${value}%`
  return (
    <div className="flex items-center justify-between border-b border-[#25201B] pb-1.5 last:border-none last:pb-0">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            isPositiveGood ? 'bg-[#4C9A6A]' : 'bg-[#C45A3E]'
          }`}
        />
        <span className="text-[#C8C0B3]">{label}</span>
      </div>
      <span
        className={`mono font-bold ${
          isPositiveGood ? 'text-[#5BB37D]' : 'text-[#D96B52]'
        }`}
      >
        {formatted}
      </span>
    </div>
  )
}
