/**
 * CORPORATE HELL™ — Slide-Over Employee Dossier & Inspector (Section 01 3D Hub).
 *
 * Detailed dossier for selected employee in the 3D Office Hub: vitals, skills,
 * goals, memories, management actions, live AI dialogue, and direct jump to
 * Section 03 Employee Interaction.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { ARCHETYPES } from '../../game/engine/archetypes'
import {
  DEPARTMENT_LABELS,
  ROLE_LABELS,
} from '../../game/models/types'
import { requestDialogue } from '../../services/api'
import {
  X,
  Sparkles,
  Award,
  AlertCircle,
  Gift,
  GraduationCap,
  Zap,
  UserX,
  MessageSquare,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react'

export function EmployeeDossier() {
  const selectedId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const setDossierOpen = useGameStore((s) => s.setDossierOpen)
  const setActiveTab = useGameStore((s) => s.setActiveTab)
  const employees = useGameStore((s) => s.state?.employees)
  const dispatch = useGameStore((s) => s.dispatch)

  const [aiLoading, setAiLoading] = useState(false)
  const [liveDialogue, setLiveDialogue] = useState<{
    text: string
    emotion: string
    thought: string
    source: string
  } | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  if (!selectedId || !employees || !employees[selectedId]) {
    return null
  }

  const emp = employees[selectedId]
  const archetypeDef = ARCHETYPES[emp.archetype]

  const handleAction = (type: string, args = {}) => {
    const result = dispatch({ type: type as any, employeeId: emp.id, ...args })
    if (result.message) {
      setActionFeedback(result.message)
      setTimeout(() => setActionFeedback(null), 3500)
    }
  }

  const handleTalkToAI = async () => {
    setAiLoading(true)
    try {
      const res = await requestDialogue({
        employee_id: emp.id,
        employee_name: emp.name,
        archetype: emp.archetype,
        role: emp.role,
        department: emp.department,
        bio: emp.bio,
        morale: emp.morale,
        stress: emp.stress,
        energy: emp.energy,
        trust: emp.trust,
        current_activity: emp.action,
        current_task: emp.thought,
      })
      setLiveDialogue({
        text: res.dialogue,
        emotion: res.emotion,
        thought: res.thought,
        source: res.source,
      })
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <aside className="relative flex h-full w-80 md:w-96 flex-col border-l border-[#D4A84F]/25 bg-[#1C1814]/95 shadow-2xl backdrop-blur overflow-y-auto select-none z-20">
      {/* Dossier Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D4A84F]/20 bg-[#14110E]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div
            style={{ backgroundColor: emp.visual.outfit }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4A84F]/40 text-xs font-bold text-white shadow"
          >
            {emp.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-serif-title text-sm font-bold text-[#FAF7F0] leading-tight">
              {emp.name}
            </h3>
            <span className="text-[11px] text-[#9E9484]">
              {ROLE_LABELS[emp.role]} • {DEPARTMENT_LABELS[emp.department]}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            selectEmployee(null)
            setDossierOpen(false)
          }}
          className="rounded-lg p-1.5 text-[#9E9484] hover:bg-[#25201B] hover:text-[#FAF7F0] transition"
          title="Close Inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Open Full 1-on-1 Session in Section 03 */}
        <button
          onClick={() => setActiveTab('employees')}
          className="btn-gold flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold shadow transition"
        >
          <span>Open Full 1-on-1 Session (Section 03)</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="rounded-xl bg-[#4C9A6A]/15 border border-[#4C9A6A]/40 p-2.5 text-xs font-semibold text-[#5BB37D] animate-slide-up flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#4C9A6A] shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Archetype & Bio Card */}
        <div className="rounded-xl border border-[#332B22] bg-[#14110E]/85 p-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A84F]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#E3B963] border border-[#D4A84F]/30">
              <Sparkles className="h-3 w-3 text-[#D4A84F]" />
              {archetypeDef?.label}
            </span>
            <span className="mono text-xs text-[#9E9484]">${emp.salary}/day</span>
          </div>
          <p className="mt-2 text-xs italic text-[#C8C0B3]">"{archetypeDef?.tagline}"</p>
          <p className="mt-1.5 text-xs text-[#FAF7F0]/80">{emp.bio}</p>
        </div>

        {/* Live / AI Dialogue Speech Box */}
        <div className="rounded-xl border border-[#D4A84F]/30 bg-[#D4A84F]/10 p-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#E3B963]">
              <MessageSquare className="h-3.5 w-3.5" />
              Direct Dialogue
            </span>
            <button
              onClick={handleTalkToAI}
              disabled={aiLoading}
              className="btn-gold flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>{aiLoading ? 'Thinking...' : 'Talk'}</span>
            </button>
          </div>

          <div className="mt-2 text-xs text-[#FAF7F0]">
            {liveDialogue ? (
              <div>
                <p className="font-medium italic text-[#FAF7F0]">"{liveDialogue.text}"</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#9E9484]">
                  <span>Inner thought: {liveDialogue.thought}</span>
                  <span className="rounded bg-[#14110E] px-1.5 py-0.5 font-mono uppercase text-[#D4A84F]">
                    {liveDialogue.source}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[#C8C0B3] italic">
                {emp.thought ? `"${emp.thought}"` : 'Currently focused on daily tasks.'}
              </p>
            )}
          </div>
        </div>

        {/* Bounded Vitals Bars */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9E9484]">
            Vital Metrics
          </span>

          <VitalBar label="Morale" value={emp.morale} color="bg-[#4C9A6A]" />
          <VitalBar label="Stress" value={emp.stress} color="bg-[#C45A3E]" />
          <VitalBar label="Energy" value={emp.energy} color="bg-[#D4A84F]" />
          <VitalBar label="Trust in Leadership" value={emp.trust} color="bg-[#E3B963]" />
          <VitalBar label="Productivity Index" value={emp.productivity} color="bg-[#C5963A]" />
        </div>

        {/* Skill Matrix */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9E9484]">
            Skill Ratings (1..10)
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <SkillPill label="Technical" value={emp.skills.technical} />
            <SkillPill label="Focus" value={emp.skills.focus} />
            <SkillPill label="Creativity" value={emp.skills.creativity} />
            <SkillPill label="Communication" value={emp.skills.communication} />
            <SkillPill label="Leadership" value={emp.skills.leadership} />
          </div>
        </div>

        {/* Personal Goals */}
        {emp.goals.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9E9484]">
              Personal Goal
            </span>
            <div className="mt-1.5 rounded-xl border border-[#332B22] bg-[#14110E]/85 p-2.5 text-xs text-[#FAF7F0]">
              <p className="font-medium">{emp.goals[0].description}</p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#25201B] overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, (emp.goals[0].progress / emp.goals[0].target) * 100)}%`,
                  }}
                  className="h-full bg-[#D4A84F] transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Memories */}
        {emp.memories.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9E9484]">
              Recent Memories
            </span>
            <div className="mt-1.5 space-y-1.5 text-xs">
              {emp.memories.slice(-3).map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[#14110E]/75 p-2 text-[#C8C0B3] border border-[#332B22]"
                >
                  <span className="mono text-[10px] text-[#D4A84F] mr-1.5">Day {m.day}</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executive Management Actions */}
        <div className="border-t border-[#332B22] pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9E9484]">
            Executive Actions
          </span>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction('promote')}
              className="flex items-center gap-1.5 rounded-xl border border-[#332B22] bg-[#14110E] p-2 text-xs font-semibold text-[#FAF7F0] hover:border-[#D4A84F] transition"
            >
              <Award className="h-3.5 w-3.5 text-[#D4A84F]" />
              <span>Promote</span>
            </button>

            <button
              onClick={() => handleAction('bonus')}
              className="flex items-center gap-1.5 rounded-xl border border-[#332B22] bg-[#14110E] p-2 text-xs font-semibold text-[#FAF7F0] hover:border-[#4C9A6A] transition"
            >
              <Gift className="h-3.5 w-3.5 text-[#4C9A6A]" />
              <span>Spot Bonus</span>
            </button>

            <button
              onClick={() => handleAction('training')}
              className="flex items-center gap-1.5 rounded-xl border border-[#332B22] bg-[#14110E] p-2 text-xs font-semibold text-[#FAF7F0] hover:border-[#D4A84F] transition"
            >
              <GraduationCap className="h-3.5 w-3.5 text-[#E3B963]" />
              <span>Training ($750)</span>
            </button>

            <button
              onClick={() => handleAction('nudge')}
              className="flex items-center gap-1.5 rounded-xl border border-[#332B22] bg-[#14110E] p-2 text-xs font-semibold text-[#FAF7F0] hover:border-[#D4A84F] transition"
            >
              <Zap className="h-3.5 w-3.5 text-[#E3B963]" />
              <span>Manager Nudge</span>
            </button>

            <button
              onClick={() => handleAction('reprimand')}
              className="flex items-center gap-1.5 rounded-xl border border-[#C45A3E]/30 bg-[#C45A3E]/10 p-2 text-xs font-semibold text-[#D96B52] hover:bg-[#C45A3E] hover:text-white transition"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Reprimand</span>
            </button>

            <button
              onClick={() => handleAction('fire')}
              className="flex items-center gap-1.5 rounded-xl border border-[#C45A3E]/40 bg-[#C45A3E]/15 p-2 text-xs font-semibold text-[#D96B52] hover:bg-[#C45A3E] hover:text-white transition"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Terminate</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

function VitalBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const rounded = Math.round(value)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-[#C8C0B3]">{label}</span>
        <span className="mono font-bold text-[#FAF7F0]">{rounded}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#14110E] overflow-hidden">
        <div style={{ width: `${rounded}%` }} className={`h-full ${color} transition-all`} />
      </div>
    </div>
  )
}

function SkillPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#14110E] px-2.5 py-1.5 border border-[#332B22]">
      <span className="text-[#9E9484] text-[11px]">{label}</span>
      <span className="mono font-bold text-[#FAF7F0] text-xs">{value}/10</span>
    </div>
  )
}
