/**
 * CORPORATE HELL™ — Section 03: Employee Interaction & Dossier Hub.
 *
 * Complete 3-column interactive character management & conversation system:
 * - Left: Searchable Employee Roster + Department filter + Recent Conversations log
 * - Center: 1-on-1 Conversation Stage, contextual response choices, AI dialogue & Situation Remedies
 * - Right: 4-Tab Employee Dossier (Overview, Personality, Career, Relationships) + 8 Executive Actions
 */
import { useState, useMemo } from 'react'
import { useGameStore } from '../../state/gameStore'
import { ARCHETYPES } from '../../game/engine/archetypes'
import {
  DEPARTMENT_LABELS,
  ROLE_LABELS,
  type Department,
  type Employee,
} from '../../game/models/types'
import { requestDialogue } from '../../services/api'
import { audio } from '../../services/audio'
import {
  Search,
  UserPlus,
  Sparkles,
  MessageSquare,
  Award,
  Gift,
  GraduationCap,
  AlertCircle,
  UserX,
  Calendar,
  DollarSign,
  Send,
  Loader2,
  CheckCircle2,
  Sliders,
  Briefcase,
  Heart,
  Zap,
  Shield,
  Users,
} from 'lucide-react'

type DossierTab = 'overview' | 'personality' | 'career' | 'relationships'

interface ConversationOption {
  id: string
  label: string
  subtitle: string
  moraleDelta: number
  stressDelta: number
  trustDelta: number
  productivityDelta: number
  replyText: string
}

function getContextualOptions(emp: Employee): ConversationOption[] {
  if (emp.stress >= 60) {
    return [
      {
        id: 'opt_support',
        label: 'Acknowledge their heavy workload and rebalance sprint priorities',
        subtitle: 'Empathetic leadership • Reduces burnout risk immediately',
        moraleDelta: 12,
        stressDelta: -15,
        trustDelta: 10,
        productivityDelta: 5,
        replyText: `Thank you, CEO. Knowing leadership actually sees the crunch makes a huge difference. I'll focus on the highest-impact deliverables.`,
      },
      {
        id: 'opt_incentive',
        label: 'Promise a milestone recognition bonus once this sprint ships',
        subtitle: 'Performance incentive • Keeps output high despite pressure',
        moraleDelta: 8,
        stressDelta: -4,
        trustDelta: 6,
        productivityDelta: 10,
        replyText: `Deal. If the reward is real, I can push through the final tickets before Friday.`,
      },
      {
        id: 'opt_demand',
        label: 'Remind them that high pressure is part of startup equity',
        subtitle: 'Tough love • Risks morale drop',
        moraleDelta: -10,
        stressDelta: 10,
        trustDelta: -8,
        productivityDelta: 2,
        replyText: `Understood... I'll get back to my desk.`,
      },
    ]
  }

  return [
    {
      id: 'opt_praise',
      label: 'Praise their recent technical execution and autonomy',
      subtitle: 'Positive reinforcement • Builds deep trust and morale',
      moraleDelta: 10,
      stressDelta: -5,
      trustDelta: 12,
      productivityDelta: 8,
      replyText: `I appreciate that! I’ve been optimizing our core modules and have a few ideas to speed up the next release by 20%.`,
    },
    {
      id: 'opt_stretch',
      label: 'Challenge them with ownership of a flagship architecture module',
      subtitle: 'Growth stretch goal • High productivity boost for ambitious talent',
      moraleDelta: 6,
      stressDelta: 6,
      trustDelta: 8,
      productivityDelta: 14,
      replyText: `Count me in. Giving me end-to-end ownership is exactly what I was hoping for this quarter.`,
    },
    {
      id: 'opt_audit',
      label: 'Review their daily KPIs and request stricter status reporting',
      subtitle: 'Micromanagement check-in • Slight stress increase',
      moraleDelta: -6,
      stressDelta: 8,
      trustDelta: -5,
      productivityDelta: 4,
      replyText: `Sure, I'll fill out the hourly tracker spreadsheets by end of day.`,
    },
  ]
}

