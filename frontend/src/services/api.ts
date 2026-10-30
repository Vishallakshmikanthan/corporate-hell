/**
 * CORPORATE HELL™ — Backend API Service.
 *
 * Connects to the backend for NVIDIA AI dialogue and cloud save snapshots.
 * Automatically falls back to deterministic local dialogue if backend is offline.
 */
import { ARCHETYPES } from '../game/engine/archetypes'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export interface DialoguePayload {
  employee_id: string
  employee_name: string
  archetype: string
  role: string
  department: string
  bio: string
  morale: number
  stress: number
  energy: number
  trust: number
  current_activity: string
  current_task?: string
  recent_memories?: string[]
  context?: {
    recent_event?: string
    player_decision?: string
  }
}

export interface DialogueResult {
  dialogue: string
  emotion: string
  thought: string
  referencedEventIds: string[]
  suggestedAction?: string | null
  confidence: number
  source: 'ai' | 'fallback'
}

export async function checkBackendHealth(): Promise<{
  ok: boolean
  ai_status: string
  ai_model: string
}> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const data = await res.json()
      return { ok: true, ai_status: data.ai_status, ai_model: data.ai_model }
    }
  } catch {
    // Offline
  }
  return { ok: false, ai_status: 'offline', ai_model: 'deterministic_fallback' }
}

