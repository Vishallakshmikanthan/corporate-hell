/**
 * CORPORATE HELL™ — Addictive Gamification, Roguelite Perks & Dopamine Loop Store.
 *
 * Implements the "Sweet Spot Hybrid" (D + B + C Lite):
 * - 3D Collectible Dopamine Bubbles (Code, Design, Hype, Cash, Bug Squash)
 * - Pitch-escalating Combo Multiplier & Flow State
 * - Product Launch Charge Meter (0-100%) + 4-Critic Review Reveal
 * - Roguelite End-of-Day 3-Card Perk Drafts with stacking synergies
 * - Escalating 3-Day Board Audit Milestones
 * - Floating Combat-Style Popups, Confetti Bursts & Screen Shake
 */
import { create } from 'zustand'
import { audio } from '../services/audio'

export type BubbleKind = 'code' | 'design' | 'hype' | 'cash' | 'bug'

export interface WorldBubble {
  id: string
  kind: BubbleKind
  position: [number, number, number]
  value: number
  label: string
  spawnedAt: number
  expiresAt: number
}

export interface FloatingPop {
  id: string
  text: string
  color: string
  x: number // percentage 15..85
  y: number // percentage 20..75
  createdAt: number
}

export type PerkRarity = 'common' | 'rare' | 'legendary' | 'cursed'

export interface StartupPerk {
  id: string
  name: string
  rarity: PerkRarity
  tag: string
  description: string
  flavor: string
  modifiers: {
    bubbleValueMult?: number
    cashMult?: number
    hypeMult?: number
    bugBonusCash?: number
    launchScoreBonus?: number
    chargeSpeedMult?: number
    moraleBonus?: number
    comboBonus?: number
  }
}

export interface CriticReview {
  outlet: string
  critic: string
  score: number // 1..10
  quote: string
}

export interface LaunchReviewResult {
  productName: string
  buzzword: string
  reviews: CriticReview[]
  avgScore: number
  totalPayout: number
  hypeGained: number
  newUsers: number
}

export interface BoardAudit {
  auditNumber: number
  dueDay: number
  targetCash: number
  targetLaunches: number
  rewardCash: number
  title: string
}

