/**
 * CORPORATE HELL™ — Senate Antitrust Hearing & Regulatory Confrontation.
 *
 * Implements high-stakes Capitol Hill testimony:
 * - Testifying under oath before cynical senators regarding monopoly power
 * - Choosing between Lobbying, PR Spin, Technical Evasion, or Tech Bro Arrogance
 * - Win condition: Regulatory immunity and sovereign corporate status
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import {
  Gavel,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Award,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'

interface Props {
  onClose: () => void
}

interface Question {
  senator: string
  title: string
  speech: string
  avatar: string
  options: {
    label: string
    tactic: 'spin' | 'lobby' | 'nerd' | 'arrogant'
    effectText: string
    approvalDelta: number
    cost: number
  }[]
}

const QUESTIONS: Question[] = [
  {
    senator: 'Senator Bradford Vance',
    title: 'Judiciary Committee Chairman',
    avatar: '🏛️',
    speech:
      '"CEO, your company now controls 88% of all cloud infrastructure and enterprise communications. You buy every startup that poses a threat. Why shouldn’t this committee break you up into four baby companies right now?"',
    options: [
      {
        label: '"Senator, our integrated scale saves American consumers billions every year."',
        tactic: 'spin',
        effectText: '+15% Committee Approval (Good PR Spin)',
        approvalDelta: 15,
        cost: 0,
      },
      {
        label: 'Direct $2,500,000 corporate PAC donation to the Senator’s re-election super PAC.',
        tactic: 'lobby',
        effectText: '+30% Committee Approval (Undisclosed Campaign Synergy)',
        approvalDelta: 30,
        cost: 2500000,
      },
      {
        label: '"The mathematical topology of our distributed nodes makes dissolution physically impossible."',
        tactic: 'nerd',
        effectText: '+10% Approval (Senators are confused and nod along)',
        approvalDelta: 10,
        cost: 0,
      },
      {
        label: '"With all due respect Senator, you type with two index fingers and use Yahoo mail."',
        tactic: 'arrogant',
        effectText: '-35% Approval (Senator holds you in contempt)',
        approvalDelta: -35,
        cost: 0,
      },
    ],
  },
  {
    senator: 'Senator Eleanor Sterling',
    title: 'Commerce & Consumer Protection',
    avatar: '⚖️',
    speech:
      '"Our subpoenas show your algorithms predict human emotional vulnerability to sell enterprise software. Do you view our citizens as sovereign individuals, or mere monthly recurring revenue?"',
    options: [
      {
        label: '"We operate under the strictest Zero-Trust privacy frameworks in human history."',
        tactic: 'spin',
        effectText: '+20% Committee Approval',
        approvalDelta: 20,
        cost: 0,
      },
      {
        label: 'Commit $5,000,000 to building an AI Ethics Center at the Senator’s alma mater.',
        tactic: 'lobby',
        effectText: '+35% Committee Approval',
        approvalDelta: 35,
        cost: 5000000,
      },
      {
        label: '"Our models optimize for utility functions that maximize global productivity metrics."',
        tactic: 'nerd',
        effectText: '+15% Approval',
        approvalDelta: 15,
        cost: 0,
      },
      {
        label: '"If we don\'t analyze them, foreign rivals will. Do you want foreign algorithms ruling us?"',
        tactic: 'spin',
        effectText: '+25% Approval (National Security Card played)',
        approvalDelta: 25,
        cost: 0,
      },
    ],
  },
]

export const SenateHearingModal: React.FC<Props> = ({ onClose }) => {
  const cash = useGameStore((s) => s.state?.cash || 0)
  const career = useGameStore((s) => s.state?.career)
  const pushToast = useUiStore((s) => s.pushToast)

  const [questionIdx, setQuestionIdx] = useState<number>(0)
  const [committeeApproval, setCommitteeApproval] = useState<number>(45)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const currentQ = QUESTIONS[questionIdx]

  const handleSelectOption = (opt: (typeof QUESTIONS)[0]['options'][0]) => {
    if (cash < opt.cost) {
      audio.playBuzzer()
      pushToast({
        title: 'Insufficient Campaign Funds!',
        description: `Need $${(opt.cost / 1000000).toFixed(1)}M for this lobbying strategy.`,
        severity: 'alert',
      })
      return
    }

    if (opt.cost > 0) {
      const currentState = useGameStore.getState().state
      if (currentState) {
        currentState.cash -= opt.cost
      }
    }

    const nextApproval = Math.max(0, Math.min(100, committeeApproval + opt.approvalDelta))
    setCommitteeApproval(nextApproval)

    if (opt.approvalDelta > 0) {
      audio.playDing()
    } else {
      audio.playAlert()
    }

    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx((prev) => prev + 1)
    } else {
      // Completed hearing
      setIsFinished(true)
      if (nextApproval >= 60) {
        audio.playFanfare()
        if (career) {
          career.senateInquiryPassed = true
        }
        pushToast({
          title: 'Antitrust Immunity Granted!',
          description: 'The Senate Committee cleared your conglomerate of all antitrust charges!',
          severity: 'celebrate',
        })
      } else {
        audio.playBuzzer()
        pushToast({
          title: 'Federal Breakup Order Imminent!',
          description: 'The Committee recommended DOJ anti-monopoly dissolution. Appeal quickly!',
          severity: 'alert',
        })
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm select-none font-mono">
      <div className="flex flex-col max-w-2xl w-full bg-[#14121c] border-4 border-[#4b4a5e] shadow-[8px_8px_0px_#000] text-[#f4ecd8] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#2a2838] px-4 py-3 border-b-2 border-[#4b4a5e]">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-[#f2a93b]" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#f4ecd8]">
                United States Senate Antitrust Inquiry
              </h2>
              <span className="text-[10px] text-[#8fd3ff]">
                Live CSPAN Broadcast • Testimony Under Oath
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-0.5 bg-[#4b4a5e] hover:bg-[#d9453d] text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Approval Bar */}
        <div className="p-3 bg-[#1e1c2a] border-b-2 border-[#4b4a5e]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-[#ded2b6]">Senate Committee Approval Sentiment:</span>
            <span
              className={`font-bold ${
                committeeApproval >= 60
                  ? 'text-[#b6e52d]'
                  : committeeApproval >= 40
                  ? 'text-[#f2a93b]'
                  : 'text-[#d9453d]'
              }`}
            >
              {committeeApproval}% {committeeApproval >= 60 ? '(Favorable)' : '(Hostile)'}
            </span>
          </div>
          <PixelBar
            value={committeeApproval}
            color={committeeApproval >= 60 ? 'green' : committeeApproval >= 40 ? 'amber' : 'red'}
            size="md"
          />
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto pixel-scrollbar flex-1">
          {!isFinished ? (
            <>
              {/* Senator Question Card */}
              <div className="p-3.5 bg-[#2a2838] border-2 border-[#f2a93b]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{currentQ.avatar}</span>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-[#f2a93b]">{currentQ.senator}</h3>
                    <span className="text-[9px] text-[#8c8aa0]">{currentQ.title}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#f4ecd8] italic leading-relaxed">
                  {currentQ.speech}
                </p>
              </div>

              {/* Response Options */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#8c8aa0] tracking-wider block">
                  Select Your Sworn Defense Strategy:
                </span>

                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full text-left p-3 bg-[#1e1c2a] hover:bg-[#2a2838] border-2 border-[#4b4a5e] hover:border-[#b6e52d] cursor-pointer flex flex-col gap-1 transition-none"
                  >
                    <span className="text-xs font-bold text-[#f4ecd8]">{opt.label}</span>
                    <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-[#333144]">
                      <span className="text-[#8fd3ff]">{opt.effectText}</span>
                      {opt.cost > 0 && (
                        <span className="text-[#f2a93b] font-bold">
                          Cost: ${(opt.cost / 1000000).toFixed(1)}M PAC
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Hearing Outcome Screen */
            <div className="p-4 bg-[#1e1c2a] border-2 border-[#b6e52d] text-center space-y-3">
              <span className="text-4xl block">
                {committeeApproval >= 60 ? '🏛️' : '🚨'}
              </span>
              <h3 className="text-sm font-bold uppercase text-[#f4ecd8]">
                {committeeApproval >= 60
                  ? 'Hearing Adjourned: Antitrust Immunity Granted!'
                  : 'Committee Issues Subpoena for Breakup!'}
              </h3>
              <p className="text-xs text-[#ded2b6]">
                {committeeApproval >= 60
                  ? 'The congressional committee officially concluded that your conglomerate is an essential pillar of national cyber infrastructure. You now possess sovereign corporate immunity.'
                  : 'Federal regulators have initiated forced antitrust proceedings. You must appeal or deploy emergency legal warfare.'}
              </p>
              {committeeApproval >= 60 && (
                <div className="p-3 bg-[#14121c] border border-[#b6e52d] text-[10px] text-[#b6e52d] font-bold">
                  ★ FINAL OBJECTIVE COMPLETE: Planetary Tech Hegemony Achieved!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-[#2a2838] p-3 border-t-2 border-[#4b4a5e]">
          <span className="text-[10px] text-[#8c8aa0]">
            PAC War Chest: <strong className="text-[#b6e52d]">${cash.toLocaleString()}</strong>
          </span>
          <PixelButton onClick={onClose} variant="primary" size="sm">
            <span>{isFinished ? 'Exit Capitol Hill' : 'Leave Hearing'}</span>
          </PixelButton>
        </div>
      </div>
    </div>
  )
}
