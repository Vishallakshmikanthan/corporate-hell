/**
 * CORPORATE HELL™ — Pitch Duel Interactive Minigame.
 *
 * Interactive presentation duel for Chapter 2 Hackathon Judges and Chapter 3 VC Meetings:
 * - 3 tough venture judges firing aggressive questions & objections
 * - Dynamic card choices: Visionary Hype vs Hard Technical Moat vs Viral Meme
 * - Score bar measuring Judge Confidence vs Skepticism
 * - Hitting >75% wins the $25,000 Angel check & 1st Place Trophy!
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { audio } from '../../services/audio'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { Trophy, HelpCircle, AlertTriangle, Sparkles, Check } from 'lucide-react'

interface QuestionRound {
  judgeName: string
  judgeRole: string
  judgeAvatar: string
  question: string
  choices: {
    label: string
    subtext: string
    confidenceDelta: number
    skepticismDelta: number
    feedback: string
  }[]
}

const HACKATHON_QUESTIONS: QuestionRound[] = [
  {
    judgeName: 'Brad Thornwood',
    judgeRole: 'Tier-1 VC Partner',
    judgeAvatar: '/reference/char_vest.jpg',
    question: "This sounds cool, but what's your defensible moat? What prevents Google or Microsoft from shipping this next Tuesday?",
    choices: [
      {
        label: 'Proprietary Fine-Tuned Model & Data Flywheel',
        subtext: 'Focus on technical depth and enterprise sticky data',
        confidenceDelta: 28,
        skepticismDelta: -15,
        feedback: "Brad nods slowly: 'Good answer. Enterprise data gravity is hard to clone.'",
      },
      {
        label: 'Pure Speed & 10x Developer Velocity',
        subtext: 'Big tech is slow; we will ship 50 features before they schedule a meeting',
        confidenceDelta: 22,
        skepticismDelta: -8,
        feedback: "Brad smirks: 'True, Google takes 6 months to approve a button color.'",
      },
      {
        label: 'Meme Hype & Cult Following on Chirper',
        subtext: 'We have 40k waitlist signups and trending memes',
        confidenceDelta: 15,
        skepticismDelta: 10,
        feedback: "Brad raises an eyebrow: 'Memes fade fast, founder. Show me retention.'",
      },
    ],
  },
  {
    judgeName: 'Yuki Tanaka',
    judgeRole: 'Principal Architect & Veteran Founder',
    judgeAvatar: '/reference/char_graphic_tee.jpg',
    question: 'I looked at your GitHub repo during the demo. Your database schema has zero indexes and will implode under 5,000 requests.',
    choices: [
      {
        label: 'Acknowledge Debt & Present Redis / Sharding Roadmap',
        subtext: 'Honest technical maturity and fast mitigation plan',
        confidenceDelta: 30,
        skepticismDelta: -20,
        feedback: "Yuki smiles: 'Respect. Most founders pretend their prototype is production-ready.'",
      },
      {
        label: 'We will just rent 8x H100 GPUs and brute-force it',
        subtext: 'Throw compute and VC money at the problem',
        confidenceDelta: 10,
        skepticismDelta: 15,
        feedback: "Yuki sighs: 'Your runway will burn in 48 hours.'",
      },
      {
        label: 'Premature optimization is the root of all evil',
        subtext: 'Quote Donald Knuth and redirect to user love',
        confidenceDelta: 20,
        skepticismDelta: -5,
        feedback: "Yuki chuckles: 'Fair point, but fix those indexes before launch day.'",
      },
    ],
  },
  {
    judgeName: 'Brock Vance',
    judgeRole: 'Angel Syndicate Lead & Ex-Unicorn CEO',
    judgeAvatar: '/reference/char_green_sweater.jpg',
    question: 'Final question: If I wire you $25,000 right now, what is your next 30-day milestone?',
    choices: [
      {
        label: 'Incorporate Company, Hire Co-Founders & Launch Private Beta',
        subtext: 'Pragmatic, disciplined startup execution',
        confidenceDelta: 32,
        skepticismDelta: -22,
        feedback: "Brock slams his desk: 'That's what I want to hear. Execution over hype.'",
      },
      {
        label: 'Run $15,000 in Influencer Ads and Rent a Hacker Loft',
        subtext: 'Maximum viral blitzscaling',
        confidenceDelta: 18,
        skepticismDelta: 12,
        feedback: "Brock laughs: 'Bold, but you will run out of cash before month 2.'",
      },
      {
        label: 'Quit our day jobs and live on instant noodles for 6 months',
        subtext: 'Unfiltered grit and ramen profitability',
        confidenceDelta: 25,
        skepticismDelta: -10,
        feedback: "Brock nods with nostalgia: 'Ah, the true garage hustle.'",
      },
    ],
  },
]

interface Props {
  onClose: () => void
}

export const PitchDuelModal: React.FC<Props> = ({ onClose }) => {
  const dispatch = useGameStore((s) => s.dispatch)

  const [roundIndex, setRoundIndex] = useState(0)
  const [confidence, setConfidence] = useState(45)
  const [lastFeedback, setLastFeedback] = useState<string | null>(null)
  const [duelFinished, setDuelFinished] = useState(false)

  const currentRound = HACKATHON_QUESTIONS[roundIndex]

  const handleSelectChoice = (choice: typeof HACKATHON_QUESTIONS[0]['choices'][0]) => {
    audio.playStamp()
    const nextConfidence = Math.min(100, Math.max(0, confidence + choice.confidenceDelta))
    setConfidence(nextConfidence)
    setLastFeedback(choice.feedback)

    setTimeout(() => {
      if (roundIndex < HACKATHON_QUESTIONS.length - 1) {
        setRoundIndex((r) => r + 1)
        setLastFeedback(null)
      } else {
        setDuelFinished(true)
      }
    }, 1800)
  }

  const isWinner = confidence >= 70

  const handleClaimTrophy = () => {
    dispatch({
      type: 'pitch_hackathon_result',
      won: isWinner,
      rank: isWinner ? 1 : 4,
      prizeCash: isWinner ? 25000 : 2500,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono select-none crt-scanlines">
      <div className="relative flex flex-col w-full max-w-2xl bg-[#1a1824] border-4 border-[#14121c] shadow-[10px_10px_0px_#14121c] p-5 text-[#f4ecd8] overflow-hidden">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b-2 border-[#14121c] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#facc15]" />
            <h2 className="font-bold text-sm tracking-wider uppercase text-[#b6e52d]">
              HACKATHON GRAND FINALE: SLIDE PITCH DUEL
            </h2>
          </div>
          <span className="text-xs text-[#8fd3ff] font-bold">
            ROUND {Math.min(roundIndex + 1, 3)} / 3
          </span>
        </div>

        {/* Confidence Meter */}
        <div className="bg-[#2a2838] border-2 border-[#14121c] p-3 mb-4">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-[#ded2b6]">VENTURE JUDGE CONFIDENCE:</span>
            <span className={confidence >= 70 ? 'text-[#b6e52d]' : 'text-[#facc15]'}>
              {confidence}% {confidence >= 70 ? '(1ST PLACE PACING)' : '(NEEDS CONVINCING)'}
            </span>
          </div>
          <PixelBar value={confidence} max={100} color={confidence >= 70 ? 'lime' : 'amber'} />
        </div>

        {!duelFinished ? (
          <div className="flex flex-col gap-3">
            {/* Judge Spotlight Card */}
            <div className="flex items-center gap-3 p-3 bg-[#14121c] border-2 border-[#4b4a5e]">
              <div className="h-14 w-14 border-2 border-[#14121c] overflow-hidden shrink-0 shadow">
                <img
                  src={currentRound.judgeAvatar}
                  alt={currentRound.judgeName}
                  className="h-full w-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase text-[#b6e52d]">
                    {currentRound.judgeName}
                  </span>
                  <span className="text-[10px] text-[#8fd3ff] uppercase font-bold">
                    {currentRound.judgeRole}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#f4ecd8] italic">
                  "{currentRound.question}"
                </p>
              </div>
            </div>

            {/* Answer Feedback Banner */}
            {lastFeedback && (
              <div className="p-2 bg-[#2a2838] border-2 border-[#b6e52d] text-xs text-[#b6e52d] font-bold animate-slide-up">
                {lastFeedback}
              </div>
            )}

            {/* Multiple Choice Responses */}
            <div className="flex flex-col gap-2 mt-1">
              {currentRound.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectChoice(choice)}
                  disabled={!!lastFeedback}
                  className="flex flex-col text-left p-3 bg-[#2a2838] hover:bg-[#3e6ec0] active:top-[1px] border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] cursor-pointer disabled:opacity-50 transition-none"
                >
                  <span className="font-bold text-xs text-[#f4ecd8] uppercase">
                    {choice.label}
                  </span>
                  <span className="text-[10px] text-[#ded2b6] mt-0.5">
                    {choice.subtext}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Grand Finale Award Screen */
          <div className="flex flex-col items-center justify-center p-6 text-center animate-slide-up">
            <Trophy className="h-16 w-16 text-[#facc15] mb-2 animate-bounce-subtle" />
            <h3 className="text-xl font-bold uppercase text-[#b6e52d] tracking-wider mb-1">
              {isWinner ? '1ST PLACE GRAND CHAMPION!' : 'HONORABLE MENTION (4TH PLACE)'}
            </h3>
            <p className="text-xs text-[#ded2b6] max-w-md mb-4">
              {isWinner
                ? 'The judges were blown away by your technical moat and execution speed! You won the grand prize angel check.'
                : 'Good effort, founder! You received seed interest, but lacked the technical clarity to take 1st place.'}
            </p>

            <div className="bg-[#2a2838] border-2 border-[#14121c] p-4 w-full max-w-sm mb-5 flex justify-around text-xs">
              <div>
                <div className="text-[#ded2b6]">Angel Check</div>
                <div className="font-bold text-[#b6e52d] text-lg">
                  +${(isWinner ? 25000 : 2500).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[#ded2b6]">Final Score</div>
                <div className="font-bold text-[#8fd3ff] text-lg">{confidence}%</div>
              </div>
            </div>

            <PixelButton variant="primary" onClick={handleClaimTrophy}>
              Claim Angel Prize & Form Startup!
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  )
}
