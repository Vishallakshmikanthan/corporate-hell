# CORPORATE HELL™ v2: "Ship It" Implementation Plan

> From a company you *watch* to a company you *build, ship, break, fix and grow*.

This plan upgrades your current project (React + R3F + Zustand frontend, deterministic TypeScript engine, FastAPI AI backend) into a gamified **software-company simulator**. You play a role, do real-feeling engineering work (Git, CI/CD, cloud, GPUs, incidents), survive meetings, take suggestions, relax at the coffee machine, launch the product, go viral (or get ratio'd), and watch the company grow from a garage to a unicorn.

---

## 0. Where the project is today (audit of the zip)

What you already have, and it is a strong base:

| Area | Current state | Reuse for v2 |
|---|---|---|
| Engine | `SimulationEngine`, fixed tick, `SeededRandom`, render-independent | Keep. Every new system plugs into the tick. |
| Employees | 10 archetypes, needs (morale/stress/energy), relationships, goals, memories, utility-based action choice (`ActionKind`) | Becomes the NPC teammates. |
| Projects | Generic `Project` (points done / total, quality, deadline, revenue) | Replace with sprint + ticket + repo model (Section 4). |
| Meetings | `Meeting` with attendees, rooms, recurrence | Add player choices and outcomes (Section 6). |
| Events | ~52 typed events with cooldowns, decisions, effects (`EffectSpec`) | Keep, add tech/launch/social events. |
| Incidents | `Incident` with responses and costs | Becomes the on-call / outage system. |
| Campaign | 5 fixed objectives, 15 days, bankruptcy/morale-collapse endings | Becomes "Seed → Series A → …" growth ladder. |
| Launch | `launch_product` = flat $5,000, `hype: 85, quality: 70` | **Biggest gap.** Launch becomes a whole phase (Section 8). |
| Player | No avatar. CEO acts through menus only | Add a controllable avatar and role modes (Section 2). |
| 3D | Office, rooms, procedural characters, camera controller | Add avatar movement, interactables, new props. |
| Backend | `/ai/dialogue`, `/ai/directive`, `/saves` (SQLite) | Add AI for code review, PR comments, social replies, leaderboard. |

Honest observations that shape the plan:

1. The player is a **menu operator**, not a **character**. Gamification needs a body in the world.
2. Work is abstract "points". A software company's fun comes from *specific* work: tickets, branches, PRs, red CI, outages.
3. The loop ends at "launch product, +10 reputation". Nothing happens *after* launch, so there's no growth fantasy.
4. The campaign is linear and 15 days long. A growth ladder gives replayability.

---

## 1. The Core Loop: "The Ship Cycle"

One **Sprint = 5 in-game days** (tunable). Each sprint runs this loop:

```
 ┌────────────┐   ┌─────────────┐   ┌──────────┐   ┌────────────┐
 │ 1 PLANNING │ → │ 2 BUILD     │ → │ 3 REVIEW │ → │ 4 CI / CD  │
 │ backlog,   │   │ code/design │   │ PRs,     │   │ pipeline,  │
 │ suggestions│   │ meetings,   │   │ QA, demo │   │ red builds │
 └────────────┘   │ coffee      │   └──────────┘   └─────┬──────┘
        ▲         └─────────────┘                        ▼
 ┌──────┴─────┐   ┌─────────────┐   ┌──────────┐   ┌────────────┐
 │ 8 GROW     │ ← │ 7 SOCIAL    │ ← │ 6 LAUNCH │ ← │ 5 DEPLOY   │
 │ hire, fund,│   │ posts, PR,  │   │ release  │   │ staging →  │
 │ expand     │   │ community   │   │ day      │   │ production │
 └────────────┘   └─────────────┘   └──────────┘   └────────────┘
                 (+ incidents can hit at ANY stage)
```

Every stage has: **a player decision, a skill check or mini-game, a measurable consequence, and a risk.**

---

## 2. Game Modes (Role Modes)

Keep **Sandbox** and **CEO Campaign**, and add **Role Modes**. All modes run the same engine. The mode only changes *what you control*, *the HUD*, and *which events target you*.

| Mode | You control | Core fantasy | Signature mechanic |
|---|---|---|---|
| **CEO** (existing, upgraded) | Strategy, budget, hiring, funding, launch timing | Survive and scale | Board meetings, runway meter, investor pitches |
| **Developer** | An avatar who writes code | Ship clean code under pressure | Tickets → branch → commit → PR → fix CI → deploy |
| **Designer** | An avatar who makes UI/UX | Make the product loved | Design tickets, handoff to devs, usability tests |
| **Product Manager** (new) | Backlog, roadmap, stakeholders | Say "no" politely | Prioritization, scope-creep defense, meeting facilitation |
| **DevOps / SRE** (new, optional) | Infra, cloud, on-call | Keep it up at 3 AM | Incidents, cost tuning, GPU rental |
| **Overall / Director** (existing Sandbox upgraded) | Everything via menus, god-view camera | Run the whole machine | Time controls, assign NPCs to roles, trigger scenarios |
| **Intern** (new, tutorial and roguelite) | A low-stat avatar | Survive onboarding | Teaches every system in order, then becomes "Hard Mode" |

### How a role mode works technically
- `PlayerRole = 'ceo' | 'developer' | 'designer' | 'pm' | 'devops' | 'overall' | 'intern'`
- Each role defines: `allowedActions`, `hudLayout`, `dailyObligations`, `perks`, `blindSpots`.
- **Roles you don't play are run by NPC employees** using the existing utility AI plus skill rolls. This keeps the company alive and makes "hire a better dev" meaningful.
- **Auto-resolve rule:** every mini-game has an "Auto" button. Auto uses the avatar's skill stats + RNG (slightly worse than playing well). Players who don't want mini-games can still play, and Sandbox can run fully automated.

### Role-specific daily obligations (this makes each mode feel different)

- **Developer:** pick up a ticket, commit, open a PR, review a teammate's PR, fix red CI, join standup.
- **Designer:** design 1–2 screens, run a design review, respond to dev handoff questions, do one usability test per sprint.
- **CEO:** morning brief (emails + KPIs), one board/investor interaction per week, one people decision per day.
- **PM:** groom backlog, run planning, decide on every suggestion, protect the sprint scope.
- **DevOps:** watch dashboards, rotate on-call, approve production deploys, tune cloud bill.

---

## 3. The Player Avatar and Controls

### 3.1 Avatar
- Reuse the procedural character rig (`EmployeeCharacter.tsx`). Add `PlayerAvatar` with customizable look (skin, hair, outfit, accessory) in `SetupScreen`.
- Camera modes: **Follow-cam** (third-person, default for role modes), **Iso/Orbit** (existing, default for Overall), **Desk-cam** (zoom to your monitor when working).

### 3.2 Control scheme

| Input | Action |
|---|---|
| `WASD` / left stick / on-screen joystick | Move avatar (collision with desks and walls) |
| `E` / tap | Interact with highlighted object (laptop, coffee machine, whiteboard, teammate) |
| `Space` | Context action (confirm in mini-game, skip dialogue) |
| `Tab` | Open "Phone" (inbox, chat, social, calendar, ticket board) |
| `1–5` | Quick-actions wheel (role-specific) |
| `M` | Map and room fast-travel (walk-to autopath) |
| `P` | Pause / speed (Overall mode only; role modes use "time cost" per action) |
| `Esc` | Menu |

### 3.3 Interactables (the world is the UI)
Each is a 3D prop with an interaction prompt, a time cost in ticks, and effects.

| Object | Room | Interaction |
|---|---|---|
| Your laptop | Desk | Open IDE / Figma-like / dashboard mini-game |
| Kanban wall | Open plan | Pick tickets, move cards |
| Whiteboard | Conference | Start planning/design review/architecture session |
| Coffee machine | Pantry | Coffee break (energy +, social chance) |
| Ping-pong / foosball | Break room | Social mini-game (morale ++, relationships) |
| Server rack | Server room | Check infra, restart services, see cloud bill |
| GPU cluster rack | Server room | Rent/release GPU nodes (Section 5.4) |
| CEO desk | CEO office | Investor mail, funding, hiring, strategy |
| Reception | Reception | Interviews, candidates, customer visits |
| Printer | Open plan | Jam events and "urgent paper" quests |
| Phone | Anywhere | Social media, messages, calendar |

### 3.4 Player stats (separate from company stats)
`energy`, `focus`, `stress`, `reputationWithTeam`, `skillXP[role]`. Overwork → mistakes (more bugs, worse mini-game timing). Coffee and breaks restore, but cost ticks. This is the central "do I push or rest?" tension.

---

## 4. Software Workflow Simulation (the heart of the upgrade)

### 4.1 Project model replaces generic points

```ts
type TicketKind = 'feature' | 'bug' | 'chore' | 'design' | 'infra' | 'ml';
interface Ticket {
  id: string; title: string; kind: TicketKind;
  complexity: 1|2|3|5|8;          // story points
  assigneeId?: string;
  state: 'backlog'|'todo'|'doing'|'review'|'qa'|'done'|'blocked';
  source: 'roadmap'|'customer'|'investor'|'employee'|'incident';
  bugRisk: number;                // 0..1, hidden until QA/prod
  designReady: boolean;           // devs blocked w/o design on UI tickets
  techDebtDelta: number;
}
interface Sprint { id: string; startDay: number; endDay: number; committedPoints: number;
  donePoints: number; tickets: string[]; goal: string; }
interface Repo { name: string; branches: Branch[]; mainHealth: number; techDebt: number; /*0..100*/ }
interface Branch { name: string; authorId: string; commits: number; conflicts: number; ticketId: string; }
interface PullRequest { id: string; branch: string; authorId: string; reviewerId?: string;
  size: number; quality: number; state: 'open'|'changes_requested'|'approved'|'merged'; }
```

New core metrics (add to `CompanyState`):
- `techDebt` (0–100): rises when you rush or skip review; slows velocity, raises bug and CI-failure rates.
- `velocity`: points per sprint (rolling average).
- `codeQuality`, `testCoverage`, `uptime` (30-day rolling).
- `backlog`, `sprint`, `repo`, `pipeline`, `infra`.

### 4.2 Git flow (player-visible)

1. **Pick ticket** from the Kanban wall → `doing`.
2. **Create branch** (auto-named, e.g. `feat/login-oauth`).
3. **Work** = mini-game or auto-roll producing `commits` and `quality`.
4. **Open PR** (choose size: small = safer and slower, big = fast and risky).
5. **Review:** a teammate reviews. Their archetype matters (the Meeting Addict schedules a review meeting; the Silent Genius finds subtle bugs; the Bootlicker approves everything instantly).
6. **Merge conflicts** (if two branches touch the same area): mini-game "resolve the conflict" (choose ours / theirs / manual) with a consequence if wrong.
7. **Merge to main** → triggers CI.

Player actions to add to `PlayerAction`:
`pick_ticket`, `create_branch`, `commit`, `open_pr`, `review_pr`, `resolve_conflict`, `merge_pr`, `revert_commit`, `hotfix`.

> **Naming tip:** use parody names in-game (e.g. *GitBub*, *AWSome Cloud*, *NVIDIOT GPUs*, *Slackk*, *Twitterer*). It keeps the satirical tone and avoids trademark trouble if you ever publish.

### 4.3 CI/CD pipeline and errors (your "CI/CD errors and rectification")

Pipeline stages, each with a pass probability driven by `codeQuality`, `testCoverage`, `techDebt` and `rng`:

```
lint → unit tests → build → integration tests → security scan → docker image → deploy staging → smoke tests → deploy prod
```

**Failure catalogue** (each = a typed event + fix mini-game + consequence):

| Failure | Cause | Fix mini-game / decision |
|---|---|---|
| Lint failed | Sloppy PR | Auto-fix (cheap) or ignore rule (adds debt) |
| Flaky test | Test debt | Retry (gamble), quarantine test (debt), fix root cause (time) |
| Build failed: dependency conflict | Rushed upgrade | Pick correct version from a log (log-reading puzzle) |
| Docker image too large / build timeout | Neglected infra | Optimize layers (choose 3 of 5 tweaks) |
| Secret leaked in commit | Careless dev | Rotate keys (fast) vs ignore (audit risk spikes) |
| Failed security scan | Vulnerable dep | Patch, pin, or accept risk |
| Staging deploy OK, prod fails | Config drift | Compare env diffs (spot-the-difference) |
| Migration locks DB | Big schema change | Roll back or push through (outage risk) |
| "Works on my machine" | Env mismatch | Blame game with relationship consequences |

**Fix flow:** red build → *Incident ticket auto-created* → player or NPC picks fix → time cost + effect on `techDebt`, `morale`, and `uptime`. Reusing your `Incident` + `IncidentResponse` types means very little new UI is needed.

### 4.4 Deployment: environments and release strategy

Environments: `dev → staging → production`.

At the deploy gate the player chooses a **strategy**:

| Strategy | Speed | Risk | Cost | Notes |
|---|---|---|---|---|
| Big-bang Friday deploy | Fast | **Very high** | Low | Joke option: triggers a weekend-ruined event |
| Rolling | Medium | Medium | Medium | Default |
| Blue/Green | Slow | Low | High (double infra) | Instant rollback |
| Canary (5% → 50% → 100%) | Slowest | Lowest | Medium | Gives early bug signal; mini-dashboard to watch |
| Feature flags | Medium | Low | Low | Needs `testCoverage` ≥ threshold |

Rollback is always available but costs reputation and a morale hit. Post-deploy, a **bug-burst window** (hidden `bugRisk` revealed): bugs found by customers become new `bug` tickets with `source: 'customer'`.

### 4.5 Cloud and cost management

```ts
interface Infra {
  region: 'us'|'eu'|'asia';
  instances: number; autoscale: boolean; dbSize: 'S'|'M'|'L';
  cdn: boolean; monitoring: boolean; backups: boolean;
  monthlyCost: number; capacity: number; // requests/s
}
```

- **Traffic** (driven by launch hype and social posts) is compared to `capacity` each tick. Over capacity → latency → `customerSatisfaction` drops → *outage incident*.
- Choices: scale up (cost), enable autoscaling (costly but safe), cache/CDN (one-time cost), do nothing (risky).
- **Cloud bill shock event:** forgotten GPU instance or runaway autoscale produces a surprise invoice → CEO decision (investigate / blame intern / negotiate credits).
- Backups off = a cheap saving that becomes a catastrophic event later.

### 4.6 GPU renting (AI/ML work)

For `ml` tickets, AI features and "CEO Has Discovered AI" scenario:

```ts
interface GpuMarket { spotPrice: number; onDemandPrice: number; availability: number; /* random walk */ }
interface GpuJob { id: string; ticketId: string; gpus: number; hoursNeeded: number;
  progress: number; mode: 'spot'|'on_demand'; checkpointing: boolean; }
```

- Price follows a **seeded random walk with demand spikes** (e.g. "a rival announced a model → GPU shortage").
- **Spot** is ~60–70% cheaper but can be **preempted**, losing progress unless `checkpointing` is on.
- **On-demand** is expensive and reliable. **Reserved** is a long-term discount that becomes a liability if the project is cancelled.
- Player decisions: how many GPUs, spot vs on-demand, train now vs wait for a price drop, kill a runaway job.
- Outcome: model `quality` feeds feature quality and launch hype. Training overruns create CEO-level "why is the bill $40k?" moments.

### 4.7 Incidents and on-call
- On-call rotation across devs; the on-call person's stress rises, and their archetype affects response (the Burned-Out Veteran fixes things silently but resents it).
- **Severity SEV1–SEV4** map to your existing severity 1–5.
- **Postmortem** after every SEV1/SEV2: a short mini-game (pick root cause + 2 follow-up actions). Doing it well *reduces* the odds of repeats; skipping it keeps `techDebt` rising. This is a nice "learn from mistakes" mechanic.

---

## 5. Meetings and Suggestions (making meetings playable)

### 5.1 Meeting types (extend `Meeting.topic` into a typed `kind`)

| Kind | Purpose | Player interaction |
|---|---|---|
| Daily standup | Alignment, surface blockers | Choose to report honestly or spin (spin → hidden risk) |
| Sprint planning | Decide what to commit | Drag tickets into the sprint within capacity |
| Design review | Approve UI | Defend or revise a design |
| Code review session | Clear PR backlog | Fast-forward review mini-game |
| Retro | Improve process | Pick 1 "start / stop / continue" (permanent small buffs) |
| Stakeholder demo | Show progress | Pitch skill check, outcome sets stakeholder confidence |
| Board meeting | Funding and strategy | CEO mode: KPI defense |
| "Could've been an email" | Pure waste | Skip option with relationship consequences |

Meeting choices produce `EffectSpec` results, so your existing effect engine handles them.

### 5.2 Meeting dialogue
- Use the existing `/ai/dialogue` to generate NPC lines, with the deterministic template fallback you already have.
- Each attendee has a **stance** (supports / opposes / neutral) computed from archetype + relationships. The player sees stances and chooses how to persuade. This is a good use of your `relationships` data.

### 5.3 The Suggestions system ("including suggestions in projects")
Suggestions arrive from **customers, investors, employees, social media and the CEO's spouse's cousin**.

```ts
interface Suggestion { id: string; from: 'customer'|'investor'|'employee'|'social'|'ceo';
  text: string; value: number; effort: number; urgency: number; politicalWeight: number; }
```

Player options per suggestion: **Accept into sprint · Defer to backlog · Reject politely · Reject rudely**.

- Accepting a suggestion mid-sprint creates **scope creep**: sprint risk ↑, morale ↓, but satisfaction/hype ↑ if delivered.
- Rejecting an investor's pet feature costs `investorConfidence` but protects velocity.
- Good suggestions from employees raise their `trust` and `ambition` progress, which feeds your `PersonalGoal` system.
- A "Voice of Customer" board shows how many accepted/rejected suggestions shipped, and ties directly into launch reviews.

---

## 6. Office Life: Coffee, Fun and Culture

This is where your existing needs system (energy, morale, stress, relationships) pays off.

### 6.1 Break activities (player-controlled and NPC-driven)

| Activity | Cost | Effect | Hook |
|---|---|---|---|
| Coffee | 1–2 ticks, $ | Energy +, jitters if >3/day (focus ↓) | Coffee machine breaks = existing event, now playable repair |
| Lunch with a teammate | 3 ticks | Relationship ++, stress − | Choose who; archetype influences conversation |
| Ping-pong / foosball | 3 ticks | Morale ++, small rivalry chance | Timing mini-game |
| Walk / balcony | 2 ticks | Stress −, creativity chance | Random "shower thoughts" buff |
| Napping pod | 4 ticks | Energy +++ | Risk: caught by CEO |
| Office gossip | 2 ticks | Reveals hidden info | Already supported by `gossip` action |

### 6.2 Culture events (company-wide)
Friday demo day · Hackathon day (a free sprint-of-chaos, produces prototypes and bugs) · Pizza Thursday · Team offsite (cash cost, large morale and trust gain, one random disaster) · Mandatory Fun (already in your presets) · Birthday cake with a passive-aggressive card · Employee-of-the-month (promotion and jealousy chain).

### 6.3 Culture meter
Add `culture` (0–100) built from policies (four-day week, remote-friendly, meeting-free day), perks and events. High culture → better hiring pool and lower turnover; low culture → the "toxic Glassdoor review" event.

---

## 7. Launch and Social Media (making the company grow)

### 7.1 Launch is now a phase, not a button

**Pre-launch checklist** (each item adds readiness; skipping adds risk):
- Feature completeness (done tickets / scope)
- QA pass and `bugRisk` revealed
- Load test (`infra.capacity` vs forecast)
- Landing page (Designer task)
- Docs and onboarding
- Marketing assets and a content calendar
- Legal/privacy review (a quick event with a funny outcome)

**Launch day** is a real-time 60–90 second "war room" mode: live traffic graph, error rate, social feed, support tickets. You react to events: scale up, rollback, post a statement, hotfix. This is the game's big payoff moment.

**Launch channels** (parody names): *Launchpad* (Product-Hunt-like), *Techcrunchy* (press), *HackerNooz* (brutal comments), *YouTuber influencer*, *Cold email blast*. Each has a cost, reach multiplier, and a "roast risk" tied to quality.

### 7.2 Social media simulation

```ts
type Platform = 'chirper' | 'linkedout' | 'instagrim' | 'tiktak' | 'reddot' | 'newsletter';
interface SocialAccount { platform: Platform; followers: number; engagementRate: number; sentiment: number; }
interface SocialPost { id: string; platform: Platform; kind: 'announcement'|'meme'|'thread'|'demo_video'|'apology'|'hiring'|'behind_the_scenes';
  quality: number; authorId: string; postedTick: number; reach: number; likes: number; shares: number; sentiment: number; }
```

**Reach formula (deterministic with seeded noise):**
```
reach = followers × engagementRate × contentQuality × timingBonus × (1 + hype/100) × viralRoll
viralRoll = lognormal(seeded rng), rare 10×–50× outliers
newFollowers = reach × conversionRate × productQuality/100
```
- **Who posts matters:** the Marketing dept, the LinkedIn Motivational Speaker (huge reach, cringe risk), or the CEO (high reach, high chaos). Use `/ai/dialogue` to write the post and the comment section (AI replies are cosmetic; numbers stay deterministic).
- **Content calendar:** schedule posts. Posting inconsistently decays engagement.
- **Reply guy mini-game:** respond to comments (helpful / defensive / meme). A wrong reply can start a **PR crisis**.
- **Viral moments:** a meme post can explode and crash servers (links to Section 4.5, the best cross-system moment in the game).
- **Crisis events:** leaked internal email, bug screenshots going viral, a rival's copycat feature, influencer feud, "ratio'd" apology.
- **Reviews and ratings:** app-store-style rating derived from real `quality`, bug count and support responsiveness.

### 7.3 Growth model
Customers acquired → revenue → cash → hiring/expansion. Define a funnel:

```
impressions → visits → signups → activated users → paying customers → retained
conversion rates depend on: landing page (designer), product quality, onboarding, price, bugs
churn = base + bugs×k1 + latency×k2 − supportQuality×k3
MRR = paying × price
```
This gives the player a clear **number-go-up** fantasy tied directly to craft decisions made earlier.

### 7.4 Company stages (the growth ladder)

| Stage | Unlocks | Requirement (example) |
|---|---|---|
| **Garage** (3 people) | Basic office, 1 repo | Start |
| **Seed** | First hire wave, small cloud budget | MVP shipped, 100 users |
| **Series A** | New floor, QA + DevOps hires, GPU access | MRR target, uptime ≥ 98% |
| **Series B** | Multiple products, marketing team, sales dept | Retention target, board approval |
| **Scale-up** | Second office, data team, M&A events | Profitability OR growth target |
| **Unicorn / IPO** | Endgame, victory screen with run report | Valuation target |

Each stage visibly **upgrades the 3D office** (more desks, new rooms, a rooftop, a server cage with blinking LEDs) so growth is *seen*, not just read. Add funding rounds as CEO mini-games (pitch deck: pick slides, answer investor questions, negotiate dilution).

---

## 8. Progression, Rewards and Replayability

- **XP and skill trees per role** (e.g. Developer: Debugging, Architecture, Code Review, Speed; CEO: Fundraising, Culture, Strategy).
- **Perks and traits** at level-ups (e.g. "10x Dev: bugs ↑ but speed ↑", "Diplomat: meetings ½ time").
- **Achievements:** *Friday Deploy Survivor*, *Zero-Downtime Quarter*, *Coffee Count 100*, *Merged With 0 Review*, *Went Viral*, *Rolled Back 3×*, *Unicorn Speedrun*.
- **Daily/weekly seed challenges** (the seeded RNG already supports this): same seed for everyone, compare scores on a backend leaderboard.
- **Unlockables:** office themes (cyberpunk, wooden startup), avatar items, new archetypes, new scenario presets.
- **Run report** at the end: timeline of decisions, best/worst incident, cloud spend chart (`recharts` is already installed), social growth chart, "most chaotic employee".

---

## 9. Technical Architecture

### 9.1 New engine modules (`frontend/src/game/engine/`)

| File | Responsibility |
|---|---|
| `tickets.ts` | Backlog, sprint, ticket state machine, velocity |
| `repo.ts` | Branches, commits, PRs, conflicts, tech debt |
| `pipeline.ts` | CI/CD stages, failure rolls, fix resolution |
| `deploy.ts` | Environments, strategies, rollback, bug-burst |
| `infra.ts` | Traffic vs capacity, costs, outages |
| `gpu.ts` | Market random walk, jobs, preemption |
| `suggestions.ts` | Suggestion generation and scope-creep effects |
| `social.ts` | Accounts, posts, reach, crises |
| `growth.ts` | Funnel, churn, MRR, valuation, stage progression |
| `avatar.ts` | Player stats, movement validation, interaction costs |
| `roles.ts` | Role definitions, allowed actions, NPC role-fill |
| `minigames/*.ts` | Pure functions: `(skill, input, rng) → result` (so tests and auto-resolve share logic) |

Also add to `rules/actions.ts` validation for all new `PlayerAction`s, and `models/types.ts` for the types above.

### 9.2 Tick integration (extend your existing 11-step tick)
```
1 work progress (tickets)         7 infra load, cost
2 needs                            8 social decay/reach update
3 decisions (utility AI)          9 funnel/MRR
4 movement + avatar                10 events (incl. tech/social)
5 repo/PR/CI state advance         11 campaign/stage evaluation
6 deploy/gpu progress              12 snapshot
```
Keep it **render-independent and deterministic**. All mini-game *outcomes* are applied via `dispatchAction` so replays and saves still work.

### 9.3 Frontend structure
- **Zustand slices:** `avatarSlice`, `workflowSlice`, `socialSlice`, `uiModeSlice`. Keep engine state as the single source of truth.
- **New views** (`components/views/`): `KanbanView`, `RepoView` (branch graph with `recharts`/SVG), `PipelineView` (stage lights), `CloudView`, `GpuMarketView`, `SocialView`, `LaunchWarRoom`, `GrowthView`, `PhoneOverlay`.
- **New 3D bits** (`scene/`): `PlayerAvatar.tsx`, `Interactable.tsx` (prompt ring + highlight), `InteractionSystem.tsx`, office-stage upgrade variants in `OfficeFloor.tsx`.
- **Mini-games** are lightweight 2D overlay components (not full 3D) in `components/minigames/`, each under ~40 seconds and skippable via Auto.
- Add a **Role HUD** swapped by `PlayerRole` (replacing parts of `TopCommandBar` and `ExecutiveCommand`).

### 9.4 Persistence and migration
- Bump `stateVersion` in `CompanyState`; write a migration in `persistence/storage.ts` that fills new fields (`sprint`, `repo`, `infra`, `social`, `avatar`...) with defaults so old saves still load.
- Backend `Save` model can stay JSON-blob based. Add a `Score` table for leaderboards (`seed`, `role`, `score`, `runSummary`).

### 9.5 Backend AI additions (`backend/app/ai/`)
Keep the rule: **AI writes words, never numbers.**
- `code_review`: generates PR review comments in the reviewer's archetype voice.
- `standup`: narrates standup updates from actual ticket states.
- `social`: writes posts, replies, comment threads and crisis headlines.
- `postmortem`: drafts incident summaries from the event log.
- Every endpoint needs the template fallback you already use, so the game works offline or without an API key.

---

## 10. Core Formulas (starting values, tune in playtests)

```
capacity(emp)      = baseSkill × (energy/100)^0.5 × (1 − stress/200) × (1 − techDebt/250)
bugRisk(ticket)    = 0.05 + complexity×0.02 + (rushed ? 0.15 : 0) − (reviewed ? 0.10 : 0) − coverage×0.001 + techDebt×0.002
ciFail(stage)      = clamp(base[stage] + techDebt×0.003 − coverage×0.002 − codeQuality×0.001, 0.02, 0.60)
velocity           = EMA(donePointsPerSprint)
outageChance/tick  = max(0, (traffic − capacity)/capacity) × 0.5 + (backups? 0 : 0.002)
gpuSpot(t+1)       = clamp(spot(t) × exp(σ·N(0,1) + shock), 0.25×onDemand, 0.9×onDemand)
preemptChance      = (spot ? 0.04 + marketDemand×0.1 : 0) per hour of job
launchHype         = 0.4×quality + 0.3×marketing + 0.2×timing + 0.1×novelty − bugPenalty
valuation          = MRR × 12 × growthMultiple(stage, growthRate, churn)
```
Document these in `docs/FORMULAS.md` (your master prompt already requires documented formulas) and test them with Vitest like your existing `engine.test.ts`.

---

## 11. Phased Roadmap

Estimates assume 1–2 developers working in focused weekends. Ship each phase as a playable build.

### Phase 0: Foundations (2–3 days)
- Add new types, bump `stateVersion`, write migration, write `docs/FORMULAS.md`.
- Feature flag system (`flags.v2Workflow`) so old modes keep working.
- **Done when:** old saves load; all existing tests pass.

### Phase 1: The Avatar and Role Select (4–5 days)
- `PlayerAvatar`, WASD movement, collisions, follow-cam, interaction prompts.
- Role select in `SetupScreen`; role HUD skeleton; NPCs auto-fill other roles.
- Interactables: laptop, coffee machine, kanban wall.
- **Done when:** you can walk to the coffee machine, drink coffee (energy +), and sit at your laptop.

### Phase 2: Tickets, Sprints, Git (5–7 days)
- Backlog, sprint planning meeting, Kanban wall view.
- Branch → commit → PR → review → merge flow; first dev mini-game (fix-the-bug) with Auto.
- Tech debt and velocity metrics wired into the tick.
- **Done when:** a full sprint can be completed in Developer mode and in Overall mode (NPCs do it).

### Phase 3: CI/CD and Deploy (5–6 days)
- Pipeline stages and ~8 failure types with fixes; `PipelineView`.
- Deploy strategies, staging → prod, rollback, bug-burst window.
- Incident flow reusing `Incident`; postmortem mini-game.
- **Done when:** a Friday deploy can ruin your weekend and you can recover.

### Phase 4: Cloud and GPU (4–5 days)
- `infra.ts` traffic/capacity/cost; `CloudView` with bill chart.
- GPU market, spot vs on-demand jobs, preemption, `ml` tickets.
- Cloud bill shock event; server room interactables.
- **Done when:** a traffic spike can crash the app unless you scaled.

### Phase 5: Meetings and Suggestions (4 days)
- Typed meetings with player choices and stances; standup spin, sprint planning drag-drop, retro buffs.
- Suggestions inbox with accept/defer/reject and scope-creep consequences.
- **Done when:** accepting too many suggestions visibly derails a sprint.

### Phase 6: Office Life and Culture (3–4 days)
- Break activities and ping-pong mini-game, culture meter, culture events, napping pod.
- Avatar needs (energy/focus/stress) fully affecting performance.
- **Done when:** skipping breaks causes mistakes; over-caffeinating has a downside.

### Phase 7: Launch and Social (6–8 days)
- Pre-launch checklist, launch war-room, channels.
- Social accounts, posts, content calendar, reach formula, reply mini-game, PR crises.
- Viral-spike → server-load link.
- **Done when:** a meme post can make you famous or crash your servers.

### Phase 8: Growth and Stages (5–6 days)
- Funnel, churn, MRR, valuation; stage ladder with 3D office upgrades.
- Funding-round pitch mini-game; hiring waves and new departments.
- **Done when:** you can play Garage → Series A and see the office physically grow.

### Phase 9: Meta, Polish, Balance (ongoing)
- XP/perks, achievements, seed challenges + leaderboard, run report.
- Audio per mini-game and event, reduced-motion, mobile controls (virtual joystick + tap-to-interact).
- Balance passes with automated simulations (Section 12).

---

## 12. Testing and Balancing

- **Unit tests (Vitest):** formulas, ticket state machine, pipeline roll boundaries, GPU price clamps, social reach monotonicity, migration of old saves.
- **Determinism test:** same seed + same action list ⇒ identical final `CompanyState` hash (extend `engine.test.ts`).
- **Headless balance runner:** a script that runs 1,000 seeded games per role with a simple bot, then reports win rate, median cash at day 30, and which events dominate. Tune until each role's win rate is roughly 40–60% on Normal.
- **Anti-frustration rules:** one free "undo last deploy" per sprint on Easy; "Auto" always available; no unavoidable instant-loss events.
- **Perf budget:** keep draw calls low (instancing for new props), and mini-games as 2D overlays.

---

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Scope explosion | Strict phases, feature flags, each phase playable alone |
| Mini-games get repetitive | Auto-resolve, 8–10 variants per role, difficulty scales with stage |
| Too many systems to balance | Few core meters (`techDebt`, `uptime`, `hype`, `cash`, `morale`) feed everything else |
| AI latency/cost | AI only writes flavor text; template fallback always works |
| Trademark worries | Parody names for all real brands |
| Save-file breakage | `stateVersion` + migrations + tests |

---

## 14. Quick Wins You Can Build First (1–2 days each)

1. **Playable coffee break:** walk to the machine, press `E`, +energy and a random chat. Instantly feels like a game.
2. **Red-build popup:** a random CI failure with 3 fix choices and different costs, reusing `Incident`.
3. **Friday deploy button** that rolls a 35% disaster chance and fires an existing-style event.
4. **Suggestion cards** in the inbox (accept / defer / reject) that adjust sprint risk.
5. **First social post button** with a seeded reach roll and a follower counter in the top bar.

---

## 15. Prompts for Your AI IDE (copy per phase)

> **Template:** "Inspect the repo first. Implement **Phase N** of `CORPORATE_HELL_V2_IMPLEMENTATION_PLAN.md`. Keep the engine deterministic and render-independent. Add types in `models/types.ts`, validation in `rules/actions.ts`, bump `stateVersion` with a migration, add Vitest tests for every formula, keep the AI-optional template fallbacks, and do not break existing sandbox/campaign modes. Run `npm run build` and `npm test`, and fix failures before stopping."

Example for Phase 3: *"…Implement the CI/CD pipeline in `engine/pipeline.ts` with the failure catalogue from Section 4.3, expose it through `PipelineView`, create incidents through the existing `Incident` system, and cover each failure's fix with a test."*

---

## 16. One-Paragraph Pitch (for your README / demo)

> **Corporate Hell™ v2** is a satirical 3D software-company simulator. Pick a role (CEO, Developer, Designer, PM, DevOps), walk around a living office, take tickets, push branches, survive code review, fix red CI builds, choose how to deploy (and regret deploying on Friday), rent spot GPUs that vanish mid-training, sit through meetings, decide which suggestions to accept, grab coffee, launch your product in a live war-room, go viral on social media (or crash your servers), and grow the company from a garage to a unicorn.

Good luck, and may your builds be green and your standups short.
