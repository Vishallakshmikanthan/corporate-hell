/**
 * CORPORATE HELL™ — 2.5D Tactical Floorplan Fallback.
 *
 * Ensures 100% playable simulation even when WebGL is unsupported or disabled.
 * Renders an architectural floor plan with animated employee tokens,
 * room divisions, and clickable desks.
 */
import { ROOMS, DESKS, type RoomDef } from '../game/engine/office'
import { useGameStore } from '../state/gameStore'
import { Users, AlertTriangle } from 'lucide-react'

export function TacticalFallback() {
  const employees = useGameStore((s) => s.state?.employees)
  const employeeOrder = useGameStore((s) => s.state?.employeeOrder || [])
  const selectedEmployeeId = useGameStore((s) => s.selectedEmployeeId)
  const selectEmployee = useGameStore((s) => s.selectEmployee)
  const focusRoom = useGameStore((s) => s.focusRoom)
  const equipment = useGameStore((s) => s.state?.equipment)

  // Map coordinate conversion [-11, 11] -> [5%, 95%], [-8, 8] -> [5%, 95%]
  const toXPercent = (x: number) => `${((x + 11) / 22) * 90 + 5}%`
  const toZPercent = (z: number) => `${((z + 8) / 16) * 90 + 5}%`

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950 p-4 select-none">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-ink-900/80 px-3 py-1.5 text-xs text-paper-200 border border-ink-700">
        <Users className="h-4 w-4 text-corp-400" />
        <span>Tactical 2.5D Office Overview (Accessible / Low-Power Mode)</span>
      </div>

      {/* Main Floor Grid Container */}
      <div className="relative mx-auto h-[90%] w-full max-w-5xl rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl overflow-hidden">
        {/* Rooms as architectural zones */}
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
              className="absolute cursor-pointer border border-ink-700/60 transition-colors hover:bg-ink-800/40 p-2 flex flex-col justify-between"
            >
              <span className="text-[10px] font-semibold tracking-wider uppercase text-ink-400">
                {room.label}
              </span>
            </div>
          )
        })}

        {/* Equipment Breakdown Alerts on Map */}
        {equipment?.coffeeMachineBroken && (
          <div
            style={{ left: toXPercent(4.4), top: toZPercent(6.1) }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded bg-alert-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow animate-pulse"
          >
            <AlertTriangle className="h-3 w-3" />
            <span>COFFEE BROKEN</span>
          </div>
        )}

        {equipment?.serverRoomHot && (
          <div
            style={{ left: toXPercent(8.9), top: toZPercent(4.5) }}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded bg-alert-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow animate-pulse"
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
            className="absolute h-5 w-8 -translate-x-1/2 -translate-y-1/2 rounded border border-ink-600 bg-ink-800/60"
          />
        ))}

        {/* Animated Employee Tokens */}
        {employeeOrder.map((id) => {
          const emp = employees?.[id]
          if (!emp || !emp.active) return null
          const isSelected = selectedEmployeeId === emp.id

          return (
            <div
              key={emp.id}
              onClick={(e) => {
                e.stopPropagation()
                selectEmployee(emp.id)
              }}
              style={{
                left: toXPercent(emp.position.x),
                top: toZPercent(emp.position.z),
                transition: 'left 0.4s ease-out, top 0.4s ease-out',
              }}
              className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group`}
            >
              {/* Token Avatar Pin */}
              <div
                style={{ backgroundColor: emp.visual.outfit }}
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow-lg transition-transform group-hover:scale-125 ${
                  isSelected
                    ? 'border-acid-400 scale-125 ring-2 ring-acid-400/50'
                    : 'border-ink-950'
                }`}
              >
                {emp.name.charAt(0)}
              </div>

              {/* Name Tag */}
              <div className="mt-1 rounded bg-ink-950/80 px-1 py-0.2 text-[9px] font-medium text-paper-200 whitespace-nowrap shadow border border-ink-800">
                {emp.name.split(' ')[0]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
