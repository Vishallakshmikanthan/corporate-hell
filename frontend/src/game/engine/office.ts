/**
 * Office layout: rooms, desks, standing spots and a waypoint navigation graph.
 *
 * Coordinates: x ∈ [-11, 11] (west→east), z ∈ [-8, 8] (south→north).
 * The 3D scene renders this exact layout; the engine moves employees along
 * the same graph so visuals and simulation never disagree.
 */
import type { RoomId, Vec2 } from '../models/types'

export interface Rect {
  cx: number
  cz: number
  hw: number
  hd: number
}

export interface RoomDef {
  id: RoomId
  label: string
  rect: Rect
  accent: string
  focus: { position: [number, number, number]; target: [number, number, number] }
}

export const OFFICE_HALF_W = 11
export const OFFICE_HALF_D = 8

export const ROOMS: Record<RoomId, RoomDef> = {
  open_plan: {
    id: 'open_plan',
    label: 'Open Plan',
    rect: { cx: -0.5, cz: 0, hw: 7.5, hd: 3.2 },
    accent: '#8ba3ff',
    focus: { position: [10, 12.5, 14], target: [0, 0.4, 0] },
  },
  reception: {
    id: 'reception',
    label: 'Reception',
    rect: { cx: -8.25, cz: -5.75, hw: 2.25, hd: 1.75 },
    accent: '#d3f26a',
    focus: { position: [-13.5, 7.5, 1.5], target: [-8.25, 0.4, -5.75] },
  },
  ceo_office: {
    id: 'ceo_office',
    label: 'CEO Office',
    rect: { cx: 8.25, cz: -5.75, hw: 2.25, hd: 1.75 },
    accent: '#f5c66b',
    focus: { position: [14, 7.5, 1.5], target: [8.25, 0.4, -5.75] },
  },
  conference: {
    id: 'conference',
    label: 'Conference Room',
    rect: { cx: -7.75, cz: 5.9, hw: 2.75, hd: 1.6 },
    accent: '#6d87f7',
    focus: { position: [-13, 8.5, 12.5], target: [-7.75, 0.4, 5.9] },
  },
  break_room: {
    id: 'break_room',
    label: 'Break Room',
    rect: { cx: -0.5, cz: 6.1, hw: 2.1, hd: 1.6 },
    accent: '#b8e04a',
    focus: { position: [-2, 8, 14], target: [-0.5, 0.4, 6.1] },
  },
  pantry: {
    id: 'pantry',
    label: 'Pantry',
    rect: { cx: 4.4, cz: 6.1, hw: 2.1, hd: 1.6 },
    accent: '#e8a33d',
    focus: { position: [4.5, 8, 14.5], target: [4.4, 0.4, 6.1] },
  },
  server_room: {
    id: 'server_room',
    label: 'Server Room',
    rect: { cx: 8.9, cz: 4.5, hw: 1.6, hd: 3 },
    accent: '#9aa3b2',
    focus: { position: [15, 7, 10.5], target: [8.9, 0.4, 4.5] },
  },
}

/** Which room contains a point (open plan is the fallback corridor space). */
export function roomAtPoint(x: number, z: number): RoomId {
  for (const id of ['reception', 'ceo_office', 'conference', 'break_room', 'pantry', 'server_room'] as RoomId[]) {
    const r = ROOMS[id].rect
    if (Math.abs(x - r.cx) <= r.hw && Math.abs(z - r.cz) <= r.hd) return id
  }
  return 'open_plan'
}

// ---------------------------------------------------------------------------
// Desks
// ---------------------------------------------------------------------------

export interface DeskDef {
  index: number
  x: number
  z: number
  roomId: RoomId
  kind: 'cubicle' | 'exec' | 'reception'
  /** Chair / seat offsets relative to the desk (first is the main seat). */
  seatOffsets: Vec2[]
}

const CUBICLE_SEATS: Vec2[] = [
  { x: 0, z: -0.95 },
  { x: 1.15, z: -0.55 },
  { x: -1.15, z: -0.55 },
  { x: 0, z: -1.9 },
]

export const DESKS: DeskDef[] = [
  // open-plan cubicles: 2 rows × 4 columns
  ...[-6.9, -3.2, 0.5, 4.2].flatMap((x) =>
    [-1.8, 1.6].map(
      (z, row): DeskDef => ({
        index: 0,
        x,
        z,
        roomId: 'open_plan',
        kind: 'cubicle',
        seatOffsets: CUBICLE_SEATS.map((o) => ({ x: o.x, z: row === 0 ? o.z : o.z })),
      }),
    ),
  ),
  { index: -1, x: 8.6, z: -6.4, roomId: 'ceo_office', kind: 'exec', seatOffsets: [{ x: 0, z: -0.95 }] },
  { index: -2, x: -8.25, z: -6.5, roomId: 'reception', kind: 'reception', seatOffsets: [{ x: 0, z: -0.85 }] },
]

