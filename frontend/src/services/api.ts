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

