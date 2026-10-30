/**
 * CORPORATE HELL™ — Section 02: Investor Pitch & Boardroom Negotiations.
 *
 * Playable 5-round boardroom negotiation experience:
 * - 4 distinct Venture Partners with individual sentiment meters & focus areas
 * - 6 interactive Pitch Deck slides that align with investor questions
 * - 3 strategic response choices per round + AI-powered custom executive response
 * - Valuation & Equity dilution negotiation levers
 * - Deterministic Full / Partial / Rejected funding outcomes persisted to CompanyState
 */
import { useState, useMemo } from 'react'
import { useGameStore } from '../../state/gameStore'
import { requestPitchEvaluation } from '../../services/api'
import { audio } from '../../services/audio'
import {
  Presentation,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Users,
  DollarSign,
  BarChart3,
  Cpu,
  Layers,
  Send,
  Loader2,
  Award,
} from 'lucide-react'

interface InvestorPartner {
  id: string
  name: string
  firm: string
  role: string
  personality: string
  focus: string
  avatarBg: string
  initials: string
  sentiment: number
  lastReaction: string
}

interface PitchSlide {
  id: number
  title: string
  subtitle: string
  tag: string
  keyMetricLabel: string
  bullets: string[]
}

interface PitchOption {
  id: 'A' | 'B' | 'C'
  label: string
  subtitle: string
  tone: string
  partnerDeltas: Record<string, number>
  confidenceDelta: number
  feedback: string
}

interface PitchRound {
  round: number
  investorId: string
  investorName: string
  difficulty: 'Medium' | 'Hard' | 'Critical'
  recommendedSlideId: number
  question: string
  contextHint: string
  options: PitchOption[]
}

const PITCH_SLIDES: PitchSlide[] = [
  {
    id: 1,
    title: 'Problem & Enterprise Bottleneck',
    subtitle: 'Legacy workflows cost Fortune 500 teams 34% of engineering velocity',
    tag: 'Problem',
    keyMetricLabel: '34% Wasted Engineering Hours',
    bullets: [
      'Fragmented deployment & approval pipelines across hybrid cloud teams',
      'Rising operational overhead and alert fatigue across DevOps & SRE',
      'Urgent C-suite mandate for deterministic AI workflow automation',
    ],
  },
  {
    id: 2,
    title: 'Solution & Autonomous AI Core',
    subtitle: 'Proprietary neural orchestration with deterministic guardrails',
    tag: 'Product & AI',
    keyMetricLabel: '99.8% Uptime SLA',
    bullets: [
      'Zero-config integration with enterprise repositories and CI/CD pipelines',
      'Sub-50ms inference routing with automated rollback protection',
      'Deep defensive moat built on proprietary operational telemetry',
    ],
  },
  {
    id: 3,
    title: 'Market Opportunity & Expansion',
    subtitle: 'Capturing the $42B Enterprise Autonomous Infrastructure TAM',
    tag: 'Market Size',
    keyMetricLabel: '$42.0B Global TAM',
    bullets: [
      '140% YoY enterprise budget shift toward AI infrastructure automation',
      'Land-and-expand seat licensing from 50-seat pilots to company-wide rollouts',
      'High switching costs once embedded in daily engineering workflows',
    ],
  },
  {
    id: 4,
    title: 'Traction, Revenue & Unit Economics',
    subtitle: 'High-margin recurring retainers and expanding enterprise contracts',
    tag: 'Traction',
    keyMetricLabel: '76% Gross Margin',
    bullets: [
      'Strong daily retainer baseline with active Fortune 500 delivery milestones',
      'LTV / CAC ratio exceeding 4.2x with net dollar retention at 128%',
      'Disciplined burn multiple with clear visibility to cash-flow positivity',
    ],
  },
  {
    id: 5,
    title: 'World-Class Team & Execution Velocity',
    subtitle: 'Battle-tested engineers, SREs, and enterprise sales leaders',
    tag: 'Team',
    keyMetricLabel: '13 Core Specialists',
    bullets: [
      'Senior technical architecture led by veteran distributed-systems engineers',
      'Cross-functional alignment across Engineering, Sales, Marketing, and Ops',
      'Rapid shipping cadence with automated quality and test coverage',
    ],
  },
  {
    id: 6,
    title: 'Financial Projections & Capital Allocation',
    subtitle: '18-month runway to $2.5M ARR and Series B readiness',
    tag: 'Financials',
    keyMetricLabel: '18-Month Runway Target',
    bullets: [
      '60% R&D & AI infrastructure, 25% Enterprise GTM, 15% Working Capital reserve',
      'Tripling enterprise outbound capacity while lowering cloud unit costs by 30%',
      'Clear milestone triggers for profitable scale',
    ],
  },
]

