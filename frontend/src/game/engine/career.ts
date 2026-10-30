/**
 * CORPORATE HELL™ — Silicon Empire Career Chapter Engine.
 *
 * Implements the multi-chapter founder journey:
 * Ch 1: The Bedroom Hacker (Solo dev, side projects, caffeine & burnout)
 * Ch 2: The 48h Hackathon (Networking, co-founder recruitment, MVP crunch, pitch duel)
 * Ch 3: The Garage & Pre-Seed (Equity split negotiation, accelerator demo day, first 3 hires)
 * Ch 4: The Scale-up Office (Customizable builder grid, GPU clusters, product pivots)
 * Ch 5: Megacorp Hegemony (Hostile M&A, Wall Street IPO bell, Senate antitrust hearing)
 */
import type { CompanyState } from '../models/types'

export type CareerChapterId = 'bedroom' | 'hackathon' | 'garage' | 'scaleup' | 'megacorp'

export interface ChapterObjective {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  completed: boolean
}

export interface CoFounderCandidate {
  id: string
  name: string
  role: string
  archetype: string
  bio: string
  skills: { tech: number; hustle: number; design: number }
  demandedEquityPct: number
  avatarImg: string
  satisfaction: number
}

export interface TermSheetOffer {
  id: string
  firmName: string
  partnerName: string
  investmentAmount: number
  equityPct: number
  valuation: number
  hasBoardSeatTakeover: boolean
  hasLiquidationPreference: boolean // 2x participating liquidation preference
  hasFounderVestingCliff: boolean
  flavorText: string
}

export interface CareerChapterState {
  currentChapter: CareerChapterId
  unlockedChapters: CareerChapterId[]
  objectives: ChapterObjective[]
  starsEarned: Record<CareerChapterId, number>
  chapterDay: number

  // Chapter 1: Solo Bedroom Hacker Metrics
  githubStars: number
  sideProjectsShipped: number
  caffeineLevel: number // 0..100
  sleepDebt: number // 0..100
  learningLevel: number // 0..100

  // Chapter 2: 48h Hackathon Metrics
  hackathonHoursLeft: number // 48 -> 0
  recruitedCoFounders: CoFounderCandidate[]
  prototypeCompleteness: number // 0..100
  prototypeQuality: number // 0..100
  wonHackathon: boolean
  hackathonRank: number // 1 = 1st Place

  // Chapter 3: Garage & Pre-Seed Equity
  coFounders: { id: string; name: string; role: string; equityPct: number; satisfaction: number }[]
  founderEquityPct: number
  termSheetOffers: TermSheetOffer[]
  selectedTermSheetId: string | null

  // Chapter 4: Office Builder
  placedFurnitureCount: number
  activeTechDomain: 'ai_agents' | 'b2b_saas' | 'social_viral' | 'fintech'

  // Chapter 5: Megacorp & Hegemony
  acquiredRivalIds: string[]
  ipoBellRung: boolean
  senateInquiryPassed: boolean
}

