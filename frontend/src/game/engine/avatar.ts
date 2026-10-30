/**
 * CORPORATE HELL™ — Player Avatar, Movement, & Office Interactables Engine.
 *
 * Implements avatar state, WASD movement boundaries, interaction proximity checks,
 * coffee jitters, and office break activities.
 */
import type {
  ActionResult,
  CompanyState,
  PlayerAvatarState,
  PlayerRole,
  Vec2,
} from '../models/types'
import { BOUNDS, clamp } from '../models/types'
import { SeededRandom } from './rng'

export interface InteractableObject {
  id: string
  label: string
  room: string
  position: Vec2
  radius: number
  icon: string
  description: string
  actionHint: string
}

export const OFFICE_INTERACTABLES: InteractableObject[] = [
  {
    id: 'laptop_desk',
    label: 'Developer Laptop & Workstation',
    room: 'open_plan',
    position: { x: -3.5, z: -1.0 },
    radius: 1.6,
    icon: 'laptop',
    description: 'Your mechanical keyboard and high-refresh dual monitors.',
    actionHint: 'Work on assigned ticket or review PRs',
  },
  {
    id: 'coffee_machine',
    label: 'Espresso Barista Machine',
    room: 'pantry',
    position: { x: -6.5, z: -5.5 },
    radius: 1.8,
    icon: 'coffee',
    description: 'Dark roast corporate coffee machine. Restores energy.',
    actionHint: 'Drink fresh coffee (Energy +30)',
  },
  {
    id: 'kanban_wall',
    label: 'Agile Kanban Wall',
    room: 'open_plan',
    position: { x: 0, z: -4.5 },
    radius: 2.0,
    icon: 'clipboard-list',
    description: 'Sprint sticky notes and story points.',
    actionHint: 'View backlog and pick sprint tickets',
  },
  {
    id: 'whiteboard_conference',
    label: 'Conference Whiteboard',
    room: 'conference',
    position: { x: 5.5, z: -4.0 },
    radius: 2.0,
    icon: 'presentation',
    description: 'Architecture diagrams, boxes, and synergy arrows.',
    actionHint: 'Hold sprint planning or retro session',
  },
  {
    id: 'server_rack',
    label: 'Server Room Rack Cluster',
    room: 'server_room',
    position: { x: 6.2, z: 4.8 },
    radius: 2.0,
    icon: 'server',
    description: 'Blinking blue and amber LEDs with cooling fans.',
    actionHint: 'Check AWSome Cloud infrastructure and capacity',
  },
  {
    id: 'gpu_cluster',
    label: 'NVIDIOT GPU Server Cage',
    room: 'server_room',
    position: { x: 7.2, z: 5.8 },
    radius: 2.0,
    icon: 'cpu',
    description: 'Dedicated H100 GPU cluster for deep learning model training.',
    actionHint: 'Rent spot GPUs and train ML models',
  },
  {
    id: 'ceo_desk',
    label: 'Executive CEO Mahogany Desk',
    room: 'ceo_office',
    position: { x: -6.5, z: 4.5 },
    radius: 2.2,
    icon: 'crown',
    description: 'Imported executive desk with investor term sheets.',
    actionHint: 'Review company strategy and pitch investors',
  },
  {
    id: 'ping_pong_table',
    label: 'Break Room Ping-Pong Table',
    room: 'break_room',
    position: { x: 1.0, z: 4.5 },
    radius: 2.2,
    icon: 'activity',
    description: 'Tournament regulation table tennis table.',
    actionHint: 'Play a match with teammates (Stress -20, Morale +20)',
  },
]

export function createInitialAvatar(
  role: PlayerRole = 'developer',
  playerName = 'Alex Vance',
): PlayerAvatarState {
  return {
    role,
    name: playerName,
    visual: {
      skin: '#e2b397',
      hair: '#2c1810',
      outfit: '#3b82f6',
      outfitAccent: '#1d4ed8',
      hairStyle: 'short',
      accessory: 'glasses',
    },
    position: { x: -3.5, z: -1.0 },
    facing: 0,
    cameraMode: 'follow',
    energy: 95,
    focus: 90,
    stress: 20,
    reputationWithTeam: 60,
    coffeesToday: 0,
    skillXP: {
      coding: 250,
      debugging: 180,
      architecture: 120,
      communication: 140,
    },
    perks: ['Keyboard Warrior'],
    currentInteractable: 'laptop_desk',
  }
}

/**
 * Checks which interactive prop the player avatar is standing next to.
 */
export function checkProximityInteractable(pos: Vec2): InteractableObject | null {
  for (const obj of OFFICE_INTERACTABLES) {
    const dx = pos.x - obj.position.x
    const dz = pos.z - obj.position.z
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist <= obj.radius) {
      return obj
    }
  }
  return null
}

