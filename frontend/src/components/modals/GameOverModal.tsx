/**
 * CORPORATE HELL™ — Satirical TechCrunch Obituary & Game Over Modal.
 *
 * Implements dramatic startup failures:
 * - Bankruptcy, Boardroom Coups, Catastrophic Data Leaks, and Antitrust Dissolution
 * - Satirical TechCrunch front-page article with Hacker News comment section
 * - Instant Chapter Checkpoint Rewind or 3-Slot Disk Load
 */
import React from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { audio } from '../../services/audio'
import { Skull, RotateCcw, Save, AlertTriangle, MessageSquare } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'

export type GameOverReason =
  | 'bankruptcy'
  | 'boardroom_coup'
  | 'catastrophic_hack'
  | 'antitrust_dissolution'

interface Props {
  reason: GameOverReason
  onRewindChapter: () => void
  onOpenSaveSlots: () => void
}

const FAILURE_DATA: Record<
  GameOverReason,
  { headline: string; subhead: string; article: string; comments: { user: string; text: string }[] }
> = {
  bankruptcy: {
    headline: 'Silicon Valley Darling Collapses After Burning $15M on Branded Patagonia Vests',
    subhead: 'Runway plunged to $0.00 while founders debated office ping-pong table ergonomics.',
    article:
      'In a shocking yet entirely predictable turn of events, the high-flying tech venture has filed for Chapter 11 bankruptcy after failing to convert viral LinkedIn engagement into actual paying enterprise clients. Liquidators have already begun auctioning the espresso machines and Herman Miller chairs.',
    comments: [
      { user: '@vc_whistleblower', text: 'Called it on Substack 6 months ago. Zero unit economics.' },
      { user: '@junior_dev_anon', text: 'Wait, does this mean our unvested options are worthless??' },
      { user: '@hustle_grindset', text: 'Every failure is just a pre-seed round for your next unicorn bro! 🔥' },
    ],
  },
  boardroom_coup: {
    headline: 'Board Votes 4-1 to Oust Founder in Brutal Midnight Corporate Coup',
    subhead: 'Venture capitalists invoke dilution covenants and install veteran gray-haired supply chain executive.',
    article:
      'Following a contentious quarterly board meeting, institutional investors exercised their preferred voting covenants to terminate the original founder and CEO. The incoming interim CEO announced immediate 35% headcount reductions and mandatory in-office attendance 6 days a week.',
    comments: [
      { user: '@steve_jobs_fan_99', text: 'Getting fired from your own company is just canon founder lore.' },
      { user: '@corporate_shill', text: 'The spreadsheet always wins in the end. Good riddance to founder mode.' },
    ],
  },
  catastrophic_hack: {
    headline: 'Unauthenticated API Leaks 400 Million Plaintext Passwords onto Dark Web',
    subhead: 'Engineering leadership skipped security sprints to ship AI meme generation features.',
    article:
      'Regulatory authorities have issued unprecedented GDPR fines after security researchers discovered a production database open to the public internet with the password "admin123". Enterprise customers fled in droves.',
    comments: [
      { user: '@cyber_threat_intel', text: 'Tech debt always collects its compound interest eventually.' },
      { user: '@sre_on_call', text: 'I literally filed 14 Jira tickets about this and was told "we\'ll fix it post-Series A".' },
    ],
  },
  antitrust_dissolution: {
    headline: 'Federal Trade Commission Slices Tech Giant into 4 Regional Public Utilities',
    subhead: 'Supreme Court upholds historic anti-monopoly decree following disastrous Senate hearing.',
    article:
      'The era of sovereign corporate hegemony came to a screeching halt today as federal regulators executed a forced partition of the tech conglomerate. Operating systems, cloud datacenters, and enterprise apps will now operate as separate municipal monopolies.',
    comments: [
      { user: '@bell_system_nostalgia', text: 'Standard Oil 2.0. History rhymes every 100 years.' },
      { user: '@open_source_crusader', text: 'Nature is healing. The protocols belong to humanity again.' },
    ],
  },
}

export const GameOverModal: React.FC<Props> = ({ reason, onRewindChapter, onOpenSaveSlots }) => {
  const data = FAILURE_DATA[reason] || FAILURE_DATA.bankruptcy

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none font-mono">
      <div className="flex flex-col max-w-2xl w-full bg-[#14121c] border-4 border-[#d9453d] shadow-[10px_10px_0px_#000] text-[#f4ecd8] max-h-[92vh] overflow-hidden animate-slide-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-[#d9453d] px-4 py-3 text-[#14121c]">
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5" />
            <span className="font-bold text-sm uppercase tracking-widest">
              TechCrunch • OBITUARY BREAKING NEWS
            </span>
          </div>
          <span className="text-[10px] font-bold bg-[#14121c] text-[#d9453d] px-2 py-0.5 uppercase">
            GAME OVER
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto pixel-scrollbar flex-1 bg-[#181622]">
          {/* Newspaper Headline */}
          <div className="border-b-2 border-[#4b4a5e] pb-3">
            <h1 className="text-base sm:text-lg font-bold text-[#f4ecd8] leading-snug">
              {data.headline}
            </h1>
            <p className="text-xs text-[#f2a93b] italic mt-1">{data.subhead}</p>
          </div>

          {/* Article snippet */}
          <div className="p-3 bg-[#1e1c2a] border border-[#4b4a5e] text-xs text-[#ded2b6] leading-relaxed">
            {data.article}
          </div>

          {/* Satirical Comments Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#8c8aa0]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Hacker News Comments:</span>
            </div>

            <div className="space-y-1.5">
              {data.comments.map((c, idx) => (
                <div key={idx} className="p-2 bg-[#14121c] border border-[#333144] text-[10px]">
                  <span className="text-[#8fd3ff] font-bold block">{c.user}</span>
                  <p className="text-[#ded2b6] mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-[#2a2838] p-3 border-t-2 border-[#4b4a5e]">
          <span className="text-[10px] text-[#8c8aa0]">
            Don't despair — corporate history allows second chances.
          </span>

          <div className="flex items-center gap-2">
            <PixelButton onClick={onOpenSaveSlots} variant="neutral" size="sm">
              <Save className="h-3.5 w-3.5" />
              <span>Load Slot</span>
            </PixelButton>

            <PixelButton onClick={onRewindChapter} variant="danger" size="sm">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>↺ Rewind Chapter Checkpoint</span>
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  )
}
