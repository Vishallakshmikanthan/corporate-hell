/**
 * CORPORATE HELL™ — Quantitative Talent Recruiter App (CorpOS).
 *
 * Implements standardized role management (Intern to 10x Legend) across
 * Engineering, Design, Sales, and Marketing with live burn rate & productivity synergies.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Zap,
  CheckCircle2,
  Sparkles,
  Award,
} from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import type { Department, Role } from '../../game/models/types'

interface CandidateTier {
  id: string
  name: string
  role: Role
  department: Department
  tier: 'Intern' | 'Junior' | 'Senior' | 'Lead' | '10x Legend'
  salaryMo: number
  recruitmentFee: number
  outputMultiplier: number
  synergy: string
  avatar: string
  bio: string
}

const CANDIDATE_POOL: CandidateTier[] = [
  // Engineering
  {
    id: 'cand_dev_intern',
    name: 'Toby Flenderson Jr.',
    role: 'intern',
    department: 'engineering',
    tier: 'Intern',
    salaryMo: 2500,
    recruitmentFee: 500,
    outputMultiplier: 0.5,
    synergy: 'Cheap labour; generates +15% bug risk without senior supervision.',
    avatar: '🐣',
    bio: 'CS sophomore who claims to have built Facebook in Rust during high school.',
  },
  {
    id: 'cand_dev_junior',
    name: 'Priya Sharma',
    role: 'junior',
    department: 'engineering',
    tier: 'Junior',
    salaryMo: 6000,
    recruitmentFee: 2000,
    outputMultiplier: 1.0,
    synergy: 'Solid day-to-day bug squasher and pull-request author.',
    avatar: '💻',
    bio: 'Bootcamp valedictorian ready to grind sprint tickets 60 hours a week.',
  },
  {
    id: 'cand_dev_senior',
    name: 'Marcus Vance',
    role: 'senior',
    department: 'engineering',
    tier: 'Senior',
    salaryMo: 14000,
    recruitmentFee: 6000,
    outputMultiplier: 2.2,
    synergy: '+25% Output buff to all junior developers in the same room.',
    avatar: '⚡',
    bio: 'Ex-FAANG systems architect who refactors legacy code in his sleep.',
  },
  {
    id: 'cand_dev_10x',
    name: 'Satoshi "Zero" Tanaka',
    role: 'specialist',
    department: 'engineering',
    tier: '10x Legend',
    salaryMo: 45000,
    recruitmentFee: 20000,
    outputMultiplier: 10.0,
    synergy: 'Autonomously completes entire sprints; refuses to attend standups.',
    avatar: '🔥',
    bio: 'Legendary kernel hacker. Only accepts compensation in gold bars and stock.',
  },

  // Design / UX
  {
    id: 'cand_ux_senior',
    name: 'Maya Lin',
    role: 'specialist',
    department: 'marketing',
    tier: 'Senior',
    salaryMo: 12000,
    recruitmentFee: 4000,
    outputMultiplier: 2.5,
    synergy: '-30% Customer Churn; +20% Product Polish rating.',
    avatar: '🎨',
    bio: 'Obsessive typography perfectionist who designed award-winning mobile OS interfaces.',
  },

  // Sales / GTM
  {
    id: 'cand_sales_lead',
    name: 'Chad "Closer" Sterling',
    role: 'manager',
    department: 'sales',
    tier: 'Lead',
    salaryMo: 20000,
    recruitmentFee: 10000,
    outputMultiplier: 4.0,
    synergy: 'Closes $100k+ enterprise contracts; talks extremely loud on speakerphone.',
    avatar: '📞',
    bio: 'President’s Club winner 5 years running. Lives on espresso and LinkedIn hustle quotes.',
  },

  // Marketing
  {
    id: 'cand_mkt_lead',
    name: 'Chloe Monet',
    role: 'manager',
    department: 'marketing',
    tier: 'Lead',
    salaryMo: 15000,
    recruitmentFee: 5000,
    outputMultiplier: 3.5,
    synergy: '+50% Viral Hype coefficient; drives organic signup spikes.',
    avatar: '📣',
    bio: 'Growth hacker who trended 4 viral TikTok campaigns to #1 worldwide.',
  },
]

export const TalentRecruiterApp: React.FC = () => {
  const cash = useGameStore((s) => s.state?.cash || 0)
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const [selectedDept, setSelectedDept] = useState<string>('all')

  const filteredCandidates =
    selectedDept === 'all'
      ? CANDIDATE_POOL
      : CANDIDATE_POOL.filter((c) => c.department === selectedDept)

  const handleHire = (cand: CandidateTier) => {
    if (cash < cand.recruitmentFee) {
      audio.playBuzzer()
      pushToast({
        title: 'Recruitment Fund Depleted!',
        description: `Need $${cand.recruitmentFee.toLocaleString()} to onboard ${cand.name}.`,
        severity: 'alert',
      })
      return
    }

    audio.playDing()
    dispatch({
      type: 'hire',
      department: cand.department,
      role: cand.role,
      name: cand.name,
    })

    pushToast({
      title: `${cand.tier} Onboarded!`,
      description: `${cand.name} joined ${cand.department.toUpperCase()} (+${cand.outputMultiplier}x Output).`,
      severity: 'celebrate',
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#14121c] text-[#f4ecd8] font-mono select-none overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between bg-[#2a2838] p-3 border-b-2 border-[#4b4a5e]">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[#b6e52d]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#f4ecd8]">
            Headhunter & Talent Syndicate
          </h2>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-1">
          {['all', 'engineering', 'design', 'sales', 'marketing'].map((dept) => (
            <button
              key={dept}
              onClick={() => {
                audio.playClick()
                setSelectedDept(dept)
              }}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold border border-[#14121c] ${
                selectedDept === dept
                  ? 'bg-[#3e6ec0] text-white'
                  : 'bg-[#14121c] text-[#ded2b6] hover:bg-[#4b4a5e]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="flex-1 p-3 overflow-y-auto pixel-scrollbar space-y-2.5">
        {filteredCandidates.map((cand) => {
          const canAfford = cash >= cand.recruitmentFee

          return (
            <div
              key={cand.id}
              className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e] hover:border-[#b6e52d] flex items-center justify-between gap-4"
            >
              {/* Left Candidate Info */}
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-[#2a2838] border border-[#4b4a5e] shrink-0">
                  {cand.avatar}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#f4ecd8] uppercase">{cand.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 border border-[#14121c] text-[#14121c] ${
                        cand.tier === '10x Legend'
                          ? 'bg-[#f2a93b]'
                          : cand.tier === 'Lead'
                          ? 'bg-[#b6e52d]'
                          : cand.tier === 'Senior'
                          ? 'bg-[#8fd3ff]'
                          : 'bg-[#ded2b6]'
                      }`}
                    >
                      {cand.tier}
                    </span>
                    <span className="text-[9px] text-[#8c8aa0] uppercase">{cand.department}</span>
                  </div>

                  <p className="text-[10px] text-[#ded2b6] italic mt-0.5">{cand.bio}</p>

                  <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                    <span className="text-[#b6e52d] flex items-center gap-1 font-bold">
                      <Zap className="h-3 w-3" /> {cand.outputMultiplier}x Output
                    </span>
                    <span className="text-[#8c8aa0]">•</span>
                    <span className="text-[#f2a93b] flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> ${(cand.salaryMo / 1000).toFixed(1)}k/mo
                    </span>
                    <span className="text-[#8c8aa0]">•</span>
                    <span className="text-[#8fd3ff] text-[9px]">{cand.synergy}</span>
                  </div>
                </div>
              </div>

              {/* Right Hire Button */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[9px] text-[#8c8aa0] mb-1">
                  Fee: ${cand.recruitmentFee.toLocaleString()}
                </span>
                <PixelButton
                  onClick={() => handleHire(cand)}
                  variant={canAfford ? 'success' : 'neutral'}
                  size="sm"
                  disabled={!canAfford}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Hire Candidate</span>
                </PixelButton>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
