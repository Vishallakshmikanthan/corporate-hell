/**
 * CORPORATE HELL™ — Product Forge & Modular Architecture App (CorpOS).
 *
 * Implements modular product architecture:
 * - Allocating sprints between Core Scalability, AI Agents, Enterprise Security, and UX
 * - Balancing Tech Debt vs Velocity
 * - Releasing Major Versions (v1.0 MVP -> v2.0 Enterprise -> v3.0 Planetary OS)
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import {
  Boxes,
  Cpu,
  ShieldCheck,
  Sparkles,
  Zap,
  Flame,
  Wrench,
  Rocket,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'

export const ProductForgeApp: React.FC = () => {
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)
  const growth = useGameStore((s) => s.state?.growth)

  const [techDebt, setTechDebt] = useState<number>(24)
  const [featurePoints, setFeaturePoints] = useState<number>(68)
  const [activeVersion, setActiveVersion] = useState<'v1.0' | 'v2.0' | 'v3.0'>('v1.0')

  // Module Allocation sliders (must sum to 100%)
  const [modules, setModules] = useState({
    scalability: 35,
    aiAgent: 30,
    security: 15,
    ux: 20,
  })

  const handleRefactor = () => {
    audio.playLever()
    setTechDebt((prev) => Math.max(0, prev - 25))
    pushToast({
      title: 'Technical Debt Refactored!',
      description: 'Refactoring sprint completed: -25% Tech Debt. System stability restored.',
      severity: 'celebrate',
    })
  }

  const handleSprintFeature = (featureName: string) => {
    audio.playDing()
    setFeaturePoints((prev) => prev + 15)
    setTechDebt((prev) => Math.min(100, prev + 8))
    pushToast({
      title: 'Feature Shipped!',
      description: `Engineers completed ${featureName}. +15 Feature Points (+8% Tech Debt).`,
      severity: 'info',
    })
  }

  const handleReleaseVersion = (targetVersion: 'v2.0' | 'v3.0', reqPoints: number) => {
    if (featurePoints < reqPoints) {
      audio.playBuzzer()
      pushToast({
        title: 'Insufficient Feature Points!',
        description: `Need ${reqPoints} Feature Points to release ${targetVersion} (currently ${featurePoints}).`,
        severity: 'alert',
      })
      return
    }

    audio.playFanfare()
    setActiveVersion(targetVersion)
    pushToast({
      title: `🎉 ${targetVersion} Launch Day!`,
      description: `Shipped ${targetVersion} to 500,000 active enterprise accounts! ARR surged!`,
      severity: 'celebrate',
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#14121c] text-[#f4ecd8] font-mono select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#2a2838] p-3 border-b-2 border-[#4b4a5e]">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-[#8fd3ff]" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#f4ecd8]">
              Product Forge & Architecture
            </h2>
            <span className="text-[10px] text-[#b6e52d]">
              Active Release: {activeVersion} Production
            </span>
          </div>
        </div>

        {/* Feature Points & Tech Debt meters */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] uppercase text-[#8c8aa0] block">Feature Points</span>
            <span className="text-xs font-bold text-[#b6e52d]">{featurePoints} pts</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase text-[#8c8aa0] block">Tech Debt</span>
            <span
              className={`text-xs font-bold ${
                techDebt > 60 ? 'text-[#d9453d]' : techDebt > 35 ? 'text-[#f2a93b]' : 'text-[#8fd3ff]'
              }`}
            >
              {techDebt}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-y-auto pixel-scrollbar space-y-3">
        {/* Tech Debt Warning & Refactor Button */}
        <div className="p-2.5 bg-[#1e1c2a] border-2 border-[#4b4a5e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame
              className={`h-4 w-4 ${techDebt > 50 ? 'text-[#d9453d] animate-bounce' : 'text-[#f2a93b]'}`}
            />
            <div>
              <span className="text-xs font-bold text-[#f4ecd8]">
                Codebase Entropy & Server Load ({techDebt}%)
              </span>
              <p className="text-[9px] text-[#ded2b6]">
                {techDebt > 60
                  ? 'CRITICAL: High bug rate! Servers risk spontaneous outage during peak traffic.'
                  : 'Maintain refactoring cadence to prevent velocity degradation.'}
              </p>
            </div>
          </div>

          <PixelButton onClick={handleRefactor} variant="neutral" size="sm">
            <Wrench className="h-3.5 w-3.5 text-[#8fd3ff]" />
            <span>Refactor Sprint (-25%)</span>
          </PixelButton>
        </div>

        {/* Modular Architecture Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Module 1: Scalability */}
          <div className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#8fd3ff]">
                <Cpu className="h-4 w-4" /> Core Scalability
              </span>
              <span className="text-[10px] text-[#b6e52d] font-bold">99.98% Uptime</span>
            </div>
            <p className="text-[9px] text-[#ded2b6] mb-2">
              Distributed database sharding, caching, and auto-scaling Kubernetes nodes.
            </p>
            <PixelButton onClick={() => handleSprintFeature('Cloud Sharding')} variant="primary" size="sm">
              <Zap className="h-3 w-3" />
              <span>Sprint Infra (+15 pts)</span>
            </PixelButton>
          </div>

          {/* Module 2: AI Agents */}
          <div className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#f2a93b]">
                <Sparkles className="h-4 w-4" /> AI Co-Pilot & Agents
              </span>
              <span className="text-[10px] text-[#f2a93b] font-bold">4.2x Valuation Hype</span>
            </div>
            <p className="text-[9px] text-[#ded2b6] mb-2">
              Autonomous workflows, multi-modal LLMs, and real-time reasoning loops.
            </p>
            <PixelButton onClick={() => handleSprintFeature('AI Reasoning Loop')} variant="warning" size="sm">
              <Sparkles className="h-3 w-3" />
              <span>Sprint AI (+15 pts)</span>
            </PixelButton>
          </div>

          {/* Module 3: Security */}
          <div className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#b6e52d]">
                <ShieldCheck className="h-4 w-4" /> Enterprise Security
              </span>
              <span className="text-[10px] text-[#b6e52d] font-bold">SOC2 Certified</span>
            </div>
            <p className="text-[9px] text-[#ded2b6] mb-2">
              End-to-end encryption, Zero-Trust network access, and compliance auditing.
            </p>
            <PixelButton onClick={() => handleSprintFeature('SOC2 Type II Audit')} variant="success" size="sm">
              <ShieldCheck className="h-3 w-3" />
              <span>Sprint Security (+15 pts)</span>
            </PixelButton>
          </div>

          {/* Module 4: UX Delight */}
          <div className="p-3 bg-[#1e1c2a] border-2 border-[#4b4a5e]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#f4ecd8]">
                <TrendingUp className="h-4 w-4 text-[#8fd3ff]" /> UX Delight & Virality
              </span>
              <span className="text-[10px] text-[#8fd3ff] font-bold">+35% Conversion</span>
            </div>
            <p className="text-[9px] text-[#ded2b6] mb-2">
              Micro-interactions, frictionless onboarding, and social referral flywheels.
            </p>
            <PixelButton onClick={() => handleSprintFeature('Viral Flywheel')} variant="neutral" size="sm">
              <TrendingUp className="h-3 w-3" />
              <span>Sprint UX (+15 pts)</span>
            </PixelButton>
          </div>
        </div>

        {/* Version Releases Roadmap */}
        <div className="p-3 bg-[#2a2838] border-2 border-[#4b4a5e] space-y-2">
          <h3 className="text-xs font-bold uppercase text-[#f4ecd8] tracking-wider">
            Major Release Roadmap:
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {/* v1.0 MVP */}
            <div className="p-2 bg-[#1e1c2a] border border-[#b6e52d] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#b6e52d] block">v1.0 MVP</span>
                <span className="text-[9px] text-[#ded2b6]">The Bedroom Prototype</span>
              </div>
              <span className="text-[9px] text-[#b6e52d] mt-2 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Shipped & Live
              </span>
            </div>

            {/* v2.0 Enterprise */}
            <div className="p-2 bg-[#1e1c2a] border border-[#4b4a5e] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#f4ecd8] block">v2.0 Enterprise</span>
                <span className="text-[9px] text-[#ded2b6]">Requires 100 Feature Pts</span>
              </div>
              {activeVersion === 'v2.0' || activeVersion === 'v3.0' ? (
                <span className="text-[9px] text-[#b6e52d] mt-2 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active Production
                </span>
              ) : (
                <PixelButton
                  onClick={() => handleReleaseVersion('v2.0', 100)}
                  variant="success"
                  size="sm"
                  disabled={featurePoints < 100}
                >
                  <Rocket className="h-3 w-3" />
                  <span>Ship v2.0</span>
                </PixelButton>
              )}
            </div>

            {/* v3.0 Planetary OS */}
            <div className="p-2 bg-[#1e1c2a] border border-[#4b4a5e] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#f4ecd8] block">v3.0 Planetary Cloud</span>
                <span className="text-[9px] text-[#ded2b6]">Requires 200 Feature Pts</span>
              </div>
              {activeVersion === 'v3.0' ? (
                <span className="text-[9px] text-[#b6e52d] mt-2 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Planetary Monopoly
                </span>
              ) : (
                <PixelButton
                  onClick={() => handleReleaseVersion('v3.0', 200)}
                  variant="warning"
                  size="sm"
                  disabled={featurePoints < 200}
                >
                  <Rocket className="h-3 w-3" />
                  <span>Ship v3.0</span>
                </PixelButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
