/**
 * CORPORATE HELL™ — 2.5D Pixel Art Office Diorama View.
 *
 * Implements a nostalgic isometric 2.5D office floor using the authentic
 * reference diorama artwork (/reference/office_diorama.jpg) and animated
 * reference character sprites (/reference/char_*.jpg) with pixelated UI tokens.
 */
import { ROOMS, DESKS, type RoomDef } from '../game/engine/office'
import { useGameStore } from '../state/gameStore'
import { useUiStore } from '../state/uiStore'
import { EMPLOYEE_REFERENCE_SPRITES } from './characters/EmployeeCharacter'
import { Users, AlertTriangle, Video } from 'lucide-react'

interface Props {
  onSwitchTo3D?: () => void
}

export function TacticalFallback({ onSwitchTo3D }: Props) {
  const employees = useGameStore((s) => s.state?.employees)
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const selectedEmployeeId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const equipment = useGameStore((s) => s.state?.equipment)
  const inspectEmployee = useUiStore((s) => s.inspectEmployee)

  // Map coordinate conversion [-11, 11] -> [8%, 92%], [-8, 8] -> [12%, 88%]
  const toXPercent = (x: number) => `${((x + 11) / 22) * 84 + 8}%`
  const toZPercent = (z: number) => `${((z + 8) / 16) * 76 + 12}%`

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#14121c] p-2 md:p-4 select-none font-mono crt-scanlines">
      {/* Top Controls Header */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[#2a2838] px-3 py-1.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] text-[#f4ecd8] text-xs font-bold uppercase">
          <Users className="h-4 w-4 text-[#8fd3ff]" />
          <span>2.5D Pixel Diorama Mode</span>
        </div>

        {onSwitchTo3D && (
          <button
            onClick={onSwitchTo3D}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3e6ec0] hover:bg-[#4d80d9] text-white text-xs font-bold uppercase border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] cursor-pointer active:top-[1px]"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Switch to 3D View</span>
          </button>
        )}
      </div>

      {/* Main Pixel Diorama Frame */}
      <div className="relative mx-auto h-[94%] w-full max-w-6xl border-4 border-[#14121c] bg-[#1a1824] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Pixel Office Diorama Backdrop from Reference Folder */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85 pointer-events-none"
          style={{
            backgroundImage: "url('/reference/office_diorama.jpg')",
            imageRendering: 'pixelated',
          }}
        />

        {/* Ambient Grid overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#8fd3ff 1px, transparent 1px), radial-gradient(#8fd3ff 1px, #14121c 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Architectural Room Hitboxes */}
        {(Object.values(ROOMS) as RoomDef[]).map((room) => {
          const left = ((room.rect.cx - room.rect.hw + 11) / 22) * 100
          const top = ((room.rect.cz - room.rect.hd + 8) / 16) * 100
          const width = ((room.rect.hw * 2) / 22) * 100
          const height = ((room.rect.hd * 2) / 16) * 100

          return (
            <div
              key={room.id}
              onClick={() => focusRoom(room.id)}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
              className="absolute cursor-pointer border border-[#8fd3ff]/20 hover:border-[#b6e52d]/60 hover:bg-[#b6e52d]/10 transition-colors p-2 flex flex-col justify-start z-10"
              title={`Focus on ${room.label}`}
            >
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#f4ecd8] drop-shadow-[1px_1px_0px_#14121c] bg-[#14121c]/80 px-1 py-0.5 w-fit border border-[#4b4a5e]">
                {room.label}
              </span>
            </div>
          )
        })}

        {/* Equipment Breakdown Alerts on Map */}
        {equipment?.coffeeMachineBroken && (
          <div
            style={{ left: toXPercent(4.4), top: toZPercent(6.1) }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#d9453d] px-2 py-0.5 text-[9px] font-bold text-white border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] animate-pulse"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>COFFEE BROKEN</span>
          </div>
        )}

        {equipment?.serverRoomHot && (
          <div
            style={{ left: toXPercent(8.9), top: toZPercent(4.5) }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#d9453d] px-2 py-0.5 text-[9px] font-bold text-white border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] animate-pulse"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>OVERHEATING</span>
          </div>
        )}

        {/* Desks */}
        {DESKS.map((d, i) => (
          <div
            key={i}
            style={{ left: toXPercent(d.x), top: toZPercent(d.z) }}
            className="absolute h-5 w-8 -translate-x-1/2 -translate-y-1/2 border border-[#4b4a5e] bg-[#2a2838]/70 shadow-[1px_1px_0px_#14121c] z-10 pointer-events-none"
          />
        ))}

        {/* Animated Employee Character Sprites from Reference */}
        {employeeOrder.map((id) => {
          const emp = employees?.[id]
          if (!emp || !emp.active) return null
          const isSelected = selectedEmployeeId === emp.id
          const spriteImg = EMPLOYEE_REFERENCE_SPRITES[emp.id] || '/reference/char_graphic_tee.jpg'

          return (
            <div
              key={emp.id}
              onClick={(e) => {
                e.stopPropagation()
                selectEmployee(emp.id)
                inspectEmployee(emp.id)
              }}
              style={{
                left: toXPercent(emp.position.x),
                top: toZPercent(emp.position.z),
                transition: 'left 0.4s ease-out, top 0.4s ease-out',
              }}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group pointer-events-auto select-none"
            >
              {/* Employee Sprite Avatar Pin with Reference Image */}
              <div
                className={`relative h-10 w-10 border-2 overflow-hidden shadow-[2px_2px_0px_#14121c] transition-transform group-hover:scale-125 ${
                  isSelected
                    ? 'border-[#fabc3c] scale-125 ring-2 ring-[#fabc3c]'
                    : 'border-[#14121c] bg-[#2a2838]'
                }`}
              >
                <img
                  src={spriteImg}
                  alt={emp.name}
                  className="h-full w-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Pixel Name Tag */}
              <div className="mt-1 bg-[#14121c] px-1.5 py-0.2 text-[9px] font-bold text-[#f4ecd8] border border-[#4b4a5e] shadow-[1px_1px_0px_#14121c] whitespace-nowrap">
                {emp.name.split(' ')[0]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