export async function requestDialogue(payload: DialoguePayload): Promise<DialogueResult> {
  try {
    const res = await fetch(`${API_BASE}/ai/dialogue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    })

    if (res.ok) {
      return (await res.json()) as DialogueResult
    }
  } catch {
    // Backend offline or timeout -> local deterministic fallback
  }

  // Local fallback
  const archetypeDef = ARCHETYPES[payload.archetype as keyof typeof ARCHETYPES]
  const lines = archetypeDef?.lines ?? ['Back to the quarterly sprint deliverables.']
  const thoughts = archetypeDef?.thoughts ?? ['Synergy.']
  const lineIdx = Math.floor(Math.random() * lines.length)
  const thoughtIdx = Math.floor(Math.random() * thoughts.length)

  return {
    dialogue: lines[lineIdx],
    emotion: 'neutral',
    thought: thoughts[thoughtIdx],
    referencedEventIds: [],
    suggestedAction: null,
    confidence: 0.95,
    source: 'fallback',
  }
}

export interface DirectivePayload {
  directive: string
  company_name?: string
  day?: number
  cash?: number
  morale?: number
  stress?: number
  employee_count?: number
}

export interface DirectiveResult {
  title: string
  executive_summary: string
  action_type: string
  action_payload?: Record<string, any>
  cash_delta: number
  morale_delta: number
  stress_delta: number
  quotes: Array<{ employee_name: string; quote: string }>
  source: 'ai' | 'fallback'
}

export async function requestDirective(payload: DirectivePayload): Promise<DirectiveResult> {
  try {
    const res = await fetch(`${API_BASE}/ai/directive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(7000),
    })

    if (res.ok) {
      return (await res.json()) as DirectiveResult
    }
  } catch {
    // Offline or timeout -> local deterministic fallback
  }

  const d = payload.directive.toLowerCase()
  if (d.includes('4-day') || d.includes('four day') || d.includes('4 day')) {
    return {
      title: '4-Day Workweek Proclamation',
      executive_summary: 'The CEO officially announced a 4-day workweek. Engineering rejoiced; Sales is frantically cramming demos into Thursday.',
      action_type: 'policy_4day',
      cash_delta: 0,
      morale_delta: 15,
      stress_delta: -12,
      quotes: [
        { employee_name: 'Yuki Tanaka', quote: 'Finally, one fewer day of synchronous alignment.' },
        { employee_name: 'Deborah Overbyte', quote: 'I will schedule 40% more meetings on Monday to compensate.' },
      ],
      source: 'fallback',
    }
  }
  if (d.includes('meeting') || d.includes('cut') || d.includes('calendar')) {
    return {
      title: 'Emergency Calendar Cull',
      executive_summary: 'All recurring syncs sliced in half. Calendar bloat decreased by 50% across all departments.',
      action_type: 'cut_meetings',
      cash_delta: 0,
      morale_delta: 12,
      stress_delta: -14,
      quotes: [
        { employee_name: 'Yuki Tanaka', quote: 'Miraculous silence in the open plan.' },
        { employee_name: 'Deborah Overbyte', quote: 'Can we schedule a 15-minute debrief to discuss the canceled meetings?' },
      ],
      source: 'fallback',
    }
  }
  if (d.includes('morale') || d.includes('happy') || d.includes('boost')) {
    return {
      title: 'Mandatory Corporate Joy Initiative',
      executive_summary: 'Emergency morale injection authorized. Cold brew kegs replenished and executive high-fives declared mandatory.',
      action_type: 'morale_boost',
      cash_delta: -1200,
      morale_delta: 18,
      stress_delta: -8,
      quotes: [
        { employee_name: 'Priya Nair', quote: 'Free cold brew?! I forgive the last three sprints.' },
        { employee_name: 'Sandra Keller', quote: 'I heard management only did this because Glassdoor ratings dropped.' },
      ],
      source: 'fallback',
    }
  }
  if (d.includes('spend') || d.includes('audit') || d.includes('money') || d.includes('investigate')) {
    return {
      title: 'Forensic Corporate Expense Audit',
      executive_summary: 'Finance scoured corporate card receipts. Discovered $3,400 in questionable subscriptions and refunded the treasury.',
      action_type: 'audit_spending',
      cash_delta: 3400,
      morale_delta: -4,
      stress_delta: 8,
      quotes: [
        { employee_name: 'Marcus Vane', quote: 'Those 14 artisan kombucha cases were critical to closing Q3 enterprise pipeline!' },
        { employee_name: 'Ellen Wang', quote: 'Every audit finds the same missing receipt from 2021.' },
      ],
      source: 'fallback',
    }
  }
  if (d.includes('incident') || d.includes('random') || d.includes('chaos')) {
    return {
      title: 'Chaos Engineering: The Office Rebellion',
      executive_summary: 'An unexpected workplace crisis erupted! The office printer has jammed itself in existential protest.',
      action_type: 'trigger_incident',
      cash_delta: -500,
      morale_delta: -5,
      stress_delta: 10,
      quotes: [
        { employee_name: 'Bianca Reyes', quote: 'This printer again?! It just shredded my department roster!' },
        { employee_name: 'Steve Bhattacharya', quote: 'Where is everyone? Why is the machine smoking?' },
      ],
      source: 'fallback',
    }
  }

  return {
    title: 'Executive Decree Enacted',
    executive_summary: `The CEO declared: "${payload.directive}". Executive leadership nodded solemnly while middle management scheduled 14 alignment syncs.`,
    action_type: 'custom',
    cash_delta: -350,
    morale_delta: 6,
    stress_delta: -2,
    quotes: [
      { employee_name: 'Chad Sterling', quote: 'Brilliant visionary leadership, CEO! Reposting immediately on LinkedIn.' },
      { employee_name: 'Yuki Tanaka', quote: 'I will ignore this until the Jira ticket appears.' },
    ],
    source: 'fallback',
  }
}

export interface CodeReviewPayload {
  ticket_title: string
  code_diff?: string
  author: string
  reviewer_archetype: string
}

export interface CodeReviewResult {
  approved: boolean
  comment: string
  requested_changes: string[]
  snark_level: number
  source: 'ai' | 'fallback'
}