export const PERK_CATALOG: StartupPerk[] = [
  {
    id: 'espresso_iv',
    name: 'Espresso IV Drip',
    rarity: 'common',
    tag: 'SPEED',
    description: '+35% Launch Charge from all bubbles & PR swipes.',
    flavor: 'HR says it is technically a wellness benefit.',
    modifiers: { chargeSpeedMult: 0.35 },
  },
  {
    id: 'rubber_duck_army',
    name: 'Rubber Duck Army',
    rarity: 'common',
    tag: 'BUGS',
    description: 'Squashing 🐞 Bugs awards +$1,500 bonus cash & double charge.',
    flavor: 'They listen better than middle management.',
    modifiers: { bugBonusCash: 1500, bubbleValueMult: 0.15 },
  },
  {
    id: 'ai_buzzword_deck',
    name: 'AI Buzzword Deck',
    rarity: 'common',
    tag: 'HYPE',
    description: '+40% Hype gain and +0.6 Critic Review score on Launches.',
    flavor: 'Just add "Agentic" to the landing page.',
    modifiers: { hypeMult: 0.4, launchScoreBonus: 0.6 },
  },
  {
    id: 'ergonomic_chairs',
    name: 'Herman Miller Surplus',
    rarity: 'common',
    tag: 'CULTURE',
    description: '+15 Team Morale immediately & +20% bubble value.',
    flavor: 'Bought from a bankrupt crypto exchange.',
    modifiers: { moraleBonus: 15, bubbleValueMult: 0.2 },
  },
  {
    id: 'standing_desk_cult',
    name: 'Standing Desk Cult',
    rarity: 'common',
    tag: 'COMBO',
    description: '+25% cash from combos & faster Flow State.',
    flavor: 'Nobody sits, everybody ships.',
    modifiers: { cashMult: 0.25, comboBonus: 1 },
  },
  {
    id: 'ten_x_intern',
    name: '10x Unpaid Intern',
    rarity: 'rare',
    tag: 'SYNERGY',
    description: '+60% Code & Design bubble value, +30% Launch Charge speed.',
    flavor: 'Paid in exposure and lukewarm LaCroix.',
    modifiers: { bubbleValueMult: 0.6, chargeSpeedMult: 0.3 },
  },
  {
    id: 'growth_hacker_bot',
    name: 'Viral Botnet (Organic™)',
    rarity: 'rare',
    tag: 'HYPE',
    description: '+75% Cash payout on Product Launches & +50% Hype.',
    flavor: '90% real humans, 100% investor-ready.',
    modifiers: { cashMult: 0.75, hypeMult: 0.5 },
  },
  {
    id: 'zero_downtime_ci',
    name: 'Green Build Shrine',
    rarity: 'rare',
    tag: 'ENG',
    description: '+1.2 Critic Review Score on all Product Launches.',
    flavor: 'Never deploy on Friday (unless you have this).',
    modifiers: { launchScoreBonus: 1.2 },
  },
  {
    id: 'vc_fomo_ring',
    name: 'VC FOMO Whisper Network',
    rarity: 'rare',
    tag: 'FINANCE',
    description: '+50% Cash from every bubble, PR review, and Launch.',
    flavor: '"We are oversubscribed" (you have 1 email).',
    modifiers: { cashMult: 0.5 },
  },
  {
    id: 'golden_crocs',
    name: 'Kevin’s Golden Crocs',
    rarity: 'legendary',
    tag: 'LEGENDARY',
    description: '+100% Bubble Value, +50% Cash, +1.5 Launch Score!',
    flavor: 'Sport mode permanently engaged.',
    modifiers: { bubbleValueMult: 1.0, cashMult: 0.5, launchScoreBonus: 1.5 },
  },
  {
    id: 'silicon_messiah',
    name: 'Black Turtleneck Aura',
    rarity: 'legendary',
    tag: 'LEGENDARY',
    description: '+2.0 Critic Review Score & +80% Launch Cash Payout!',
    flavor: 'One more thing...',
    modifiers: { launchScoreBonus: 2.0, cashMult: 0.8 },
  },
  {
    id: 'infinite_runway_hack',
    name: 'R&D Tax Credit Wizard',
    rarity: 'legendary',
    tag: 'LEGENDARY',
    description: 'Bugs pay +$4,000 each & +60% all Cash rewards!',
    flavor: 'Every bug is now "experimental R&D".',
    modifiers: { bugBonusCash: 4000, cashMult: 0.6 },
  },
  {
    id: 'cursed_pivot',
    name: 'Cursed: Rewrite in Rust',
    rarity: 'cursed',
    tag: 'CURSED',
    description: '+120% Bubble Value & +1.8 Launch Score, -10 Morale.',
    flavor: 'Memory safe, emotionally unsafe.',
    modifiers: { bubbleValueMult: 1.2, launchScoreBonus: 1.8, moraleBonus: -10 },
  },
  {
    id: 'cursed_crunch',
    name: 'Cursed: Pizza Party Crunch',
    rarity: 'cursed',
    tag: 'CURSED',
    description: '+100% Launch Charge Speed & +70% Cash, -12 Morale.',
    flavor: 'No raises, but hey — pepperoni!',
    modifiers: { chargeSpeedMult: 1.0, cashMult: 0.7, moraleBonus: -12 },
  },
]

const BUBBLE_SPOTS: [number, number, number][] = [
  [-4.2, 2.2, -2.5],
  [3.6, 2.3, -2.0],
  [0.2, 2.4, -3.5],
  [-2.6, 2.1, 2.4],
  [4.0, 2.2, 2.8],
  [-0.8, 2.3, 0.5],
  [2.2, 2.1, -0.4],
  [-3.8, 2.4, 0.2],
]

const BEDROOM_SPOTS: [number, number, number][] = [
  [-2.2, 2.1, -3.2],
  [1.8, 2.0, -2.4],
  [0.0, 2.2, 0.5],
  [-2.4, 2.0, 1.4],
  [2.4, 2.1, 1.2],
]

let uidCounter = 0
function nextUid(prefix: string): string {
  uidCounter += 1
  return `${prefix}_${Date.now()}_${uidCounter}`
}

