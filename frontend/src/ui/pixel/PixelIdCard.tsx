/**
 * CORPORATE HELL™ — Pixel Employee ID Card.
 *
 * Diegetic clip-on employee badge with reference portrait,
 * mood indicators, segmented vitals, and one-click actions.
 */
import React, { useState } from 'react'
import { X, Coffee, Award, DollarSign, MessageSquare, ChevronRight, RotateCw } from 'lucide-react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { PixelBar } from './PixelBar'
import { PixelBadge } from './PixelBadge'
import { PixelButton } from './PixelButton'

// Map roles / visual traits to reference images
function getEmployeePortrait(emp: any): string {
  const role = emp?.role?.toLowerCase() || ''
  const name = emp?.name?.toLowerCase() || ''
  
  if (role.includes('lead') || role.includes('cto') || role.includes('founder')) {
    return '/reference/char_vest.jpg'
  }
  if (role.includes('design') || role.includes('product') || name.includes('maya') || name.includes('sophia')) {
    return '/reference/char_woman_selfie.jpg'
  }
  if (role.includes('qa') || role.includes('data') || name.includes('sarah') || name.includes('elena')) {
    return '/reference/char_woman_lanyard.jpg'
  }
  if (role.includes('junior') || role.includes('intern') || name.includes('alex') || name.includes('sam')) {
    return '/reference/char_green_sweater.jpg'
  }
  if (role.includes('devops') || role.includes('sre') || name.includes('marcus')) {
    return '/reference/char_crocs.jpg'
  }
  if (role.includes('front') || name.includes('liam') || name.includes('kai')) {
    return '/reference/char_graphic_tee.jpg'
  }
  return '/reference/char_hoodie.jpg'
}