export const CHAPTER_DEFINITIONS: Record<CareerChapterId, {
  number: number
  title: string
  subtitle: string
  locationLabel: string
  description: string
  initialObjectives: ChapterObjective[]
}> = {
  bedroom: {
    number: 1,
    title: 'The Bedroom Hacker',
    subtitle: 'Solo Indie Developer Arc',
    locationLabel: 'Student Dorm / Messy Bedroom',
    description: 'Learn modern tech stacks, manage caffeine & sleep, build working side projects, and gain GitHub stars to catch the eye of hackathon organizers.',
    initialObjectives: [
      {
        id: 'obj_learn_docs',
        title: 'Master Modern Tech Stacks',
        description: 'Read documentation & study frameworks to reach 50 Tech Knowledge.',
        target: 50,
        current: 0,
        unit: 'Skill',
        completed: false,
      },
      {
        id: 'obj_ship_projects',
        title: 'Ship 3 Side Projects',
        description: 'Build and push 3 working open-source projects to GitHub.',
        target: 3,
        current: 0,
        unit: 'Projects',
        completed: false,
      },
      {
        id: 'obj_github_stars',
        title: 'Earn 300 GitHub Stars',
        description: 'Gain traction and recognition across the developer community.',
        target: 300,
        current: 0,
        unit: 'Stars',
        completed: false,
      },
    ],
  },
  hackathon: {
    number: 2,
    title: 'The 48-Hour Hackathon',
    subtitle: 'Crunch Time & Co-Founder Hunt',
    locationLabel: 'Convention Center Floor',
    description: 'Network with brilliant hackers, recruit your dream co-founders, crunch an MVP under a ticking 48-hour clock, and deliver a killer pitch to win the $25,000 Angel check.',
    initialObjectives: [
      {
        id: 'obj_recruit_team',
        title: 'Recruit 2 Co-Founders',
        description: 'Network with hackers and assemble a team with complementary skills.',
        target: 2,
        current: 0,
        unit: 'Members',
        completed: false,
      },
      {
        id: 'obj_build_mvp',
        title: 'Build Working MVP Prototype',
        description: 'Crunch code before the 48-hour countdown expires to hit 100% completeness.',
        target: 100,
        current: 0,
        unit: '%',
        completed: false,
      },
      {
        id: 'obj_win_hackathon',
        title: 'Win the Slide Pitch Duel',
        description: 'Pitch to brutal venture judges and take 1st place in the hackathon.',
        target: 1,
        current: 0,
        unit: 'Trophy',
        completed: false,
      },
    ],
  },
  garage: {
    number: 3,
    title: 'The Garage & Pre-Seed',
    subtitle: 'Co-Founders, Equity & Demo Day',
    locationLabel: 'Suburban Garage Incubator',
    description: 'Incorporate your startup, negotiate fair equity splits, survive early co-founder drama, and negotiate term sheets with Sand Hill Road VCs at Demo Day.',
    initialObjectives: [
      {
        id: 'obj_equity_split',
        title: 'Settle Co-Founder Equity',
        description: 'Finalize founding equity distribution without causing co-founder rage-quits.',
        target: 1,
        current: 0,
        unit: 'Agreement',
        completed: false,
      },
      {
        id: 'obj_hire_early_team',
        title: 'Hire First 3 Employees',
        description: 'Bring on initial engineers and operators to build product v1.',
        target: 3,
        current: 0,
        unit: 'Hires',
        completed: false,
      },
      {
        id: 'obj_seed_round',
        title: 'Close $1.5M Seed Round',
        description: 'Pitch VCs, negotiate pre-money valuation, and sign a clean term sheet.',
        target: 1500000,
        current: 0,
        unit: '$',
        completed: false,
      },
    ],
  },
  scaleup: {
    number: 4,
    title: 'The Series A Scale-up',
    subtitle: 'Custom Office, Product Pivots & Hyper-Growth',
    locationLabel: 'Downtown Brick Loft',
    description: 'Design and customize your office on the isometric grid, scale engineering velocity, navigate market tech pivots, and hit $5,000,000 ARR.',
    initialObjectives: [
      {
        id: 'obj_customize_office',
        title: 'Build & Equip Office',
        description: 'Place at least 8 desks, servers, and morale amenities using the Builder mode.',
        target: 8,
        current: 0,
        unit: 'Items',
        completed: false,
      },
      {
        id: 'obj_reach_arr',
        title: 'Hit $5,000,000 ARR',
        description: 'Scale product revenue, optimize funnel conversion, and retain enterprise clients.',
        target: 5000000,
        current: 0,
        unit: '$',
        completed: false,
      },
      {
        id: 'obj_scale_infra',
        title: 'Achieve 99.9% Uptime',
        description: 'Upgrade cloud servers and maintain pristine pipeline stability.',
        target: 99.9,
        current: 0,
        unit: '%',
        completed: false,
      },
    ],
  },
  megacorp: {
    number: 5,
    title: 'Megacorp Hegemony',
    subtitle: 'Hostile Takeovers, IPO Bell & World Domination',
    locationLabel: 'Global Glass Tower Campus',
    description: 'Ring the opening bell on Wall Street, acquire rival tech startups through hostile takeovers, testify before the Senate Anti-Trust committee, and establish a global tech monopoly.',
    initialObjectives: [
      {
        id: 'obj_ipo_bell',
        title: 'Ring the Wall Street IPO Bell',
        description: 'Take your tech company public and hit a multi-billion dollar valuation.',
        target: 1,
        current: 0,
        unit: 'Bell',
        completed: false,
      },
      {
        id: 'obj_acquire_rivals',
        title: 'Acquire 3 Rival Startups',
        description: 'Execute hostile M&A takeovers of emerging competitors.',
        target: 3,
        current: 0,
        unit: 'Acquisitions',
        completed: false,
      },
      {
        id: 'obj_senate_hearing',
        title: 'Survive Senate Antitrust Inquiry',
        description: 'Testify under oath before lawmakers and protect your tech monopoly.',
        target: 1,
        current: 0,
        unit: 'Inquiry',
        completed: false,
      },
    ],
  },
}

