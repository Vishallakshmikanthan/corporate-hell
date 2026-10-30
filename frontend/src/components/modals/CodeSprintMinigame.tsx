/**
 * CORPORATE HELL™ — Code Sprint Arcade Minigame.
 *
 * Fast-paced 30-second arcade bug-squashing challenge:
 * - Falling software bugs (NullPointer, MemoryLeak, RaceCondition, InfiniteLoop)
 * - Match quick keys (Q / W / E / R) to squash bugs before they hit production
 * - Streak combos trigger "10x DEVELOPER FLOW STATE"
 * - Rewards GitHub Stars and Tech Skill upon completion
 */
import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../state/gameStore'
import { audio } from '../../services/audio'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { Bug, Zap, CheckCircle2, Trophy, Flame } from 'lucide-react'

interface FallingBug {
  id: number
  name: string
  key: 'Q' | 'W' | 'E' | 'R'
  color: string
  y: number // 0% -> 90%
}

const BUG_TYPES = [
  { name: 'NullPointer', key: 'Q' as const, color: '#ef4444' },
  { name: 'MemoryLeak', key: 'W' as const, color: '#f59e0b' },
  { name: 'RaceCondition', key: 'E' as const, color: '#8b5cf6' },
  { name: 'InfiniteLoop', key: 'R' as const, color: '#06b6d4' },
]

interface Props {
  onClose: () => void
}

