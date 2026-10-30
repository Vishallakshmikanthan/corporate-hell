/**
 * CORPORATE HELL™ — Section 07: Corporate Inbox & Executive Correspondence.
 *
 * Luxury warm cream/ivory & dark charcoal executive email client matching reference-ui #07:
 * - Category filter rail (All, Important, Investors, Employees, Customers, HR, Archived)
 * - Rich stakeholder threads with attachment previews (Pitch_Deck.pdf, Financials.xlsx, etc.)
 * - Strategic decision choices + AI-assisted custom executive reply composer
 * - Sender Profile, Key Topics, and Related Section shortcuts
 */
import { useState, useMemo } from 'react'
import { useGameStore } from '../../state/gameStore'
import { requestEmailReply } from '../../services/api'
import { audio } from '../../services/audio'
import type { EmailAttachment } from '../../game/models/types'
import {
  Mail,
  Star,
  Archive,
  Send,
  FileText,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  CheckCircle2,
  Search,
  User,
  Briefcase,
  Building2,
  Users,
  HeartHandshake,
  Loader2,
  ArrowRight,
  Eye,
} from 'lucide-react'

type InboxCategory =
  | 'all'
  | 'important'
  | 'investors'
  | 'employees'
  | 'customers'
  | 'hr'
  | 'archived'

