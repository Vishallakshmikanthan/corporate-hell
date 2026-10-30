/**
 * CORPORATE HELL™ — CorpOS Directive.exe (Section 6).
 *
 * Executive AI Command console for issuing top-down strategic decrees,
 * crunch mode overrides, pizza parties, and technical mandates.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Zap, Terminal, Pizza, ShieldAlert, Sparkles, Send } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const DirectiveApp: React.FC = () => {
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)
  const [customPrompt, setCustomPrompt] = useState('')
  const [executionLog, setExecutionLog] = useState<string[]>([
    'CorpOS Executive Neural Substrate v4.2 Initialized.',
    'System ready for high-impact leadership mandates.',
  ])

  const issueDirective = (title: string, impact: string, actionFn: () => void) => {
    audio.playLever()
    actionFn()
    setExecutionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] DECREE: ${title}`,
      `> ${impact}`,
      ...prev,
    ])
    pushToast({
      title: `Decree Issued: ${title}`,
      description: impact,
      severity: 'celebrate',
      appId: 'directive',
    })
  }

  const handleCustomCommand = () => {
    if (!customPrompt.trim()) return
    audio.playClick()
    const prompt = customPrompt
    setCustomPrompt('')
    issueDirective(
      'AI Strategic Mandate',
      `Synthesizing autonomous agentic protocol: "${prompt}"`,
      () => {
        dispatch({ type: 'bonus_all' })
      }
    )
  }

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#b6e52d]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            DIRECTIVE.EXE [CEO Console]
          </span>
          <PixelBadge label="ROOT ACCESS" variant="lime" />
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Executive Preset Decrees & Terminal */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5 flex-1 min-h-[220px]">
        {/* Left Col: High-Impact Corporate Decrees */}
        <div className="flex flex-col gap-2 bg-[#14121c] p-3 border-2 border-[#4b4a5e]">
          <span className="text-xs font-bold text-[#f2a93b] uppercase mb-1 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> High-Impact Strategic Presets
          </span>

          {/* Preset 1: Pizza Party */}
          <div
            onClick={() =>
              issueDirective(
                'Mandatory Pizza Party',
                'Spent $400 on artisan slices. Morale +20%, Stress -15%!',
                () => dispatch({ type: 'bonus_all' })
              )
            }
            className="p-2.5 bg-[#2a2838] border border-[#4b4a5e] hover:border-[#b6e52d] cursor-pointer shadow-[1px_1px_0px_#14121c]"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#b6e52d] uppercase">
              <span>🍕 Morale Pizza Party</span>
              <span>-$400</span>
            </div>
            <p className="text-[10px] text-[#ded2b6] mt-0.5">
              Instantly cools down burnout and recharges team focus.
            </p>
          </div>

          {/* Preset 2: Tech Debt Freeze */}
          <div
            onClick={() =>
              issueDirective(
                'Tech Debt Ceasefire',
                'All feature tickets frozen. 100% focus on refactoring main.',
                () => dispatch({ type: 'bonus_all' })
              )
            }
            className="p-2.5 bg-[#2a2838] border border-[#4b4a5e] hover:border-[#8fd3ff] cursor-pointer shadow-[1px_1px_0px_#14121c]"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#8fd3ff] uppercase">
              <span>🧹 Zero Tech Debt Week</span>
              <span>Velocity -15%</span>
            </div>
            <p className="text-[10px] text-[#ded2b6] mt-0.5">
              Cuts repository bugs in half and restores build reliability.
            </p>
          </div>

          {/* Preset 3: Weekend Hackathon Sprint */}
          <div
            onClick={() =>
              issueDirective(
                'Crunch Hackathon',
                'Team shipped 3 major features! Energy -30%, Stress +25%.',
                () => dispatch({ type: 'bonus_all' })
              )
            }
            className="p-2.5 bg-[#2a2838] border border-[#4b4a5e] hover:border-[#d9453d] cursor-pointer shadow-[1px_1px_0px_#14121c]"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#d9453d] uppercase">
              <span>⚡ Weekend Crunch Sprint</span>
              <span>+300% Points</span>
            </div>
            <p className="text-[10px] text-[#ded2b6] mt-0.5">
              High risk, huge reward. Doubles sprint points at cost of stamina.
            </p>
          </div>
        </div>

        {/* Right Col: Terminal Output Log */}
        <div className="flex flex-col bg-[#14121c] p-2.5 border-2 border-[#14121c] text-[10px] text-[#b6e52d] shadow-[inset_2px_2px_0px_#000000] overflow-y-auto pixel-scrollbar justify-between">
          <div className="flex flex-col gap-1">
            {executionLog.map((log, idx) => (
              <div key={idx} className="leading-tight">
                {log}
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-[#4b4a5e]/50 text-[#8c8aa0]">
            AI Executive Copilot Status: Online (Latency: 12ms)
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Bottom: Custom Directive Input */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center gap-2 p-2 bg-[#2a2838] border-2 border-[#14121c] mt-2 shadow-[2px_2px_0px_#14121c]">
        <span className="text-xs text-[#b6e52d] font-bold">&gt;</span>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Issue custom decree (e.g. 'All engineers drink espresso and deploy')..."
          className="flex-1 bg-[#14121c] border border-[#4b4a5e] px-2 py-1 text-xs text-[#f4ecd8] outline-none font-mono"
        />
        <PixelButton
          variant="lime"
          size="sm"
          icon={<Send className="h-3 w-3" />}
          onClick={handleCustomCommand}
          disabled={!customPrompt.trim()}
        >
          Execute
        </PixelButton>
      </div>
    </div>
  )
}