const PITCH_ROUNDS: PitchRound[] = [
  {
    round: 1,
    investorId: 'inv_james',
    investorName: 'James Carter (Horizon Capital)',
    difficulty: 'Medium',
    recommendedSlideId: 4,
    question:
      'Your top-line traction is promising, CEO, but how sustainable is your customer acquisition cost as you scale into enterprise accounts?',
    contextHint: 'Tip: Select Slide 4 (Traction & Unit Economics) before answering for a +6% alignment bonus.',
    options: [
      {
        id: 'A',
        label: 'Highlight revenue growth, 4.2x LTV/CAC, and expanding enterprise retainers',
        subtitle: 'Strong and confident data-driven approach',
        tone: 'Confident & Analytical',
        partnerDeltas: { inv_james: 14, inv_sarah: 8, inv_priya: 6, inv_daniel: 10 },
        confidenceDelta: 10,
        feedback:
          'James Carter nods approvingly: "A 4.2x LTV/CAC with net expansion is exactly the discipline we look for."',
      },
      {
        id: 'B',
        label: 'Address profitability timeline and balanced payback period',
        subtitle: 'Balanced and realistic operational breakdown',
        tone: 'Balanced & Realistic',
        partnerDeltas: { inv_james: 9, inv_sarah: 5, inv_priya: 8, inv_daniel: 12 },
        confidenceDelta: 8,
        feedback:
          'Daniel Wu takes notes: "Pragmatic payback assumptions. I appreciate founders who don’t hide burn."',
      },
      {
        id: 'C',
        label: 'Pivot to aggressive viral blitzscaling regardless of near-term CAC',
        subtitle: 'High-risk growth-at-all-costs pitch',
        tone: 'Aggressive Hype',
        partnerDeltas: { inv_james: -8, inv_sarah: 6, inv_priya: -4, inv_daniel: -12 },
        confidenceDelta: -5,
        feedback:
          'James Carter frowns: "Unchecked burn without unit economic guardrails is how startups hit a wall."',
      },
    ],
  },
  {
    round: 2,
    investorId: 'inv_sarah',
    investorName: 'Sarah Kim (Vertex Ventures)',
    difficulty: 'Hard',
    recommendedSlideId: 2,
    question:
      'Foundation model providers are shipping new agent features every month. What stops a hyperscaler from replicating your core product overnight?',
    contextHint: 'Tip: Switch to Slide 2 (Solution & Autonomous AI Core) to showcase your architectural moat.',
    options: [
      {
        id: 'A',
        label: 'Demonstrate proprietary workflow telemetry and deep enterprise compliance lock-in',
        subtitle: 'Emphasize structural switching costs and deterministic guardrails',
        tone: 'Technical Moat',
        partnerDeltas: { inv_james: 8, inv_sarah: 16, inv_priya: 9, inv_daniel: 7 },
        confidenceDelta: 11,
        feedback:
          'Sarah Kim smiles: "Deep workflow telemetry plus deterministic compliance is a real moat hyperscalers can’t easily copy."',
      },
      {
        id: 'B',
        label: 'Focus on our faster UI iteration speed and customer support',
        subtitle: 'Position execution speed as the primary differentiator',
        tone: 'Execution Focus',
        partnerDeltas: { inv_james: 4, inv_sarah: 6, inv_priya: 10, inv_daniel: 4 },
        confidenceDelta: 6,
        feedback:
          'Sarah Kim nods cautiously: "Speed matters, though you will need deeper IP protection as you scale."',
      },
      {
        id: 'C',
        label: 'Claim our secret prompt templates are 10 years ahead of everyone',
        subtitle: 'Overpromise on surface-level AI hype',
        tone: 'Overconfident',
        partnerDeltas: { inv_james: -6, inv_sarah: -14, inv_priya: -8, inv_daniel: -6 },
        confidenceDelta: -8,
        feedback:
          'Sarah Kim raises an eyebrow: "Prompt templates are not defensible IP, CEO."',
      },
    ],
  },
  {
    round: 3,
    investorId: 'inv_priya',
    investorName: 'Priya Mehta (Catalyst Fund)',
    difficulty: 'Hard',
    recommendedSlideId: 5,
    question:
      'Rapid scaling breaks engineering cultures. How are you preventing burnout and key-person attrition while hitting aggressive product deadlines?',
    contextHint: 'Tip: Select Slide 5 (Team & Execution Velocity) to back up your organizational strategy.',
    options: [
      {
        id: 'A',
        label: 'Showcase structured sprint buffers, senior mentorship, and performance incentives',
        subtitle: 'Highlight sustainable high-output engineering culture',
        tone: 'Empathetic & Structured',
        partnerDeltas: { inv_james: 6, inv_sarah: 8, inv_priya: 16, inv_daniel: 8 },
        confidenceDelta: 10,
        feedback:
          'Priya Mehta beams: "Retaining senior talent through structured ownership saves millions in recruiting churn."',
      },
      {
        id: 'B',
        label: 'Commit 20% of the round to hiring senior specialists and DevOps automation',
        subtitle: 'Use capital to relieve operational bottlenecks',
        tone: 'Resource Allocation',
        partnerDeltas: { inv_james: 7, inv_sarah: 9, inv_priya: 12, inv_daniel: 5 },
        confidenceDelta: 8,
        feedback:
          'Priya Mehta nods: "Smart headcount planning—investing in SRE early prevents costly outages."',
      },
      {
        id: 'C',
        label: 'Insist that 80-hour crunch weeks build founder mentality',
        subtitle: 'Dismiss burnout concerns as weakness',
        tone: 'Ruthless Crunch',
        partnerDeltas: { inv_james: -4, inv_sarah: -8, inv_priya: -16, inv_daniel: 2 },
        confidenceDelta: -7,
        feedback:
          'Priya Mehta shakes her head: "Burnout-driven attrition is the #1 silent killer of Series A engineering teams."',
      },
    ],
  },
  {
    round: 4,
    investorId: 'inv_daniel',
    investorName: 'Daniel Wu (Summit Equity)',
    difficulty: 'Critical',
    recommendedSlideId: 6,
    question:
      'Let’s talk runway and cloud burn. If macro enterprise sales cycles lengthen by 60 days, how do you guarantee this capital gets you to profitability?',
    contextHint: 'Tip: Select Slide 6 (Financial Projections & Capital Allocation) for maximum credibility.',
    options: [
      {
        id: 'A',
        label: 'Present cost-optimization controls, Spot GPU scheduling, and 18-month stress-tested runway',
        subtitle: 'Demonstrate granular treasury and cloud cost command',
        tone: 'CFO-Grade Discipline',
        partnerDeltas: { inv_james: 12, inv_sarah: 7, inv_priya: 8, inv_daniel: 18 },
        confidenceDelta: 12,
        feedback:
          'Daniel Wu leans forward: "Spot cluster governance and a stress-tested 18-month buffer—that is boardroom-ready."',
      },
      {
        id: 'B',
        label: 'Outline modular hiring gates tied strictly to ARR milestones',
        subtitle: 'Stage expenses dynamically as revenue lands',
        tone: 'Milestone-Gated',
        partnerDeltas: { inv_james: 10, inv_sarah: 6, inv_priya: 9, inv_daniel: 13 },
        confidenceDelta: 9,
        feedback:
          'Daniel Wu nods: "Milestone-gated hiring protects downside if enterprise procurement slows down."',
      },
      {
        id: 'C',
        label: 'Assure the board we can always raise another bridge round in 6 months',
        subtitle: 'Rely on future fundraising rather than cost discipline',
        tone: 'Complacent',
        partnerDeltas: { inv_james: -10, inv_sarah: -6, inv_priya: -8, inv_daniel: -16 },
        confidenceDelta: -10,
        feedback:
          'Daniel Wu sighs: "Assuming capital is always cheap is not a financial strategy."',
      },
    ],
  },
  {
    round: 5,
    investorId: 'inv_james',
    investorName: 'Full Partnership Committee',
    difficulty: 'Critical',
    recommendedSlideId: 3,
    question:
      'Final question, CEO: Why is your company the category-defining winner in this space, and what concrete milestones will you deliver in the next 2 quarters?',
    contextHint: 'Tip: Select Slide 3 (Market Opportunity) or Slide 6 (Financials) to close strong.',
    options: [
      {
        id: 'A',
        label: 'Commit to shipping flagship enterprise releases, 80%+ retention, and 2.5x ARR growth',
        subtitle: 'Bold, measurable executive commitment backed by live traction',
        tone: 'Visionary & Accountable',
        partnerDeltas: { inv_james: 14, inv_sarah: 14, inv_priya: 12, inv_daniel: 12 },
        confidenceDelta: 13,
        feedback:
          'The partners exchange impressed glances: "Clear milestones, strong technical moat, and disciplined leadership."',
      },
      {
        id: 'B',
        label: 'Promise steady incremental growth and conservative treasury preservation',
        subtitle: 'Safe, low-risk closing pitch',
        tone: 'Conservative',
        partnerDeltas: { inv_james: 6, inv_sarah: 3, inv_priya: 7, inv_daniel: 10 },
        confidenceDelta: 6,
        feedback:
          'The committee nods: "Solid and measured, though we encourage bolder category ambition."',
      },
      {
        id: 'C',
        label: 'Demand an immediate term sheet with zero board oversight',
        subtitle: 'Ultimatum tactics at the closing table',
        tone: 'Combative',
        partnerDeltas: { inv_james: -12, inv_sarah: -10, inv_priya: -12, inv_daniel: -14 },
        confidenceDelta: -12,
        feedback:
          'James Carter closes his folder: "Governance is a partnership, not a blank check."',
      },
    ],
  },
]

