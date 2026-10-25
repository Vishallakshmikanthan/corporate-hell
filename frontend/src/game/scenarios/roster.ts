/**
 * Starting roster: 13 named employees covering all 10 archetypes
 * (three archetypes appear twice with different data, proving the
 * characters are data-driven variations rather than bespoke builds).
 */
import type { ArchetypeId, Department, EmployeeVisual, Role, Skills } from '../models/types'

export interface RosterEntry {
  id: string
  name: string
  role: Role
  department: Department
  archetype: ArchetypeId
  bio: string
  skills: Skills
  ambition: number
  morale: number
  stress: number
  trust: number
  visual: EmployeeVisual
}

export const STARTING_ROSTER: RosterEntry[] = [
  {
    id: 'emp_deborah',
    name: 'Deborah Overbyte',
    role: 'manager',
    department: 'operations',
    archetype: 'meeting_addict',
    bio: 'Has never encountered a problem that couldn\u2019t be solved by scheduling another problem. Owns four calendars.',
    skills: { focus: 4, communication: 9, technical: 3, creativity: 5, leadership: 6 },
    ambition: 70,
    morale: 72,
    stress: 38,
    trust: 62,
    visual: {
      skin: '#e8b98a',
      hair: '#7c4a21',
      outfit: '#4f6df0',
      outfitAccent: '#3d55cf',
      hairStyle: 'bun',
      accessory: 'badge',
    },
  },
  {
    id: 'emp_chad',
    name: 'Chad Sterling',
    role: 'senior',
    department: 'sales',
    archetype: 'bootlicker',
    bio: 'Agrees with you before you finish your sentence. Keeps a spreadsheet of executive compliments received.',
    skills: { focus: 5, communication: 8, technical: 3, creativity: 6, leadership: 4 },
    ambition: 85,
    morale: 68,
    stress: 32,
    trust: 74,
    visual: {
      skin: '#f0cfa0',
      hair: '#c9a24b',
      outfit: '#2f6b4f',
      outfitAccent: '#1f4a37',
      hairStyle: 'short',
      accessory: 'tie',
    },
  },
  {
    id: 'emp_yuki',
    name: 'Yuki Tanaka',
    role: 'senior',
    department: 'engineering',
    archetype: 'silent_genius',
    bio: 'Shipped the entire platform. Attended zero meetings about it. Replies in one-liners or merged pull requests.',
    skills: { focus: 10, communication: 2, technical: 10, creativity: 8, leadership: 3 },
    ambition: 40,
    morale: 66,
    stress: 44,
    trust: 55,
    visual: {
      skin: '#f2d3b3',
      hair: '#20242c',
      outfit: '#3a3f4b',
      outfitAccent: '#565c69',
      hairStyle: 'long',
      accessory: 'headphones',
    },
  },
  {
    id: 'emp_gary',
    name: 'Gary Sparks',
    role: 'specialist',
    department: 'marketing',
    archetype: 'linkedin_speaker',
    bio: 'Thinks outside the box. Lives outside the deliverables. Has 14k followers and zero completed Q3 tasks.',
    skills: { focus: 3, communication: 9, technical: 2, creativity: 8, leadership: 4 },
    ambition: 60,
    morale: 78,
    stress: 22,
    trust: 58,
    visual: {
      skin: '#caa27e',
      hair: '#8a5a2b',
      outfit: '#e8a33d',
      outfitAccent: '#cf8521',
      hairStyle: 'spiky',
      accessory: 'none',
    },
  },
  {
    id: 'emp_priya',
    name: 'Priya Nair',
    role: 'specialist',
    department: 'engineering',
    archetype: 'procrastinator',
    bio: 'Performs exclusively between \u201Coh no\u201D and \u201Cit\u2019s due\u201D. Legend of the 4:45 PM miracle.',
    skills: { focus: 6, communication: 5, technical: 8, creativity: 7, leadership: 2 },
    ambition: 55,
    morale: 70,
    stress: 35,
    trust: 60,
    visual: {
      skin: '#c98f63',
      hair: '#16181d',
      outfit: '#b8e04a',
      outfitAccent: '#97c62e',
      hairStyle: 'ponytail',
      accessory: 'glasses',
    },
  },
  {
    id: 'emp_sandra',
    name: 'Sandra Keller',
    role: 'specialist',
    department: 'hr',
    archetype: 'gossip',
    bio: 'Knows everyone\u2019s salary. Including yours. Especially yours. Runs the shadow communication network.',
    skills: { focus: 4, communication: 9, technical: 2, creativity: 6, leadership: 5 },
    ambition: 45,
    morale: 74,
    stress: 28,
    trust: 66,
    visual: {
      skin: '#f5d9b8',
      hair: '#a33d2e',
      outfit: '#e25848',
      outfitAccent: '#c74234',
      hairStyle: 'long',
      accessory: 'none',
    },
  },
  {
    id: 'emp_marcus',
    name: 'Marcus Vane',
    role: 'manager',
    department: 'sales',
    archetype: 'kpi_manipulator',
    bio: 'His dashboards go up. His contributions go... elsewhere. Believes reality is a rounding error.',
    skills: { focus: 6, communication: 7, technical: 5, creativity: 7, leadership: 5 },
    ambition: 80,
    morale: 64,
    stress: 40,
    trust: 70,
    visual: {
      skin: '#8f5b3c',
      hair: '#101114',
      outfit: '#21242b',
      outfitAccent: '#e8a33d',
      hairStyle: 'short',
      accessory: 'tie',
    },
  },
  {
    id: 'emp_ellen',
    name: 'Ellen Wang',
    role: 'senior',
    department: 'operations',
    archetype: 'burnout_veteran',
    bio: 'Been here through four rebrands. Remembers all of them. Runs on coffee and institutional memory.',
    skills: { focus: 8, communication: 6, technical: 7, creativity: 4, leadership: 7 },
    ambition: 30,
    morale: 52,
    stress: 62,
    trust: 48,
    visual: {
      skin: '#e9c194',
      hair: '#565c69',
      outfit: '#6d87f7',
      outfitAccent: '#4f6df0',
      hairStyle: 'bun',
      accessory: 'glasses',
    },
  },
  {
    id: 'emp_preston',
    name: 'Preston Whitfield IV',
    role: 'manager',
    department: 'marketing',
    archetype: 'unnecessary_manager',
    bio: 'Delegates upwards, downwards, and occasionally to himself. Squats in the CEO office \u201Cwhile you travel\u201D.',
    skills: { focus: 2, communication: 7, technical: 2, creativity: 5, leadership: 6 },
    ambition: 65,
    morale: 70,
    stress: 26,
    trust: 66,
    visual: {
      skin: '#f2d3b3',
      hair: '#c9a24b',
      outfit: '#4f6df0',
      outfitAccent: '#8ba3ff',
      hairStyle: 'short',
      accessory: 'tie',
    },
  },
  {
    id: 'emp_kevin',
    name: 'Kevin Byte',
    role: 'junior',
    department: 'engineering',
    archetype: 'ai_evangelist',
    bio: 'Wants to automate standup. Then standups about standups. Then, conceptually, himself.',
    skills: { focus: 6, communication: 6, technical: 7, creativity: 8, leadership: 2 },
    ambition: 58,
    morale: 82,
    stress: 18,
    trust: 60,
    visual: {
      skin: '#d9a06b',
      hair: '#3a2a18',
      outfit: '#97c62e',
      outfitAccent: '#b8e04a',
      hairStyle: 'spiky',
      accessory: 'none',
    },
  },
  {
    id: 'emp_nadia',
    name: 'Nadia Petrov',
    role: 'junior',
    department: 'engineering',
    archetype: 'silent_genius',
    bio: 'Communicates exclusively in pull requests. Has unmerged opinions about everything.',
    skills: { focus: 9, communication: 3, technical: 9, creativity: 7, leadership: 2 },
    ambition: 44,
    morale: 63,
    stress: 47,
    trust: 52,
    visual: {
      skin: '#f5dbc0',
      hair: '#7c4a21',
      outfit: '#3a3f4b',
      outfitAccent: '#8ba3ff',
      hairStyle: 'ponytail',
      accessory: 'none',
    },
  },
  {
    id: 'emp_steve',
    name: 'Steve Bhattacharya',
    role: 'specialist',
    department: 'operations',
    archetype: 'procrastinator',
    bio: 'Will absolutely start that report. After coffee. After the second coffee. After the deadline.',
    skills: { focus: 5, communication: 6, technical: 6, creativity: 5, leadership: 3 },
    ambition: 38,
    morale: 61,
    stress: 41,
    trust: 57,
    visual: {
      skin: '#b5794a',
      hair: '#16181d',
      outfit: '#e8a33d',
      outfitAccent: '#f5c66b',
      hairStyle: 'bald',
      accessory: 'beard',
    },
  },
  {
    id: 'emp_bianca',
    name: 'Bianca Reyes',
    role: 'intern',
    department: 'hr',
    archetype: 'gossip',
    bio: 'Currently interning in three departments simultaneously. Nobody remembers hiring her. She has a badge though.',
    skills: { focus: 4, communication: 8, technical: 3, creativity: 7, leadership: 2 },
    ambition: 66,
    morale: 88,
    stress: 14,
    trust: 60,
    visual: {
      skin: '#caa27e',
      hair: '#16181d',
      outfit: '#d3f26a',
      outfitAccent: '#b8e04a',
      hairStyle: 'bun',
      accessory: 'badge',
    },
  },
]