export function getAggregatedModifiers(perks: StartupPerk[]) {
  return perks.reduce(
    (acc, p) => ({
      bubbleValueMult: acc.bubbleValueMult + (p.modifiers.bubbleValueMult || 0),
      cashMult: acc.cashMult + (p.modifiers.cashMult || 0),
      hypeMult: acc.hypeMult + (p.modifiers.hypeMult || 0),
      bugBonusCash: acc.bugBonusCash + (p.modifiers.bugBonusCash || 0),
      launchScoreBonus: acc.launchScoreBonus + (p.modifiers.launchScoreBonus || 0),
      chargeSpeedMult: acc.chargeSpeedMult + (p.modifiers.chargeSpeedMult || 0),
      comboBonus: acc.comboBonus + (p.modifiers.comboBonus || 0),
    }),
    {
      bubbleValueMult: 1,
      cashMult: 1,
      hypeMult: 1,
      bugBonusCash: 0,
      launchScoreBonus: 0,
      chargeSpeedMult: 1,
      comboBonus: 0,
    }
  )
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 5.0
  if (combo >= 6) return 3.0
  if (combo >= 4) return 2.0
  if (combo >= 2) return 1.5
  return 1.0
}

export function buildAuditForNumber(auditNumber: number): BoardAudit {
  const dueDay = auditNumber * 3
  const targets = [
    { cash: 65000, launches: 1, reward: 20000, title: 'Angel Check-In' },
    { cash: 130000, launches: 2, reward: 45000, title: 'Seed Board Audit' },
    { cash: 260000, launches: 3, reward: 90000, title: 'Series A Stress Test' },
    { cash: 550000, launches: 5, reward: 180000, title: 'Hypergrowth Audit' },
  ]
  const cfg = targets[Math.min(auditNumber - 1, targets.length - 1)]
  const scale = auditNumber > targets.length ? Math.pow(1.8, auditNumber - targets.length) : 1
  return {
    auditNumber,
    dueDay,
    targetCash: Math.round(cfg.cash * scale),
    targetLaunches: cfg.launches + Math.max(0, auditNumber - targets.length),
    rewardCash: Math.round(cfg.reward * scale),
    title: cfg.title,
  }
}

interface GamificationStore {
  // Dopamine Loop (D)
  codePoints: number
  designPoints: number
  hypePoints: number
  productCharge: number // 0..100
  launchesCompleted: number
  bugsSquashed: number
  prSwipeStreak: number
  bestPrStreak: number
  comboCount: number
  comboExpiresAt: number

  // World Bubbles & Visual Juice
  activeBubbles: WorldBubble[]
  floatingPops: FloatingPop[]
  confettiTrigger: number
  screenShakeTrigger: number

  // Roguelite Perks & Audits (B)
  activePerks: StartupPerk[]
  draftChoices: StartupPerk[]
  isPerkDraftOpen: boolean
  currentAudit: BoardAudit
  auditsPassed: number

  // Product Launch Critic Reveal (D)
  isLaunchModalOpen: boolean
  lastLaunchReview: LaunchReviewResult | null

  // Progressive Onboarding (C Lite)
  sandboxUnlockAll: boolean

  // Actions
  spawnBubble: (sceneType?: 'bedroom' | 'office') => void
  collectBubble: (
    id: string,
    onCashDelta?: (amount: number) => void,
    screenHint?: { x?: number; y?: number }
  ) => void
  collectAllBubbles: (onCashDelta?: (amount: number) => void) => number
  recordActionJuice: (opts: {
    label: string
    color?: string
    chargeDelta?: number
    codeDelta?: number
    hypeDelta?: number
    cashDelta?: number
    incrementCombo?: boolean
    shake?: boolean
    confetti?: boolean
    onCashDelta?: (amount: number) => void
  }) => void
  decayComboIfExpired: () => void
  pushFloatingPop: (text: string, color: string, x?: number, y?: number) => void
  triggerConfetti: () => void
  triggerScreenShake: () => void

  // Perk Draft
  openPerkDraft: () => void
  selectPerk: (perkId: string, onMoraleDelta?: (delta: number) => void) => void
  closePerkDraft: () => void