export const PixelIdCard: React.FC = () => {
  const inspectedId = useUiStore((s) => s.inspectedEmployeeId)
  const inspectEmployee = useUiStore((s) => s.inspectEmployee)
  const employees = useGameStore((s) => s.state?.employees)
  const dispatch = useGameStore((s) => s.dispatch)
  const [showBackSide, setShowBackSide] = useState(false)

  if (!inspectedId) return null
  const emp = employees?.[inspectedId]
  if (!emp) return null

  const portraitUrl = getEmployeePortrait(emp)

  const moodKey = emp.morale > 75 ? 'happy' : emp.morale > 45 ? 'neutral' : emp.stress > 70 ? 'stressed' : 'exhausted'
  const moodIcon = {
    happy: '☺',
    neutral: '😐',
    stressed: '💢',
    exhausted: '💤',
  }[moodKey] || '☺'

  const handleBonus = () => {
    dispatch({ type: 'bonus', employeeId: emp.id })
  }

  const handlePromote = () => {
    dispatch({ type: 'promote', employeeId: emp.id })
  }

  const handleCoffee = () => {
    dispatch({ type: 'office_break', activity: 'coffee', targetEmployeeId: emp.id })
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 font-mono select-none animate-slide-up">
      {/* Clip-on Lanyard / Badge Holder */}
      <div className="mx-auto h-4 w-12 bg-[#7a4a2d] border-2 border-[#14121c] flex items-center justify-center shadow-[1px_1px_0px_#14121c]">
        <div className="h-2 w-4 bg-[#c58a55] border border-[#14121c]" />
      </div>

      <div className="border-4 border-[#14121c] bg-[#f4ecd8] text-[#14121c] p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85),inset_2px_2px_0px_#ffffff,inset_-2px_-2px_0px_#ded2b6]">
        {/* Badge Header */}
        <div className="flex items-center justify-between border-b-2 border-[#14121c] pb-1.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🏢</span>
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#14121c]">
              EMPLOYEE PASS
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowBackSide(!showBackSide)}
              title="Flip badge"
              className="p-1 hover:bg-[#ded2b6] border border-[#14121c] shadow-[1px_1px_0px_#14121c]"
            >
              <RotateCw className="h-3 w-3" />
            </button>
            <button
              onClick={() => inspectEmployee(null)}
              className="p-1 hover:bg-[#d9453d] hover:text-white border border-[#14121c] shadow-[1px_1px_0px_#14121c]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Front / Back Toggle */}
        {!showBackSide ? (
          <div>
            {/* Photo & Name Section */}
            <div className="flex gap-3 items-center mb-3">
              {/* Pixel Photo with retro border */}
              <div className="relative shrink-0 w-20 h-24 border-2 border-[#14121c] bg-[#ded2b6] overflow-hidden shadow-[2px_2px_0px_#14121c]">
                <img
                  src={portraitUrl}
                  alt={emp.name}
                  className="w-full h-full object-cover object-top pixelated"
                />
                <span className="absolute bottom-0 right-0 bg-[#14121c] text-white text-[10px] px-1 font-bold">
                  {moodIcon}
                </span>
              </div>

              {/* Name & Title */}
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="font-bold text-sm tracking-wide uppercase truncate text-[#14121c]">
                  {emp.name}
                </span>
                <PixelBadge
                  label={emp.role || 'Engineer'}
                  variant="blue"
                  className="text-[9px] w-fit"
                />
                <span className="text-[10px] text-[#4b4a5e]">
                  Level {Math.round((emp.skills?.technical || 5) / 2)} • {emp.department || 'Engineering'}
                </span>
                <span className="text-[10px] font-bold text-[#3f8f4e]">
                  ${(emp.salary ? emp.salary * 365 : 80000).toLocaleString()}/yr
                </span>
              </div>
            </div>

            {/* Segmented Pixel Vitals */}
            <div className="flex flex-col gap-1.5 bg-[#ded2b6] p-2 border-2 border-[#14121c] mb-3">
              <PixelBar
                value={emp.morale ?? 75}
                color={emp.morale < 35 ? 'red' : emp.morale < 60 ? 'amber' : 'green'}
                size="sm"
                label="Morale"
                icon="☺"
                showNumber
              />
              <PixelBar
                value={emp.energy ?? 80}
                color={emp.energy < 30 ? 'red' : 'blue'}
                size="sm"
                label="Energy"
                icon="⚡"
                showNumber
              />
              <PixelBar
                value={emp.productivity ?? 65}
                color="lime"
                size="sm"
                label="Output"
                icon="⚙"
                showNumber
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-1.5">
              <PixelButton
                size="sm"
                variant="cream"
                icon={<Coffee className="h-3 w-3" />}
                onClick={handleCoffee}
                title="1-on-1 Coffee Chat (+Energy)"
              >
                Coffee
              </PixelButton>

              <PixelButton
                size="sm"
                variant="amber"
                icon={<DollarSign className="h-3 w-3" />}
                onClick={handleBonus}
                title="Give $500 Bonus (+Morale)"
              >
                Bonus
              </PixelButton>

              <PixelButton
                size="sm"
                variant="lime"
                icon={<Award className="h-3 w-3" />}
                onClick={handlePromote}
                title="Promote Employee (+Output)"
              >
                Promote
              </PixelButton>
            </div>
          </div>
        ) : (
          /* Back Side: Dossier / Traits / Obligations */
          <div className="flex flex-col gap-2 text-[11px]">
            <div className="bg-[#ded2b6] p-2 border border-[#14121c]">
              <span className="font-bold uppercase text-[10px] text-[#4b4a5e]">
                Bio / Quirks:
              </span>
              <p className="mt-1 text-[#14121c] leading-tight">
                {emp.bio || 'Fueled by artisanal cold brew and recursive algorithms. Will question Jira tickets politely.'}
              </p>
            </div>

            <div className="bg-[#ded2b6] p-2 border border-[#14121c]">
              <span className="font-bold uppercase text-[10px] text-[#4b4a5e]">
                Current Assignment:
              </span>
              <p className="mt-0.5 text-[#14121c] font-semibold">
                {emp.action ? `Action: ${emp.action}` : 'Working at desk'}
              </p>
            </div>

            <div className="flex justify-between items-center bg-[#ded2b6] p-1.5 border border-[#14121c]">
              <span>Hired:</span>
              <span className="font-bold">Day {emp.hiredDay || 1}</span>
            </div>

            <PixelButton
              size="sm"
              variant="default"
              onClick={() => setShowBackSide(false)}
              className="w-full mt-1"
            >
              Flip Back
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  )
}
