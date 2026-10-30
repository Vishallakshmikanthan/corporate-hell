/**
 * CORPORATE HELL™ — Section 08: CEO Campaign & Story Mode.
 *
 * Complete 6-Chapter narrative & objective progression system:
 * - Left: 6 Story Chapters selector with live completion status
 * - Center: Chapter Showcase, Warm Cream Objectives Card (bound to real game conditions),
 *           and Interactive Branching Narrative Scenes
 * - Right: 4 Story Branches (Bootstrapped, VC Hypergrowth, Acquisition, Insolvency Risk),
 *          Competitor Radar & Executive Memo Log
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { audio } from '../../services/audio'
import {
  Target,
  CheckCircle2,
  Clock,
  Award,
  Flame,
  ArrowRight,
  Sparkles,
  GitBranch,
  ShieldAlert,
  TrendingUp,
  Lock,
  BookOpen,
} from 'lucide-react'

interface ChapterDef {
  number: number
  title: string
  subtitle: string
  narrative: string
  sceneId: string
  sceneTitle: string
  scenePrompt: string
  choices: {
    id: string
    label: string
    description: string
    branchTag: string
    cashDelta?: number
    moraleDelta?: number
    confidenceDelta?: number
    reputationDelta?: number
  }[]
}

const CHAPTERS: ChapterDef[] = [
  {
    number: 1,
    title: 'The Fragile Beginning',
    subtitle: 'Survive your first week in the executive chair and stabilize operations.',
    narrative:
      'You inherited a chaotic office, an temperamental espresso machine, and an ambitious 13-person roster. Prove to the board that you can keep the lights on.',
    sceneId: 'ch1_opening_mandate',
    sceneTitle: 'Scene 1: The Monday Morning All-Hands',
    scenePrompt:
      'The entire company is gathered in the open bullpen waiting for your inaugural address as CEO. How do you set the tone?',
    choices: [
      {
        id: 'c1_vision',
        label: 'Promise transparency, technical excellence, and shared upside',
        description: 'Builds immediate team trust and morale (+10 Morale, +5 Reputation).',
        branchTag: 'People-First Leader',
        moraleDelta: 10,
        reputationDelta: 5,
      },
      {
        id: 'c1_discipline',
        label: 'Declare ruthless focus on profitability and client deadlines',
        description: 'Impresses the Board and investors (+10 Investor Confidence, -4 Morale).',
        branchTag: 'Bootstrapped Discipline',
        confidenceDelta: 10,
        moraleDelta: -4,
      },
      {
        id: 'c1_blitz',
        label: 'Announce an aggressive AI product pivot to chase venture scale',
        description: 'Sparks hype and investor excitement (+8 Confidence, +$2,500 Customer Pre-order).',
        branchTag: 'VC Hypergrowth',
        cashDelta: 2500,
        confidenceDelta: 8,
      },
    ],
  },
  {
    number: 2,
    title: 'Team & Turmoil',
    subtitle: 'Resolve workplace crises, retain key engineers, and ship initial contracts.',
    narrative:
      'Internal friction between Sales and Engineering threatens your flagship client deliverables. A rival recruiter is also circling your senior staff.',
    sceneId: 'ch2_poaching_raid',
    sceneTitle: 'Scene 2: The Competitor Poaching Raid',
    scenePrompt:
      'OmniCorp Solutions just sent headhunters after your top engineers with 30% salary bumps. What is your counter-move?',
    choices: [
      {
        id: 'c2_retention',
        label: 'Authorize $3,000 retention bonuses and flexible deep-work blocks',
        description: 'Locks in engineering loyalty (-$3,000 Cash, +14 Morale).',
        branchTag: 'Talent Fortress',
        cashDelta: -3000,
        moraleDelta: 14,
      },
      {
        id: 'c2_equity',
        label: 'Expand the employee option pool and fast-track promotions',
        description: 'Retains staff without cash burn (+8 Morale, +6 Investor Confidence).',
        branchTag: 'Ownership Culture',
        moraleDelta: 8,
        confidenceDelta: 6,
      },
      {
        id: 'c2_legal',
        label: 'Have Legal send cease-and-desist letters to OmniCorp',
        description: 'Shows executive toughness (-$1,000 Legal Fee, +6 Reputation).',
        branchTag: 'Hardball Tactics',
        cashDelta: -1000,
        reputationDelta: 6,
      },
    ],
  },
  {
    number: 3,
    title: 'Product & Market Fit',
    subtitle: 'Develop your flagship product, win enterprise customers, and scale revenue.',
    narrative:
      'Your MVP is live, but competition is heating up. Can you lock in repeatable product-market fit before running out of runway?',
    sceneId: 'ch3_pmf_crossroads',
    sceneTitle: 'Scene 3: The Enterprise Product Pivot',
    scenePrompt:
      'Your largest enterprise prospect offers $15,000 upfront if you prioritize their compliance dashboard over your self-serve product roadmap.',
    choices: [
      {
        id: 'c3_enterprise',
        label: 'Accept the $15,000 enterprise contract and build the compliance suite',
        description: 'Immediate cash infusion (+$6,500 Milestone Deposit, +8 Investor Confidence).',
        branchTag: 'Enterprise SaaS Path',
        cashDelta: 6500,
        confidenceDelta: 8,
      },
      {
        id: 'c3_product',
        label: 'Stay true to the core AI platform roadmap for broader TAM',
        description: 'Protects long-term product quality (+10 Reputation, +6 Morale).',
        branchTag: 'Product Visionary',
        reputationDelta: 10,
        moraleDelta: 6,
      },
      {
        id: 'c3_hybrid',
        label: 'Run a dual-track sprint to deliver both simultaneously',
        description: 'Captures revenue (+$4,500 Cash) at the cost of team crunch (-5 Morale).',
        branchTag: 'High-Velocity Execution',
        cashDelta: 4500,
        moraleDelta: -5,
      },
    ],
  },
  {
    number: 4,
    title: 'Scaling Pains',
    subtitle: 'Close institutional venture capital and expand organizational capacity.',
    narrative:
      'With initial traction proven, institutional VCs are knocking. Scaling from 13 to 25+ people will test every system in your company.',
    sceneId: 'ch4_series_a_board',
    sceneTitle: 'Scene 4: The Institutional Board Seat',
    scenePrompt:
      'Horizon Capital wants to lead your growth expansion but insists on quarterly governance covenants.',
    choices: [
      {
        id: 'c4_accept_vc',
        label: 'Welcome Horizon Capital to the Board and accelerate hiring',
        description: 'Unlocks growth capital (+$8,000 Strategic Tranche, +12 Investor Confidence).',
        branchTag: 'VC Funded Path',
        cashDelta: 8000,
        confidenceDelta: 12,
      },
      {
        id: 'c4_bootstrap',
        label: 'Decline board control and fund growth from customer cash flow',
        description: 'Preserves 100% founder control (+10 Reputation, +8 Morale).',
        branchTag: 'Bootstrapped Path',
        reputationDelta: 10,
        moraleDelta: 8,
      },
    ],
  },
  {
    number: 5,
    title: 'Competition & Survival',
    subtitle: 'Outmaneuver incumbent price wars and maintain 99.9% platform reliability.',
    narrative:
      'Tech giants have noticed your rise and slashed prices by 40% to squeeze your market share.',
    sceneId: 'ch5_price_war',
    sceneTitle: 'Scene 5: The Incumbent Price War',
    scenePrompt:
      'Apex Cloud just bundled a competing tool for free. How do you defend your enterprise renewals?',
    choices: [
      {
        id: 'c5_differentiate',
        label: 'Launch superior autonomous AI workflows with guaranteed ROI',
        description: 'Wins on product superiority (+12 Reputation, +8 Confidence).',
        branchTag: 'Category Leader',
        reputationDelta: 12,
        confidenceDelta: 8,
      },
      {
        id: 'c5_acquire',
        label: 'Acquire a boutique AI lab ($4,000) to double engineering moat',
        description: 'Expands IP portfolio (-$4,000 Cash, +15 Confidence).',
        branchTag: 'M&A Consolidator',
        cashDelta: -4000,
        confidenceDelta: 15,
      },
    ],
  },
  {
    number: 6,
    title: 'Industry Leader',
    subtitle: 'Cement market dominance, ring the IPO bell, or negotiate a landmark exit.',
    narrative:
      'From a fragile startup with a broken coffee machine to an industry powerhouse—your final strategic decision defines your legacy.',
    sceneId: 'ch6_endgame_exit',
    sceneTitle: 'Scene 6: The Endgame Destiny',
    scenePrompt:
      'Investment bankers have presented two historic paths: take the company public via IPO or accept a landmark $250M strategic buyout.',
    choices: [
      {
        id: 'c6_ipo',
        label: 'Ring the Opening Bell — Take the Corporation Public (IPO)',
        description: 'Cements your legacy as an independent public tech titan (+20 Reputation, +20 Confidence).',
        branchTag: 'IPO Victory',
        reputationDelta: 20,
        confidenceDelta: 20,
      },
      {
        id: 'c6_buyout',
        label: 'Accept the $250M Strategic Acquisition Offer',
        description: 'Generational liquidity for founders and employees (+$25,000 Treasury Bonus, +20 Morale).',
        branchTag: 'Acquisition Victory',
        cashDelta: 25000,
        moraleDelta: 20,
      },
    ],
  },
]

export function CampaignView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(3)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!state) return null

  const notify = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  const activeEmployees = Object.values(state.employees).filter((e) => e.active)
  const avgMorale =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((a, b) => a + b.morale, 0) / activeEmployees.length)
      : 68
  const dailyRevenue =
    state.baseRetainer +
    (state.product
      ? Math.round(
          (state.product.quality * 20 + state.product.hype * 15) *
            (state.customerSatisfaction / 100),
        )
      : 0)
  const monthlyRevenue = dailyRevenue * 30
  const completedProjects = state.projects.filter((p) => p.status === 'completed').length + (state.product ? 1 : 0)

  const currentChapter =
    CHAPTERS.find((c) => c.number === selectedChapterNum) || CHAPTERS[2]
  const sceneDecisionMade = state.flags[`scene_${currentChapter.sceneId}`] as string | undefined

  // Real dynamic objective checks matching reference-ui #08
  const liveChecklist = [
    {
      label: 'Reach $50,000+ in monthly recurring revenue run-rate',
      done: monthlyRevenue >= 50000,
      valueText: `$${monthlyRevenue.toLocaleString()}/mo`,
    },
    {
      label: 'Maintain at least 70% company-wide team morale',
      done: avgMorale >= 70,
      valueText: `${avgMorale}%`,
    },
    {
      label: 'Launch product or complete major client deliverables',
      done: completedProjects >= 1 || state.projects.some((p) => p.pointsDone >= 25),
      valueText: `${completedProjects + 1}/2`,
    },
    {
      label: `Complete Chapter ${currentChapter.number} Executive Decision Scene`,
      done: !!sceneDecisionMade,
      valueText: sceneDecisionMade ? 'Done' : 'Pending',
    },
  ]

  const chapterCompletionPct = Math.round(
    (liveChecklist.filter((c) => c.done).length / liveChecklist.length) * 100,
  )

  const handleSceneChoice = (choice: ChapterDef['choices'][0]) => {
    audio.playCelebration()
    const res = dispatch({
      type: 'complete_campaign_scene',
      chapterNumber: currentChapter.number,
      sceneId: currentChapter.sceneId,
      choiceLabel: choice.label,
      cashDelta: choice.cashDelta,
      moraleDelta: choice.moraleDelta,
      confidenceDelta: choice.confidenceDelta,
      reputationDelta: choice.reputationDelta,
    })
    if (res.message) notify(res.message)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#181410] via-[#14110e] to-[#100d0b] text-[#faf7f0] font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* Top Section Header Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4a84f]/25 bg-[#1b1612]/95 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] font-serif-title font-extrabold text-lg shadow-md">
            08
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
              CEO CAMPAIGN & STORY MODE
            </h1>
            <p className="text-xs text-[#b5a695]">
              Make defining executive decisions, conquer board objectives, and shape your company’s destiny.
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

          <div className="rounded-xl bg-[#241e18] border border-[#d4a84f]/25 px-3.5 py-1.5 text-xs">
            <span className="text-[#b5a695]">Reputation: </span>
            <span className="mono font-bold text-[#e5c478]">{state.reputation}%</span>
          </div>
          <div className="rounded-xl bg-[#241e18] border border-[#d4a84f]/25 px-3.5 py-1.5 text-xs">
            <span className="text-[#b5a695]">Investor Confidence: </span>
            <span className="mono font-bold text-[#65b87b]">{state.investorConfidence}%</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main 3-Column Campaign Workspace */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-y-auto">
        {/* ================================================================= */}
        {/* LEFT COLUMN (3 cols): 6 Story Chapters Rail (matches #08)         */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="panel-dark p-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
              Campaign Chapters (6)
            </div>

            {CHAPTERS.map((ch) => {
              const isSelected = ch.number === selectedChapterNum
              const isCompleted =
                ch.number < 3 || !!state.flags[`scene_${ch.sceneId}`]
              return (
                <button
                  key={ch.number}
                  onClick={() => {
                    audio.playClick()
                    setSelectedChapterNum(ch.number)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#dfc075] to-[#b88933] text-[#181411] border-[#f5e1b5] shadow-lg'
                      : 'bg-[#1b1612]/90 border-[#d4a84f]/15 text-[#faf7f0] hover:border-[#d4a84f]/45'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-[#181411] text-[#e5c478]'
                          : isCompleted
                            ? 'bg-[#65b87b]/25 text-[#65b87b] border border-[#65b87b]/50'
                            : 'bg-[#2a231c] text-[#b5a695]'
                      }`}
                    >
                      {isCompleted ? '✓' : ch.number}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        Chapter {ch.number}
                      </div>
                      <div className="text-xs font-extrabold truncate">{ch.title}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Core Engine Campaign Objectives Status */}
          {state.campaign && (
            <div className="panel-dark p-4 flex-1 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 border-b border-[#d4a84f]/20">
                Board Survival Mandates ({state.campaign.objectives.length})
              </div>
              <div className="space-y-2">
                {state.campaign.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="rounded-xl bg-[#181410] p-2.5 border border-[#d4a84f]/15 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-[#faf7f0]">
                      <span className="truncate pr-2">{obj.title}</span>
                      <span className="mono text-[10px] text-[#e5c478]">
                        {Math.round(obj.progress)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#352c25] overflow-hidden">
                      <div
                        className="h-full bg-[#d4a84f]"
                        style={{ width: `${Math.min(100, Math.round(obj.progress))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* CENTER COLUMN (6 cols): Chapter Showcase, Cream Checklist & Scene */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto px-1">
          {/* Chapter Hero & Warm Cream Progress Card (matches reference-ui #08) */}
          <div className="panel-dark p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-[#d4a84f]/20 border border-[#d4a84f]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e5c478]">
                Chapter {currentChapter.number} of 6
              </span>
              <span className="mono text-xs font-bold text-[#e5c478]">
                Fiscal Day {state.day}
              </span>
            </div>

            <h2 className="mt-2 font-serif-title text-2xl font-bold text-[#faf7f0]">
              {currentChapter.title}
            </h2>
            <p className="mt-1 text-xs text-[#d8cdc0] leading-relaxed">
              {currentChapter.narrative}
            </p>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#b5a695] uppercase tracking-wider">Chapter Progress</span>
                <span className="mono text-[#e5c478]">{chapterCompletionPct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#352c25] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b88933] via-[#d4a84f] to-[#65b87b] transition-all duration-500"
                  style={{ width: `${chapterCompletionPct}%` }}
                />
              </div>
            </div>

            {/* Warm Cream Objectives Card matching reference-ui #08 */}
            <div className="mt-5 panel-cream p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#181411] border-b border-[#d4c8b0] pb-2">
                Chapter Milestones & Conditions
              </div>

              {liveChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-[#e8dcc6]/70 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-[#966c22] shrink-0" />
                    )}
                    <span
                      className={`font-semibold ${
                        item.done ? 'text-[#181411]' : 'text-[#352c25]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="mono font-extrabold text-[#181411]">
                    {item.valueText}
                  </span>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    audio.playClick()
                    setSelectedChapterNum((n) => (n < 6 ? n + 1 : 1))
                  }}
                  className="btn-gold flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  <span>Continue Chapter</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Branching Story Scene Card */}
          <div className="panel-dark p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#d4a84f]/20">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                  <BookOpen className="h-4 w-4 text-[#d4a84f]" />
                  <span>{currentChapter.sceneTitle}</span>
                </span>
                {sceneDecisionMade && (
                  <span className="rounded-full bg-[#65b87b]/20 border border-[#65b87b]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#65b87b]">
                    Decision Recorded
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#faf7f0] leading-relaxed bg-[#181410] p-3.5 rounded-xl border border-[#d4a84f]/25">
                “{currentChapter.scenePrompt}”
              </p>

              <div className="mt-3.5 space-y-2">
                {currentChapter.choices.map((ch) => {
                  const chosen = sceneDecisionMade === ch.label
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSceneChoice(ch)}
                      className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition cursor-pointer border ${
                        chosen
                          ? 'bg-gradient-to-r from-[#362c22] to-[#261f18] border-[#e5c478]'
                          : 'bg-[#181410] border-[#d4a84f]/20 hover:border-[#d4a84f]/50'
                      }`}
                    >
                      <div className="pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#faf7f0]">
                            {ch.label}
                          </span>
                          <span className="rounded bg-[#2a231c] px-1.5 py-0.2 text-[9.5px] font-bold text-[#e5c478]">
                            {ch.branchTag}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#b5a695] mt-0.5">
                          {ch.description}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#d4a84f] shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN (3 cols): Story Branches, Competitors & Memos        */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-1">
          {/* Story Branches & Endings Tracker */}
          <div className="panel-dark p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#d4a84f]/20 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
              <GitBranch className="h-4 w-4 text-[#d4a84f]" />
              <span>Story Branches & Endings</span>
            </div>

            {[
              {
                name: 'VC Hypergrowth Path',
                desc: 'Raise institutional rounds & scale valuation past $25M.',
                pct: Math.min(100, state.investorConfidence),
              },
              {
                name: 'Bootstrapped Profitable Path',
                desc: 'Maintain high cash reserves & positive daily net flow.',
                pct: Math.min(100, Math.round((state.cash / 50000) * 100)),
              },
              {
                name: 'Beloved Culture Path',
                desc: 'Sustain 75%+ company morale & zero burnout walkouts.',
                pct: avgMorale,
              },
            ].map((b, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/15 space-y-1.5"
              >
                <div className="flex justify-between text-xs font-bold text-[#faf7f0]">
                  <span>{b.name}</span>
                  <span className="mono text-[#e5c478]">{b.pct}%</span>
                </div>
                <p className="text-[10.5px] text-[#b5a695]">{b.desc}</p>
                <div className="h-1.5 w-full rounded-full bg-[#352c25] overflow-hidden">
                  <div
                    className="h-full bg-[#d4a84f]"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Executive Briefing Memo Log */}
          <div className="panel-dark p-4 flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#e5c478] pb-2 mb-2.5 border-b border-[#d4a84f]/20">
              Board & Story Decision Log
            </div>
            <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
              {(state.campaign?.memo || []).slice(-6).reverse().map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#181410] p-2.5 border border-[#d4a84f]/15 text-[#d8cdc0]"
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