export const CodeSprintMinigame: React.FC<Props> = ({ onClose }) => {
  const dispatch = useGameStore((s) => s.dispatch)

  const [timeLeft, setTimeLeft] = useState(25)
  const [score, setScore] = useState(0)
  const [bugsSquashed, setBugsSquashed] = useState(0)
  const [combo, setCombo] = useState(1)
  const [activeBugs, setActiveBugs] = useState<FallingBug[]>([])
  const [gameOver, setGameOver] = useState(false)

  const bugIdCounter = useRef(1)

  // Game Countdown Loop
  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver])

  // Bug Spawning Loop
  useEffect(() => {
    if (gameOver) return
    const spawnTimer = setInterval(() => {
      const type = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)]
      const newBug: FallingBug = {
        id: bugIdCounter.current++,
        name: type.name,
        key: type.key,
        color: type.color,
        y: 0,
      }
      setActiveBugs((prev) => [...prev.slice(-6), newBug])
    }, 850)

    return () => clearInterval(spawnTimer)
  }, [gameOver])

  // Gravity / Movement Loop
  useEffect(() => {
    if (gameOver) return
    const moveTimer = setInterval(() => {
      setActiveBugs((prev) =>
        prev
          .map((bug) => ({ ...bug, y: bug.y + 6 }))
          .filter((bug) => {
            if (bug.y >= 92) {
              // Bug escaped into production! Reset combo
              audio.playZap()
              setCombo(1)
              return false
            }
            return true
          }),
      )
    }, 100)

    return () => clearInterval(moveTimer)
  }, [gameOver])

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return
      const k = e.key.toUpperCase()
      if (['Q', 'W', 'E', 'R'].includes(k)) {
        // Find lowest bug matching this key
        setActiveBugs((prev) => {
          const matchIndex = prev.findIndex((b) => b.key === k)
          if (matchIndex !== -1) {
            audio.playClick()
            setBugsSquashed((b) => b + 1)
            setScore((s) => s + 15 * combo)
            setCombo((c) => Math.min(8, c + 1))
            return prev.filter((_, idx) => idx !== matchIndex)
          } else {
            audio.playZap()
            setCombo(1)
            return prev
          }
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, combo])

  const handleFinish = () => {
    dispatch({
      type: 'code_sprint_result',
      score,
      bugsSquashed,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-mono select-none crt-scanlines">
      <div className="relative flex flex-col w-full max-w-xl h-[560px] bg-[#1a1824] border-4 border-[#14121c] shadow-[8px_8px_0px_#14121c] p-4 text-[#f4ecd8] overflow-hidden">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b-2 border-[#14121c] pb-2 mb-2">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#facc15] animate-pulse" />
            <h2 className="font-bold text-sm tracking-wider uppercase text-[#b6e52d]">
              CODE SPRINT: 10X FLOW STATE
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-[#8fd3ff]">TIME: {timeLeft}s</span>
            <span className="text-[#facc15]">STARS: +{score}</span>
          </div>
        </div>

        {/* Combo & Stats Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#2a2838] border border-[#14121c] text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#ded2b6]">COMBO:</span>
            <span className="font-bold text-[#b6e52d] text-sm">{combo}x</span>
            {combo >= 4 && <span className="text-[10px] text-[#facc15] font-bold">🔥 IN THE ZONE!</span>}
          </div>
          <div>SQUASHED: {bugsSquashed} BUGS</div>
        </div>

        {/* Falling Bugs Arena */}
        <div className="relative flex-1 bg-[#14121c] border-2 border-[#4b4a5e] overflow-hidden p-2">
          {/* Danger Line */}
          <div className="absolute bottom-10 left-0 right-0 border-b border-dashed border-[#ef4444]/60 pointer-events-none flex justify-end pr-2">
            <span className="text-[9px] text-[#ef4444] uppercase">Prod Deployment Line</span>
          </div>

          {/* Active Falling Bugs */}
          {activeBugs.map((bug) => (
            <div
              key={bug.id}
              style={{
                top: `${bug.y}%`,
                left: bug.key === 'Q' ? '12%' : bug.key === 'W' ? '36%' : bug.key === 'E' ? '60%' : '84%',
                transform: 'translateX(-50%)',
              }}
              className="absolute flex flex-col items-center gap-0.5 animate-bounce-subtle"
            >
              <div
                style={{ backgroundColor: bug.color }}
                className="flex items-center gap-1 px-2 py-1 border border-[#14121c] shadow-[2px_2px_0px_#14121c] text-white text-[10px] font-bold uppercase whitespace-nowrap"
              >
                <Bug className="h-3 w-3" />
                <span>{bug.name}</span>
              </div>
              <div className="bg-[#f4ecd8] text-[#14121c] px-1.5 py-0.5 border border-[#14121c] text-[10px] font-bold">
                [{bug.key}]
              </div>
            </div>
          ))}

          {/* Action Trigger Pad at Bottom */}
          <div className="absolute bottom-1 left-2 right-2 flex justify-around">
            {BUG_TYPES.map((type) => (
              <div
                key={type.key}
                className="flex flex-col items-center bg-[#2a2838] border-2 border-[#4b4a5e] px-3 py-1 shadow"
              >
                <span className="text-xs font-bold text-[#facc15]">[{type.key}]</span>
                <span className="text-[9px] text-[#ded2b6]">{type.name}</span>
              </div>
            ))}
          </div>

          {/* Game Over Modal Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-[#14121c]/95 flex flex-col items-center justify-center p-6 text-center animate-slide-up z-30">
              <Trophy className="h-12 w-12 text-[#facc15] mb-2" />
              <h3 className="text-lg font-bold uppercase text-[#b6e52d] tracking-wider mb-1">
                SPRINT COMPLETE!
              </h3>
              <p className="text-xs text-[#ded2b6] mb-4">
                You squashed {bugsSquashed} critical production bugs and gained reputation!
              </p>

              <div className="bg-[#2a2838] border-2 border-[#14121c] p-3 w-full max-w-xs mb-4 flex justify-around text-xs">
                <div>
                  <div className="text-[#ded2b6]">GitHub Stars</div>
                  <div className="font-bold text-[#b6e52d] text-base">+{score}</div>
                </div>
                <div>
                  <div className="text-[#ded2b6]">Tech Skill</div>
                  <div className="font-bold text-[#8fd3ff] text-base">+5</div>
                </div>
              </div>

              <PixelButton variant="primary" onClick={handleFinish}>
                Collect Stars & Return
              </PixelButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
