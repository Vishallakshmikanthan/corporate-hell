/**
 * CORPORATE HELL™ — CorpOS Team Roster App (Section 6).
 *
 * Grid of pixel ID photos with live mood emotes, vitals,
 * and direct links to open the pixel ID badge inspector.
 */
import React from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Users, Coffee, DollarSign, Award, ChevronRight } from 'lucide-react'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { PixelBar } from '../../ui/pixel/PixelBar'
import { audio } from '../../services/audio'

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

export const TeamApp: React.FC = () => {
  const employees = useGameStore((s) => s.state?.employees || {})
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const inspectEmployee = useUiStore((s) => s.inspectEmployee)

  const activeEmployees = employeeOrder
    .map((id) => employees[id])
    .filter((e) => e && e.active)

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#8fd3ff]" />
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            Company Directory ({activeEmployees.length} Teammates)
          </span>
        </div>
        <span className="text-[10px] text-[#ded2b6]">
          Click any employee to open their Clip-On ID Pass
        </span>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Grid of Pixel ID Photo Cards */}
      {/* ----------------------------------------------------------- */}
      <div className="flex-1 bg-[#14121c] p-3 border-2 border-[#4b4a5e] overflow-y-auto pixel-scrollbar">
        <div className="grid grid-cols-3 gap-3">
          {activeEmployees.map((emp) => {
            const portraitUrl = getEmployeePortrait(emp)
            const moodKey = emp.morale > 75 ? 'happy' : emp.morale > 45 ? 'neutral' : emp.stress > 70 ? 'stressed' : 'exhausted'
            const moodEmoji = {
              happy: '☺',
              neutral: '😐',
              stressed: '💢',
              exhausted: '💤',
            }[moodKey] || '☺'

            return (
              <div
                key={emp.id}
                onClick={() => {
                  audio.playClick()
                  inspectEmployee(emp.id)
                }}
                className="flex items-center gap-3 p-2.5 bg-[#2a2838] border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c] hover:border-[#b6e52d] cursor-pointer group active:top-[1px]"
              >
                {/* Photo */}
                <div className="relative shrink-0 w-14 h-18 border-2 border-[#14121c] bg-[#14121c] overflow-hidden">
                  <img
                    src={portraitUrl}
                    alt={emp.name}
                    className="w-full h-full object-cover object-top pixelated"
                  />
                  <span className="absolute bottom-0 right-0 bg-[#14121c] text-[9px] px-1 font-bold">
                    {moodEmoji}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-bold text-xs text-[#f4ecd8] uppercase truncate group-hover:text-[#b6e52d]">
                    {emp.name}
                  </span>
                  <span className="text-[9px] text-[#8fd3ff] truncate">
                    {emp.role || 'Software Engineer'}
                  </span>
                  <div className="my-1">
                    <PixelBar
                      value={emp.morale ?? 75}
                      color={emp.morale < 40 ? 'red' : 'green'}
                      size="sm"
                    />
                  </div>
                  <span className="text-[9px] text-[#ded2b6]">
                    Output: {emp.productivity ?? 70}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
