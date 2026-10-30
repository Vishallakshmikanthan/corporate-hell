/**
 * CORPORATE HELL™ — Section 05: Finance & Corporate Treasury.
 *
 * Complete executive financial command center:
 * - Top 4 KPIs: Treasury Balance, Monthly Revenue Run-Rate, Monthly Burn Rate, Runway & Health Grade
 * - Revenue vs Expenses AreaChart (warm gold & terracotta palette — zero blue)
 * - Expense Breakdown, Revenue Streams, Cap Table & Debt Ledger
 * - 6 working Treasury Actions (Loans, Cost Consolidation, Pricing Power, SAFE Bridge, GAAP Audit, Bonuses)
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { audio } from '../../services/audio'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gift,
  AlertTriangle,
  ShieldCheck,
  Presentation,
  Landmark,
  Scissors,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export function FinanceView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [feedback, setFeedback] = useState<string | null>(null)

  if (!state) return null

  const notify = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  const activeEmployees = Object.values(state.employees).filter((e) => e.active)
  const dailyPayroll = activeEmployees.reduce((acc, e) => acc + e.salary, 0)
  const dailyInfra = Math.round((state.infra?.monthlyCost || 2400) / 30)
  const dailyOverhead = 800 + activeEmployees.length * 50
  const dailyBurn = dailyPayroll + dailyOverhead + dailyInfra

  const dailyRetainer = state.baseRetainer
  const productRev = state.product
    ? Math.round(
        (state.product.quality * 20 + state.product.hype * 15) *
          (state.customerSatisfaction / 100),
      )
    : 0
  const dailyRevenue = dailyRetainer + productRev
  const dailyNet = dailyRevenue - dailyBurn

  const monthlyRevenue = dailyRevenue * 30
  const monthlyBurn = dailyBurn * 30
  const runwayDays =
    dailyNet >= 0 ? 999 : dailyBurn > 0 ? Math.max(0, Math.floor(state.cash / Math.abs(dailyNet))) : 99

  const loanBalance = Number(state.flags.loanBalance || 0)
  const totalDiluted = Number(state.flags.totalEquityDiluted || 15)
  const founderEquity = Math.max(15, 100 - totalDiluted)
  const totalRaised = Number(state.flags.totalCapitalRaised || 120000)

  // Financial Health Grade (A-F)
  const healthGrade =
    state.cash >= 40000 && dailyNet >= -200
      ? { grade: 'A', label: 'Fortress Balance Sheet', color: 'text-[#65b87b]' }
      : state.cash >= 22000
        ? { grade: 'B+', label: 'Healthy Operating Runway', color: 'text-[#e5c478]' }
        : state.cash >= 10000
          ? { grade: 'C', label: 'Elevated Burn Watch', color: 'text-[#f5c66b]' }
          : { grade: 'D', label: 'Liquidity Alert — Raise Now', color: 'text-[#f08578]' }

  // Chart data from state.history + 3-point forecast
  const chartData = state.history.map((h) => ({
    day: `Day ${h.day}`,
    revenue: h.revenue,
    costs: h.costs,
    cash: h.cashAfter,
  }))

  if (chartData.length === 0) {
    chartData.push(
      {
        day: 'Day 1 (Est)',
        revenue: dailyRevenue,
        costs: dailyBurn,
        cash: state.cash,
      },
      {
        day: 'Day 2 (Proj)',
        revenue: Math.round(dailyRevenue * 1.06),
        costs: dailyBurn,
        cash: state.cash + dailyNet,
      },
      {
        day: 'Day 3 (Proj)',
        revenue: Math.round(dailyRevenue * 1.12),
        costs: Math.round(dailyBurn * 0.98),
        cash: state.cash + dailyNet * 2,
      },
    )
  }

  // Expense Breakdown Percentages
  const totalExpParts = dailyPayroll + dailyInfra + dailyOverhead
  const payrollPct = Math.round((dailyPayroll / totalExpParts) * 100)
  const infraPct = Math.round((dailyInfra / totalExpParts) * 100)
  const opsPct = Math.max(5, 100 - payrollPct - infraPct)

  const runTreasuryAction = (
    subtype:
      | 'take_loan'
      | 'repay_loan'
      | 'cut_costs'
      | 'increase_pricing'
      | 'emergency_fundraise'
      | 'prepare_financials',
    amount?: number,
  ) => {
    audio.playClick()
    const res = dispatch({ type: 'treasury_action', subtype, amount })
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
            05
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
              FINANCE & CORPORATE TREASURY
            </h1>
            <p className="text-xs text-[#b5a695]">
              Track revenue streams, control departmental burn, manage credit facilities, and ensure survival.
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
            onClick={() => setActiveTab('pitch')}
            className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <Presentation className="h-3.5 w-3.5" />
            <span>Raise Capital in Boardroom →</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main Scrollable Content */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Top 4 Executive Financial KPI Cards (matches reference-ui #05) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* KPI 1: Treasury Balance */}
          <div className="panel-dark p-5">
            <div className="flex items-center justify-between text-xs text-[#b5a695]">
              <span className="font-bold uppercase tracking-wider">Treasury Balance</span>
              <DollarSign className="h-4 w-4 text-[#d4a84f]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif-title text-3xl font-extrabold text-[#faf7f0] mono">
                ${state.cash.toLocaleString()}
              </span>
              <span
                className={`text-xs font-bold ${
                  dailyNet >= 0 ? 'text-[#65b87b]' : 'text-[#e5c478]'
                }`}
              >
                {dailyNet >= 0 ? '+Solvent' : `${dailyNet}/d`}
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#9e8e7c]">
              Valuation: ${((state.growth?.valuation || 8500000) / 1_000_000).toFixed(1)}M Post-Money
            </div>
          </div>

          {/* KPI 2: Monthly Revenue Run-Rate */}
          <div className="panel-dark p-5">
            <div className="flex items-center justify-between text-xs text-[#b5a695]">
              <span className="font-bold uppercase tracking-wider">Monthly Revenue</span>
              <TrendingUp className="h-4 w-4 text-[#65b87b]" />
            </div>
            <div className="mt-2 font-serif-title text-3xl font-extrabold text-[#65b87b] mono">
              ${monthlyRevenue.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-[#9e8e7c]">
              ${dailyRevenue.toLocaleString()}/day recurring + product income
            </div>
          </div>

          {/* KPI 3: Monthly Burn Rate */}
          <div className="panel-dark p-5">
            <div className="flex items-center justify-between text-xs text-[#b5a695]">
              <span className="font-bold uppercase tracking-wider">Monthly Burn</span>
              <TrendingDown className="h-4 w-4 text-[#f08578]" />
            </div>
            <div className="mt-2 font-serif-title text-3xl font-extrabold text-[#f08578] mono">
              ${monthlyBurn.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-[#9e8e7c]">
              ${dailyPayroll.toLocaleString()}/d payroll • ${(dailyOverhead + dailyInfra).toLocaleString()}/d ops
            </div>
          </div>

          {/* KPI 4: Runway & Financial Health Grade */}
          <div className="panel-dark p-5">
            <div className="flex items-center justify-between text-xs text-[#b5a695]">
              <span className="font-bold uppercase tracking-wider">Runway & Health</span>
              <Calendar className="h-4 w-4 text-[#d4a84f]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif-title text-3xl font-extrabold text-[#e5c478] mono">
                {runwayDays === 999 ? 'Infinite' : `${runwayDays} Days`}
              </span>
              <span className={`font-serif-title text-2xl font-extrabold ${healthGrade.color}`}>
                Grade {healthGrade.grade}
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-[#9e8e7c]">{healthGrade.label}</div>
          </div>
        </div>

        {/* Middle Row: Revenue vs Burn Chart (8 cols) + Expense Breakdown & Cap Table (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Revenue vs Operating Costs Chart */}
          <div className="lg:col-span-8 panel-dark p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#e5c478]">
                    Revenue vs Operating Burn & Forecast
                  </h3>
                  <p className="text-xs text-[#b5a695]">
                    Daily accounting ledger and forward trajectory
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[#e5c478] font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#d4a84f]" /> Revenue
                  </span>
                  <span className="flex items-center gap-1.5 text-[#f08578] font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e25848]" /> Operating Costs
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goldRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a84f" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#d4a84f" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="terraCostGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e25848" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#e25848" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#352c25" />
                    <XAxis dataKey="day" stroke="#9e8e7c" fontSize={11} />
                    <YAxis stroke="#9e8e7c" fontSize={11} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1a16',
                        borderColor: '#d4a84f',
                        borderRadius: '12px',
                        color: '#faf7f0',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d4a84f"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#goldRevGrad)"
                      name="Daily Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="costs"
                      stroke="#e25848"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#terraCostGrad)"
                      name="Operating Costs"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6 Quick Executive Treasury Action Pills (matches reference-ui #05 bottom bar) */}
            <div className="mt-4 pt-4 border-t border-[#d4a84f]/20 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => runTreasuryAction('take_loan', 25000)}
                className="flex items-center justify-between rounded-xl bg-[#181410] hover:bg-[#27211c] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#faf7f0]">Draw Credit Facility</div>
                  <div className="text-[10px] text-[#65b87b]">+$25,000 Cash (8% interest)</div>
                </div>
                <Landmark className="h-4 w-4 text-[#d4a84f]" />
              </button>

              <button
                onClick={() => runTreasuryAction('repay_loan')}
                className="flex items-center justify-between rounded-xl bg-[#181410] hover:bg-[#27211c] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#faf7f0]">Repay Venture Loan</div>
                  <div className="text-[10px] text-[#e5c478]">
                    {loanBalance > 0 ? `Pay $${loanBalance.toLocaleString()}` : 'Zero debt active'}
                  </div>
                </div>
                <ShieldCheck className="h-4 w-4 text-[#65b87b]" />
              </button>

              <button
                onClick={() => runTreasuryAction('cut_costs')}
                className="flex items-center justify-between rounded-xl bg-[#181410] hover:bg-[#27211c] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#faf7f0]">Consolidate SaaS Costs</div>
                  <div className="text-[10px] text-[#65b87b]">-$600 Burn • -6 Morale</div>
                </div>
                <Scissors className="h-4 w-4 text-[#e8a33d]" />
              </button>

              <button
                onClick={() => runTreasuryAction('increase_pricing')}
                className="flex items-center justify-between rounded-xl bg-[#181410] hover:bg-[#27211c] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#faf7f0]">Increase Enterprise Pricing</div>
                  <div className="text-[10px] text-[#e5c478]">+12% Base Retainer</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#65b87b]" />
              </button>

              <button
                onClick={() => runTreasuryAction('emergency_fundraise')}
                className="flex items-center justify-between rounded-xl bg-[#181410] hover:bg-[#27211c] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#faf7f0]">Emergency SAFE Note</div>
                  <div className="text-[10px] text-[#e5c478]">+$12,000 Cash (6% Dilution)</div>
                </div>
                <DollarSign className="h-4 w-4 text-[#d4a84f]" />
              </button>

              <button
                onClick={() => runTreasuryAction('prepare_financials')}
                className="flex items-center justify-between rounded-xl bg-[#181410] hover:bg-[#27211c] border border-[#d4a84f]/25 p-3 text-left transition cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#faf7f0]">Certify GAAP Financials</div>
                  <div className="text-[10px] text-[#65b87b]">-$500 • +6 Investor Conf</div>
                </div>
                <FileSpreadsheet className="h-4 w-4 text-[#d4a84f]" />
              </button>
            </div>
          </div>

          {/* Right Column: Expense Breakdown + Cap Table & Revenue Streams */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Expense Breakdown Card */}
            <div className="panel-dark p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4a84f]/20">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                  <PieChart className="h-4 w-4 text-[#d4a84f]" />
                  <span>Expense Breakdown</span>
                </span>
                <span className="mono text-xs font-bold text-[#faf7f0]">
                  ${dailyBurn.toLocaleString()}/day
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#d8cdc0]">Salaries & Benefits ({activeEmployees.length})</span>
                    <span className="mono font-bold text-[#faf7f0]">
                      ${dailyPayroll.toLocaleString()}/d ({payrollPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#352c25] overflow-hidden">
                    <div className="h-full bg-[#d4a84f]" style={{ width: `${payrollPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#d8cdc0]">Office, Facilities & Legal</span>
                    <span className="mono font-bold text-[#faf7f0]">
                      ${dailyOverhead.toLocaleString()}/d ({opsPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#352c25] overflow-hidden">
                    <div className="h-full bg-[#b88933]" style={{ width: `${opsPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#d8cdc0]">Cloud & GPU Infrastructure</span>
                    <span className="mono font-bold text-[#faf7f0]">
                      ${dailyInfra.toLocaleString()}/d ({infraPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#352c25] overflow-hidden">
                    <div className="h-full bg-[#e8a33d]" style={{ width: `${infraPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cap Table, Funding & Investors Card */}
            <div className="panel-cream p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#d4c8b0] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181411]">
                  Cap Table & Investor Relations
                </span>
                <span className="mono text-xs font-extrabold text-[#966c22]">
                  {state.investorConfidence}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-[#e6decb]/80 p-2.5">
                  <div className="text-[10px] text-[#5c4e41] uppercase font-semibold">
                    Founder Ownership
                  </div>
                  <div className="mono text-base font-extrabold text-[#181411]">
                    {founderEquity}%
                  </div>
                </div>
                <div className="rounded-lg bg-[#e6decb]/80 p-2.5">
                  <div className="text-[10px] text-[#5c4e41] uppercase font-semibold">
                    VC Syndicate Stake
                  </div>
                  <div className="mono text-base font-extrabold text-[#966c22]">
                    {totalDiluted}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#5c4e41] font-medium">Total Capital Raised:</span>
                <span className="mono font-extrabold text-[#181411]">
                  ${totalRaised.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5c4e41] font-medium">Active Venture Debt:</span>
                <span className="mono font-extrabold text-[#a63428]">
                  ${loanBalance.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  const res = dispatch({ type: 'bonus_all' })
                  if (res.message) notify(res.message)
                  else if (res.reason) notify(res.reason)
                }}
                className="mt-2 w-full rounded-xl bg-[#1f1a16] hover:bg-[#352c25] text-[#e5c478] py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Gift className="h-3.5 w-3.5" />
                <span>Distribute Company-Wide Bonus ($600/staff)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
