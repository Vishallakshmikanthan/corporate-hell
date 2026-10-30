/**
 * CORPORATE HELL™ — CorpOS App Registry.
 *
 * Defines all desktop apps, roles, stage unlock requirements, and live badge counts.
 */
import React from 'react'

export interface AppDefinition {
  id: string
  title: string
  icon: string
  shortcut?: string
  unlockStage?: string
  description: string
  badge?: (state: any) => number | string | null
}

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'kanban',
    title: 'Kanban',
    icon: '📋',
    description: 'Sprint corkboard & sticky note assignments',
    badge: (state) => {
      const tickets = state?.tickets || []
      const remaining = tickets.filter((t: any) => t.status !== 'done').length
      return remaining > 0 ? remaining : null
    },
  },
  {
    id: 'gitbub',
    title: 'GitBub',
    icon: '🌿',
    description: 'Subway PR tracks and code review swipe',
    badge: (state) => {
      const prs = state?.pullRequests || []
      const open = prs.filter((p: any) => p.status === 'open').length
      return open > 0 ? open : null
    },
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    icon: '⚙',
    description: 'Factory conveyor belt CI/CD automated builds',
    badge: (state) => {
      const failing = state?.ciStatus === 'failed' || state?.isBuildBroken
      return failing ? '!' : null
    },
  },
  {
    id: 'awsome',
    title: 'AWSome',
    icon: '☁',
    description: 'Server racks, cloud capacity & traffic doors',
    badge: (state) => {
      return state?.cloudServers ? `${state.cloudServers}x` : null
    },
  },
  {
    id: 'nvidiot',
    title: 'NVIDIOT',
    icon: '🧠',
    unlockStage: 'Seed',
    description: 'GPU cluster spot exchange & training cluster',
    badge: (state) => {
      return state?.gpuSpotPrice ? `$${state.gpuSpotPrice}` : null
    },
  },
  {
    id: 'chirper',
    title: 'Chirper',
    icon: '🐤',
    description: 'Tech Twitter feed, virality spikes & replies',
    badge: (state) => {
      return state?.socialHype ? `${Math.round(state.socialHype)}%` : null
    },
  },
  {
    id: 'launch',
    title: 'Launch',
    icon: '🚀',
    description: 'Mission control rocket launch & war room',
    badge: (state) => {
      return state?.launchReadiness ? `${Math.round(state.launchReadiness)}%` : null
    },
  },
  {
    id: 'investors',
    title: 'Investors',
    icon: '📈',
    description: 'Skyline climb, funnel drop & pitch mini-game',
    badge: (state) => {
      return state?.stage || 'Seed'
    },
  },
  {
    id: 'mail',
    title: 'Mail',
    icon: '✉',
    description: 'Decision inbox & executive emails',
    badge: (state) => {
      const unread = state?.emails?.filter((e: any) => !e.read)?.length || 0
      return unread > 0 ? unread : null
    },
  },
  {
    id: 'team',
    title: 'Team',
    icon: '👥',
    description: 'Employee ID photo grid & 1-on-1 actions',
    badge: (state) => {
      const count = state?.employeeOrder?.length || 0
      return count > 0 ? count : null
    },
  },
  {
    id: 'directive',
    title: 'Directive.exe',
    icon: '⚡',
    description: 'Executive AI Command and company mandates',
    badge: () => 'AI',
  },
  {
    id: 'pager',
    title: 'Pager',
    icon: '🚨',
    description: 'SRE on-call outage alarm & postmortems',
    badge: (state) => {
      const incidents = state?.incidents?.filter((i: any) => i.status === 'active')?.length || 0
      return incidents > 0 ? incidents : null
    },
  },
  {
    id: 'talent',
    title: 'Recruiter',
    icon: '💼',
    description: 'Quantitative talent hiring (Intern to 10x Legend)',
    badge: () => 'HIRE',
  },
  {
    id: 'forge',
    title: 'Forge',
    icon: '📦',
    description: 'Modular tech architecture & major version shipping',
    badge: () => 'v1.0',
  },
]
