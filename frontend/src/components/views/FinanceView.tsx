/**
 * CORPORATE HELL™ — Finance & Performance View.
 *
 * Balance sheet, cash runway, income breakdown, expense trends,
 * and recharts financial visualizations.
 */
import { useGameStore } from '../../state/gameStore'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gift,
  AlertCircle,
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

  if (!state) return null

  const activeEmployees = Object.values(state.employees).filter((e) => e.active)
  const dailyPayroll = activeEmployees.reduce((acc, e) => acc + e.salary, 0)
  const dailyOverhead = 800 + activeEmployees.length * 50
  const dailyBurn = dailyPayroll + dailyOverhead
  const dailyRetainer = state.baseRetainer
  const productRev = state.product
    ? Math.round((state.product.quality * 20 + state.product.hype * 15) * (state.customerSatisfaction / 100))
    : 0
  const dailyNet = dailyRetainer + productRev - dailyBurn

  // Estimated runway in fiscal days
  const runwayDays = dailyBurn > 0 ? Math.max(0, Math.floor(state.cash / dailyBurn)) : 99

  // Prepare chart data from state.history
  const chartData = state.history.map((h) => ({
    day: `Day ${h.day}`,
    revenue: h.revenue,
    costs: h.costs,
    cash: h.cashAfter,
  }))

  // If day 1 and no history yet, display initial baseline point
  if (chartData.length === 0) {
    chartData.push({
      day: 'Day 1',
      revenue: dailyRetainer + productRev,
      costs: dailyBurn,
      cash: state.cash,
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none">
      <div className="border-b border-ink-800 pb-5">
        <h2 className="font-display text-xl font-bold text-paper-50 uppercase tracking-wide">
          Financial Treasury & Cash Runway
        </h2>
        <p className="text-xs text-ink-400">
          Statutory accounting, cash flow burn rate, and financial stability projections
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cash Balance */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>Treasury Reserves</span>
            <DollarSign className="h-4 w-4 text-acid-400" />
          </div>
          <div className="mt-2 font-display text-2xl font-black text-paper-50">
            ${state.cash.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-ink-400">
            {state.cash < 8000 ? (
              <span className="text-alert-400 font-bold">CRITICAL RESERVES</span>
            ) : (
              'Solvent reserves'
            )}
          </div>
        </div>

        {/* Daily Net Cash Flow */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>Daily Net Cash Flow</span>
            {dailyNet >= 0 ? (
              <TrendingUp className="h-4 w-4 text-acid-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-alert-400" />
            )}
          </div>
          <div
            className={`mt-2 font-display text-2xl font-black ${
              dailyNet >= 0 ? 'text-acid-400' : 'text-alert-400'
            }`}
          >
            {dailyNet >= 0 ? '+' : ''}${dailyNet.toLocaleString()}/day
          </div>
          <div className="mt-1 text-[11px] text-ink-400">
            ${(dailyRetainer + productRev).toLocaleString()} in • ${dailyBurn.toLocaleString()} out
          </div>
        </div>

        {/* Cash Runway */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>Estimated Runway</span>
            <Calendar className="h-4 w-4 text-corp-400" />
          </div>
          <div className="mt-2 font-display text-2xl font-black text-paper-50">
            {runwayDays} Days
          </div>
          <div className="mt-1 text-[11px] text-ink-400">Until liquidity depletion</div>
        </div>

        {/* Investor Confidence */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>Investor Confidence</span>
            <span className="mono font-bold text-corp-400">{state.investorConfidence}%</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-ink-800 overflow-hidden">
            <div
              style={{ width: `${state.investorConfidence}%` }}
              className="h-full bg-corp-400 transition-all"
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-ink-400">
            <span>Audit Risk: {state.auditRisk}%</span>
            <span>KPI Inflation: {state.kpiInflation}%</span>
          </div>
        </div>
      </div>

      {/* Financial History Chart */}
      <div className="mt-6 rounded-2xl border border-ink-800 bg-ink-900/80 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-paper-100 uppercase tracking-wider mb-4">
          Fiscal Performance Trends (Revenue vs Costs)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f6df0" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#4f6df0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e25848" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#e25848" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e37" />
              <XAxis dataKey="day" stroke="#78808f" fontSize={11} />
              <YAxis stroke="#78808f" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1b1e24',
                  borderColor: '#3a3f4b',
                  borderRadius: '12px',
                  color: '#f6f3ea',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f6df0"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="costs"
                stroke="#e25848"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCost)"
                name="Operating Costs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bonus / Dividend Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-800 bg-ink-900/60 p-5">
        <div>
          <h4 className="font-bold text-sm text-paper-100">Discretionary Capital Allocation</h4>
          <p className="text-xs text-ink-400">
            Distribute spot bonuses to all personnel to dramatically elevate morale
          </p>
        </div>

        <button
          onClick={() => dispatch({ type: 'bonus_all' })}
          className="flex items-center gap-2 rounded-xl bg-acid-400 px-4 py-2.5 text-xs font-bold text-ink-950 transition hover:bg-acid-500 active:scale-95 shadow-md"
        >
          <Gift className="h-4 w-4" />
          <span>Distribute Company-Wide Bonus ($600 / person)</span>
        </button>
      </div>
    </div>
  )
}