// fix desk indices (0..7 cubicles, 8 exec, 9 reception)
DESKS.forEach((d, i) => (d.index = i))

export const EXEC_DESK = 8
export const RECEPTION_DESK = 9

/** Absolute seat position for a desk slot. */
export function deskSeat(deskIndex: number, slot = 0): Vec2 {
  const desk = DESKS[deskIndex]
  if (!desk) return { x: 0, z: 0 }
  const off = desk.seatOffsets[slot % desk.seatOffsets.length]
  if (!off) return { x: desk.x, z: desk.z }
  return { x: desk.x + off.x, z: desk.z + off.z }
}

// ---------------------------------------------------------------------------
// Standing spots per room (chat, gossip, breaks, meetings...)
// ---------------------------------------------------------------------------

export const CONFERENCE_CHAIRS: Vec2[] = [
  ...[-1.65, -0.55, 0.55, 1.65].map((dx): Vec2 => ({ x: -7.75 + dx, z: 6.85 })),
  ...[-1.65, -0.55, 0.55, 1.65].map((dx): Vec2 => ({ x: -7.75 + dx, z: 4.95 })),
]

const ROOM_SPOTS: Record<RoomId, Vec2[]> = {
  open_plan: [
    { x: -5.05, z: -3.1 },
    { x: -1.35, z: -3.1 },
    { x: 2.35, z: -3.1 },
    { x: -5.05, z: 0.65 },
    { x: -1.35, z: 0.65 },
    { x: 2.35, z: 0.65 },
    { x: 6.4, z: 2.4 },
    { x: 6.4, z: -2.4 },
  ],
  reception: [
    { x: -8.25, z: -7.35 },
    { x: -9.6, z: -5 },
    { x: -6.8, z: -4.7 },
  ],
  ceo_office: [
    { x: 8.6, z: -7.35 },
    { x: 8.6, z: -5.35 },
    { x: 6.9, z: -4.6 },
  ],
  conference: CONFERENCE_CHAIRS,
  break_room: [
    { x: -1.7, z: 6.95 },
    { x: 0.6, z: 6.95 },
    { x: 0, z: 5.5 },
    { x: -2, z: 5.6 },
    { x: 1.2, z: 5.6 },
  ],
  pantry: [
    { x: 3.2, z: 6.6 },
    { x: 5.2, z: 6.6 },
    { x: 4.4, z: 5.6 },
    { x: 2.6, z: 5.6 },
  ],
  server_room: [
    { x: 8.9, z: 2.2 },
    { x: 8.9, z: 5.9 },
  ],
}

/** Deterministic standing spot in a room (index wraps). */
export function spotInRoom(roomId: RoomId, index: number): Vec2 {
  const spots = ROOM_SPOTS[roomId]
  return spots[((index % spots.length) + spots.length) % spots.length]
}

export const COFFEE_SPOT: Vec2 = { x: 3.2, z: 6.6 }
export const PRINTER_POS: Vec2 = { x: 6.55, z: 3.0 }

// ---------------------------------------------------------------------------
// Waypoint navigation graph
// ---------------------------------------------------------------------------

interface GraphNode extends Vec2 {
  edges: number[]
}

const VERTICAL_XS = [-9.3, -5.05, -1.35, 2.35, 7.2]
const SOUTH_Z = -3.6
const NORTH_Z = 3.85
const MID_Z = 0.65