  // Launch Reveal
  openLaunchModal: () => void
  closeLaunchModal: () => void
  executeProductLaunch: (
    productName: string,
    buzzword: string,
    onCashDelta?: (amount: number) => void
  ) => LaunchReviewResult

  // Audits
  checkBoardAudit: (day: number, cash: number, onCashDelta?: (amount: number) => void) => 'passed' | 'missed' | 'pending'

  // Onboarding
  toggleSandboxUnlockAll: () => void
  resetRun: () => void
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  codePoints: 0,
  designPoints: 0,
  hypePoints: 10,
  productCharge: 25, // Start at 25% so first launch feels super close!
  launchesCompleted: 0,
  bugsSquashed: 0,
  prSwipeStreak: 0,
  bestPrStreak: 0,
  comboCount: 0,
  comboExpiresAt: 0,

  activeBubbles: [],
  floatingPops: [],
  confettiTrigger: 0,
  screenShakeTrigger: 0,

  activePerks: [],
  draftChoices: [],
  isPerkDraftOpen: false,
  currentAudit: buildAuditForNumber(1),
  auditsPassed: 0,

  isLaunchModalOpen: false,
  lastLaunchReview: null,

  sandboxUnlockAll: false,

  spawnBubble: (sceneType = 'office') => {
    const now = Date.now()
    const current = get().activeBubbles.filter((b) => b.expiresAt > now)
    if (current.length >= 6) {
      set({ activeBubbles: current })
      return
    }

    const spots = sceneType === 'bedroom' ? BEDROOM_SPOTS : BUBBLE_SPOTS
    const baseSpot = spots[Math.floor(Math.random() * spots.length)]
    const jitterX = (Math.random() - 0.5) * 1.4
    const jitterZ = (Math.random() - 0.5) * 1.4

    const roll = Math.random()
    let kind: BubbleKind = 'code'
    let value = 12
    let label = '+CODE'
    if (roll < 0.34) {
      kind = 'code'
      value = 10 + Math.floor(Math.random() * 12)
      label = `+${value} CODE`
    } else if (roll < 0.56) {
      kind = 'design'
      value = 8 + Math.floor(Math.random() * 10)
      label = `+${value} UX`
    } else if (roll < 0.74) {
      kind = 'hype'
      value = 8 + Math.floor(Math.random() * 10)
      label = `+${value} HYPE`
    } else if (roll < 0.88) {
      kind = 'cash'
      value = 600 + Math.floor(Math.random() * 900)
      label = `+$${value}`
    } else {
      kind = 'bug'
      value = 18
      label = 'BUG!'
    }

    const bubble: WorldBubble = {
      id: nextUid('bub'),
      kind,
      position: [baseSpot[0] + jitterX, baseSpot[1], baseSpot[2] + jitterZ],
      value,
      label,
      spawnedAt: now,
      expiresAt: now + 18000,
    }

    set({ activeBubbles: [...current, bubble] })
  },