/** Name pools for procedurally hired employees. */
export const FIRST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Riley', 'Quinn', 'Avery', 'Dana', 'Kai', 'Robin', 'Charlie',
  'Minh', 'Aisha', 'Dmitri', 'Ines', 'Tobias', 'Priyanka', 'Hana', 'Diego', 'Zoe', 'Omar',
  'Sofia', 'Felix', 'Amara', 'Jonas', 'Leila', 'Marcus', 'Nina', 'Oscar', 'Petra', 'Viktor',
]

export const LAST_NAMES = [
  'Blunderbuss', 'Cardholder', 'Deadline', 'Envelope', 'Flowchart', 'Gridlock', 'Havisham',
  'Inbox', 'Jargonspeaker', 'Kumbaya', 'Ledger', 'Mandatory', 'Nudgeworthy', 'Offsite',
  'Powerpoint', 'Quarterly', 'Rockslide', 'Standup', 'Template', 'Uplift',
  'Vandergrind', 'Watercooler', 'Xerox', 'Yesman', 'Zilch',
]

export const HIRE_ARCHETYPE_POOL: ArchetypeId[] = [
  'meeting_addict', 'bootlicker', 'silent_genius', 'linkedin_speaker', 'procrastinator',
  'gossip', 'kpi_manipulator', 'burnout_veteran', 'unnecessary_manager', 'ai_evangelist',
]

export const SKIN_TONES = ['#f5dbc0', '#e8b98a', '#d9a06b', '#b5794a', '#8f5b3c', '#6e4428', '#caa27e', '#c98f63']
export const HAIR_COLORS = ['#16181d', '#3a2a18', '#7c4a21', '#c9a24b', '#a33d2e', '#565c69', '#20242c']
export const OUTFIT_COLORS = [
  '#4f6df0', '#6d87f7', '#2f6b4f', '#3a3f4b', '#b8e04a', '#e8a33d', '#e25848',
  '#97c62e', '#8ba3ff', '#21242b', '#d3f26a', '#cf8521',
]
export const HAIR_STYLES: EmployeeVisual['hairStyle'][] = ['short', 'bun', 'long', 'ponytail', 'spiky', 'bald']
export const ACCESSORIES: EmployeeVisual['accessory'][] = ['none', 'glasses', 'tie', 'headphones', 'badge', 'beard']
