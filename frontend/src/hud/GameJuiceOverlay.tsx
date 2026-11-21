/**
 * CORPORATE HELL™ — Game Juice Overlay (Floating Popups, Combo Meter, Pixel Confetti).
 *
 * Gives instant arcade-grade feedback on every collected bubble, PR swipe,
 * bug squash, perk draft, and product launch.
 */
import React, { useEffect, useState } from 'react'
import { useGamificationStore, getComboMultiplier } from '../state/gamificationStore'
import { Flame } from 'lucide-react'

interface ConfettiPiece {
  id: number
  left: number
  color: string
  delay: number
  size: number
}

const CONFETTI_COLORS = ['#b6e52d', '#8fd3ff', '#f2a93b', '#d9453d', '#c084fc', '#f4ecd8']

export const GameJuiceOverlay: React.FC = () => {
  const floatingPops = useGamificationStore((s) => s.floatingPops)
  const comboCount = useGamificationStore((s) => s.comboCount)
  const confettiTrigger = useGamificationStore((s) => s.confettiTrigger)
  const decayComboIfExpired = useGamificationStore((s) => s.decayComboIfExpired)

  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  // Prune expired pops & combos every 400ms
  useEffect(() => {
    const t = setInterval(() => {
      decayComboIfExpired()
    }, 400)
    return () => clearInterval(t)
  }, [decayComboIfExpired])

  // Spawn pixel confetti shower whenever confettiTrigger increments
  useEffect(() => {
    if (confettiTrigger === 0) return
    const pieces: ConfettiPiece[] = Array.from({ length: 28 }, (_, i) => ({
      id: Date.now() + i,
      left: 8 + Math.random() * 84,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 250,
      size: 6 + Math.floor(Math.random() * 6),
    }))
    setConfetti(pieces)
    const timer = setTimeout(() => setConfetti([]), 1650)
    return () => clearTimeout(timer)
  }, [confettiTrigger])

  const comboMult = getComboMultiplier(comboCount)
  const isFlowState = comboCount >= 6

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none font-mono">
      {/* Live Combo / Flow State Banner (Top Center) */}
      {comboCount >= 2 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-bounce">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 border-2 border-[#14121c] shadow-[4px_4px_0px_#14121c] ${
              isFlowState
                ? 'bg-[#b6e52d] text-[#14121c]'
                : 'bg-[#f2a93b] text-[#14121c]'
            }`}
          >
            <Flame className="h-4 w-4 fill-current" />
            <span className="font-bold text-xs uppercase tracking-wider">
              {isFlowState ? 'FLOW STATE!' : 'COMBO'} {comboCount}x STREAK
            </span>
            <span className="bg-[#14121c] text-[#f4ecd8] px-1.5 py-0.5 text-[10px] font-bold">
              {comboMult.toFixed(1)}× REWARD
            </span>
          </div>
        </div>
      )}

      {/* Floating Combat-Style Numbers */}
      {floatingPops.map((pop) => (
        <div
          key={pop.id}
          style={{
            left: `${pop.x}%`,
            top: `${pop.y}%`,
            color: pop.color,
            animation: 'floatPopUp 1.3s ease-out forwards',
          }}
          className="absolute -translate-x-1/2 font-bold text-sm md:text-base uppercase tracking-wider drop-shadow-[2px_2px_0px_#14121c] whitespace-nowrap"
        >
          {pop.text}
        </div>
      ))}

      {/* Pixel Confetti Shower */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          style={{
            left: `${piece.left}%`,
            top: '-12px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animation: `pixelConfettiFall 1.4s linear ${piece.delay}ms forwards`,
          }}
          className="absolute border border-[#14121c]"
        />
      ))}

      <style>{`
        @keyframes floatPopUp {
          0% { opacity: 1; transform: translate(-50%, 0px) scale(0.9); }
          20% { opacity: 1; transform: translate(-50%, -14px) scale(1.12); }
          100% { opacity: 0; transform: translate(-50%, -62px) scale(0.95); }
        }
        @keyframes pixelConfettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          85% { opacity: 1; }
          100% { opacity: 0; transform: translateY(95vh) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