export function EmployeesView() {
  const state = useGameStore((s) => s.state)
  const selectedId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const dispatch = useGameStore((s) => s.dispatch)

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [dossierTab, setDossierTab] = useState<DossierTab>('overview')
  const [customMessage, setCustomMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [salaryDraft, setSalaryDraft] = useState<number | null>(null)
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null)
  const [conversationLog, setConversationLog] = useState<
    { empId: string; empName: string; playerText: string; empReply: string; impact: string }[]
  >([
    {
      empId: 'emp_priya',
      empName: 'Priya Nair',
      playerText: 'Checked in on API cluster reliability and sprint velocity.',
      empReply: 'I love solving complex problems and building products that matter.',
      impact: '+10 Morale, +8 Productivity',
    },
    {
      empId: 'emp_yuki',
      empName: 'Yuki Tanaka',
      playerText: 'Protected deep-focus coding blocks from unnecessary meetings.',
      empReply: 'Finally, four uninterrupted hours to ship the core engine.',
      impact: '+12 Trust, +14 Productivity',
    },
  ])

  if (!state) return null

  const activeEmployees = useMemo(
    () =>
      state.employeeOrder
        .map((id) => state.employees[id])
        .filter((e): e is Employee => !!e && e.active),
    [state.employeeOrder, state.employees],
  )

  const filteredList = useMemo(() => {
    return activeEmployees.filter((e) => {
      if (deptFilter !== 'all' && e.department !== deptFilter) return false
      if (
        search &&
        !e.name.toLowerCase().includes(search.toLowerCase()) &&
        !ARCHETYPES[e.archetype]?.label.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [activeEmployees, deptFilter, search])

  const selectedEmp =
    (selectedId && state.employees[selectedId]?.active
      ? state.employees[selectedId]
      : activeEmployees[0]) || null

  if (!selectedEmp) return null

  const arch = ARCHETYPES[selectedEmp.archetype]
  const contextOptions = getContextualOptions(selectedEmp)
  const currentSalaryVal = salaryDraft ?? selectedEmp.salary

  const showToast = (msg: string) => {
    setFeedbackBanner(msg)
    setTimeout(() => setFeedbackBanner(null), 3500)
  }

  const handleSelectOption = (opt: ConversationOption) => {
    audio.playClick()
    const res = dispatch({
      type: 'employee_conversation',
      employeeId: selectedEmp.id,
      choiceLabel: opt.label,
      moraleDelta: opt.moraleDelta,
      stressDelta: opt.stressDelta,
      trustDelta: opt.trustDelta,
      productivityDelta: opt.productivityDelta,
      memoryText: `1:1 with CEO: "${opt.label}"`,
    })
    setConversationLog((prev) => [
      {
        empId: selectedEmp.id,
        empName: selectedEmp.name,
        playerText: opt.label,
        empReply: opt.replyText,
        impact: `${opt.moraleDelta >= 0 ? '+' : ''}${opt.moraleDelta} Morale, ${opt.productivityDelta >= 0 ? '+' : ''}${opt.productivityDelta} Prod`,
      },
      ...prev.slice(0, 7),
    ])
    if (res.message) showToast(res.message)
  }

  const handleCustomChat = async () => {
    if (!customMessage.trim() || aiLoading) return
    const promptText = customMessage.trim()
    setCustomMessage('')
    setAiLoading(true)
    audio.playClick()

    try {
      const aiRes = await requestDialogue({
        employee_id: selectedEmp.id,
        employee_name: selectedEmp.name,
        archetype: selectedEmp.archetype,
        role: selectedEmp.role,
        department: selectedEmp.department,
        bio: selectedEmp.bio,
        morale: selectedEmp.morale,
        stress: selectedEmp.stress,
        energy: selectedEmp.energy,
        trust: selectedEmp.trust,
        current_activity: selectedEmp.action,
        current_task: promptText,
        recent_memories: selectedEmp.memories.slice(-3).map((m) => m.text),
      })

      dispatch({
        type: 'employee_conversation',
        employeeId: selectedEmp.id,
        choiceLabel: promptText,
        moraleDelta: 6,
        stressDelta: -4,
        trustDelta: 8,
        productivityDelta: 5,
        memoryText: `Discussed with CEO: "${promptText}"`,
      })

      setConversationLog((prev) => [
        {
          empId: selectedEmp.id,
          empName: selectedEmp.name,
          playerText: promptText,
          empReply: aiRes.dialogue,
          impact: `+6 Morale, +8 Trust (${aiRes.source.toUpperCase()})`,
        },
        ...prev.slice(0, 7),
      ])
      showToast(`${selectedEmp.name} responded (${aiRes.emotion})`)
    } finally {
      setAiLoading(false)
    }
  }

  const handleRemedy = (
    label: string,
    moraleDelta: number,
    stressDelta: number,
    prodDelta: number,
    cost = 0,
  ) => {
    const res = dispatch({
      type: 'employee_conversation',
      employeeId: selectedEmp.id,
      choiceLabel: label,
      moraleDelta,
      stressDelta,
      trustDelta: 6,
      productivityDelta: prodDelta,
      memoryText: `CEO Action: ${label}`,
      cost,
    })
    if (res.ok) {
      showToast(`${label} applied to ${selectedEmp.name}!`)
    } else if (res.reason) {
      showToast(res.reason)
    }
  }

  const latestReplyForSelected =
    conversationLog.find((c) => c.empId === selectedEmp.id)?.empReply ||
    selectedEmp.thought ||
    `"I love solving complex problems and building products that matter."`

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#181410] via-[#14110e] to-[#100d0b] text-[#faf7f0] font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* Top Section Header Bar */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4a84f]/25 bg-[#1b1612]/95 px-6 py-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#dfc075] to-[#b88933] text-[#181411] font-serif-title font-extrabold text-lg shadow-md">
            03
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold tracking-wider text-[#faf7f0] uppercase">
              EMPLOYEE INTERACTION & DOSSIER
            </h1>
            <p className="text-xs text-[#b5a695]">
              Talk 1-on-1, build trust, resolve bottlenecks, and manage autonomous personalities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {feedbackBanner && (
            <div className="flex items-center gap-1.5 rounded-xl bg-[#65b87b]/20 border border-[#65b87b]/40 px-3.5 py-1.5 text-xs font-bold text-[#65b87b] animate-slide-up">
              <CheckCircle2 className="h-4 w-4" />
              <span>{feedbackBanner}</span>
            </div>
          )}

          {/* Hire New Team Member */}
          <button
            onClick={() => {
              const res = dispatch({
                type: 'hire',
                department: (deptFilter === 'all' ? 'engineering' : deptFilter) as Department,
                role: 'specialist',
              })
              if (res.message) showToast(res.message)
              else if (res.reason) showToast(res.reason)
            }}
            className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Hire Specialist ($1,500)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Main 3-Column Layout */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-4 p-5 overflow-y-auto">
        {/* ================================================================= */}
        {/* LEFT COLUMN (3 cols): Roster Search + Recent Conversations        */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="panel-dark p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                Active Team ({filteredList.length})
              </span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-lg bg-[#181410] border border-[#d4a84f]/25 px-2 py-1 text-[11px] text-[#faf7f0] focus:outline-none cursor-pointer"
              >
                <option value="all">All Depts</option>
                {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8e7c6b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or archetype..."
                className="w-full rounded-xl bg-[#16120e] border border-[#d4a84f]/20 pl-8 pr-3 py-1.5 text-xs text-[#faf7f0] placeholder:text-[#8e7c6b] focus:border-[#d4a84f] focus:outline-none"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filteredList.map((emp) => {
                const active = emp.id === selectedEmp.id
                const moodLabel =
                  emp.stress > 65
                    ? { text: 'Stressed', cls: 'bg-[#c74234]/20 text-[#f08578] border-[#c74234]/40' }
                    : emp.morale >= 70
                      ? { text: 'Happy', cls: 'bg-[#65b87b]/20 text-[#65b87b] border-[#65b87b]/40' }
                      : { text: 'Focused', cls: 'bg-[#d4a84f]/20 text-[#e5c478] border-[#d4a84f]/40' }

                return (
                  <div
                    key={emp.id}
                    onClick={() => {
                      selectEmployee(emp.id)
                      setSalaryDraft(null)
                    }}
                    className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer border transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#342a20] to-[#241d17] border-[#d4a84f] shadow-md'
                        : 'bg-[#1b1612]/80 border-[#d4a84f]/15 hover:border-[#d4a84f]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#faf7f0] border border-[#d4a84f]/40"
                        style={{ backgroundColor: emp.visual.outfit }}
                      >
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#faf7f0] truncate">
                          {emp.name}
                        </div>
                        <div className="text-[10.5px] text-[#b5a695] truncate">
                          {ROLE_LABELS[emp.role]} • {DEPARTMENT_LABELS[emp.department]}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px]">
                          <span className="text-[#65b87b] font-semibold">
                            ☺ {Math.round(emp.morale)}%
                          </span>
                          <span className="text-[#e5c478] font-semibold">
                            ⚡ {Math.round(emp.productivity)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold shrink-0 ${moodLabel.cls}`}
                    >
                      {moodLabel.text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Conversations Log */}
          <div className="panel-dark p-4 flex-1">
            <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-[#d4a84f]/20 text-xs font-bold uppercase tracking-wider text-[#e5c478]">
              <MessageSquare className="h-4 w-4 text-[#d4a84f]" />
              <span>Recent Conversations</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {conversationLog.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => selectEmployee(c.empId)}
                  className="rounded-xl bg-[#181410] p-2.5 border border-[#d4a84f]/15 hover:border-[#d4a84f]/40 cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#faf7f0]">
                    <span>{c.empName}</span>
                    <span className="text-[10px] text-[#65b87b]">{c.impact}</span>
                  </div>
                  <p className="mt-1 text-[10.5px] text-[#b5a695] line-clamp-2 italic">
                    “{c.empReply}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CENTER COLUMN (5 cols): 1:1 Stage, Choices & Situation Remedies   */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto px-1">
          {/* Character Portrait & Dialogue Stage (matches reference-ui #03) */}
          <div className="panel-dark p-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#d4a84f]/20 pb-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-serif-title font-extrabold text-[#faf7f0] border-2 border-[#d4a84f] shadow-lg"
                  style={{ backgroundColor: selectedEmp.visual.outfit }}
                >
                  {selectedEmp.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif-title text-xl font-bold text-[#faf7f0]">
                      {selectedEmp.name}
                    </h2>
                    <span className="rounded-full bg-[#65b87b]/20 border border-[#65b87b]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#65b87b]">
                      {selectedEmp.morale >= 65 ? 'Happy' : selectedEmp.stress > 65 ? 'Stressed' : 'Focused'}
                    </span>
                  </div>
                  <p className="text-xs text-[#b5a695]">
                    {ROLE_LABELS[selectedEmp.role]} • {DEPARTMENT_LABELS[selectedEmp.department]} • Hired Day {selectedEmp.hiredDay}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-[#2a231c] border border-[#d4a84f]/30 px-2 py-0.5 text-[10px] font-semibold text-[#e5c478]">
                      {arch?.label || selectedEmp.archetype}
                    </span>
                    <span className="rounded-md bg-[#2a231c] border border-[#d4a84f]/20 px-2 py-0.5 text-[10px] font-semibold text-[#d8cdc0]">
                      Ambition {selectedEmp.ambition}%
                    </span>
                    <span className="rounded-md bg-[#2a231c] border border-[#d4a84f]/20 px-2 py-0.5 text-[10px] font-semibold text-[#d8cdc0]">
                      Tech {selectedEmp.skills.technical}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warm Cream Dialogue Quote Card */}
            <div className="mt-4 panel-cream p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#966c22] mb-1">
                Live 1-on-1 Statement
              </div>
              <p className="font-serif-title text-base font-semibold italic text-[#181411] leading-relaxed">
                {latestReplyForSelected}
              </p>
              <p className="mt-1.5 text-[11px] text-[#5c4e41]">{selectedEmp.bio}</p>
            </div>

            {/* 3 Contextual Executive Response Options */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#e5c478] mb-2">
                Choose Your Executive Response
              </div>
              <div className="space-y-2">
                {contextOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className="flex w-full items-center justify-between rounded-xl bg-[#221c17] hover:bg-[#2e261f] border border-[#d4a84f]/25 hover:border-[#d4a84f] p-3 text-left transition cursor-pointer"
                  >
                    <div className="pr-3">
                      <div className="text-xs font-bold text-[#faf7f0]">{opt.label}</div>
                      <div className="text-[10.5px] text-[#b5a695] mt-0.5">{opt.subtitle}</div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 text-[10px] font-bold">
                      <span
                        className={
                          opt.moraleDelta >= 0 ? 'text-[#65b87b]' : 'text-[#f08578]'
                        }
                      >
                        {opt.moraleDelta >= 0 ? `+${opt.moraleDelta}` : opt.moraleDelta} Morale
                      </span>
                      <span className="text-[#e5c478]">
                        +{opt.productivityDelta} Prod
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom AI Dialogue Input */}
            <div className="mt-3.5 pt-3 border-t border-[#d4a84f]/20 flex items-center gap-2">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCustomChat()
                }}
                placeholder={`Say something directly to ${selectedEmp.name.split(' ')[0]}...`}
                className="flex-1 rounded-xl bg-[#16120e] border border-[#d4a84f]/25 px-3.5 py-2 text-xs text-[#faf7f0] placeholder:text-[#8e7c6b] focus:border-[#d4a84f] focus:outline-none"
              />
              <button
                onClick={handleCustomChat}
                disabled={aiLoading}
                className="btn-gold flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
              >
                {aiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Speak</span>
              </button>
            </div>
          </div>

          {/* Current Situation & Bottleneck Remedies (matches reference-interface #03) */}
          <div className="panel-dark p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#d4a84f]/20">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e5c478]">
                Current Situation & Managerial Remedies
              </span>
              <span className="text-[10.5px] text-[#b5a695]">
                Workload: {Math.round(selectedEmp.workload * 100)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRemedy('Reassigned Non-Critical Tasks', 8, -14, 4, 0)}
                className="rounded-xl bg-[#1b1612] hover:bg-[#2a221b] border border-[#d4a84f]/20 hover:border-[#d4a84f]/50 p-2.5 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#faf7f0]">Reassign Tasks</div>
                <div className="text-[10px] text-[#65b87b] mt-0.5">-14 Stress • +8 Morale</div>
              </button>
              <button
                onClick={() => handleRemedy('Provided Cloud & AI Tooling Upgrade', 6, -6, 12, 400)}
                className="rounded-xl bg-[#1b1612] hover:bg-[#2a221b] border border-[#d4a84f]/20 hover:border-[#d4a84f]/50 p-2.5 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#faf7f0]">Provide Resources ($400)</div>
                <div className="text-[10px] text-[#e5c478] mt-0.5">+12 Productivity • +6 Morale</div>
              </button>
              <button
                onClick={() => {
                  const res = dispatch({ type: 'training', employeeId: selectedEmp.id })
                  if (res.message) showToast(res.message)
                  else if (res.reason) showToast(res.reason)
                }}
                className="rounded-xl bg-[#1b1612] hover:bg-[#2a221b] border border-[#d4a84f]/20 hover:border-[#d4a84f]/50 p-2.5 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#faf7f0]">Offer Training ($750)</div>
                <div className="text-[10px] text-[#e5c478] mt-0.5">+Skills • +8 Morale (3 Days)</div>
              </button>
              <button
                onClick={() => handleRemedy('Granted Paid Recovery Afternoon', 14, -20, 0, 0)}
                className="rounded-xl bg-[#1b1612] hover:bg-[#2a221b] border border-[#d4a84f]/20 hover:border-[#d4a84f]/50 p-2.5 text-left transition cursor-pointer"
              >
                <div className="text-xs font-bold text-[#faf7f0]">Give Time Off</div>
                <div className="text-[10px] text-[#65b87b] mt-0.5">-20 Stress • +14 Morale</div>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN (4 cols): 4-Tab Employee Dossier & 8 Actions         */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pl-1">
          <div className="panel-dark p-4 flex-1 flex flex-col justify-between">
            <div>
              {/* 4 Dossier Sub-Tabs (Overview | Personality | Career | Relationships) */}
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-[#16120e] p-1 border border-[#d4a84f]/20 mb-4">
                {(
                  [
                    { id: 'overview', label: 'Overview' },
                    { id: 'personality', label: 'Personality' },
                    { id: 'career', label: 'Career' },
                    { id: 'relationships', label: 'Relations' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDossierTab(t.id)}
                    className={`rounded-lg py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      dossierTab === t.id
                        ? 'btn-gold'
                        : 'text-[#b5a695] hover:text-[#faf7f0]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW */}
              {dossierTab === 'overview' && (
                <div className="space-y-4 animate-slide-up">
                  {/* 2x2 Vital Grid matching reference-ui #03 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <MetricBox
                      label="Morale"
                      value={selectedEmp.morale}
                      barColor="bg-[#65b87b]"
                    />
                    <MetricBox
                      label="Productivity"
                      value={selectedEmp.productivity}
                      barColor="bg-[#d4a84f]"
                    />
                    <MetricBox
                      label="Stress"
                      value={selectedEmp.stress}
                      barColor="bg-[#e8a33d]"
                    />
                    <MetricBox
                      label="Trust"
                      value={selectedEmp.trust}
                      barColor="bg-[#e5c478]"
                    />
                  </div>

                  {/* Compensation & Salary Adjustment Slider */}
                  <div className="rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/20">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-[#e5c478] flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Daily Compensation</span>
                      </span>
                      <span className="mono font-extrabold text-[#faf7f0]">
                        ${currentSalaryVal}/day
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={1000}
                      step={10}
                      value={currentSalaryVal}
                      onChange={(e) => setSalaryDraft(Number(e.target.value))}
                      className="w-full accent-[#d4a84f] cursor-pointer"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#b5a695]">
                        Current: ${selectedEmp.salary}/day
                      </span>
                      <button
                        disabled={currentSalaryVal === selectedEmp.salary}
                        onClick={() => {
                          const res = dispatch({
                            type: 'adjust_salary',
                            employeeId: selectedEmp.id,
                            newSalary: currentSalaryVal,
                          })
                          setSalaryDraft(null)
                          if (res.message) showToast(res.message)
                        }}
                        className="btn-gold rounded-lg px-3 py-1 text-[10.5px] font-bold cursor-pointer disabled:opacity-40"
                      >
                        Apply Salary
                      </button>
                    </div>
                  </div>

                  {/* Personal Goal */}
                  {selectedEmp.goals[0] && (
                    <div className="rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/20">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695]">
                        Active Personal Ambition
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[#faf7f0]">
                        {selectedEmp.goals[0].description}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PERSONALITY */}
              {dossierTab === 'personality' && (
                <div className="space-y-3 animate-slide-up">
                  <div className="rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/25">
                    <div className="text-xs font-bold text-[#e5c478]">
                      Archetype: {arch?.label}
                    </div>
                    <p className="mt-1 text-xs italic text-[#d8cdc0]">
                      “{arch?.tagline}”
                    </p>
                    <p className="mt-2 text-xs text-[#b5a695] leading-relaxed">
                      {selectedEmp.bio}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#181410] p-3.5 border border-[#d4a84f]/20 space-y-2 text-xs">
                    <div className="font-bold text-[#faf7f0]">Behavioral Drivers</div>
                    <div className="flex justify-between text-[#b5a695]">
                      <span>Ambition Drive</span>
                      <span className="font-bold text-[#e5c478]">{selectedEmp.ambition}/100</span>
                    </div>
                    <div className="flex justify-between text-[#b5a695]">
                      <span>Preferred Room</span>
                      <span className="font-bold text-[#faf7f0] capitalize">
                        {selectedEmp.location.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#b5a695]">
                      <span>Coffees Today</span>
                      <span className="font-bold text-[#faf7f0]">{selectedEmp.coffeesToday} cups</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CAREER & SKILLS */}
              {dossierTab === 'career' && (
                <div className="space-y-3 animate-slide-up">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedEmp.skills).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between rounded-xl bg-[#181410] px-3 py-2 border border-[#d4a84f]/20 text-xs"
                      >
                        <span className="capitalize text-[#b5a695]">{k}</span>
                        <span className="mono font-bold text-[#e5c478]">{v}/10</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/20">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#e5c478] mb-2">
                      Persistent Memory Timeline ({selectedEmp.memories.length})
                    </div>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {selectedEmp.memories
                        .slice()
                        .reverse()
                        .map((m, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-[#221c17] px-2.5 py-1.5 text-[11px] text-[#d8cdc0]"
                          >
                            <span className="font-bold text-[#d4a84f] mr-1.5">Day {m.day}:</span>
                            <span>{m.text}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: RELATIONSHIPS */}
              {dossierTab === 'relationships' && (
                <div className="space-y-2 animate-slide-up max-h-64 overflow-y-auto pr-1">
                  {activeEmployees
                    .filter((other) => other.id !== selectedEmp.id)
                    .slice(0, 7)
                    .map((other) => {
                      const score =
                        selectedEmp.relationships[other.id] ??
                        ((selectedEmp.id.charCodeAt(4) + other.id.charCodeAt(4)) % 50) - 10
                      const ally = score >= 15
                      const rival = score < 0
                      return (
                        <div
                          key={other.id}
                          className="flex items-center justify-between rounded-xl bg-[#181410] p-2.5 border border-[#d4a84f]/15 text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#faf7f0]">{other.name}</div>
                            <div className="text-[10px] text-[#b5a695]">
                              {ROLE_LABELS[other.role]} • {DEPARTMENT_LABELS[other.department]}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              ally
                                ? 'bg-[#65b87b]/20 text-[#65b87b]'
                                : rival
                                  ? 'bg-[#c74234]/20 text-[#f08578]'
                                  : 'bg-[#d4a84f]/20 text-[#e5c478]'
                            }`}
                          >
                            {ally ? `Ally (+${score})` : rival ? `Rival (${score})` : `Colleague (+${score})`}
                          </span>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Bottom 6 Executive Action Buttons (matches reference-ui #03) */}
            <div className="mt-4 pt-3 border-t border-[#d4a84f]/20">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#b5a695] mb-2">
                Direct Executive Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const res = dispatch({ type: 'promote', employeeId: selectedEmp.id })
                    if (res.message) showToast(res.message)
                    else if (res.reason) showToast(res.reason)
                  }}
                  className="btn-gold flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Promote Role</span>
                </button>

                <button
                  onClick={() => {
                    const res = dispatch({ type: 'bonus', employeeId: selectedEmp.id })
                    if (res.message) showToast(res.message)
                    else if (res.reason) showToast(res.reason)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/35 py-2 px-3 text-xs font-bold text-[#e5c478] cursor-pointer transition"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span>Spot Bonus (${selectedEmp.salary * 3})</span>
                </button>

                <button
                  onClick={() => {
                    const res = dispatch({
                      type: 'schedule_meeting',
                      title: `1:1 Sync with ${selectedEmp.name}`,
                      roomId: 'ceo_office',
                      durationTicks: 3,
                      attendeeIds: [selectedEmp.id],
                    })
                    if (res.message) showToast(res.message)
                    else if (res.reason) showToast(res.reason)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/25 py-2 px-3 text-xs font-semibold text-[#faf7f0] cursor-pointer transition"
                >
                  <Calendar className="h-3.5 w-3.5 text-[#d4a84f]" />
                  <span>Schedule 1:1</span>
                </button>

                <button
                  onClick={() => {
                    const res = dispatch({ type: 'training', employeeId: selectedEmp.id })
                    if (res.message) showToast(res.message)
                    else if (res.reason) showToast(res.reason)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#27211c] hover:bg-[#352c25] border border-[#d4a84f]/25 py-2 px-3 text-xs font-semibold text-[#faf7f0] cursor-pointer transition"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-[#d4a84f]" />
                  <span>Training ($750)</span>
                </button>

                <button
                  onClick={() => {
                    const res = dispatch({ type: 'reprimand', employeeId: selectedEmp.id })
                    if (res.message) showToast(res.message)
                    else if (res.reason) showToast(res.reason)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c74234]/15 hover:bg-[#c74234]/30 border border-[#c74234]/40 py-2 px-3 text-xs font-semibold text-[#f08578] cursor-pointer transition"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Reprimand</span>
                </button>

                <button
                  onClick={() => {
                    const res = dispatch({ type: 'fire', employeeId: selectedEmp.id })
                    if (res.message) showToast(res.message)
                    else if (res.reason) showToast(res.reason)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c74234]/20 hover:bg-[#c74234] border border-[#c74234]/50 py-2 px-3 text-xs font-bold text-[#f08578] hover:text-white cursor-pointer transition"
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span>Terminate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricBox({
  label,
  value,
  barColor,
}: {
  label: string
  value: number
  barColor: string
}) {
  const v = Math.round(value)
  return (
    <div className="rounded-xl bg-[#181410] p-3 border border-[#d4a84f]/20">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-[#b5a695] font-medium">{label}</span>
        <span className="mono font-extrabold text-[#faf7f0]">{v}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#352c25] overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  )
}