const FUNDING_TIERS = [
  { id: 'seed_ext', label: 'Seed Extension', ask: 85000, defaultValuation: 6000000, defaultEquity: 12 },
  { id: 'series_a', label: 'Series A Round', ask: 180000, defaultValuation: 12500000, defaultEquity: 15 },
  { id: 'series_b', label: 'Series B Growth', ask: 350000, defaultValuation: 24000000, defaultEquity: 18 },
] as const

export function InvestorPitchView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [selectedTierIndex, setSelectedTierIndex] = useState(1)
  const activeTier = FUNDING_TIERS[selectedTierIndex]

  const [equityOffered, setEquityOffered] = useState<number>(activeTier.defaultEquity)
  const [valuationAsk, setValuationAsk] = useState<number>(activeTier.defaultValuation)

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [activeSlideId, setActiveSlideId] = useState<number>(4)
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B' | 'C'>('A')
  const [customResponse, setCustomResponse] = useState('')
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false)
  const [pitchCompleted, setPitchCompleted] = useState(false)
  const [termSheetSigned, setTermSheetSigned] = useState<string | null>(null)

  const [partners, setPartners] = useState<InvestorPartner[]>([
    {
      id: 'inv_james',
      name: 'James Carter',
      firm: 'Horizon Capital',
      role: 'Lead Partner',
      personality: 'Analytical • Unit Economics',
      focus: 'Revenue & Payback',
      avatarBg: '#8e6c32',
      initials: 'JC',
      sentiment: 66,
      lastReaction: 'Reviewing your ARR retention cohorts.',
    },
    {
      id: 'inv_sarah',
      name: 'Sarah Kim',
      firm: 'Vertex Ventures',
      role: 'General Partner',
      personality: 'Visionary • Deep Tech',
      focus: 'Product & AI Moat',
      avatarBg: '#5c4b3b',
      initials: 'SK',
      sentiment: 68,
      lastReaction: 'Intrigued by your autonomous workflow engine.',
    },
    {
      id: 'inv_priya',
      name: 'Priya Mehta',
      firm: 'Catalyst Fund',
      role: 'Managing Director',
      personality: 'People-First • Execution',
      focus: 'Team & Morale',
      avatarBg: '#7a5938',
      initials: 'PM',
      sentiment: 64,
      lastReaction: 'Checking engineering velocity and retention.',
    },
    {
      id: 'inv_daniel',
      name: 'Daniel Wu',
      firm: 'Summit Equity',
      role: 'Partner',
      personality: 'Skeptical • Margin Hawk',
      focus: 'Burn Rate & Runway',
      avatarBg: '#473c33',
      initials: 'DW',
      sentiment: 58,
      lastReaction: 'Scrutinizing cloud infrastructure costs.',
    },
  ])

  const [roundHistory, setRoundHistory] = useState<
    { round: number; question: string; answer: string; feedback: string; delta: number }[]
  >([])

  if (!state) return null

  const activeEmployees = Object.values(state.employees).filter((e) => e.active)
  const avgMorale =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((a, b) => a + b.morale, 0) / activeEmployees.length)
      : 68
  const avgProd =
    activeEmployees.length > 0
      ? Math.round(activeEmployees.reduce((a, b) => a + b.productivity, 0) / activeEmployees.length)
      : 72
  const dailyPayroll = activeEmployees.reduce((a, b) => a + b.salary, 0)
  const dailyRevenue = state.baseRetainer + (state.product ? state.product.quality * 18 : 0)

  const avgSentiment = useMemo(
    () => Math.round(partners.reduce((acc, p) => acc + p.sentiment, 0) / partners.length),
    [partners],
  )

  const currentRound = PITCH_ROUNDS[currentRoundIdx] || PITCH_ROUNDS[0]
  const currentSlide = PITCH_SLIDES.find((s) => s.id === activeSlideId) || PITCH_SLIDES[0]
  const isSlideAligned =
    activeSlideId === currentRound.recommendedSlideId ||
    (currentRound.round === 5 && (activeSlideId === 3 || activeSlideId === 6))

  const getStatusLabel = (sentiment: number) => {
    if (sentiment >= 75) return { text: 'Impressed', cls: 'bg-[#65b87b]/20 text-[#65b87b] border-[#65b87b]/40' }
    if (sentiment >= 60) return { text: 'Interested', cls: 'bg-[#d4a84f]/20 text-[#e5c478] border-[#d4a84f]/40' }
    if (sentiment >= 45) return { text: 'Cautious', cls: 'bg-[#e8a33d]/20 text-[#f5c66b] border-[#e8a33d]/40' }
    return { text: 'Skeptical', cls: 'bg-[#c74234]/20 text-[#f08578] border-[#c74234]/40' }
  }

  // Execute a strategic choice for the current round
  const handleConfirmChoice = () => {
    if (pitchCompleted) return
    const chosen = currentRound.options.find((o) => o.id === selectedOptionId) || currentRound.options[0]
    const slideBonus = isSlideAligned ? 5 : 0

    audio.playClick()

    setPartners((prev) =>
      prev.map((p) => {
        const delta = (chosen.partnerDeltas[p.id] || 0) + slideBonus
        const nextSent = Math.max(5, Math.min(100, p.sentiment + delta))
        return {
          ...p,
          sentiment: nextSent,
          lastReaction:
            p.id === currentRound.investorId
              ? chosen.feedback
              : delta >= 8
                ? 'Nodding in strong agreement with your answer.'
                : delta < 0
                  ? 'Concerned by the risk profile of that answer.'
                  : p.lastReaction,
        }
      }),
    )

    setRoundHistory((prev) => [
      {
        round: currentRound.round,
        question: currentRound.question,
        answer: `[Option ${chosen.id}] ${chosen.label}${isSlideAligned ? ' (+Slide Alignment Bonus)' : ''}`,
        feedback: chosen.feedback,
        delta: chosen.confidenceDelta + slideBonus,
      },
      ...prev,
    ])

    if (currentRoundIdx + 1 >= PITCH_ROUNDS.length) {
      setPitchCompleted(true)
      audio.playCelebration()
    } else {
      const nextIdx = currentRoundIdx + 1
      setCurrentRoundIdx(nextIdx)
      setSelectedOptionId('A')
    }
  }

  // Execute a custom AI-evaluated response for the current round
  const handleCustomSubmit = async () => {
    if (!customResponse.trim() || isEvaluatingAi || pitchCompleted) return
    setIsEvaluatingAi(true)
    audio.playClick()

    try {
      const evalRes = await requestPitchEvaluation({
        company_name: state.name,
        industry: state.industry,
        round_number: currentRound.round,
        investor_name: currentRound.investorName,
        investor_focus: 'Unit Economics, AI Defensibility & Burn Discipline',
        question: currentRound.question,
        player_response: customResponse.trim(),
        selected_slide: currentSlide.title,
        cash: state.cash,
        revenue: dailyRevenue,
        burn_rate: dailyPayroll + 900,
        morale: avgMorale,
      })

      const slideBonus = isSlideAligned ? 4 : 0
      const totalDelta = evalRes.sentiment_delta + slideBonus

      setPartners((prev) =>
        prev.map((p) => ({
          ...p,
          sentiment: Math.max(5, Math.min(100, p.sentiment + totalDelta)),
          lastReaction:
            p.id === currentRound.investorId ? evalRes.investor_reply : p.lastReaction,
        })),
      )

      setRoundHistory((prev) => [
        {
          round: currentRound.round,
          question: currentRound.question,
          answer: `"${customResponse.trim()}"`,
          feedback: `${evalRes.investor_reply} (${evalRes.evaluation_note})`,
          delta: totalDelta,
        },
        ...prev,
      ])

      setCustomResponse('')
      if (currentRoundIdx + 1 >= PITCH_ROUNDS.length) {
        setPitchCompleted(true)
        audio.playCelebration()
      } else {
        setCurrentRoundIdx((i) => i + 1)
      }
    } finally {
      setIsEvaluatingAi(false)
    }
  }

  // Adjust valuation / equity terms during negotiation
  const handleSweetenEquity = () => {
    if (equityOffered >= 28) return
    audio.playClick()
    setEquityOffered((e) => e + 2)
    setValuationAsk((v) => Math.max(4000000, Math.round(v * 0.94)))
    setPartners((prev) =>
      prev.map((p) => ({
        ...p,
        sentiment: Math.min(100, p.sentiment + 4),
        lastReaction: 'Appreciates the founder-friendly valuation adjustment (+4% Sentiment).',
      })),
    )
  }

  const handleRaiseValuation = () => {
    if (equityOffered <= 8) return
    audio.playClick()
    setEquityOffered((e) => e - 2)
    setValuationAsk((v) => Math.round(v * 1.08))
    setPartners((prev) =>
      prev.map((p) => ({
        ...p,
        sentiment: Math.max(10, p.sentiment - 3),
        lastReaction: 'Pushing back slightly on the steeper valuation cap (-3% Sentiment).',
      })),
    )
  }

  // Finalize and commit funding outcome to authoritative CompanyState
  const handleSignDeal = (outcomeType: 'full' | 'partial' | 'rejected') => {
    if (termSheetSigned) return
    if (outcomeType === 'full') {
      dispatch({
        type: 'conclude_pitch',
        cashRaised: activeTier.ask,
        valuation: valuationAsk,
        equityDiluted: equityOffered,
        confidenceDelta: 18,
        investorName: 'Horizon Capital Syndicate',
        outcome: 'full',
      })
      setTermSheetSigned(
        `Signed Full ${activeTier.label} Term Sheet! +$${activeTier.ask.toLocaleString()} wired to Corporate Treasury.`,
      )
      audio.playCelebration()
    } else if (outcomeType === 'partial') {
      const bridgeAmount = Math.round(activeTier.ask * 0.55)
      const bridgeEquity = equityOffered + 3
      dispatch({
        type: 'conclude_pitch',
        cashRaised: bridgeAmount,
        valuation: Math.round(valuationAsk * 0.8),
        equityDiluted: bridgeEquity,
        confidenceDelta: 8,
        investorName: 'Summit & Catalyst Bridge Syndicate',
        outcome: 'partial',
      })
      setTermSheetSigned(
        `Signed Bridge Round Term Sheet! +$${bridgeAmount.toLocaleString()} wired to Corporate Treasury (${bridgeEquity}% equity).`,
      )
      audio.playCash()
    } else {
      dispatch({
        type: 'conclude_pitch',
        cashRaised: 0,
        valuation: valuationAsk,
        equityDiluted: 0,
        confidenceDelta: -6,
        investorName: 'Partnership Committee',
        outcome: 'rejected',
      })
      setTermSheetSigned('Walked away from the table with zero dilution. Regroup and pitch again.')
      audio.playAlert()
    }
  }

  const handleResetPitch = () => {
    audio.playClick()
    setCurrentRoundIdx(0)
    setPitchCompleted(false)
    setTermSheetSigned(null)
    setRoundHistory([])
    setPartners((prev) =>
      prev.map((p, idx) => ({
        ...p,
        sentiment: [66, 68, 64, 58][idx] || 65,
      })),
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#181410] via-[#14110e] to-[#100d0b] text-[#faf7f0] font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* Top Section Header Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4a84f]/25 bg-[#1b1612]/95 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] font-serif-title font-extrabold text-lg shadow-md">
            02
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
                INVESTOR PITCH — BOARDROOM NEGOTIATION
              </h1>
              <span className="rounded-full bg-[#d4a84f]/15 border border-[#d4a84f]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e5c478]">
                {activeTier.label}
              </span>
            </div>
            <p className="text-xs text-[#b5a695]">
              Convince partners across 5 rounds, align slides to questions, and negotiate valuation terms.
            </p>
          </div>
        </div>

        {/* Round Stepper & Overall Syndicate Sentiment */}
        <div className="flex items-center gap-6">
          {/* Round Progress Dots */}
          <div className="flex items-center gap-2.5 rounded-xl bg-[#241e18] px-3.5 py-2 border border-[#d4a84f]/25">
            <span className="text-xs font-bold text-[#e5c478]">
              {pitchCompleted ? 'Pitch Concluded' : `Round ${currentRound.round} of 5`}
            </span>
            <div className="flex items-center gap-1.5">
              {PITCH_ROUNDS.map((r, idx) => {
                const done = pitchCompleted || idx < currentRoundIdx
                const current = !pitchCompleted && idx === currentRoundIdx
                return (
                  <span
                    key={r.round}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      done
                        ? 'bg-[#65b87b]'
                        : current
                          ? 'bg-[#e5c478] ring-4 ring-[#d4a84f]/30 scale-110'
                          : 'bg-[#3a3028]'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Syndicate Confidence Meter */}
          <div className="flex items-center gap-3 rounded-xl bg-[#241e18] px-4 py-2 border border-[#d4a84f]/25">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                  Syndicate Confidence
                </span>
                <span className="mono text-xs font-extrabold text-[#e5c478]">
                  {avgSentiment}%
                </span>
              </div>
              <div className="mt-1 h-2 w-36 rounded-full bg-[#352c25] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b88933] via-[#d4a84f] to-[#65b87b] transition-all duration-500"
                  style={{ width: `${avgSentiment}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main 3-Column Boardroom Workspace */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-4 p-5 overflow-y-auto">
        {/* ================================================================= */}
        {/* LEFT COLUMN (3 cols): Venture Partners & Pitch Deck Slides        */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Venture Partners Panel */}
          <div className="panel-dark p-4">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#d4a84f]/20">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                <Users className="h-4 w-4 text-[#d4a84f]" />
                <span>Venture Partners (4)</span>
              </span>
              <span className="text-[10px] text-[#b5a695]">Live Sentiment</span>
            </div>

            <div className="space-y-2.5">
              {partners.map((p) => {
                const isAsking = !pitchCompleted && currentRound.investorId === p.id
                const status = getStatusLabel(p.sentiment)
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl p-3 border transition ${
                      isAsking
                        ? 'bg-[#2c241d] border-[#d4a84f] shadow-[0_0_16px_rgba(212,168,79,0.2)]'
                        : 'bg-[#1b1612]/80 border-[#d4a84f]/15'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#faf7f0] border border-[#d4a84f]/40"
                          style={{ backgroundColor: p.avatarBg }}
                        >
                          {p.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#faf7f0] truncate">
                              {p.name}
                            </span>
                            {isAsking && (
                              <span className="rounded bg-[#d4a84f] px-1.5 py-0.2 text-[9px] font-extrabold text-[#181411] uppercase">
                                Speaking
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-[#b5a695] truncate">
                            {p.firm} • {p.focus}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold ${status.cls}`}
                      >
                        {status.text}
                      </span>
                    </div>

                    {/* Sentiment Bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-[#352c25] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#c5963a] to-[#65b87b] transition-all duration-300"
                          style={{ width: `${p.sentiment}%` }}
                        />
                      </div>
                      <span className="mono text-[10.5px] font-bold text-[#e5c478]">
                        {p.sentiment}%
                      </span>
                    </div>

                    <p className="mt-1.5 text-[10.5px] text-[#d8cdc0] italic leading-snug">
                      "{p.lastReaction}"
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pitch Deck Slide Selector */}
          <div className="panel-dark p-4">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#d4a84f]/20">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                <Layers className="h-4 w-4 text-[#d4a84f]" />
                <span>Pitch Deck Slides (6)</span>
              </span>
              <span className="text-[10px] text-[#b5a695]">Click to Present</span>
            </div>

            <div className="space-y-1.5">
              {PITCH_SLIDES.map((slide) => {
                const active = slide.id === activeSlideId
                const recommended = !pitchCompleted && slide.id === currentRound.recommendedSlideId
                return (
                  <button
                    key={slide.id}
                    onClick={() => {
                      audio.playClick()
                      setActiveSlideId(slide.id)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition cursor-pointer border ${
                      active
                        ? 'btn-gold'
                        : 'bg-[#1b1612]/80 border-[#d4a84f]/15 text-[#d8cdc0] hover:border-[#d4a84f]/45 hover:text-[#faf7f0]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold truncate">
                        0{slide.id}. {slide.title}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          active ? 'text-[#27211c]' : 'text-[#9e8e7c]'
                        }`}
                      >
                        {slide.tag} — {slide.keyMetricLabel}
                      </div>
                    </div>
                    {recommended && !active && (
                      <span className="shrink-0 rounded bg-[#65b87b]/20 border border-[#65b87b]/40 px-1.5 py-0.5 text-[9px] font-bold text-[#65b87b]">
                        Best Match
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER COLUMN (6 cols): Boardroom Projection Screen & Responses   */}
        {/* ================================================================= */}
        <div className="lg:col-span-6 flex flex-col gap-4 overflow-y-auto px-1">
          {/* Big Luxury Boardroom Projection Screen (Warm Ivory Slide Card) */}
          <div className="panel-cream p-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#d4c8b0] pb-3">
              <div>
                <span className="inline-block rounded-md bg-[#1f1a16] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e5c478]">
                  Slide 0{currentSlide.id} / 06 • {currentSlide.tag}
                </span>
                <h2 className="mt-1 font-serif-title text-xl font-bold text-[#181411]">
                  {currentSlide.title}
                </h2>
                <p className="text-xs text-[#5c4e41]">{currentSlide.subtitle}</p>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#68594c]">
                  Headline Metric
                </div>
                <div className="font-serif-title text-lg font-extrabold text-[#966c22]">
                  {currentSlide.keyMetricLabel}
                </div>
                {isSlideAligned && !pitchCompleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#65b87b]/20 px-2 py-0.5 text-[10px] font-bold text-[#2b6cb0] text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> +5% Alignment Bonus Active
                  </span>
                )}
              </div>
            </div>

            {/* Live Company Telemetry Strip Embedded in the Slide */}
            <div className="mt-3.5 grid grid-cols-4 gap-2.5">
              <div className="rounded-xl bg-[#e6decb]/75 p-2.5 border border-[#d4c8b0]">
                <span className="text-[10px] font-semibold uppercase text-[#5c4e41]">
                  Treasury Cash
                </span>
                <div className="mono text-sm font-extrabold text-[#181411]">
                  ${state.cash.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl bg-[#e6decb]/75 p-2.5 border border-[#d4c8b0]">
                <span className="text-[10px] font-semibold uppercase text-[#5c4e41]">
                  Daily Revenue
                </span>
                <div className="mono text-sm font-extrabold text-emerald-800">
                  +${dailyRevenue.toLocaleString()}/d
                </div>
              </div>
              <div className="rounded-xl bg-[#e6decb]/75 p-2.5 border border-[#d4c8b0]">
                <span className="text-[10px] font-semibold uppercase text-[#5c4e41]">
                  Team Velocity
                </span>
                <div className="mono text-sm font-extrabold text-[#181411]">
                  {avgProd}% Prod
                </div>
              </div>
              <div className="rounded-xl bg-[#e6decb]/75 p-2.5 border border-[#d4c8b0]">
                <span className="text-[10px] font-semibold uppercase text-[#5c4e41]">
                  Team Morale
                </span>
                <div className="mono text-sm font-extrabold text-[#966c22]">
                  {avgMorale}%
                </div>
              </div>
            </div>

            {/* Key Slide Bullets */}
            <ul className="mt-3.5 space-y-1.5">
              {currentSlide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#27211c] font-medium">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#b88933] shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active Round Question OR Final Term Sheet Decision */}
          {!pitchCompleted ? (
            <div className="panel-dark p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                    Round {currentRound.round} Question • {currentRound.investorName}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      currentRound.difficulty === 'Critical'
                        ? 'bg-[#c74234]/25 text-[#f08578] border border-[#c74234]/40'
                        : 'bg-[#d4a84f]/20 text-[#e5c478] border border-[#d4a84f]/40'
                    }`}
                  >
                    {currentRound.difficulty} Question
                  </span>
                </div>

                <div className="rounded-xl bg-[#181410] p-4 border border-[#d4a84f]/30">
                  <p className="font-serif-title text-base font-semibold text-[#faf7f0] leading-relaxed">
                    “{currentRound.question}”
                  </p>
                  <p className="mt-2 text-[11px] text-[#e5c478] font-medium">
                    {currentRound.contextHint}
                  </p>
                </div>

                {/* 3 Strategic Response Choices (matching reference-ui #02 A / B / C cards) */}
                <div className="mt-4 space-y-2.5">
                  {currentRound.options.map((opt) => {
                    const selected = selectedOptionId === opt.id
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          audio.playClick()
                          setSelectedOptionId(opt.id)
                        }}
                        className={`flex items-center justify-between rounded-xl p-3.5 cursor-pointer border transition-all ${
                          selected
                            ? 'bg-gradient-to-r from-[#362c22] to-[#272019] border-[#e5c478] shadow-[0_4px_18px_rgba(212,168,79,0.22)]'
                            : 'bg-[#1b1612]/90 border-[#d4a84f]/20 hover:border-[#d4a84f]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-serif-title text-sm font-extrabold ${
                              selected
                                ? 'bg-[#e5c478] text-[#181411]'
                                : 'bg-[#2a231c] text-[#d8cdc0] border border-[#d4a84f]/30'
                            }`}
                          >
                            {opt.id}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#faf7f0] leading-snug">
                              {opt.label}
                            </div>
                            <div className="text-[11px] text-[#b5a695] mt-0.5">
                              {opt.subtitle} • <span className="text-[#e5c478]">{opt.tone}</span>
                            </div>
                          </div>
                        </div>

                        <ArrowRight
                          className={`h-4 w-4 shrink-0 ml-2 transition-transform ${
                            selected ? 'text-[#e5c478] translate-x-0.5' : 'text-[#68594c]'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Confirm Choice OR Custom AI Response */}
              <div className="mt-4 pt-3 border-t border-[#d4a84f]/20 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={customResponse}
                      onChange={(e) => setCustomResponse(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCustomSubmit()
                      }}
                      placeholder="Or type a custom executive response (AI-evaluated)..."
                      className="w-full rounded-xl bg-[#16120e] border border-[#d4a84f]/25 px-3.5 py-2 text-xs text-[#faf7f0] placeholder:text-[#8e7c6b] focus:border-[#d4a84f] focus:outline-none"
                    />
                  </div>
                  {customResponse.trim() ? (
                    <button
                      onClick={handleCustomSubmit}
                      disabled={isEvaluatingAi}
                      className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      {isEvaluatingAi ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Pitch Custom Answer</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmChoice}
                      className="btn-gold flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      <span>Deliver Response ({selectedOptionId})</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Final Boardroom Term Sheet Verdict Card */
            <div className="panel-dark p-6 flex-1 flex flex-col justify-between animate-slide-up">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                  <Award className="h-4 w-4 text-[#d4a84f]" />
                  <span>Partnership Committee Final Verdict</span>
                </div>

                <h3 className="mt-2 font-serif-title text-2xl font-bold text-[#faf7f0]">
                  {avgSentiment >= 68
                    ? `Full ${activeTier.label} Term Sheet Issued!`
                    : avgSentiment >= 48
                      ? 'Conditional Bridge Term Sheet Offered'
                      : 'Partnership Declined to Issue Term Sheet'}
                </h3>

                <p className="mt-1.5 text-xs text-[#d8cdc0] leading-relaxed">
                  {avgSentiment >= 68
                    ? `With ${avgSentiment}% syndicate confidence, Horizon Capital and co-investors are ready to wire $${activeTier.ask.toLocaleString()} at a $${(valuationAsk / 1_000_000).toFixed(1)}M valuation (${equityOffered}% equity).`
                    : avgSentiment >= 48
                      ? `Syndicate confidence reached ${avgSentiment}%. The partners are cautious on full valuation, but offered a $${Math.round(activeTier.ask * 0.55).toLocaleString()} bridge tranche at ${equityOffered + 3}% equity.`
                      : `Syndicate confidence ended at ${avgSentiment}%. Strengthen your unit economics, resolve office incidents, and return for a fresh pitch.`}
                </p>

                {termSheetSigned && (
                  <div className="mt-4 rounded-xl bg-[#65b87b]/15 border border-[#65b87b]/40 p-3.5 text-xs font-semibold text-[#65b87b] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{termSheetSigned}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-[#d4a84f]/20">
                {!termSheetSigned && avgSentiment >= 68 && (
                  <button
                    onClick={() => handleSignDeal('full')}
                    className="btn-gold flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Sign Full Term Sheet (+${activeTier.ask.toLocaleString()})
                    </span>
                  </button>
                )}

                {!termSheetSigned && avgSentiment >= 48 && (
                  <button
                    onClick={() => handleSignDeal('partial')}
                    className="btn-gold flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>
                      Accept Bridge Offer (+${Math.round(activeTier.ask * 0.55).toLocaleString()})
                    </span>
                  </button>
                )}

                {!termSheetSigned && (
                  <button
                    onClick={() => handleSignDeal('rejected')}
                    className="rounded-xl bg-[#27211c] hover:bg-[#352c25] text-[#d8cdc0] border border-[#d4a84f]/30 px-4 py-2.5 text-xs font-semibold cursor-pointer transition"
                  >
                    Walk Away (Zero Dilution)
                  </button>
                )}

                <button
                  onClick={handleResetPitch}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#241e18] hover:bg-[#332a22] text-[#e5c478] border border-[#d4a84f]/30 px-3.5 py-2 text-xs font-semibold cursor-pointer transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Start New Pitch Session</span>
                </button>

                {termSheetSigned && (
                  <button
                    onClick={() => setActiveTab('finance')}
                    className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    <span>View Treasury in Finance →</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN (3 cols): Deal Terms, Negotiation Levers & History   */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-1">
          {/* Deal Terms & Valuation Configuration */}
          <div className="panel-dark p-4">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#d4a84f]/20">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                <DollarSign className="h-4 w-4 text-[#d4a84f]" />
                <span>Deal Structure & Terms</span>
              </span>
            </div>

            {/* Round Tier Selector */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {FUNDING_TIERS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    audio.playClick()
                    setSelectedTierIndex(idx)
                    setEquityOffered(t.defaultEquity)
                    setValuationAsk(t.defaultValuation)
                  }}
                  className={`rounded-lg py-1.5 px-2 text-[10px] font-bold transition cursor-pointer border ${
                    selectedTierIndex === idx
                      ? 'btn-gold'
                      : 'bg-[#1b1612] text-[#b5a695] border-[#d4a84f]/20 hover:text-[#faf7f0]'
                  }`}
                >
                  {t.label.split(' ')[0]} {t.label.split(' ')[1]}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b5a695]">Target Capital Ask</span>
                <span className="mono font-bold text-[#65b87b]">
                  +${activeTier.ask.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b5a695]">Pre-Money Valuation</span>
                <span className="mono font-bold text-[#faf7f0]">
                  ${(valuationAsk / 1_000_000).toFixed(2)}M
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b5a695]">Equity Dilution</span>
                <span className="mono font-bold text-[#e5c478]">{equityOffered}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b5a695]">Approval Threshold</span>
                <span className="mono font-bold text-[#d8cdc0]">68% Sentiment</span>
              </div>
            </div>

            {/* Interactive Term Negotiation Levers */}
            <div className="mt-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                Live Term Sheet Levers
              </div>
              <button
                onClick={handleSweetenEquity}
                disabled={pitchCompleted}
                className="w-full rounded-xl bg-[#26201a] hover:bg-[#332b22] border border-[#d4a84f]/30 px-3 py-2 text-left text-xs transition cursor-pointer disabled:opacity-40"
              >
                <div className="font-bold text-[#e5c478]">Sweeten Equity Offer (+2% Equity)</div>
                <div className="text-[10px] text-[#b5a695]">
                  Boosts all partner sentiment by +4% immediately
                </div>
              </button>
              <button
                onClick={handleRaiseValuation}
                disabled={pitchCompleted}
                className="w-full rounded-xl bg-[#26201a] hover:bg-[#332b22] border border-[#d4a84f]/30 px-3 py-2 text-left text-xs transition cursor-pointer disabled:opacity-40"
              >
                <div className="font-bold text-[#faf7f0]">Push Valuation Cap Higher (-2% Equity)</div>
                <div className="text-[10px] text-[#b5a695]">
                  Protects founder stake, -3% partner sentiment
                </div>
              </button>
            </div>
          </div>

          {/* Boardroom Q&A Transcript Log */}
          <div className="panel-dark p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#d4a84f]/20">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                <Presentation className="h-4 w-4 text-[#d4a84f]" />
                <span>Boardroom Transcript ({roundHistory.length}/5)</span>
              </span>
            </div>

            {roundHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-xs text-[#8e7c6b]">
                <Sparkles className="h-6 w-6 text-[#d4a84f]/50 mb-2" />
                <p>Select your pitch slide and answer Round 1 to begin recording the boardroom transcript.</p>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
                {roundHistory.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-[#181410] p-2.5 border border-[#d4a84f]/20 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-[#e5c478]">
                      <span>Round {item.round}</span>
                      <span
                        className={
                          item.delta >= 0 ? 'text-[#65b87b]' : 'text-[#f08578]'
                        }
                      >
                        {item.delta >= 0 ? `+${item.delta}%` : `${item.delta}%`} Confidence
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-[#faf7f0]">
                      {item.answer}
                    </p>
                    <p className="mt-1 text-[10.5px] text-[#b5a695] italic">
                      {item.feedback}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