export async function requestCodeReview(payload: CodeReviewPayload): Promise<CodeReviewResult> {
  try {
    const res = await fetch(`${API_BASE}/ai/code_review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      return (await res.json()) as CodeReviewResult
    }
  } catch {
    // Offline fallback
  }

  const arch = payload.reviewer_archetype.toLowerCase()
  if (arch.includes('architect')) {
    return {
      approved: false,
      comment: 'LGTM in theory, but have you considered rewriting this using hexagonal event-sourcing?',
      requested_changes: ['Decouple database layers', 'Add 4 abstract factory interfaces'],
      snark_level: 9,
      source: 'fallback',
    }
  }
  if (arch.includes('cynic') || arch.includes('senior')) {
    return {
      approved: false,
      comment: 'Bold assumption that this won’t crash prod at 3 AM. Where are the automated unit tests?',
      requested_changes: ['Add nil guards', 'Write integration tests'],
      snark_level: 8,
      source: 'fallback',
    }
  }
  return {
    approved: true,
    comment: 'LGTM! Merging now to hit arbitrary sprint velocity targets.',
    requested_changes: ['Remove leftover console.log'],
    snark_level: 4,
    source: 'fallback',
  }
}

export interface StandupPayload {
  employee_name: string
  role: string
  current_ticket?: string
  blockers?: string
}

export interface StandupResult {
  yesterday: string
  today: string
  blockers: string
  corporate_buzzword_count: number
  source: 'ai' | 'fallback'
}

export async function requestStandup(payload: StandupPayload): Promise<StandupResult> {
  try {
    const res = await fetch(`${API_BASE}/ai/standup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      return (await res.json()) as StandupResult
    }
  } catch {
    // Fallback
  }

  return {
    yesterday: 'Attended 4 alignment meetings to discuss aligning our upcoming alignment meeting.',
    today: `Working on ${payload.current_ticket || 'high-priority sprint deliverables'}.`,
    blockers: payload.blockers || 'Waiting on cross-functional IAM permissions and stakeholder sign-off.',
    corporate_buzzword_count: 5,
    source: 'fallback',
  }
}

export interface SocialPostPayload {
  platform: 'chirper' | 'linkedout' | 'reddot'
  announcement_type: string
  company_name: string
  stage?: string
}

export interface SocialPostResult {
  post_content: string
  predicted_virality: number
  cringe_score: number
  hashtags: string[]
  source: 'ai' | 'fallback'
}

export async function requestSocialPost(payload: SocialPostPayload): Promise<SocialPostResult> {
  try {
    const res = await fetch(`${API_BASE}/ai/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      return (await res.json()) as SocialPostResult
    }
  } catch {
    // Fallback
  }

  if (payload.platform === 'linkedout') {
    return {
      post_content: `🚀 Thrilled to announce ${payload.company_name} has achieved ${payload.announcement_type}! What did 72 hours without sleep teach me about B2B founder synergy? A 🧵... Agree? 👇`,
      predicted_virality: 0.85,
      cringe_score: 9,
      hashtags: ['#ThoughtLeadership', '#HustleCulture', '#FounderMindset'],
      source: 'fallback',
    }
  }
  if (payload.platform === 'reddot') {
    return {
      post_content: `TIL ${payload.company_name} shipped ${payload.announcement_type} on a Friday afternoon without breaking prod (somehow). AMA.`,
      predicted_virality: 0.65,
      cringe_score: 3,
      hashtags: ['#programming', '#devops'],
      source: 'fallback',
    }
  }
  return {
    post_content: `Big announcement! ${payload.company_name} just rolled out ${payload.announcement_type}. Zero tech debt, 100% vibes. Link in bio 🚀👇`,
    predicted_virality: 0.75,
    cringe_score: 5,
    hashtags: ['#TechNews', '#Startup'],
    source: 'fallback',
  }
}

export interface PostmortemPayload {
  incident_title: string
  root_cause?: string
  incident_cause?: string
  downtime_minutes?: number
  revenue_lost?: number
  severity?: number
  resolution_chosen?: string
  company_name?: string
}

export interface PostmortemResult {
  title: string
  summary: string
  five_whys: string[]
  contributing_factors: string[]
  action_items: string[]
  executive_excuse: string
  source: 'ai' | 'fallback'
}

export async function requestPostmortem(payload: PostmortemPayload): Promise<PostmortemResult> {
  const cause = payload.root_cause || payload.incident_cause || 'Systemic operational failure'
  const downtime = payload.downtime_minutes ?? 45
  const revLost = payload.revenue_lost ?? 8400
  try {
    const res = await fetch(`${API_BASE}/ai/postmortem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_title: payload.incident_title,
        root_cause: cause,
        downtime_minutes: downtime,
        revenue_lost: revLost,
      }),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const data = await res.json()
      return {
        ...data,
        contributing_factors: data.contributing_factors ?? data.five_whys ?? [cause],
      } as PostmortemResult
    }
  } catch {
    // Fallback
  }

  const fiveWhys = [
    `1. Why did the service fail? -> ${cause}`,
    '2. Why was it not caught in staging? -> Staging environment was turned off to reduce cloud bill',
    '3. Why was staging turned off? -> Finance issued an emergency cost-cutting mandate',
    '4. Why was the mandate issued? -> Executive team bought an enterprise AI subscription',
    '5. Why did they buy the subscription? -> Board demanded AI in every quarterly slide deck',
  ]

  return {
    title: `Root Cause Analysis: ${payload.incident_title}`,
    summary: `A ${downtime}-minute disruption cost $${revLost.toLocaleString()}. Traced to: ${cause}.`,
    five_whys: fiveWhys,
    contributing_factors: fiveWhys,
    action_items: [
      'Implement automated canary rollback guards',
      'Mandate blue/green deployments for all prod releases',
      'Establish a moratorium on Friday 5 PM deployments',
    ],
    executive_excuse: 'An unprecedented cascade of third-party cloud provider transit latencies outside our operational perimeter.',
    source: 'fallback',
  }
}