  collectBubble: (id, onCashDelta, screenHint) => {
    const state = get()
    const bubble = state.activeBubbles.find((b) => b.id === id)
    if (!bubble) return

    const now = Date.now()
    const mods = getAggregatedModifiers(state.activePerks)
    const nextCombo = now <= state.comboExpiresAt ? state.comboCount + 1 + mods.comboBonus : 1
    const comboMult = getComboMultiplier(nextCombo)

    let codeDelta = 0
    let designDelta = 0
    let hypeDelta = 0
    let cashDelta = 0
    let chargeDelta = 0
    let bugsDelta = 0
    let popText = ''
    let popColor = '#b6e52d'

    if (bubble.kind === 'code') {
      codeDelta = Math.round(bubble.value * mods.bubbleValueMult * comboMult)
      chargeDelta = Math.round(10 * mods.chargeSpeedMult * Math.min(2, comboMult))
      cashDelta = Math.round(250 * mods.cashMult * comboMult)
      popText = `+${codeDelta} CODE`
      popColor = '#8fd3ff'
      audio.playComboPop(nextCombo)
    } else if (bubble.kind === 'design') {
      designDelta = Math.round(bubble.value * mods.bubbleValueMult * comboMult)
      chargeDelta = Math.round(9 * mods.chargeSpeedMult * Math.min(2, comboMult))
      cashDelta = Math.round(220 * mods.cashMult * comboMult)
      popText = `+${designDelta} UX`
      popColor = '#c084fc'
      audio.playComboPop(nextCombo)
    } else if (bubble.kind === 'hype') {
      hypeDelta = Math.round(bubble.value * mods.hypeMult * comboMult)
      chargeDelta = Math.round(8 * mods.chargeSpeedMult)
      popText = `+${hypeDelta} HYPE 🔥`
      popColor = '#f2a93b'
      audio.playComboPop(nextCombo)
    } else if (bubble.kind === 'cash') {
      cashDelta = Math.round(bubble.value * mods.cashMult * comboMult)
      chargeDelta = Math.round(5 * mods.chargeSpeedMult)
      popText = `+$${cashDelta.toLocaleString()}`
      popColor = '#b6e52d'
      audio.playCash()
    } else if (bubble.kind === 'bug') {
      bugsDelta = 1
      codeDelta = Math.round(bubble.value * mods.bubbleValueMult * comboMult)
      chargeDelta = Math.round(15 * mods.chargeSpeedMult)
      cashDelta = Math.round((800 + mods.bugBonusCash) * mods.cashMult * comboMult)
      popText = `🐞 SQUASHED! +$${cashDelta.toLocaleString()}`
      popColor = '#ff6b6b'
      audio.playBugSquash()
      get().triggerScreenShake()
    }

    if (cashDelta > 0 && onCashDelta) {
      onCashDelta(cashDelta)
    }

    const nextCharge = Math.min(100, state.productCharge + chargeDelta)
    const justHit100 = state.productCharge < 100 && nextCharge >= 100

    set({
      activeBubbles: state.activeBubbles.filter((b) => b.id !== id),
      codePoints: state.codePoints + codeDelta,
      designPoints: state.designPoints + designDelta,
      hypePoints: state.hypePoints + hypeDelta,
      bugsSquashed: state.bugsSquashed + bugsDelta,
      productCharge: nextCharge,
      comboCount: nextCombo,
      comboExpiresAt: now + 5500,
    })

    get().pushFloatingPop(
      nextCombo >= 3 ? `${popText} (${comboMult}x!)` : popText,
      popColor,
      screenHint?.x,
      screenHint?.y
    )

    if (justHit100) {
      audio.playCelebration()
      get().triggerConfetti()
      get().pushFloatingPop('🚀 LAUNCH READY 100%!', '#b6e52d', 50, 30)
    }
  },

  collectAllBubbles: (onCashDelta) => {
    const bubbles = [...get().activeBubbles]
    bubbles.forEach((b, idx) => {
      setTimeout(() => {
        get().collectBubble(b.id, onCashDelta)
      }, idx * 75)
    })
    return bubbles.length
  },

  recordActionJuice: ({
    label,
    color = '#b6e52d',
    chargeDelta = 0,
    codeDelta = 0,
    hypeDelta = 0,
    cashDelta = 0,
    incrementCombo = true,
    shake = false,
    confetti = false,
    onCashDelta,
  }) => {
    const state = get()
    const now = Date.now()
    const mods = getAggregatedModifiers(state.activePerks)
    const nextCombo = incrementCombo
      ? now <= state.comboExpiresAt
        ? state.comboCount + 1
        : 1
      : state.comboCount
    const comboMult = getComboMultiplier(nextCombo)

    const finalCash = Math.round(cashDelta * mods.cashMult * (incrementCombo ? comboMult : 1))
    const finalCharge = Math.round(chargeDelta * mods.chargeSpeedMult)

    if (finalCash !== 0 && onCashDelta) {
      onCashDelta(finalCash)
    }

    const nextCharge = Math.min(100, Math.max(0, state.productCharge + finalCharge))
    const justHit100 = state.productCharge < 100 && nextCharge >= 100

    set({
      codePoints: state.codePoints + Math.round(codeDelta * mods.bubbleValueMult),
      hypePoints: state.hypePoints + Math.round(hypeDelta * mods.hypeMult),
      productCharge: nextCharge,
      comboCount: nextCombo,
      comboExpiresAt: incrementCombo ? now + 5500 : state.comboExpiresAt,
    })

    if (incrementCombo) {
      audio.playComboPop(nextCombo)
    }
    if (shake) get().triggerScreenShake()
    if (confetti || justHit100) get().triggerConfetti()

    get().pushFloatingPop(label, color)
    if (justHit100) {
      audio.playCelebration()
      get().pushFloatingPop('🚀 LAUNCH READY 100%!', '#b6e52d', 50, 28)
    }
  },

