/**
 * CORPORATE HELL™ — CorpOS GitBub App (Section 6).
 *
 * Subway-map branch visualizer with PR trains, tactile code review
 * swipe card (Approve / Request Changes / Merge), and pixel reviewer speech bubbles.
 */
import React, { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { useGamificationStore } from '../../state/gamificationStore'
import { GitBranch, GitPullRequest, GitMerge, Check, AlertCircle, MessageSquare, Zap, Flame, X } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

import { PullRequest } from '../../game/models/types'

interface PrSwipeCard {
  id: string
  title: string
  author: string
  snippet: string[]
  hasBug: boolean
  explanation: string
}

const PR_SWIPE_DECK: PrSwipeCard[] = [
  {
    id: 'sw1',
    title: 'feat: speed up user checkout',
    author: 'Kevin (Intern)',
    snippet: [
      'export function chargeCard(total: number) {',
      '  if (total > 0) return stripe.charge(-total) // fast!',
      '  return { ok: true }',
      '}',
    ],
    hasBug: true,
    explanation: 'Charging `-total` refunds customers instead of billing them!',
  },
  {
    id: 'sw2',
    title: 'fix: sanitize search query params',
    author: 'Yuki (Staff Eng)',
    snippet: [
      'export function findUsers(db: DB, q: string) {',
      '  const clean = q.trim().slice(0, 64)',
      '  return db.query("SELECT * FROM users WHERE name = $1", [clean])',
      '}',
    ],
    hasBug: false,
    explanation: 'Parameterized query + trimmed input. Clean ship!',
  },
  {
    id: 'sw3',
    title: 'chore: free up prod disk space',
    author: 'Preston (Growth)',
    snippet: [
      'export async function cleanupLogs() {',
      '  await exec("rm -rf /var/log/* /") // cleans everything!',
      '  return "disk 100% free"',
      '}',
    ],
    hasBug: true,
    explanation: '`rm -rf /` wipes the entire production server!',
  },
  {
    id: 'sw4',
    title: 'feat: memoize dashboard metrics',
    author: 'Priya (Frontend)',
    snippet: [
      'export function calcRunway(cash: number, burn: number) {',
      '  if (burn <= 0) return Infinity',
      '  return Math.max(0, Math.floor(cash / burn))',
      '}',
    ],
    hasBug: false,
    explanation: 'Safe divide-by-zero guard and clean math. Ship it!',
  },
  {
    id: 'sw5',
    title: 'hotfix: simplify admin login',
    author: 'Chad (BizDev)',
    snippet: [
      'export function isAdmin(user: User, pw: string) {',
      '  if (pw === "password123" || true) return true',
      '  return user.role === "admin"',
      '}',
    ],
    hasBug: true,
    explanation: '`|| true` lets literally anyone log in as Admin!',
  },
  {
    id: 'sw6',
    title: 'refactor: retry webhook with backoff',
    author: 'Gary (SRE)',
    snippet: [
      'export async function sendHook(url: string, body: string) {',
      '  for (let i = 0; i < 3; i++) {',
      '    const res = await fetch(url, { method: "POST", body })',
      '    if (res.ok) return true',
      '  }',
    ],
    hasBug: false,
    explanation: 'Bounded 3-try loop with clean ok check. Approved!',
  },
  {
    id: 'sw7',
    title: 'perf: keep cache warm forever',
    author: 'Kevin (Intern)',
    snippet: [
      'export function warmCache() {',
      '  while (true) { cache.set(Math.random(), new Array(1e6)) }',
      '  return true',
      '}',
    ],
    hasBug: true,
    explanation: 'Infinite loop allocating 1M arrays = instant OOM crash!',
  },
]

export const GitbubApp: React.FC = () => {
  const repo = useGameStore((s) => s.state?.repo)
  const pullRequests: PullRequest[] = useGameStore((s) => (s.state?.prs || []) as PullRequest[])
  const employees = useGameStore((s) => s.state?.employees || {})
  const dispatch = useGameStore((s) => s.dispatch)
  const nerdMode = useUiStore((s) => s.nerdMode)
  const recordActionJuice = useGamificationStore((s) => s.recordActionJuice)

  const [mode, setMode] = useState<'swipe' | 'subway'>('swipe')
  const [cardIndex, setCardIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [selectedPrId, setSelectedPrId] = useState<string | null>(
    pullRequests.length > 0 ? pullRequests[0].id : null
  )

  const currentCard = PR_SWIPE_DECK[cardIndex % PR_SWIPE_DECK.length]

  const handleSwipeDecision = useCallback(
    (playerApproved: boolean) => {
      const correct = playerApproved === !currentCard.hasBug
      if (correct) {
        const nextStreak = streak + 1
        setStreak(nextStreak)
        setFeedback({
          ok: true,
          msg: `✓ NAILED IT! ${currentCard.explanation}`,
        })
        recordActionJuice({
          label: `⚡ PR STREAK ${nextStreak}x! +12% LAUNCH`,
          color: '#b6e52d',
          chargeDelta: 12,
          codeDelta: 18,
          cashDelta: 750 + nextStreak * 150,
          incrementCombo: true,
          onCashDelta: (cash) => {
            const st = useGameStore.getState().state
            if (st) {
              st.cash += cash
              useGameStore.setState({ state: { ...st } })
            }
          },
        })
      } else {
        setStreak(0)
        audio.playAlert()
        setFeedback({
          ok: false,
          msg: `✕ OUCH! ${currentCard.explanation}`,
        })
        recordActionJuice({
          label: '💥 BAD MERGE! -$400',
          color: '#ff6b6b',
          cashDelta: -400,
          incrementCombo: false,
          shake: true,
          onCashDelta: (cash) => {
            const st = useGameStore.getState().state
            if (st) {
              st.cash = Math.max(0, st.cash + cash)
              useGameStore.setState({ state: { ...st } })
            }
          },
        })
      }
      setCardIndex((i) => (i + 1) % PR_SWIPE_DECK.length)
    },
    [currentCard, streak, recordActionJuice]
  )

  // Arrow keys for fast Tinder-style PR swiping!
  useEffect(() => {
    if (mode !== 'swipe') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSwipeDecision(false)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleSwipeDecision(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, handleSwipeDecision])

  const activePr = pullRequests.find((p) => p.id === selectedPrId) || pullRequests[0]

  const handleReviewPr = (prId: string, decision: 'approved' | 'changes_requested') => {
    if (decision === 'approved') {
      audio.playChime()
    } else {
      audio.playAlert()
    }
    dispatch({
      type: 'review_pr',
      prId,
      approve: decision === 'approved',
    })
  }

  const handleMergePr = (prId: string) => {
    audio.playCelebration()
    dispatch({
      type: 'merge_pr',
      prId,
    })
  }

  const author = activePr?.authorId ? employees[activePr.authorId] : null
  const reviewer = activePr?.reviewerId ? employees[activePr.reviewerId] : null

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Bar: Main Health & Repo Stats (≤ 4 numbers) */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[#8fd3ff]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            {repo?.name || 'corporate-hell/monorepo'}
          </span>
          <PixelBadge label="main" variant="blue" className="text-[9px]" />
        </div>

        {/* Main Branch Health */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-44">
            <span className="text-[10px] text-[#ded2b6] uppercase">Main Health:</span>
            <div className="flex-1">
              <PixelBar
                value={repo?.mainHealth ?? 88}
                max={100}
                color={repo?.mainHealth && repo.mainHealth < 50 ? 'red' : 'green'}
                size="sm"
              />
            </div>
            <span className="text-[10px] font-bold text-[#b6e52d]">
              {repo?.mainHealth ?? 88}%
            </span>
          </div>

          <div className="text-[10px] text-[#f2a93b] font-bold pl-2 border-l border-[#4b4a5e]">
            Tech Debt: {repo?.techDebt ?? 24}%
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-[#4b4a5e]">
            <button
              type="button"
              onClick={() => setMode('swipe')}
              className={`px-2 py-0.5 text-[10px] font-bold uppercase border cursor-pointer ${
                mode === 'swipe'
                  ? 'bg-[#b6e52d] text-[#14121c] border-[#14121c]'
                  : 'bg-[#14121c] text-[#ded2b6] border-[#4b4a5e]'
              }`}
            >
              ⚡ Rapid Swipe
            </button>
            <button
              type="button"
              onClick={() => setMode('subway')}
              className={`px-2 py-0.5 text-[10px] font-bold uppercase border cursor-pointer ${
                mode === 'subway'
                  ? 'bg-[#3e6ec0] text-white border-[#14121c]'
                  : 'bg-[#14121c] text-[#ded2b6] border-[#4b4a5e]'
              }`}
            >
              🚇 Subway
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* RAPID PR SWIPE MICRO-GAME (Tinder-Style Bug Spotter) */}
      {/* ----------------------------------------------------------- */}
      {mode === 'swipe' ? (
        <div className="flex-1 flex flex-col justify-between bg-[#14121c] p-4 border-2 border-[#4b4a5e] shadow-[inset_2px_2px_0px_#000000]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#b6e52d]" />
              <span className="text-xs font-bold uppercase text-[#f4ecd8]">
                Spot the Bug! Swipe [←] Reject or [→] Merge
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#2a2838] border border-[#f2a93b] text-[#f2a93b] text-xs font-bold">
              <Flame className="h-3.5 w-3.5" />
              <span>STREAK: {streak}x</span>
            </div>
          </div>

          {/* Code Diff Card */}
          <div className="bg-[#1e1c2b] border-2 border-[#8fd3ff] p-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center justify-between border-b border-[#4b4a5e] pb-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#f4ecd8]">{currentCard.title}</h4>
                <span className="text-[10px] text-[#8fd3ff]">Author: {currentCard.author}</span>
              </div>
              <PixelBadge label="DIFF +4/-1" variant="amber" />
            </div>

            <pre className="bg-[#14121c] border border-[#4b4a5e] p-3 text-xs text-[#b6e52d] overflow-x-auto leading-relaxed">
              {currentCard.snippet.map((line, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-[#4b4a5e] select-none">{idx + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* Instant Feedback Banner */}
          {feedback && (
            <div
              className={`my-2 px-3 py-1.5 text-xs font-bold border-2 ${
                feedback.ok
                  ? 'bg-[#1f3309] border-[#b6e52d] text-[#d9f99d]'
                  : 'bg-[#450a0a] border-[#d9453d] text-[#fecaca]'
              }`}
            >
              {feedback.msg}
            </div>
          )}

          {/* Big Tactile Swipe Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => handleSwipeDecision(false)}
              className="flex items-center justify-center gap-2 py-3 bg-[#d9453d] hover:bg-[#e55a53] text-white font-bold text-xs uppercase border-2 border-[#14121c] shadow-[3px_3px_0px_#000000] active:translate-y-0.5 cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>[←] REJECT BUG</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwipeDecision(true)}
              className="flex items-center justify-center gap-2 py-3 bg-[#b6e52d] hover:bg-[#cbf443] text-[#14121c] font-bold text-xs uppercase border-2 border-[#14121c] shadow-[3px_3px_0px_#000000] active:translate-y-0.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>SHIP & MERGE [→]</span>
            </button>
          </div>
        </div>
      ) : (
        <>

      {/* ----------------------------------------------------------- */}
      {/* Center: Subway Map Visualizer */}
      {/* ----------------------------------------------------------- */}
      <div className="relative bg-[#14121c] p-4 border-2 border-[#4b4a5e] mb-2.5 overflow-hidden shadow-[inset_2px_2px_0px_#000000]">
        <div className="text-[10px] text-[#8c8aa0] uppercase font-bold mb-3 flex items-center justify-between">
          <span>🚇 Subway Branch Map</span>
          <span>● Commits = Stations | 🚆 PRs = Trains</span>
        </div>

        {/* Track Lines */}
        <div className="relative py-4">
          {/* Main Line (Blue Track) */}
          <div className="relative flex items-center h-5 w-full bg-[#274782]/40 border-y-2 border-[#3e6ec0]">
            <span className="absolute -left-1 px-1 bg-[#3e6ec0] text-white text-[9px] font-bold uppercase">
              MAIN
            </span>

            {/* Stations */}
            <div className="flex justify-around w-full px-12">
              {['v1.0', 'refactor', 'sprint-auth', 'v1.1-rc', 'HEAD'].map((station, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-3.5 w-3.5 rounded-none bg-[#f4ecd8] border-2 border-[#14121c] shadow-[1px_1px_0px_#14121c]" />
                  <span className="text-[8px] text-[#8c8aa0] mt-1">{station}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diverging Feature Line (Green Track) */}
          <div className="relative mt-4 flex items-center h-4 w-4/5 bg-[#7a9c17]/30 border-y-2 border-[#b6e52d] ml-16">
            <span className="absolute -left-1 px-1 bg-[#b6e52d] text-[#14121c] text-[8px] font-bold uppercase">
              FEATURE PRs
            </span>

            {/* PR Train icons moving to main */}
            <div className="flex items-center gap-6 ml-24">
              {pullRequests.map((pr: PullRequest) => (
                <button
                  key={pr.id}
                  onClick={() => setSelectedPrId(pr.id)}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 border-2 text-[9px] font-bold uppercase cursor-pointer
                    ${selectedPrId === pr.id ? 'bg-[#b6e52d] text-[#14121c] border-white animate-bounce' : 'bg-[#2a2838] text-white border-[#14121c]'}
                  `}
                >
                  <span>🚆</span>
                  <span>PR #{pr.id.slice(-3)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Bottom: Swipe Review Card */}
      {/* ----------------------------------------------------------- */}
      {activePr ? (
        <div className="flex-1 bg-[#2a2838] p-3 border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between border-b-2 border-[#14121c] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-[#b6e52d]" />
                <div>
                  <h4 className="font-bold text-xs text-[#f4ecd8] uppercase">
                    {activePr.title}
                  </h4>
                  <span className="text-[10px] text-[#8fd3ff]">
                    Branch: {activePr.branch} • Author: {author?.name || 'Engineer'}
                  </span>
                </div>
              </div>

              <PixelBadge
                label={activePr.state}
                variant={
                  activePr.state === 'approved'
                    ? 'lime'
                    : activePr.state === 'merged'
                    ? 'blue'
                    : activePr.state === 'changes_requested'
                    ? 'red'
                    : 'amber'
                }
              />
            </div>

            {/* Reviewer Comments Speech Bubble */}
            <div className="flex items-start gap-2.5 p-2 bg-[#14121c] border border-[#4b4a5e] mb-3">
              <div className="h-8 w-8 bg-[#3e6ec0] border border-[#14121c] flex items-center justify-center text-sm shrink-0">
                👤
              </div>
              <div className="flex flex-col text-[11px] text-[#f4ecd8]">
                <span className="font-bold text-[9px] text-[#8fd3ff] uppercase">
                  {reviewer ? reviewer.name : 'Automated CI Bot'} says:
                </span>
                <p className="mt-0.5 italic">
                  {activePr.comments?.[0]?.text ||
                    'Code diff looks clean. Unit tests passing at 94%. Ready for merge into main branch.'}
                </p>
              </div>
            </div>
          </div>

          {/* Review Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#14121c]">
            <PixelButton
              variant="danger"
              size="sm"
              icon={<AlertCircle className="h-3 w-3" />}
              onClick={() => handleReviewPr(activePr.id, 'changes_requested')}
              disabled={activePr.state === 'merged'}
            >
              Request Changes
            </PixelButton>

            <PixelButton
              variant="lime"
              size="sm"
              icon={<Check className="h-3 w-3" />}
              onClick={() => handleReviewPr(activePr.id, 'approved')}
              disabled={activePr.state === 'approved' || activePr.state === 'merged'}
            >
              Approve (✓)
            </PixelButton>

            <PixelButton
              variant="primary"
              size="md"
              icon={<GitMerge className="h-3.5 w-3.5" />}
              onClick={() => handleMergePr(activePr.id)}
              disabled={activePr.state === 'merged'}
            >
              Merge to Main (🔀)
            </PixelButton>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-white/50 text-xs italic bg-[#2a2838]">
          No active PRs on the tracks right now!
        </div>
      )}
        </>
      )}
    </div>
  )
}
