/**
 * CORPORATE HELL™ — CorpOS Mail App (Section 6).
 *
 * Retro pixel email client with critical executive decision emails,
 * tactile choice buttons, and runway/morale consequences.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Mail, Check, AlertCircle, Trash2, ArrowRight } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

interface DecisionEmail {
  id: string
  from: string
  subject: string
  body: string
  unread: boolean
  choices: {
    label: string
    impact: string
    action: () => void
  }[]
}

export const MailApp: React.FC = () => {
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const [selectedEmailId, setSelectedEmailId] = useState<string>('m-1')
  const [emails, setEmails] = useState<DecisionEmail[]>([
    {
      id: 'm-1',
      from: 'alex.vc@sequoia-capital.com',
      subject: 'URGENT: Board Meeting Prep & AI Pivot',
      body: 'Team, we notice 3 rival YC companies added "Autonomous Neural Workflows" to their landing page last week. We recommend pivoting 50% of your engineering sprint into generative agent demos before our next board meeting on Thursday.',
      unread: true,
      choices: [
        {
          label: 'Accept Pivot (+Hype, -Sprint Progress)',
          impact: 'Pivots 4 developers to AI demos.',
          action: () => {
            dispatch({ type: 'bonus_all' })
            pushToast({
              title: 'Pivot Mandate Issued',
              description: 'AI hype increased by 30%! Engineering velocity took a hit.',
              severity: 'warn',
              appId: 'mail',
            })
          },
        },
        {
          label: 'Politely Decline (Keep Shipping)',
          impact: 'Focus remains 100% on core product.',
          action: () => {
            pushToast({
              title: 'Board Informed',
              description: 'Stayed the course. Engineering velocity maximized!',
              severity: 'celebrate',
              appId: 'mail',
            })
          },
        },
      ],
    },
    {
      id: 'm-2',
      from: 'sarah.lead@corporatehell.io',
      subject: 'Coffee Machine & Office Snacks Budget',
      body: 'Hey boss, the break room espresso machine is making scary metallic screeching noises, and someone stole the last oat milk carton. Morale in the engineering pod is plummeting. Can we approve an emergency artisanal snack stipend?',
      unread: true,
      choices: [
        {
          label: 'Approve $800 Artisan Coffee (+Morale)',
          impact: 'Costs $800, grants +15% company-wide morale.',
          action: () => {
            dispatch({ type: 'bonus_all' })
            pushToast({
              title: 'Artisan Espresso Delivered!',
              description: 'Espresso machine replaced with chrome Italian beast. Engineers cheering!',
              severity: 'celebrate',
              appId: 'mail',
            })
          },
        },
        {
          label: 'Suggest Instant Coffee (-Morale)',
          impact: 'Saves money, but engineers will grumble.',
          action: () => {
            pushToast({
              title: 'Budget Conserved',
              description: 'Instant coffee crystals placed in pantry. 2 employees sighed audibly.',
              severity: 'warn',
              appId: 'mail',
            })
          },
        },
      ],
    },
  ])

  const activeEmail = emails.find((e) => e.id === selectedEmailId) || emails[0]

  const handleResolveEmail = (emailId: string, choiceIdx: number) => {
    audio.playStamp()
    const email = emails.find((e) => e.id === emailId)
    if (email) {
      email.choices[choiceIdx].action()
      setEmails((prev) => prev.filter((e) => e.id !== emailId))
      setSelectedEmailId(emails.find((e) => e.id !== emailId)?.id || '')
    }
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Unread Count */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#f4ecd8]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            CorpOS Mail v2.1
          </span>
          <PixelBadge
            label={`${emails.length} Action Items`}
            variant={emails.length > 0 ? 'amber' : 'slate'}
          />
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Split Inbox Layout */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-[220px]">
        {/* Left Col: Email List */}
        <div className="flex flex-col bg-[#14121c] p-2 border-2 border-[#4b4a5e] overflow-y-auto pixel-scrollbar">
          {emails.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelectedEmailId(e.id)}
              className={`
                p-2 border-2 mb-1.5 cursor-pointer select-none
                ${selectedEmailId === e.id ? 'bg-[#3e6ec0] text-white border-white' : 'bg-[#2a2838] text-[#f4ecd8] border-[#14121c] hover:bg-[#353346]'}
              `}
            >
              <div className="flex justify-between items-center text-[9px] mb-1">
                <span className="font-bold truncate max-w-[120px]">{e.from}</span>
                <span className="text-[#b6e52d] font-bold">NEW</span>
              </div>
              <div className="text-[11px] font-bold truncate">{e.subject}</div>
            </div>
          ))}

          {emails.length === 0 && (
            <div className="text-center py-12 text-[#8c8aa0] text-xs italic">
              🎉 Inbox Zero! No pending decisions.
            </div>
          )}
        </div>

        {/* Right 2 Cols: Email Reader & Decision Options */}
        <div className="col-span-2 flex flex-col bg-[#2a2838] p-3 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] justify-between">
          {activeEmail ? (
            <div>
              <div className="border-b border-[#4b4a5e] pb-2 mb-2">
                <h4 className="font-bold text-xs text-[#f4ecd8] uppercase">
                  {activeEmail.subject}
                </h4>
                <div className="text-[10px] text-[#8fd3ff] mt-0.5">
                  From: {activeEmail.from}
                </div>
              </div>

              <p className="text-xs text-[#f4ecd8] my-3 leading-relaxed whitespace-pre-line bg-[#14121c] p-3 border border-[#4b4a5e]">
                {activeEmail.body}
              </p>

              {/* Decision Buttons */}
              <div className="mt-4">
                <span className="text-[10px] text-[#b6e52d] font-bold uppercase block mb-2">
                  Choose Executive Action:
                </span>
                <div className="flex flex-col gap-2">
                  {activeEmail.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleResolveEmail(activeEmail.id, idx)}
                      className="p-2 bg-[#14121c] hover:bg-[#3e6ec0] border-2 border-[#4b4a5e] hover:border-white text-left cursor-pointer flex items-center justify-between text-xs text-[#f4ecd8] font-bold group shadow-[1px_1px_0px_#14121c]"
                    >
                      <span>{choice.label}</span>
                      <span className="text-[9px] text-[#8c8aa0] group-hover:text-white font-normal">
                        {choice.impact}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#8c8aa0] text-xs italic">
              Select an email from the left pane
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
