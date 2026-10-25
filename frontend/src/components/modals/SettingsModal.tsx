/**
 * CORPORATE HELL™ — Settings & Configuration Modal.
 *
 * Audio volume, graphics quality, AI backend diagnostics,
 * keyboard shortcuts, and JSON save export/import.
 */
import { useState, useEffect } from 'react'
import { useGameStore, type GraphicsQuality } from '../../state/gameStore'
import { checkBackendHealth } from '../../services/api'
import { exportSaveToJson, importSaveFromJson } from '../../game/persistence/storage'
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Download,
  Upload,
  Keyboard,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export function SettingsModal() {
  const isOpen = useGameStore((s) => s.isSettingsModalOpen)
  const setOpen = useGameStore((s) => s.setSettingsModalOpen)
  const audioMuted = useGameStore((s) => s.audioMuted)
  const audioVolume = useGameStore((s) => s.audioVolume)
  const toggleAudioMute = useGameStore((s) => s.toggleAudioMute)
  const setAudioVolume = useGameStore((s) => s.setAudioVolume)
  const graphicsQuality = useGameStore((s) => s.graphicsQuality)
  const setGraphicsQuality = useGameStore((s) => s.setGraphicsQuality)
  const state = useGameStore((s) => s.state)
  const loadState = useGameStore((s) => s.loadState)

  const [aiStatus, setAiStatus] = useState<'checking' | 'live' | 'fallback'>('checking')
  const [aiModel, setAiModel] = useState<string>('')
  const [importFeedback, setImportFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      checkBackendHealth().then((res) => {
        setAiStatus(res.ai_status as any)
        setAiModel(res.ai_model)
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleExportSave = () => {
    if (!state) return
    const jsonStr = exportSaveToJson(state)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `corporate_hell_${state.name.replace(/\s+/g, '_')}_day${state.day}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const imported = importSaveFromJson(content)
        loadState(imported)
        setImportFeedback('Game state successfully imported!')
        setTimeout(() => setImportFeedback(null), 3000)
      } catch (err) {
        setImportFeedback('Failed to parse save file. Ensure valid JSON.')
        setTimeout(() => setImportFeedback(null), 3000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur select-none animate-slide-up">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-800 pb-4">
          <h3 className="font-display text-lg font-bold text-paper-50 uppercase tracking-wide">
            Settings & System Preferences
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-xs">
          {/* Audio Controls */}
          <div>
            <span className="font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2.5">
              <Volume2 className="h-4 w-4 text-corp-400" />
              <span>Audio Synthesis</span>
            </span>
            <div className="rounded-xl border border-ink-800 bg-ink-850 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-paper-200">Mute All Audio</span>
                <button
                  onClick={toggleAudioMute}
                  className={`rounded-lg px-3 py-1 font-bold ${
                    audioMuted
                      ? 'bg-alert-500 text-white'
                      : 'bg-ink-700 text-paper-200 hover:bg-ink-600'
                  }`}
                >
                  {audioMuted ? 'Muted' : 'Sound Active'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-paper-200">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioMuted ? 0 : audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className="w-48 accent-corp-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3D Graphics Quality */}
          <div>
            <span className="font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2.5">
              <Sliders className="h-4 w-4 text-acid-400" />
              <span>3D Graphic Fidelity</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setGraphicsQuality(q)}
                  className={`rounded-xl border p-3 text-center capitalize transition font-bold ${
                    graphicsQuality === q
                      ? 'border-corp-400 bg-corp-500/15 text-corp-300'
                      : 'border-ink-800 bg-ink-850 text-ink-400 hover:border-ink-700'
                  }`}
                >
                  {q} Detail
                </button>
              ))}
            </div>
          </div>

          {/* AI Backend Diagnostics */}
          <div>
            <span className="font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-4 w-4 text-warn-400" />
              <span>NVIDIA AI Diagnostics</span>
            </span>
            <div className="rounded-xl border border-ink-800 bg-ink-850 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-paper-200">AI Service Status:</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    aiStatus === 'live'
                      ? 'bg-acid-400/20 text-acid-400 border border-acid-400/30'
                      : 'bg-ink-700 text-ink-300'
                  }`}
                >
                  {aiStatus === 'live' ? 'Live NVIDIA NIM' : 'Deterministic Fallback'}
                </span>
              </div>
              <div className="text-[11px] text-ink-400">
                Active Model: <span className="mono text-paper-200">{aiModel || 'Local'}</span>
              </div>
              <p className="text-[11px] text-ink-500 leading-normal">
                Set <code className="text-corp-300">NVIDIA_API_KEY</code> in{' '}
                <code className="text-corp-300">.env</code> to activate real-time LLM employee
                dialogue. The game is fully playable offline without credentials.
              </p>
            </div>
          </div>

          {/* Save Export & Import */}
          <div>
            <span className="font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2.5">
              <Download className="h-4 w-4 text-corp-400" />
              <span>Save Game Management</span>
            </span>
            {importFeedback && (
              <div className="mb-2 text-xs font-semibold text-acid-400">{importFeedback}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleExportSave}
                disabled={!state}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-850 p-2.5 text-paper-100 hover:bg-ink-800 transition font-bold disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                <span>Export Save File (JSON)</span>
              </button>

              <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-850 p-2.5 text-paper-100 hover:bg-ink-800 transition font-bold cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import Save (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSave}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Keyboard Shortcuts Cheatsheet */}
          <div>
            <span className="font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5 mb-2.5">
              <Keyboard className="h-4 w-4" />
              <span>Keyboard Shortcuts</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-ink-400 text-[11px]">
              <div><kbd className="rounded bg-ink-800 px-1.5 py-0.5 text-paper-200">Space</kbd> Play / Pause</div>
              <div><kbd className="rounded bg-ink-800 px-1.5 py-0.5 text-paper-200">1 / 2 / 5</kbd> Simulation Speed</div>
              <div><kbd className="rounded bg-ink-800 px-1.5 py-0.5 text-paper-200">R</kbd> Reset 3D Camera</div>
              <div><kbd className="rounded bg-ink-800 px-1.5 py-0.5 text-paper-200">Esc</kbd> Close Inspector</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