/**
 * Validates avatar movement and clamps within office boundary walls.
 */
export function validateAvatarMove(
  current: Vec2,
  delta: Vec2,
): { position: Vec2; facing: number } {
  const nextX = clamp(current.x + delta.x, -7.8, 7.8)
  const nextZ = clamp(current.z + delta.z, -7.8, 7.8)

  let facing = 0
  if (Math.abs(delta.x) > 0.01 || Math.abs(delta.z) > 0.01) {
    facing = Math.atan2(delta.x, delta.z)
  }

  return {
    position: { x: Number(nextX.toFixed(3)), z: Number(nextZ.toFixed(3)) },
    facing,
  }
}

/**
 * Executes break activity for the avatar.
 */
export function executeOfficeBreak(
  state: CompanyState,
  activity: 'coffee' | 'lunch' | 'ping_pong' | 'walk' | 'nap' | 'gossip',
  targetEmployeeId?: string,
  rng?: SeededRandom,
): ActionResult {
  const av = state.playerAvatar
  if (!av) return { ok: false, reason: 'Avatar not initialized.' }

  switch (activity) {
    case 'coffee': {
      av.coffeesToday += 1
      if (av.coffeesToday > 3) {
        // Caffeine jitters!
        av.energy = clamp(av.energy + 15, ...BOUNDS.energy)
        av.focus = clamp(av.focus - 20, 10, 100)
        av.stress = clamp(av.stress + 10, ...BOUNDS.stress)
        return {
          ok: true,
          message: `☕ Cup #${av.coffeesToday} consumed! Caffeine jitters active: Focus -20%, Stress +10%.`,
          effects: ['Caffeine Jitters', 'Focus -20%', 'Energy +15%'],
        }
      }
      av.energy = clamp(av.energy + 30, ...BOUNDS.energy)
      av.focus = clamp(av.focus + 10, 0, 100)
      return {
        ok: true,
        message: '☕ Enjoyed fresh artisan dark roast espresso. Energy +30%, Focus +10%.',
        effects: ['Energy +30%', 'Focus +10%'],
      }
    }

    case 'lunch': {
      av.stress = clamp(av.stress - 15, ...BOUNDS.stress)
      av.energy = clamp(av.energy + 20, ...BOUNDS.energy)
      if (targetEmployeeId && state.employees[targetEmployeeId]) {
        const emp = state.employees[targetEmployeeId]
        emp.morale = clamp(emp.morale + 10, ...BOUNDS.morale)
        av.reputationWithTeam = clamp(av.reputationWithTeam + 5, 0, 100)
      }
      return {
        ok: true,
        message: '🥪 Took lunch break with teammate. Stress -15%, Morale boosted.',
        effects: ['Stress -15%', 'Relationship +10'],
      }
    }

    case 'ping_pong': {
      av.stress = clamp(av.stress - 25, ...BOUNDS.stress)
      av.focus = clamp(av.focus + 15, 0, 100)
      Object.values(state.employees).forEach((e) => {
        if (e.location === 'break_room') {
          e.morale = clamp(e.morale + 8, ...BOUNDS.morale)
        }
      })
      return {
        ok: true,
        message: '🏓 Intense ping-pong rally in the break room! Stress -25%, Focus +15%.',
        effects: ['Stress -25%', 'Focus +15%', 'Team Morale +8%'],
      }
    }

    case 'walk': {
      av.stress = clamp(av.stress - 20, ...BOUNDS.stress)
      av.focus = clamp(av.focus + 20, 0, 100)
      return {
        ok: true,
        message: '🌿 Took a fresh air balcony walk. Mind cleared. Focus +20%, Stress -20%.',
        effects: ['Focus +20%', 'Stress -20%'],
      }
    }

    case 'nap': {
      av.energy = clamp(av.energy + 45, ...BOUNDS.energy)
      const caughtRisk = rng ? rng.boolean(0.2) : false
      if (caughtRisk) {
        av.stress = clamp(av.stress + 15, ...BOUNDS.stress)
        return {
          ok: true,
          message: '😴 Power nap in pod interrupted! The CEO walked past with a disappointed squint. Stress +15%.',
          effects: ['Energy +45%', 'Caught by CEO!'],
        }
      }
      return {
        ok: true,
        message: '😴 20-minute restorative power nap in the napping pod. Energy +45%.',
        effects: ['Energy +45%'],
      }
    }

    case 'gossip': {
      av.reputationWithTeam = clamp(av.reputationWithTeam + 3, 0, 100)
      return {
        ok: true,
        message: '🗣️ Exchanged spicy office gossip by the water cooler. Learned team rumors.',
        effects: ['Reputation +3%'],
      }
    }
  }
}