function buildGraph(): GraphNode[] {
  const nodes: GraphNode[] = []
  const add = (x: number, z: number): number => {
    nodes.push({ x, z, edges: [] })
    return nodes.length - 1
  }
  const link = (a: number, b: number) => {
    nodes[a].edges.push(b)
    nodes[b].edges.push(a)
  }

  const south = VERTICAL_XS.map((x) => add(x, SOUTH_Z))
  const north = VERTICAL_XS.map((x) => add(x, NORTH_Z))
  const mid = [1, 2, 3].map((i) => add(VERTICAL_XS[i], MID_Z)) // walkway between cubicle rows

  for (let i = 0; i < south.length - 1; i++) link(south[i], south[i + 1])
  for (let i = 0; i < north.length - 1; i++) link(north[i], north[i + 1])
  for (let i = 0; i < VERTICAL_XS.length; i++) link(south[i], north[i])
  // mid walkway connections (gaps between desk columns)
  for (let k = 0; k < mid.length; k++) {
    link(mid[k], south[k + 1])
    link(mid[k], north[k + 1])
  }

  // room centers
  const reception = add(-8.25, -5.4)
  link(reception, south[0])
  const ceo = add(8.25, -5.4)
  link(ceo, south[4])
  const conference = add(-7.75, 5.9)
  link(conference, north[0])
  link(conference, north[1])
  const breakRoom = add(-0.5, 6.1)
  link(breakRoom, north[2])
  const pantry = add(4.4, 6.1)
  link(pantry, north[3])
  const server = add(8.9, 4.5)
  link(server, north[4])
  const openPlanCenter = add(-0.5, 0)
  link(openPlanCenter, south[1])
  link(openPlanCenter, south[2])
  link(openPlanCenter, mid[0])
  link(openPlanCenter, mid[1])
  link(openPlanCenter, mid[2])

  // Desk seats connect to the nearest walkway node.
  // Row A (z=-1.8): connects to the south spine at the nearest gap.
  // Row B (z=1.6): connects to the mid walkway at the nearest gap.
  const gapForColumn = (x: number): number => {
    const gaps = [-5.05, -1.35, 2.35]
    let best = 0
    let bestD = Infinity
    gaps.forEach((g, i) => {
      const d = Math.abs(g - x)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }
  DESKS.forEach((desk, deskIdx) => {
    if (desk.kind !== 'cubicle') return
    const row = desk.z > 0 ? 1 : 0
    const gap = gapForColumn(desk.x)
    const seat = add(deskSeat(deskIdx, 0).x, deskSeat(deskIdx, 0).z)
    if (row === 0) link(seat, south[gap + 1])
    else link(seat, mid[gap])
  })
  const execSeat = add(deskSeat(EXEC_DESK, 0).x, deskSeat(EXEC_DESK, 0).z)
  link(execSeat, ceo)
  const receptionSeat = add(deskSeat(RECEPTION_DESK, 0).x, deskSeat(RECEPTION_DESK, 0).z)
  link(receptionSeat, reception)

  return nodes
}

export const NAV_GRAPH: GraphNode[] = buildGraph()

function nearestNode(x: number, z: number): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < NAV_GRAPH.length; i++) {
    const n = NAV_GRAPH[i]
    const d = (n.x - x) * (n.x - x) + (n.z - z) * (n.z - z)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

/** BFS shortest path (by hops) between two graph nodes. */
function bfs(from: number, to: number): number[] {
  if (from === to) return [from]
  const prev = new Int32Array(NAV_GRAPH.length).fill(-1)
  const visited = new Uint8Array(NAV_GRAPH.length)
  const queue: number[] = [from]
  visited[from] = 1
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const next of NAV_GRAPH[cur].edges) {
      if (visited[next]) continue
      visited[next] = 1
      prev[next] = cur
      if (next === to) {
        const path: number[] = [to]
        let p = cur
        while (p !== from && p !== -1) {
          path.unshift(p)
          p = prev[p]
        }
        return path
      }
      queue.push(next)
    }
  }
  return [from]
}

/**
 * Full walking path between two arbitrary points: start → nearest node →
 * BFS hops → nearest node to destination → destination. Employees never
 * teleport; they always traverse these polylines.
 */
export function findPath(from: Vec2, to: Vec2): Vec2[] {
  const startNode = nearestNode(from.x, from.z)
  const endNode = nearestNode(to.x, to.z)
  const hops = bfs(startNode, endNode)
  const path: Vec2[] = [{ x: from.x, z: from.z }]
  for (const n of hops) path.push({ x: NAV_GRAPH[n].x, z: NAV_GRAPH[n].z })
  // drop the last hop if the destination is closer to the previous point
  if (path.length > 2) {
    const lastNode = path[path.length - 1]
    const prevPoint = path[path.length - 2]
    const dViaNode = dist(prevPoint, lastNode) + dist(lastNode, to)
    const dDirect = dist(prevPoint, to)
    if (dDirect < dViaNode) path.pop()
  }
  path.push({ x: to.x, z: to.z })
  // collapse duplicates
  const out: Vec2[] = []
  for (const p of path) {
    const last = out[out.length - 1]
    if (!last || Math.abs(last.x - p.x) > 1e-6 || Math.abs(last.z - p.z) > 1e-6) out.push(p)
  }
  return out
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

/** Walking speed in office-units per 15-minute tick. */
export const WALK_SPEED = 3.6

/** Default cinematic camera. */
export const DEFAULT_CAMERA = {
  position: [13, 12.5, 15] as [number, number, number],
  target: [0, 0.4, 0] as [number, number, number],
}