export interface PitchEvalPayload {
  investor_group?: string
  investor_name?: string
  investor_focus?: string
  round_number: number
  investor_question?: string
  question?: string
  player_response: string
  slide_title?: string
  selected_slide?: string
  company_name?: string
  industry?: string
  cash?: number
  revenue?: number
  burn_rate?: number
  morale?: number
}

export interface PitchEvalResult {
  partner_name: string
  partner_reaction: string
  investor_reply: string
  confidence_delta: number
  sentiment_delta: number
  follow_up_note: string
  evaluation_note: string
  source: 'ai' | 'fallback'
}

export async function requestPitchEvaluation(payload: PitchEvalPayload): Promise<PitchEvalResult> {
  const questionText = payload.investor_question || payload.question || 'How do your unit economics scale?'
  const slideTitle = payload.slide_title || payload.selected_slide || 'Executive Overview'
  try {
    const res = await fetch(`${API_BASE}/ai/pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investor_group: payload.investor_group || payload.investor_name || 'Horizon Capital',
        round_number: payload.round_number,
        investor_question: questionText,
        player_response: payload.player_response,
        slide_title: slideTitle,
        company_name: payload.company_name,
        revenue: payload.revenue,
        burn_rate: payload.burn_rate,
        morale: payload.morale,
      }),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const data = await res.json()
      const reaction = data.partner_reaction || data.investor_reply || 'Compelling perspective.'
      const delta = data.confidence_delta ?? data.sentiment_delta ?? 6
      const note = data.follow_up_note || data.evaluation_note || 'Noted by the partnership.'
      return {
        partner_name: data.partner_name || payload.investor_name || 'James Carter',
        partner_reaction: reaction,
        investor_reply: reaction,
        confidence_delta: delta,
        sentiment_delta: delta,
        follow_up_note: note,
        evaluation_note: note,
        source: data.source || 'ai',
      }
    }
  } catch {
    // Offline fallback
  }

  const r = payload.player_response.toLowerCase()
  if (r.includes('unit economics') || r.includes('organic') || r.includes('margin') || r.includes('profit')) {
    const reaction = "James Carter nods approvingly: 'Disciplined unit economics and clear capital efficiency—that is exactly what our investment committee wants to see.'"
    const note = 'Partners impressed by sustainable growth thesis.'
    return {
      partner_name: 'James Carter',
      partner_reaction: reaction,
      investor_reply: reaction,
      confidence_delta: 9,
      sentiment_delta: 9,
      follow_up_note: note,
      evaluation_note: note,
      source: 'fallback',
    }
  }
  if (r.includes('aggressiv') || r.includes('10x') || r.includes('multiple products')) {
    const reaction = "Sarah Kim leans forward: 'Ambitious expansion roadmap, though Daniel is still scrutinizing the near-term burn multiple.'"
    const note = 'High upside recognized; burn rate flagged for monitoring.'
    return {
      partner_name: 'Sarah Kim',
      partner_reaction: reaction,
      investor_reply: reaction,
      confidence_delta: 4,
      sentiment_delta: 4,
      follow_up_note: note,
      evaluation_note: note,
      source: 'fallback',
    }
  }
  if (r.includes('honest') || r.includes('figuring') || r.includes('guidance')) {
    const reaction = "Priya Mehta smiles: 'Candor is rare in this boardroom. We respect founder self-awareness, provided execution tightens this quarter.'"
    const note = 'Founder transparency boosted partner trust.'
    return {
      partner_name: 'Priya Mehta',
      partner_reaction: reaction,
      investor_reply: reaction,
      confidence_delta: 6,
      sentiment_delta: 6,
      follow_up_note: note,
      evaluation_note: note,
      source: 'fallback',
    }
  }
  const reaction = "James Carter jots a note in his leather folio: 'Compelling positioning. Let us see how your execution metrics hold up across the next quarter.'"
  const note = 'Measured positive reception from the partnership.'
  return {
    partner_name: 'James Carter',
    partner_reaction: reaction,
    investor_reply: reaction,
    confidence_delta: 7,
    sentiment_delta: 7,
    follow_up_note: note,
    evaluation_note: note,
    source: 'fallback',
  }
}

export interface EmailReplyPayload {
  sender_name: string
  sender_role?: string
  subject: string
  email_body: string
  reply_tone?: string
  player_reply?: string
  company_name?: string
}

export interface EmailReplyResult {
  draft_reply: string
  stakeholder_response: string
  predicted_outcome: string
  outcome_summary: string
  confidence_delta: number
  relationship_delta: number
  source: 'ai' | 'fallback'
}

export async function requestEmailReply(payload: EmailReplyPayload): Promise<EmailReplyResult> {
  const toneText = payload.reply_tone || payload.player_reply || 'Professional and collaborative'
  try {
    const res = await fetch(`${API_BASE}/ai/email_reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_name: payload.sender_name,
        subject: payload.subject,
        email_body: payload.email_body,
        reply_tone: toneText,
        company_name: payload.company_name,
      }),
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const data = await res.json()
      const draft = data.draft_reply || data.stakeholder_response || 'Received with thanks. Let us align this week.'
      const outcome = data.predicted_outcome || data.outcome_summary || 'Positive stakeholder alignment'
      const delta = data.confidence_delta ?? data.relationship_delta ?? 5
      return {
        draft_reply: draft,
        stakeholder_response: draft,
        predicted_outcome: outcome,
        outcome_summary: outcome,
        confidence_delta: delta,
        relationship_delta: delta,
        source: data.source || 'ai',
      }
    }
  } catch {
    // Offline fallback
  }

  const tone = toneText.toLowerCase()
  if (tone.includes('negotiate')) {
    const draft = `We appreciate the transparency, CEO. Let us schedule a partner call Thursday afternoon to review your updated financial model and terms.`
    const outcome = 'Strong negotiation leverage (+6 Confidence, better terms)'
    return {
      draft_reply: draft,
      stakeholder_response: draft,
      predicted_outcome: outcome,
      outcome_summary: outcome,
      confidence_delta: 6,
      relationship_delta: 6,
      source: 'fallback',
    }
  }
  if (tone.includes('time') || tone.includes('defer')) {
    const draft = `Understood. We will hold until Friday afternoon for the complete verification package.`
    const outcome = 'Buys 48 hours of breathing room (+2 Trust)'
    return {
      draft_reply: draft,
      stakeholder_response: draft,
      predicted_outcome: outcome,
      outcome_summary: outcome,
      confidence_delta: 2,
      relationship_delta: 2,
      source: 'fallback',
    }
  }
  if (tone.includes('decline')) {
    const draft = `Noted. We respect your capital allocation discipline and will revisit next quarter.`
    const outcome = 'Preserves treasury focus, closes thread cleanly'
    return {
      draft_reply: draft,
      stakeholder_response: draft,
      predicted_outcome: outcome,
      outcome_summary: outcome,
      confidence_delta: 1,
      relationship_delta: 1,
      source: 'fallback',
    }
  }
  const draft = `Thank you for the prompt response and detailed attachments. Our team is reviewing the deck and financial model ahead of our next meeting.`
  const outcome = 'Positive stakeholder alignment (+5 Confidence & Reputation)'
  return {
    draft_reply: draft,
    stakeholder_response: draft,
    predicted_outcome: outcome,
    outcome_summary: outcome,
    confidence_delta: 5,
    relationship_delta: 5,
    source: 'fallback',
  }
}



