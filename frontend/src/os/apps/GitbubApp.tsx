/**
 * CORPORATE HELL™ — CorpOS GitBub App (Section 6).
 *
 * Subway-map branch visualizer with PR trains, tactile code review
 * swipe card (Approve / Request Changes / Merge), and pixel reviewer speech bubbles.
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { GitBranch, GitPullRequest, GitMerge, Check, AlertCircle, MessageSquare } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

import { PullRequest } from '../../game/models/types'

export const GitbubApp: React.FC = () => {
  const repo = useGameStore((s) => s.state?.repo)
  const pullRequests: PullRequest[] = useGameStore((s) => (s.state?.prs || []) as PullRequest[])
  const employees = useGameStore((s) => s.state?.employees || {})
  const dispatch = useGameStore((s) => s.dispatch)
  const nerdMode = useUiStore((s) => s.nerdMode)

  const [selectedPrId, setSelectedPrId] = useState<string | null>(
    pullRequests.length > 0 ? pullRequests[0].id : null
  )

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
        </div>
      </div>

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
    </div>
  )
}
