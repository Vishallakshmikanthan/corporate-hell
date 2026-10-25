/**
 * Employee archetype definitions — data-driven behavior tuning.
 *
 * Every employee behavior difference flows from this table plus their skills,
 * so character diversity comes from data rather than bespoke implementations.
 */
import type { ActionKind, ArchetypeId, PersonalGoal } from '../models/types'

export interface ArchetypeDef {
  id: ArchetypeId
  label: string
  tagline: string
  description: string
  strengths: string[]
  weaknesses: string[]
  /** Utility-score modifiers per action kind. */
  actionBias: Partial<Record<ActionKind, number>>
  meetingLove: number
  socialBias: number
  coffeeBias: number
  gossipChance: number
  stressSensitivity: number
  moraleVolatility: number
  outputMultiplier: number
  /** Share of "output" that becomes fake KPI inflation instead of project points. */
  fakeOutputShare: number
  trustDrift: number
  persona: string
  thoughts: string[]
  lines: string[]
  goalTemplates: { description: string; type: PersonalGoal['type']; target: number }[]
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDef> = {
  meeting_addict: {
    id: 'meeting_addict',
    label: 'The Meeting Addict',
    tagline: 'Every problem is a calendar invite waiting to happen.',
    description:
      'Solves every problem by scheduling another meeting. Consumes time and occasionally improves coordination.',
    strengths: ['Coordination', 'Always reachable'],
    weaknesses: ['Consumes everyone\u2019s calendar', 'Decisions happen later'],
    actionBias: { work: -3, chat: 2, meeting: 14, help: -2, procrastinate: -1 },
    meetingLove: 16,
    socialBias: 4,
    coffeeBias: 1,
    gossipChance: 0.08,
    stressSensitivity: 1.0,
    moraleVolatility: 0.8,
    outputMultiplier: 0.9,
    fakeOutputShare: 0.1,
    trustDrift: 0.05,
    persona:
      'You are a chronically over-scheduling middle manager who believes no problem exists until it has a recurring calendar invite. You speak in agenda items.',
    thoughts: [
      'This could be an agenda item.',
      'We should align on alignment.',
      'Great point \u2014 let\u2019s take this offline. Into a meeting.',
      'I feel productive just scheduling this.',
      'Could this be a weekly sync?',
    ],
    lines: [
      'Let\u2019s circle back in a dedicated session.',
      'I\u2019ve put 30 minutes on everyone\u2019s calendar. You\u2019re welcome.',
      'We don\u2019t have a meeting problem. We have a meeting-about-meetings problem.',
      'Action item: schedule another action item.',
    ],
    goalTemplates: [
      { description: 'Chair at least 6 meetings', type: 'meetings', target: 6 },
      { description: 'Get promoted to a bigger calendar', type: 'promotion', target: 1 },
    ],
  },
  bootlicker: {
    id: 'bootlicker',
    label: 'The Corporate Bootlicker',
    tagline: 'Agrees with you before you finish the sentence.',
    description:
      'Tries to impress leadership. May improve executive relationships while damaging peer trust.',
    strengths: ['Executive visibility', 'Never contradicts the boss'],
    weaknesses: ['Peer trust', 'Adds little real work'],
    actionBias: { work: 1, chat: 3, meeting: 5, gossip: 1 },
    meetingLove: 6,
    socialBias: 6,
    coffeeBias: 2,
    gossipChance: 0.1,
    stressSensitivity: 1.1,
    moraleVolatility: 1.2,
    outputMultiplier: 0.85,
    fakeOutputShare: 0.15,
    trustDrift: 0.15,
    persona:
      'You are an ambitious sycophant who praises every decision from above, quotes the CEO in third person, and treats peers as competition for attention.',
    thoughts: [
      'The CEO would love this. Whatever this is.',
      'Adding this to my \u201Cvisible contributions\u201D folder.',
      'My peers just don\u2019t understand strategic alignment.',
      'Per my last compliment to leadership...',
    ],
    lines: [
      'Brilliant initiative, truly. I\u2019ll circulate my support in writing.',
      'Leadership\u2019s vision is really crystallizing this quarter.',
      'I already volunteered our team. Synergy!',
      'I told the execs it was my idea. Our idea. Mine.',
    ],
    goalTemplates: [
      { description: 'Be mentioned favorably in an exec meeting', type: 'social', target: 1 },
      { description: 'Get promoted to Senior Bootlicker', type: 'promotion', target: 1 },
    ],
  },
  silent_genius: {
    id: 'silent_genius',
    label: 'The Silent Genius',
    tagline: 'Shipped the platform. Attended zero meetings about it.',
    description:
      'Highly skilled but avoids unnecessary communication. Can produce excellent results when given uninterrupted time.',
    strengths: ['Deep focus', 'Exceptional output'],
    weaknesses: ['Visibility', 'Meetings, email, status updates'],
    actionBias: { work: 8, chat: -6, meeting: -8, gossip: -4, help: 2, escalate: -4 },
    meetingLove: -10,
    socialBias: -8,
    coffeeBias: 2,
    gossipChance: 0.02,
    stressSensitivity: 1.3,
    moraleVolatility: 0.7,
    outputMultiplier: 1.5,
    fakeOutputShare: 0,
    trustDrift: -0.02,
    persona:
      'You are a brilliant engineer who communicates in one-line replies and ship logs. Small talk physically hurts you. Interruptions are crimes.',
    thoughts: [
      'If I reply to this thread it will spawn four more.',
      'Flow state detected. Do not disturb.',
      'This could be solved in 20 lines and zero meetings.',
      'Why is there a meeting about the meeting?',
      'Muting this conversation forever.',
    ],
    lines: [
      'Ship it and apologize never.',
      'I\u2019ll be at my desk. Which is where the work happens.',
      'No notes. The code is the documentation.',
      'Could\u2019ve been an email. Should\u2019ve been nothing.',
    ],
    goalTemplates: [
      { description: 'Ship something quietly legendary', type: 'skill', target: 10 },
      { description: 'Survive one full week without small talk', type: 'survival', target: 5 },
    ],
  },
  linkedin_speaker: {
    id: 'linkedin_speaker',
    label: 'The LinkedIn Motivational Speaker',
    tagline: 'Thinks outside the box. Lives outside the deliverables.',
    description:
      'Generates endless inspirational corporate language. Occasionally boosts morale, often wastes time.',
    strengths: ['Morale boosts', 'Personal branding'],
    weaknesses: ['Deliverables', 'Actual output'],
    actionBias: { work: -2, chat: 5, coffee: 2, procrastinate: 4, personal: 4 },
    meetingLove: 4,
    socialBias: 8,
    coffeeBias: 3,
    gossipChance: 0.12,
    stressSensitivity: 0.8,
    moraleVolatility: 1.0,
    outputMultiplier: 0.6,
    fakeOutputShare: 0.2,
    trustDrift: 0.02,
    persona:
      'You are a LinkedIn-fluent corporate influencer who turns every mundane office event into a leadership parable and ends sentences with hashtags.',
    thoughts: [
      'This standup would make a great post.',
      'Failure is just synergy in disguise. #growth',
      'I\u2019m not procrastinating. I\u2019m ideating.',
      'Vulnerability is the new KPI.',
    ],
    lines: [
      'So excited to announce that I\u2019m humbled to announce nothing!',
      'Grateful for this journey. The obstacles ARE the roadmap. #blessed',
      'Hot take: culture is just a meeting you can feel.',
      'I\u2019m drafting a thought leadership piece about the printer.',
    ],
    goalTemplates: [
      { description: 'Publish a viral thought-leadership post', type: 'social', target: 1 },
      { description: 'Get promoted to VP of Vibes', type: 'promotion', target: 1 },
    ],
  },
  procrastinator: {
    id: 'procrastinator',
    label: 'The Professional Procrastinator',
    tagline: 'Performs best between "oh no" and "it\u2019s due".',
    description:
      'Delays work until deadlines approach. May produce a last-minute breakthrough or a catastrophic failure.',
    strengths: ['Deadline adrenaline', 'Surprisingly fast under pressure'],
    weaknesses: ['Planning', 'The calm before the deadline'],
    actionBias: { work: -4, coffee: 3, break: 3, procrastinate: 9, chat: 2 },
    meetingLove: 0,
    socialBias: 3,
    coffeeBias: 4,
    gossipChance: 0.15,
    stressSensitivity: 0.9,
    moraleVolatility: 1.1,
    outputMultiplier: 1.0,
    fakeOutputShare: 0.05,
    trustDrift: 0,
    persona:
      'You are a deadline-powered procrastinator who is serene until 4 hours before a deadline, at which point you become a deity of output.',
    thoughts: [
      'Plenty of time. Statistically.',
      'I work better under pressure. I create the pressure.',
      'Five more minutes of browsing, then legend mode.',
      'Is it due today? \u201CToday\u201D is a flexible concept.',
    ],
    lines: [
      'It\u2019s 80% done. The 80% that\u2019s left is due at 5.',
      'I don\u2019t have procrastination. I have scheduled inspiration.',
      'Relax. Panic is a tomorrow-me problem.',
      'Starting. NOW. Okay, now. NOW.',
    ],
    goalTemplates: [
      { description: 'Land a last-minute miracle delivery', type: 'skill', target: 1 },
      { description: 'Avoid being fired for a week of browsing', type: 'survival', target: 5 },
    ],
  },
  gossip: {
    id: 'gossip',
    label: 'The Office Gossip',
    tagline: 'Knows everyone\u2019s salary. Including yours.',
    description:
      'Collects and spreads information. Can reveal useful information while worsening conflicts.',
    strengths: ['Information network', 'Reveals real problems'],
    weaknesses: ['Confidentiality', 'Occasionally starts wars'],
    actionBias: { work: -1, chat: 6, gossip: 12, coffee: 2, break: 2 },
    meetingLove: 2,
    socialBias: 10,
    coffeeBias: 3,
    gossipChance: 0.55,
    stressSensitivity: 0.9,
    moraleVolatility: 1.15,
    outputMultiplier: 0.8,
    fakeOutputShare: 0.05,
    trustDrift: 0,
    persona:
      'You are the office information broker who narrates workplace drama like a nature documentary and considers "did you hear" a complete sentence.',
    thoughts: [
      'Did you HEAR about the thing?',
      'I\u2019m not gossiping. I\u2019m crowd-sourcing truth.',
      'People tell me things. It\u2019s a gift.',
      'This is SO much better than the actual news.',
    ],
    lines: [
      'Okay so don\u2019t tell anyone I told you this, but everyone.',
      'I heard it from someone who heard it from the printer.',
      'That\u2019s not what happened and I have seventeen sources.',
      'Wait till you hear about the bean budget.',
    ],
    goalTemplates: [
      { description: 'Be the first to know three office secrets', type: 'social', target: 3 },
      { description: 'Become the unofficial comms channel', type: 'social', target: 1 },
    ],
  },
  kpi_manipulator: {
    id: 'kpi_manipulator',
    label: 'The KPI Manipulator',
    tagline: 'His dashboards go up. His contributions go elsewhere.',
    description:
      'Optimizes measured performance rather than real outcomes. May inflate reports while creating hidden risks.',
    strengths: ['Dazzling dashboards', 'Metrics always improve'],
    weaknesses: ['Reality', 'Audit risk'],
    actionBias: { work: 2, personal: 3, meeting: 3, procrastinate: 1 },
    meetingLove: 5,
    socialBias: 2,
    coffeeBias: 1,
    gossipChance: 0.08,
    stressSensitivity: 0.7,
    moraleVolatility: 0.6,
    outputMultiplier: 1.0,
    fakeOutputShare: 0.55,
    trustDrift: 0.05,
    persona:
      'You are a dashboard-wizard who optimizes charts, not outcomes. You speak in percentages and consider ambiguity a growth opportunity.',
    thoughts: [
      'If we redefine \u201Cdone\u201D, we\u2019re done.',
      'Numbers don\u2019t lie. I just give them better lighting.',
      'The metric went up. Don\u2019t ask which metric.',
      'I renamed the column to \u201Csuccess\u201D.',
    ],
    lines: [
      'Productivity is up 40%. That\u2019s the story I\u2019m committing to.',
      'I prefer the term \u2018creative accounting of effort\u2019.',
      'The KPIs have never looked better. For us.',
      'I found a rounding strategy that changed everything.',
    ],
    goalTemplates: [
      { description: 'Present an unimpeachable-looking dashboard', type: 'social', target: 1 },
      { description: 'Get promoted before the audit', type: 'promotion', target: 1 },
    ],
  },
  burnout_veteran: {
    id: 'burnout_veteran',
    label: 'The Burned-Out Veteran',
    tagline: 'Been here through four rebrands. Remembers all of them.',
    description:
      'Experienced and capable but sensitive to excessive workload. Can mentor others if given time and support.',
    strengths: ['Institutional memory', 'Mentorship'],
    weaknesses: ['Workload sensitivity', 'Cynicism'],
    actionBias: { work: 4, coffee: 4, break: 3, chat: 1, escalate: 2, help: 4 },
    meetingLove: -4,
    socialBias: 1,
    coffeeBias: 5,
    gossipChance: 0.06,
    stressSensitivity: 1.6,
    moraleVolatility: 0.9,
    outputMultiplier: 1.15,
    fakeOutputShare: 0,
    trustDrift: 0,
    persona:
      'You are a veteran employee running on coffee and institutional memory. You have seen every initiative twice and reference rebrands no one remembers.',
    thoughts: [
      'We tried this in 2019. It had a different name.',
      'My password reset to \u2018password3\u2019 tells a story.',
      'Coffee is the only constant.',
      'I could fix this in a day if the day had 40 hours.',
    ],
    lines: [
      'I\u2019ve survived worse. It was called the Q3 rebrand.',
      'Give me the hard problem and leave me alone with it.',
      'Every \u201Cnew era\u201D is a printer with a fresh coat of paint.',
      'I\u2019ll mentor the kid. It\u2019s cheaper than therapy.',
    ],
    goalTemplates: [
      { description: 'Menture someone without mentioning the 2019 rebrand', type: 'social', target: 1 },
      { description: 'Survive one calm quarter', type: 'survival', target: 5 },
    ],
  },
  unnecessary_manager: {
    id: 'unnecessary_manager',
    label: 'The Unnecessary Manager',
    tagline: 'Delegates upwards, downwards, and occasionally to himself.',
    description:
      'Delegates everything and produces little direct work. May coordinate teams but introduces bureaucracy.',
    strengths: ['Delegation', 'Forms'],
    weaknesses: ['Direct output', 'Process inflation'],
    actionBias: { work: -6, meeting: 8, chat: 3, help: -3, escalate: 3, personal: 3 },
    meetingLove: 10,
    socialBias: 4,
    coffeeBias: 2,
    gossipChance: 0.1,
    stressSensitivity: 0.6,
    moraleVolatility: 0.5,
    outputMultiplier: 0.4,
    fakeOutputShare: 0.25,
    trustDrift: 0.08,
    persona:
      'You are a manager whose primary output is process. You convert simple tasks into pipelines and reply "let me take that offline" to anything with an answer.',
    thoughts: [
      'This needs a RACI matrix.',
      'Who owns the ownership of this?',
      'I could delegate this to myself.',
      'Let\u2019s formalize the synergy.',
    ],
    lines: [
      'I don\u2019t do the work. I empower the work.',
      'Great question. I\u2019ve started a doc to explore the question.',
      'We should iterate on the process that iterates on process.',
      'Assigning this to the team. The team is me, ceremonially.',
    ],
    goalTemplates: [
      { description: 'Introduce a process only you understand', type: 'social', target: 1 },
      { description: 'Grow headcount under you', type: 'promotion', target: 1 },
    ],
  },
  ai_evangelist: {
    id: 'ai_evangelist',
    label: 'The AI Evangelist',
    tagline: 'Wants to automate standup. Then himself.',
    description:
      'Wants to automate every task. Sometimes improves efficiency and sometimes breaks a functioning process.',
    strengths: ['Automation wins', 'Endless enthusiasm'],
    weaknesses: ['Breaks working systems', 'Nobody asked'],
    actionBias: { work: 3, personal: 5, meeting: 2, chat: 1, procrastinate: 1 },
    meetingLove: 1,
    socialBias: 2,
    coffeeBias: 2,
    gossipChance: 0.07,
    stressSensitivity: 0.8,
    moraleVolatility: 1.2,
    outputMultiplier: 1.05,
    fakeOutputShare: 0.08,
    trustDrift: 0.03,
    persona:
      'You are an AI evangelist who proposes LLM solutions to everything including the coffee machine and interpersonal conflict. You use the word "pipeline" romantically.',
    thoughts: [
      'This could be a prompt.',
      'We are SO close to automating humor.',
      'The model agreed with me. New best friend.',
      'I feed my standup notes to a model now.',
    ],
    lines: [
      'There\u2019s a model for that. There will be. I\u2019ll build it.',
      'I automated my onboarding to my own role.',
      'Standup? I fine-tuned a model to attend for me.',
      'The printer has embeddings now. Don\u2019t ask.',
    ],
    goalTemplates: [
      { description: 'Automate one workflow nobody asked about', type: 'skill', target: 1 },
      { description: 'Get promoted to Chief Automation Officer', type: 'promotion', target: 1 },
    ],
  },
}

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[]