export function createInitialCareerState(): CareerChapterState {
  return {
    currentChapter: 'bedroom',
    unlockedChapters: ['bedroom'],
    objectives: JSON.parse(JSON.stringify(CHAPTER_DEFINITIONS.bedroom.initialObjectives)),
    starsEarned: {
      bedroom: 0,
      hackathon: 0,
      garage: 0,
      scaleup: 0,
      megacorp: 0,
    },
    chapterDay: 1,
    githubStars: 12,
    sideProjectsShipped: 0,
    caffeineLevel: 45,
    sleepDebt: 10,
    learningLevel: 15,

    hackathonHoursLeft: 48,
    recruitedCoFounders: [],
    prototypeCompleteness: 0,
    prototypeQuality: 40,
    wonHackathon: false,
    hackathonRank: 0,

    coFounders: [],
    founderEquityPct: 100,
    termSheetOffers: [
      {
        id: 'ts_sequoia_parody',
        firmName: 'Sand Hill Sequoia Partners',
        partnerName: 'Brad Thornwood',
        investmentAmount: 1500000,
        equityPct: 18,
        valuation: 8333333,
        hasBoardSeatTakeover: false,
        hasLiquidationPreference: false,
        hasFounderVestingCliff: true,
        flavorText: 'Top-tier prestige firm with massive network, but intense quarterly expectations.',
      },
      {
        id: 'ts_shark_crypto',
        firmName: 'Degen Capital Syndicate',
        partnerName: 'Brock Vance',
        investmentAmount: 2200000,
        equityPct: 28,
        valuation: 7857142,
        hasBoardSeatTakeover: true,
        hasLiquidationPreference: true,
        hasFounderVestingCliff: false,
        flavorText: 'Aggressive cash injection, but demands 2 board seats and 2x liquidation preference!',
      },
    ],
    selectedTermSheetId: null,

    placedFurnitureCount: 4,
    activeTechDomain: 'ai_agents',

    acquiredRivalIds: [],
    ipoBellRung: false,
    senateInquiryPassed: false,
  }
}

/**
 * Checks and updates objective progress for the active career chapter.
 */
export function evaluateChapterProgress(state: CompanyState): void {
  if (!state.career) return
  const career = state.career
  const current = career.currentChapter

  if (current === 'bedroom') {
    career.objectives.forEach((obj) => {
      if (obj.id === 'obj_learn_docs') {
        obj.current = career.learningLevel
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_ship_projects') {
        obj.current = career.sideProjectsShipped
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_github_stars') {
        obj.current = career.githubStars
        obj.completed = obj.current >= obj.target
      }
    })
  } else if (current === 'hackathon') {
    career.objectives.forEach((obj) => {
      if (obj.id === 'obj_recruit_team') {
        obj.current = career.recruitedCoFounders.length
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_build_mvp') {
        obj.current = career.prototypeCompleteness
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_win_hackathon') {
        obj.current = career.wonHackathon ? 1 : 0
        obj.completed = career.wonHackathon
      }
    })
  } else if (current === 'garage') {
    career.objectives.forEach((obj) => {
      if (obj.id === 'obj_equity_split') {
        obj.current = career.coFounders.length > 0 ? 1 : 0
        obj.completed = career.coFounders.length > 0
      } else if (obj.id === 'obj_hire_early_team') {
        const hires = Object.values(state.employees).filter((e) => e.active).length
        obj.current = hires
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_seed_round') {
        obj.current = career.selectedTermSheetId ? 1500000 : 0
        obj.completed = !!career.selectedTermSheetId
      }
    })
  } else if (current === 'scaleup') {
    career.objectives.forEach((obj) => {
      if (obj.id === 'obj_customize_office') {
        obj.current = career.placedFurnitureCount
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_reach_arr') {
        const arr = (state.growth?.mrr || 50000) * 12
        obj.current = arr
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_scale_infra') {
        obj.current = state.uptime || 99.5
        obj.completed = obj.current >= obj.target
      }
    })
  } else if (current === 'megacorp') {
    career.objectives.forEach((obj) => {
      if (obj.id === 'obj_ipo_bell') {
        obj.current = career.ipoBellRung ? 1 : 0
        obj.completed = career.ipoBellRung
      } else if (obj.id === 'obj_acquire_rivals') {
        obj.current = career.acquiredRivalIds.length
        obj.completed = obj.current >= obj.target
      } else if (obj.id === 'obj_senate_hearing') {
        obj.current = career.senateInquiryPassed ? 1 : 0
        obj.completed = career.senateInquiryPassed
      }
    })
  }
}

/**
 * Advances player to the next career chapter when all objectives are completed.
 */
export function advanceCareerChapter(state: CompanyState, nextChapter: CareerChapterId): boolean {
  if (!state.career) return false
  const career = state.career
  const allDone = career.objectives.every((o) => o.completed)
  if (!allDone && !career.unlockedChapters.includes(nextChapter)) {
    return false
  }

  // Calculate stars earned (1 to 3 stars based on speed/quality)
  const currentChapter = career.currentChapter
  career.starsEarned[currentChapter] = 3

  career.currentChapter = nextChapter
  if (!career.unlockedChapters.includes(nextChapter)) {
    career.unlockedChapters.push(nextChapter)
  }

  const def = CHAPTER_DEFINITIONS[nextChapter]
  career.objectives = JSON.parse(JSON.stringify(def.initialObjectives))
  career.chapterDay = 1

  // Grant chapter transition bonuses
  if (nextChapter === 'hackathon') {
    career.hackathonHoursLeft = 48
  } else if (nextChapter === 'garage') {
    state.cash += 25000 // Angel grant from winning hackathon
    state.stage = 'garage'
  } else if (nextChapter === 'scaleup') {
    state.stage = 'series_a'
    state.cash += 1500000 // Seed investment deposit
  } else if (nextChapter === 'megacorp') {
    state.stage = 'unicorn'
    state.cash += 50000000 // IPO liquidity injection
  }

  return true
}