  decayComboIfExpired: () => {
    const state = get()
    const now = Date.now()
    const prunedBubbles = state.activeBubbles.filter((b) => b.expiresAt > now)
    const prunedPops = state.floatingPops.filter((p) => now - p.createdAt < 1400)
    const comboExpired = state.comboCount > 0 && now > state.comboExpiresAt

    if (
      comboExpired ||
      prunedBubbles.length !== state.activeBubbles.length ||
      prunedPops.length !== state.floatingPops.length
    ) {
      set({
        comboCount: comboExpired ? 0 : state.comboCount,
        activeBubbles: prunedBubbles,
        floatingPops: prunedPops,
      })
    }
  },

  pushFloatingPop: (text, color, x, y) => {
    const pop: FloatingPop = {
      id: nextUid('pop'),
      text,
      color,
      x: x ?? 30 + Math.random() * 40,
      y: y ?? 30 + Math.random() * 35,
      createdAt: Date.now(),
    }
    set((s) => ({
      floatingPops: [...s.floatingPops.slice(-10), pop],
    }))
  },

  triggerConfetti: () => set((s) => ({ confettiTrigger: s.confettiTrigger + 1 })),
  triggerScreenShake: () => set((s) => ({ screenShakeTrigger: s.screenShakeTrigger + 1 })),

  openPerkDraft: () => {
    const ownedIds = new Set(get().activePerks.map((p) => p.id))
    const pool = PERK_CATALOG.filter((p) => !ownedIds.has(p.id))
    const source = pool.length >= 3 ? pool : PERK_CATALOG
    const shuffled = [...source].sort(() => Math.random() - 0.5)
    set({
      draftChoices: shuffled.slice(0, 3),
      isPerkDraftOpen: true,
    })
  },

  selectPerk: (perkId, onMoraleDelta) => {
    const perk = get().draftChoices.find((p) => p.id === perkId)
    if (!perk) return
    audio.playCardSelect()
    get().triggerConfetti()
    if (perk.modifiers.moraleBonus && onMoraleDelta) {
      onMoraleDelta(perk.modifiers.moraleBonus)
    }
    set((s) => ({
      activePerks: [...s.activePerks, perk],
      isPerkDraftOpen: false,
      draftChoices: [],
    }))
    get().pushFloatingPop(`✨ PERK: ${perk.name.toUpperCase()}!`, '#f2a93b', 50, 35)
  },

  closePerkDraft: () => set({ isPerkDraftOpen: false }),

  openLaunchModal: () => set({ isLaunchModalOpen: true, lastLaunchReview: null }),
  closeLaunchModal: () => set({ isLaunchModalOpen: false }),