export function InboxView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)
  const setActiveTab = useGameStore((s) => s.setActiveTab)

  const [category, setCategory] = useState<InboxCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [previewAttachment, setPreviewAttachment] = useState<EmailAttachment | null>(null)
  const [customReply, setCustomReply] = useState('')
  const [isSendingAi, setIsSendingAi] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!state) return null

  const emails = state.emails || []

  const filteredEmails = useMemo(() => {
    return emails.filter((e) => {
      if (category === 'archived') return !!e.archived
      if (e.archived) return false
      if (category === 'important' && !e.important) return false
      if (
        category !== 'all' &&
        category !== 'important' &&
        e.category &&
        e.category !== category
      ) {
        return false
      }
      if (
        searchQuery.trim() &&
        !e.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.fromName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [emails, category, searchQuery])

  const selectedEmail =
    filteredEmails.find((e) => e.id === selectedEmailId) ||
    filteredEmails[0] ||
    emails[0] ||
    null

  const notify = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleChooseOption = (emailId: string, choiceId: string) => {
    audio.playClick()
    const res = dispatch({ type: 'choose_email', emailId, choiceId })
    if (res.message) notify(res.message)
    else notify('Executive response sent!')
  }

  const handleSendCustomReply = async (tonePreset?: string) => {
    if (!selectedEmail || isSendingAi) return
    const textToSend =
      tonePreset ||
      customReply.trim() ||
      'Thank you for the update. Let us align on unit economics and execution milestones this week.'

    setIsSendingAi(true)
    audio.playClick()

    try {
      const replyRes = await requestEmailReply({
        company_name: state.name,
        sender_name: selectedEmail.fromName,
        sender_role: selectedEmail.senderRole || 'Stakeholder',
        subject: selectedEmail.subject,
        email_body: selectedEmail.body,
        player_reply: textToSend,
      })

      dispatch({
        type: 'reply_email_custom',
        emailId: selectedEmail.id,
        replyText: `${textToSend}\n\n[${selectedEmail.fromName} Reply]: "${replyRes.stakeholder_response}"`,
        confidenceDelta: replyRes.relationship_delta,
      })
      setCustomReply('')
      notify(`${selectedEmail.fromName}: "${replyRes.outcome_summary}"`)
    } finally {
      setIsSendingAi(false)
    }
  }

  const CATEGORIES: { id: InboxCategory; label: string; icon: any; count: number }[] = [
    {
      id: 'all',
      label: 'All',
      icon: Mail,
      count: emails.filter((e) => !e.archived).length,
    },
    {
      id: 'important',
      label: 'Important',
      icon: Star,
      count: emails.filter((e) => e.important && !e.archived).length,
    },
    {
      id: 'investors',
      label: 'Investors',
      icon: Building2,
      count: emails.filter((e) => e.category === 'investors' && !e.archived).length,
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      count: emails.filter((e) => e.category === 'employees' && !e.archived).length,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Briefcase,
      count: emails.filter((e) => e.category === 'customers' && !e.archived).length,
    },
    {
      id: 'hr',
      label: 'HR',
      icon: HeartHandshake,
      count: emails.filter((e) => e.category === 'hr' && !e.archived).length,
    },
    {
      id: 'archived',
      label: 'Archived',
      icon: Archive,
      count: emails.filter((e) => !!e.archived).length,
    },
  ]

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#181410] via-[#14110e] to-[#100d0b] text-[#faf7f0] font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* Top Section Header Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4a84f]/25 bg-[#1b1612]/95 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] font-serif-title font-extrabold text-lg shadow-md">
            07
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
              CORPORATE INBOX
            </h1>
            <p className="text-xs text-[#b5a695]">
              Read correspondence, inspect attachments, respond to stakeholders, and make binding decisions.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center gap-1.5 rounded-xl bg-[#65b87b]/20 border border-[#65b87b]/40 px-3.5 py-1.5 text-xs font-bold text-[#65b87b] animate-slide-up">
            <CheckCircle2 className="h-4 w-4" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Warm Cream & Ivory Executive Correspondence Workspace (#07)         */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-[#d4a84f]/40 shadow-2xl bg-[#f5efe2] text-[#181411]">
          {/* =============================================================== */}
          {/* COL 1 (2 cols): Category Rail                                   */}
          {/* =============================================================== */}
          <div className="lg:col-span-2 flex flex-col justify-between border-r border-[#dfd3bd] bg-[#ede4d3] p-3.5">
            <div className="space-y-1">
              <div className="px-2 pb-2 text-xs font-serif-title font-extrabold uppercase tracking-wider text-[#181411]">
                Inbox Folders
              </div>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const active = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      audio.playClick()
                      setCategory(cat.id)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-[#d4a84f] to-[#b88933] text-[#181411] font-bold shadow-sm'
                        : 'text-[#4a3e34] hover:bg-[#e2d6c1] hover:text-[#181411]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </span>
                    <span
                      className={`mono text-[10.5px] font-bold ${
                        active ? 'text-[#181411]' : 'text-[#68594c]'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="rounded-xl bg-[#e2d6c1] p-3 text-[11px] text-[#4a3e34]">
              <div className="font-bold text-[#181411]">Executive Tip</div>
              <p className="mt-0.5 leading-snug">
                Replying promptly to Venture Partners and Staff Leads boosts Investor Confidence and Morale.
              </p>
            </div>
          </div>

          {/* =============================================================== */}
          {/* COL 2 (3 cols): Message Thread List                             */}
          {/* =============================================================== */}
          <div className="lg:col-span-3 flex flex-col border-r border-[#dfd3bd] bg-[#f5efe2] overflow-y-auto">
            <div className="p-3 border-b border-[#dfd3bd]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8e7c6b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full rounded-xl bg-[#faf7f0] border border-[#d4c8b0] pl-8 pr-3 py-1.5 text-xs text-[#181411] placeholder:text-[#8e7c6b] focus:border-[#b88933] focus:outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-[#e6decb] flex-1 overflow-y-auto">
              {filteredEmails.map((em) => {
                const isSelected = selectedEmail?.id === em.id
                return (
                  <div
                    key={em.id}
                    onClick={() => {
                      audio.playClick()
                      setSelectedEmailId(em.id)
                      setPreviewAttachment(null)
                      em.read = true
                    }}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#e8dcc6] border-l-4 border-[#b88933]'
                        : 'hover:bg-[#efe7d6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#27211c] text-[11px] font-bold text-[#e5c478]">
                          {em.fromName[0]}
                        </div>
                        <span className="text-xs font-extrabold text-[#181411] truncate">
                          {em.fromName}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#68594c] shrink-0">
                        {em.timestamp || `Day ${em.day}`}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span
                        className={`text-xs truncate ${
                          !em.read ? 'font-extrabold text-[#181411]' : 'font-semibold text-[#352c25]'
                        }`}
                      >
                        {em.subject}
                      </span>
                      {em.important && (
                        <Star className="h-3 w-3 shrink-0 fill-[#c5963a] text-[#c5963a]" />
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-[#5c4e41] line-clamp-1">
                      {em.body}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* =============================================================== */}
          {/* COL 3 (7 cols): Message Reader, Attachments & Composer          */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#faf7f0] p-6 overflow-y-auto">
            {selectedEmail ? (
              <div className="space-y-5">
                {/* Sender Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#dfd3bd] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1a16] text-sm font-serif-title font-bold text-[#e5c478] border border-[#d4a84f]">
                      {selectedEmail.fromName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif-title text-lg font-bold text-[#181411]">
                          {selectedEmail.fromName}
                        </h2>
                        {selectedEmail.senderRole && (
                          <span className="rounded-md bg-[#e6decb] px-2 py-0.5 text-[10px] font-bold text-[#4a3e34]">
                            {selectedEmail.senderRole}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#68594c]">
                        {selectedEmail.from} • To: CEO (You)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'toggle_email_flag',
                          emailId: selectedEmail.id,
                          flag: 'important',
                        })
                      }
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                        selectedEmail.important
                          ? 'bg-[#d4a84f]/25 border-[#b88933] text-[#87601d]'
                          : 'bg-[#f2ece0] border-[#d4c8b0] text-[#4a3e34]'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" />
                      <span>Important</span>
                    </button>

                    <button
                      onClick={() =>
                        dispatch({
                          type: 'toggle_email_flag',
                          emailId: selectedEmail.id,
                          flag: 'archived',
                        })
                      }
                      className="rounded-lg bg-[#f2ece0] hover:bg-[#e6decb] border border-[#d4c8b0] px-2.5 py-1 text-xs font-semibold text-[#4a3e34] flex items-center gap-1 cursor-pointer transition"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <h3 className="font-serif-title text-xl font-bold text-[#181411]">
                  {selectedEmail.subject}
                </h3>

                {/* Body */}
                <div className="text-xs sm:text-[13px] text-[#27211c] whitespace-pre-line leading-relaxed bg-[#f4ede0] rounded-xl p-4 border border-[#e2d6c1]">
                  {selectedEmail.body}
                </div>

                {/* Interactive Attachment Cards (Pitch_Deck.pdf, Financials.xlsx, etc.) */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#68594c]">
                      Attached Documents ({selectedEmail.attachments.length})
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedEmail.attachments.map((att, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            audio.playClick()
                            setPreviewAttachment(
                              previewAttachment?.name === att.name ? null : att,
                            )
                          }}
                          className="flex items-center gap-2.5 rounded-xl bg-[#efe7d6] hover:bg-[#e5d9c3] border border-[#d4c8b0] px-3.5 py-2 text-xs font-bold text-[#181411] cursor-pointer transition shadow-sm"
                        >
                          {att.type === 'pdf' ? (
                            <FileText className="h-4 w-4 text-[#c74234]" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                          )}
                          <span>{att.name}</span>
                          <Eye className="h-3.5 w-3.5 text-[#8e7c6b]" />
                        </button>
                      ))}
                    </div>

                    {previewAttachment && (
                      <div className="rounded-xl bg-[#27211c] text-[#faf7f0] p-3.5 border border-[#d4a84f] text-xs animate-slide-up">
                        <div className="font-bold text-[#e5c478]">
                          Document Preview — {previewAttachment.name}
                        </div>
                        <p className="mt-1 text-[#d8cdc0]">{previewAttachment.summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Replied Thread Banner */}
                {selectedEmail.repliedText && (
                  <div className="rounded-xl bg-emerald-950/10 border border-emerald-700/30 p-3.5 text-xs text-[#181411] whitespace-pre-line">
                    <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Executive Reply Logged</span>
                    </div>
                    {selectedEmail.repliedText}
                  </div>
                )}

                {/* Strategic Choices (if available) */}
                {selectedEmail.choices && selectedEmail.choices.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#68594c]">
                      Select Strategic Executive Decision
                    </div>
                    {selectedEmail.choices.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleChooseOption(selectedEmail.id, ch.id)}
                        className="flex w-full items-center justify-between rounded-xl bg-[#f2ece0] hover:bg-[#e6decb] border border-[#d4c8b0] hover:border-[#b88933] p-3 text-left transition cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-extrabold text-[#181411]">
                            {ch.label}
                          </div>
                          <div className="text-[11px] text-[#5c4e41] mt-0.5">
                            {ch.description}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#966c22] shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Reply Composer + Quick Actions Bar (matches reference-ui #07 bottom buttons) */}
                <div className="pt-3 border-t border-[#dfd3bd] space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customReply}
                      onChange={(e) => setCustomReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendCustomReply()
                      }}
                      placeholder={`Write a custom reply to ${selectedEmail.fromName}...`}
                      className="flex-1 rounded-xl bg-[#f2ece0] border border-[#d4c8b0] px-3.5 py-2 text-xs text-[#181411] placeholder:text-[#8e7c6b] focus:border-[#b88933] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSendCustomReply()}
                      disabled={isSendingAi}
                      className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      {isSendingAi ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>Reply</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        handleSendCustomReply(
                          'Let us schedule a formal executive session to finalize terms and next steps.',
                        )
                      }
                      className="rounded-xl bg-[#e8dcc6] hover:bg-[#dfd0b5] border border-[#d4c8b0] px-3 py-1.5 text-xs font-bold text-[#181411] flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#966c22]" />
                      <span>Schedule Meeting</span>
                    </button>

                    {selectedEmail.category === 'investors' && (
                      <button
                        onClick={() => setActiveTab('pitch')}
                        className="rounded-xl bg-[#1f1a16] hover:bg-[#352c25] text-[#e5c478] px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Open Investor Pitch Boardroom →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#68594c]">
                Select an email thread to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
