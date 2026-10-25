/**
 * CORPORATE HELL™ — Employee Dossier & Inspector.
 *
 * Detailed dossier for selected employee: vitals, skills, goals,
 * memories, relationships, management actions, and live AI dialogue.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { ARCHETYPES } from '../../game/engine/archetypes'
import {
  DEPARTMENT_LABELS,
  ROLE_LABELS,
  type Emotion,
} from '../../game/models/types'
import { requestDialogue } from '../../services/api'
import {
  X,
  Sparkles,
  TrendingUp,
  Award,
  AlertCircle,
  Gift,
  GraduationCap,
  Zap,
  UserX,
  MessageSquare,
  Flame,
  CheckCircle,
} from 'lucide-react'

export function EmployeeDossier() {
  const selectedId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const setDossierOpen = useGameStore((s) => s.setDossierOpen)
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
    <aside className="relative flex h-full w-80 md:w-96 flex-col border-l border-ink-800 bg-ink-900/95 shadow-2xl backdrop-blur overflow-y-auto select-none z-20">
      {/* Dossier Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-800 bg-ink-900/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: emp.visual.outfit }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow"
          >
            {emp.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-paper-50 leading-tight">{emp.name}</h3>
            <span className="text-[11px] text-ink-400">
              {ROLE_LABELS[emp.role]} • {DEPARTMENT_LABELS[emp.department]}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            selectEmployee(null)
            setDossierOpen(false)
          }}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition"
          title="Close Inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="rounded-xl bg-acid-400/15 border border-acid-400/40 p-2.5 text-xs font-semibold text-acid-300 animate-slide-up flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-acid-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Archetype & Bio Card */}
        <div className="rounded-xl border border-ink-700/80 bg-ink-850 p-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-corp-500/15 px-2.5 py-0.5 text-[11px] font-bold text-corp-300 border border-corp-500/30">
              <Sparkles className="h-3 w-3 text-warn-400" />
              {archetypeDef?.label}
            </span>
            <span className="mono text-xs text-ink-400">${emp.salary}/day</span>
          </div>
          <p className="mt-2 text-xs italic text-ink-300">"{archetypeDef?.tagline}"</p>
          <p className="mt-1.5 text-xs text-paper-200/80">{emp.bio}</p>
        </div>

        {/* Live / AI Dialogue Speech Box */}
        <div className="rounded-xl border border-corp-500/30 bg-corp-500/10 p-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-corp-300">
              <MessageSquare className="h-3.5 w-3.5" />
              Direct Dialogue
            </span>
            <button
              onClick={handleTalkToAI}
              disabled={aiLoading}
              className="flex items-center gap-1 rounded-lg bg-corp-500 px-2 py-1 text-[11px] font-bold text-white transition hover:bg-corp-600 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>{aiLoading ? 'Thinking...' : 'Talk'}</span>
            </button>
          </div>

          <div className="mt-2 text-xs text-paper-100">
            {liveDialogue ? (
              <div>
                <p className="font-medium italic text-paper-50">"{liveDialogue.text}"</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-400">
                  <span>Inner thought: {liveDialogue.thought}</span>
                  <span className="rounded bg-ink-800 px-1 py-0.5 font-mono uppercase">
                    {liveDialogue.source}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-ink-400 italic">
                {emp.thought ? `"${emp.thought}"` : 'Currently focused on daily tasks.'}
              </p>
            )}
          </div>
        </div>

        {/* Bounded Vitals Bars */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Vital Metrics
          </span>

          <VitalBar label="Morale" value={emp.morale} color="bg-corp-400" />
          <VitalBar label="Stress" value={emp.stress} color="bg-alert-400" inverse />
          <VitalBar label="Energy" value={emp.energy} color="bg-acid-400" />
          <VitalBar label="Trust in Leadership" value={emp.trust} color="bg-warn-300" />
          <VitalBar label="Productivity Index" value={emp.productivity} color="bg-corp-300" />
        </div>

        {/* Skill Matrix */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Personal Goal
            </span>
            <div className="mt-1.5 rounded-xl border border-ink-700/80 bg-ink-850 p-2.5 text-xs text-paper-200">
              <p className="font-medium">{emp.goals[0].description}</p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, (emp.goals[0].progress / emp.goals[0].target) * 100)}%`,
                  }}
                  className="h-full bg-acid-400 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Memories */}
        {emp.memories.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Recent Memories
            </span>
            <div className="mt-1.5 space-y-1.5 text-xs">
              {emp.memories.slice(-3).map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-ink-850/60 p-2 text-ink-300 border border-ink-800"
                >
                  <span className="mono text-[10px] text-corp-400 mr-1.5">Day {m.day}</span>
                  <span>{m.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executive Management Actions */}
        <div className="border-t border-ink-800 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Executive Actions
          </span>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction('promote')}
              className="flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-800 p-2 text-xs font-semibold text-paper-100 hover:bg-corp-500 hover:text-white transition"
            >
              <Award className="h-3.5 w-3.5 text-corp-400" />
              <span>Promote</span>
            </button>

            <button
              onClick={() => handleAction('bonus')}
              className="flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-800 p-2 text-xs font-semibold text-paper-100 hover:bg-acid-500 hover:text-ink-950 transition"
            >
              <Gift className="h-3.5 w-3.5 text-acid-400" />
              <span>Spot Bonus</span>
            </button>

            <button
              onClick={() => handleAction('training')}
              className="flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-800 p-2 text-xs font-semibold text-paper-100 hover:bg-warn-400 hover:text-ink-950 transition"
            >
              <GraduationCap className="h-3.5 w-3.5 text-warn-400" />
              <span>Training ($750)</span>
            </button>

            <button
              onClick={() => handleAction('nudge')}
              className="flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-800 p-2 text-xs font-semibold text-paper-100 hover:bg-ink-700 transition"
            >
              <Zap className="h-3.5 w-3.5 text-warn-300" />
              <span>Manager Nudge</span>
            </button>

            <button
              onClick={() => handleAction('reprimand')}
              className="flex items-center gap-1.5 rounded-xl border border-alert-500/30 bg-alert-500/10 p-2 text-xs font-semibold text-alert-300 hover:bg-alert-500 hover:text-white transition"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Reprimand</span>
            </button>

            <button
              onClick={() => handleAction('fire')}
              className="flex items-center gap-1.5 rounded-xl border border-alert-500/40 bg-alert-500/15 p-2 text-xs font-semibold text-alert-400 hover:bg-alert-600 hover:text-white transition"
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
  inverse = false,
}: {
  label: string
  value: number
  color: string
  inverse?: boolean
}) {
  const rounded = Math.round(value)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-ink-300">{label}</span>
        <span className="mono font-bold text-paper-100">{rounded}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-ink-800 overflow-hidden">
        <div style={{ width: `${rounded}%` }} className={`h-full ${color} transition-all`} />
      </div>
    </div>
  )
}

function SkillPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-ink-850 px-2.5 py-1.5 border border-ink-800">
      <span className="text-ink-400 text-[11px]">{label}</span>
      <span className="mono font-bold text-paper-100 text-xs">{value}/10</span>
    </div>
  )
}