  executeProductLaunch: (productName, buzzword, onCashDelta) => {
    const state = get()
    const mods = getAggregatedModifiers(state.activePerks)

    // Score driven by code + design + hype + perks + slight randomness
    const qualityBase = Math.min(
      8.5,
      4.5 + (state.codePoints + state.designPoints) / 90 + state.hypePoints / 120
    )

    const outlets = [
      {
        outlet: 'TechCrump',
        critic: 'Sarah V.',
        high: `"${buzzword} ${productName} actually works. VCs are fighting in the lobby."`,
        mid: `"Solid execution, though the landing page has 14 gradients."`,
        low: `"Feels like a weekend hackathon project with a Stripe button."`,
      },
      {
        outlet: 'HackerNews',
        critic: 'dang_fan_99',
        high: `"Rare W. Zero bloat, ships fast, I'd actually pay for this."`,
        mid: `"I could build this in a weekend with SQLite and bash, but nice UI."`,
        low: `"Why does this need Electron AND a GPU cluster?"`,
      },
      {
        outlet: 'ProductHunt',
        critic: 'Launch Hunter',
        high: `"#1 PRODUCT OF THE DAY! 🚀🔥 Upvoted by 1,800 founders!"`,
        mid: `"Congrats on the launch! Love the pixel vibes!"`,
        low: `"Cool idea, needs a dark mode and an AI copilot."`,
      },
      {
        outlet: 'The Verge-ish',
        critic: 'Nilay Bot',
        high: `"The most addictive corporate tool since spreadsheets."`,
        mid: `"Charming chaos. Worth keeping an eye on."`,
        low: `"It crashed twice during our review, yet somehow raised $2M."`,
      },
    ]

    const reviews: CriticReview[] = outlets.map((o) => {
      const jitter = (Math.random() - 0.4) * 2.0
      const raw = qualityBase + mods.launchScoreBonus + jitter
      const score = Math.max(2, Math.min(10, Math.round(raw * 10) / 10))
      const quote = score >= 8 ? o.high : score >= 6 ? o.mid : o.low
      return { outlet: o.outlet, critic: o.critic, score, quote }
    })

    const avgScore =
      Math.round((reviews.reduce((a, r) => a + r.score, 0) / reviews.length) * 10) / 10

    const basePayout = Math.round(
      (12000 + state.codePoints * 120 + state.designPoints * 100 + state.hypePoints * 140) *
        (avgScore / 6.5) *
        mods.cashMult
    )
    const hypeGained = Math.round(avgScore * 4 * mods.hypeMult)
    const newUsers = Math.round(avgScore * 420 + state.hypePoints * 25)

    if (onCashDelta) {
      onCashDelta(basePayout)
    }

    const result: LaunchReviewResult = {
      productName,
      buzzword,
      reviews,
      avgScore,
      totalPayout: basePayout,
      hypeGained,
      newUsers,
    }

    set((s) => ({
      productCharge: 0,
      launchesCompleted: s.launchesCompleted + 1,
      hypePoints: s.hypePoints + hypeGained,
      codePoints: Math.round(s.codePoints * 0.35), // Keep 35% momentum into next version
      designPoints: Math.round(s.designPoints * 0.35),
      lastLaunchReview: result,
    }))

    return result
  },

  checkBoardAudit: (day, cash, onCashDelta) => {
    const { currentAudit, launchesCompleted, auditsPassed } = get()
    if (day < currentAudit.dueDay) return 'pending'

    const passed =
      cash >= currentAudit.targetCash || launchesCompleted >= currentAudit.targetLaunches

    if (passed) {
      if (onCashDelta) onCashDelta(currentAudit.rewardCash)
      audio.playCelebration()
      get().triggerConfetti()
      get().pushFloatingPop(
        `🏆 AUDIT PASSED! +$${currentAudit.rewardCash.toLocaleString()}`,
        '#b6e52d',
        50,
        24
      )
      set({
        auditsPassed: auditsPassed + 1,
        currentAudit: buildAuditForNumber(currentAudit.auditNumber + 1),
      })
      return 'passed'
    }

    // Missed audit: extend deadline by 2 days with a mild stress warning instead of hard lock
    set({
      currentAudit: {
        ...currentAudit,
        dueDay: day + 2,
      },
    })
    return 'missed'
  },

  toggleSandboxUnlockAll: () => {
    audio.playLever()
    set((s) => ({ sandboxUnlockAll: !s.sandboxUnlockAll }))
  },

  resetRun: () =>
    set({
      codePoints: 0,
      designPoints: 0,
      hypePoints: 10,
      productCharge: 25,
      launchesCompleted: 0,
      bugsSquashed: 0,
      prSwipeStreak: 0,
      comboCount: 0,
      comboExpiresAt: 0,
      activeBubbles: [],
      floatingPops: [],
      activePerks: [],
      draftChoices: [],
      isPerkDraftOpen: false,
      currentAudit: buildAuditForNumber(1),
      auditsPassed: 0,
      isLaunchModalOpen: false,
      lastLaunchReview: null,
    }),
}))
