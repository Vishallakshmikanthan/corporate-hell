/**
 * CORPORATE HELL™ — Corporate Inbox View.
 *
 * Satirical email client showing memos, executive letters, and critical
 * decision requests from board members, employees, and clients.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { Mail, MailOpen, Send, User, Clock, CheckCircle } from 'lucide-react'

export function InboxView() {
  const emails = useGameStore((s) => s.state?.emails || [])
  const dispatch = useGameStore((s) => s.dispatch)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    emails.length > 0 ? emails[0].id : null,
  )

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0]

  return (
    <div className="flex h-full w-full overflow-hidden bg-ink-950 select-none">
      {/* Email List Left Pane */}
      <div className="w-80 md:w-96 flex flex-col border-r border-ink-800 bg-ink-900/80 overflow-y-auto">
        <div className="border-b border-ink-800 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-paper-50 uppercase tracking-wide flex items-center gap-2">
              <Mail className="h-4 w-4 text-corp-400" />
              <span>Inbox ({emails.length})</span>
            </h2>
            <span className="text-[11px] text-ink-500 font-mono">
              {emails.filter((e) => !e.read).length} unread
            </span>
          </div>
        </div>

        <div className="divide-y divide-ink-800/60 flex-1">
          {emails.map((email) => {
            const isSelected = selectedEmail?.id === email.id
            return (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmailId(email.id)
                  email.read = true
                }}
                className={`cursor-pointer p-4 transition hover:bg-ink-850 ${
                  isSelected ? 'bg-corp-500/15 border-l-4 border-corp-400' : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-paper-100 truncate">{email.fromName}</span>
                  <span className="text-[10px] text-ink-500 shrink-0">Day {email.day}</span>
                </div>
                <div
                  className={`mt-1 text-xs truncate ${
                    !email.read ? 'font-bold text-paper-50' : 'text-paper-300'
                  }`}
                >
                  {email.subject}
                </div>
                <p className="mt-1 text-[11px] text-ink-400 line-clamp-1">{email.body}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Email Body Right Pane */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-ink-950">
        {selectedEmail ? (
          <div className="max-w-2xl rounded-2xl border border-ink-800 bg-ink-900/90 p-6 shadow-2xl">
            {/* Message Header */}
            <div className="border-b border-ink-800 pb-4">
              <h3 className="font-display text-lg font-bold text-paper-50">
                {selectedEmail.subject}
              </h3>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-corp-500/20 text-corp-400 font-bold">
                    {selectedEmail.fromName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-paper-200">{selectedEmail.fromName}</span>
                    <span className="text-[11px] text-ink-500 ml-1.5">&lt;{selectedEmail.from}&gt;</span>
                  </div>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Fiscal Day {selectedEmail.day}</span>
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="mt-5 text-xs text-paper-100 whitespace-pre-line leading-relaxed">
              {selectedEmail.body}
            </div>

            {/* Interactive Decision Choices */}
            {selectedEmail.choices && selectedEmail.choices.length > 0 && (
              <div className="mt-8 border-t border-ink-800 pt-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Select Managerial Response
                </span>
                <div className="mt-3 space-y-2">
                  {selectedEmail.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() =>
                        dispatch({
                          type: 'choose_email',
                          emailId: selectedEmail.id,
                          choiceId: choice.id,
                        })
                      }
                      className="flex w-full flex-col rounded-xl border border-ink-700 bg-ink-850 p-3 text-left transition hover:border-corp-400 hover:bg-ink-800 active:scale-[0.99]"
                    >
                      <span className="font-bold text-xs text-paper-100">{choice.label}</span>
                      <span className="mt-1 text-[11px] text-ink-400">{choice.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-ink-500 text-xs">
            Select a message to view
          </div>
        )}
      </div>
    </div>
  )
}
