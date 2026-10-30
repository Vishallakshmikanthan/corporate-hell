/**
 * CORPORATE HELL™ — Mini-Games Overlay & Auto-Resolver.
 *
 * Provides playable 2D mini-games for Code Review, Merge Conflicts, CI Log Debugging,
 * Postmortems, Investor Pitch Decks, and Ping-Pong rallies — all featuring a 1-click
 * Auto-Resolve button backed by player skill stats.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import {
  resolveCodeReviewMiniGame,
  resolveMergeConflictMiniGame,
  resolveCiLogPuzzle,
  resolvePostmortemMiniGame,
  resolvePitchDeckMiniGame,
  resolvePingPongRally,
} from '../../game/engine/minigames/minigames'
import { SeededRandom } from '../../game/engine/rng'
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Bot,
  Terminal,
  Activity,
  Crown,
} from 'lucide-react'

export function MiniGamesOverlay() {
  const activeMiniGame = useGameStore((s) => s.activeMiniGame)
  const closeMiniGame = useGameStore((s) => s.closeMiniGame)
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  const [selectedOption, setSelectedOption] = useState<any>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [pingClicks, setPingClicks] = useState(0)

  if (!activeMiniGame || !state) return null

  const rng = new SeededRandom(Date.now())
  const techSkill = state.playerAvatar?.skillXP?.coding ? 8 : 6
  const leadSkill = state.playerAvatar?.skillXP?.communication ? 8 : 7

  const handleAutoResolve = () => {
    switch (activeMiniGame) {
      case 'code_review': {
        const res = resolveCodeReviewMiniGame(techSkill, 1, 1, rng, true)
        setResultMessage(res.summary)
        dispatch({ type: 'commit_work', branchName: state.repo.branches[0]?.name || 'main' })
        break
      }
      case 'merge_conflict': {
        const res = resolveMergeConflictMiniGame('manual', true, rng, true)
        setResultMessage(res.summary)
        if (state.repo.branches[0]) {
          dispatch({ type: 'resolve_conflict', branchName: state.repo.branches[0].name, strategy: 'manual' })
        }
        break
      }
      case 'ci_log': {
        const res = resolveCiLogPuzzle(techSkill, 'fix_1', 'fix_1', rng, true)
        setResultMessage(res.summary)
        break
      }
      case 'postmortem': {
        const res = resolvePostmortemMiniGame(true, 2, rng, true)
        setResultMessage(res.summary)
        break
      }
      case 'pitch': {
        const res = resolvePitchDeckMiniGame(leadSkill, 85, rng, true)
        dispatch({ type: 'pitch_investors', pitchDeckQuality: 85 })
        setResultMessage(res.summary)
        break
      }
      case 'ping_pong': {
        const res = resolvePingPongRally(8, 8)
        dispatch({ type: 'office_break', activity: 'ping_pong' })
        setResultMessage(res.summary)
        break
      }
    }
  }

  const handleManualSubmit = () => {
    if (activeMiniGame === 'pitch') {
      const score = selectedOption === 1 ? 95 : 60
      dispatch({ type: 'pitch_investors', pitchDeckQuality: score })
      setResultMessage(`Pitch concluded! Score: ${score}%. Funding successfully wired to treasury.`)
    } else if (activeMiniGame === 'code_review') {
      const correct = selectedOption === 2
      const res = resolveCodeReviewMiniGame(techSkill, selectedOption, 2, rng, false)
      setResultMessage(res.summary)
    } else if (activeMiniGame === 'ping_pong') {
      const res = resolvePingPongRally(pingClicks, 8)
      dispatch({ type: 'office_break', activity: 'ping_pong' })
      setResultMessage(res.summary)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-ink-700 bg-ink-900 p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-paper-50 uppercase tracking-wider">
              {activeMiniGame.replace('_', ' ')} Challenge
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoResolve}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 px-3 py-1 text-xs font-bold hover:bg-purple-600/40 transition"
              title="Automatically resolve based on your avatar's stats"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Auto-Resolve</span>
            </button>

            <button
              onClick={closeMiniGame}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-800 text-ink-400 hover:text-paper-100 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mini-Game Interactive Content */}
        <div className="mt-4 text-xs">
          {resultMessage ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-paper-100">{resultMessage}</p>
              <button
                onClick={closeMiniGame}
                className="mt-4 rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
              >
                Close & Continue
              </button>
            </div>
          ) : (
            <>
              {activeMiniGame === 'pitch' && (
                <div className="space-y-4">
                  <p className="text-ink-300">
                    Select your pitch deck lead slide to convince the Sand Hill Road VC partners:
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: 1, title: 'Slide A: "Autonomous AI Agents + 320% MoM ARR Growth"', sub: 'High synergy buzzwords + real traction metrics. Strongest appeal.' },
                      { id: 2, title: 'Slide B: "Deep Technical Monolith Architecture"', sub: 'Explains Redis memory caching. VCs glaze over in 30 seconds.' },
                      { id: 3, title: 'Slide C: "We Put Company Synergy on Web3 Solana"', sub: 'High risk gamble with crypto angel investors.' },
                    ].map((slide) => (
                      <button
                        key={slide.id}
                        onClick={() => setSelectedOption(slide.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          selectedOption === slide.id
                            ? 'border-emerald-500 bg-emerald-500/15'
                            : 'border-ink-700 bg-ink-850 hover:border-ink-600'
                        }`}
                      >
                        <div className="font-bold text-paper-100 text-xs">{slide.title}</div>
                        <div className="text-[11px] text-ink-400 mt-0.5">{slide.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeMiniGame === 'code_review' && (
                <div className="space-y-4">
                  <p className="text-ink-300">
                    Spot the dangerous vulnerability in this pull request commit:
                  </p>
                  <div className="rounded-xl border border-ink-800 bg-ink-950 p-3 font-mono text-xs text-ink-300 space-y-1">
                    <div className="text-ink-500">1 | function transferFunds(req, res) &#123;</div>
                    <div className="text-ink-500">2 |   const &#123; amount, recipient &#125; = req.body;</div>
                    <button
                      onClick={() => setSelectedOption(2)}
                      className={`w-full text-left p-1 rounded transition ${selectedOption === 2 ? 'bg-red-500/30 text-red-200' : 'hover:bg-ink-800'}`}
                    >
                      3 |   if (!amount) res.send(200); // BUG: missing return statement!
                    </button>
                    <div className="text-ink-500">4 |   db.wallet.deduct(amount);</div>
                    <div className="text-ink-500">5 | &#125;</div>
                  </div>
                  <span className="text-[10px] text-ink-400">Click on line 3 to flag the regression.</span>
                </div>
              )}

              {activeMiniGame === 'ping_pong' && (
                <div className="space-y-4 text-center py-4">
                  <p className="text-ink-300">Rhythm Match: Tap the paddle in rhythm to sustain the rally!</p>
                  <div className="font-mono text-2xl font-black text-amber-400">
                    Rally Score: {pingClicks} / 8 hits
                  </div>
                  <button
                    onClick={() => setPingClicks((c) => Math.min(10, c + 1))}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-ink-950 font-black text-sm shadow-xl shadow-amber-500/30 active:scale-95 transition"
                  >
                    HIT! 🏓
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-ink-800 pt-3">
                <button
                  onClick={closeMiniGame}
                  className="rounded-lg px-4 py-2 text-xs text-ink-400 hover:text-paper-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualSubmit}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                >
                  Submit Action
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
