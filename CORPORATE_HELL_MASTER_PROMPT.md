# MASTER BUILD PROMPT — CORPORATE HELL™
## An Absurdly Realistic AI-Powered 3D Corporate Chaos Simulator

You are a principal game engineer, senior frontend architect, 3D technical artist, simulation designer, and AI systems engineer. Build a complete, polished, playable web application called **CORPORATE HELL™**.

Do not merely create a landing page, static mockup, or dashboard prototype. Build a functional simulation with a persistent game state, autonomous AI employees, meaningful management decisions, interactive 3D environments, and two playable game modes.

Work directly in the existing Antigravity IDE workspace. Inspect the repository before making changes. Preserve useful existing code, make sensible decisions independently, install appropriate dependencies, implement the application, run it, test it, and fix errors.

Do not stop after generating a plan. Continue through implementation and verification.

---

# 1. PRODUCT VISION

**Tagline:** “Synergy is mandatory. Sanity is optional.”

CORPORATE HELL™ is a satirical 3D office simulation combining the absurdity of *The Sims*, workplace comedy, management games, and unpredictable AI characters.

The player manages a dysfunctional company populated by autonomous employees who have ambitions, grudges, habits, relationships, personal goals, and questionable professional ethics.

Employees procrastinate, form office alliances, start unnecessary meetings, hoard stationery, manipulate KPIs, spread gossip, compete for promotions, and send passive-aggressive emails.

The player can observe the office as a living miniature world or take control as CEO and attempt to keep the company profitable without destroying employee morale.

**Core design principle:** The frontend must look extraordinary, but the game mechanics must be real. Every significant interaction should produce a measurable consequence in the simulation.

# 2. VISUAL DIRECTION

Create a premium, stylized, interactive 3D miniature office with a strong visual identity.

The world should resemble a beautifully art-directed miniature corporate diorama: charming characters, absurd office details, cinematic lighting, expressive animations, and dark corporate humor.

Avoid generic SaaS dashboard aesthetics, excessive gradients, giant empty hero sections, and static stock illustrations.

## Visual language

- Deep charcoal backgrounds and warm off-white interface surfaces.
- Muted corporate blue, toxic lime, warning amber, and restrained emergency red.
- Warm office lighting contrasted with cool monitor illumination.
- Soft ambient occlusion, carefully tuned shadows, subtle bloom, and depth.
- Rounded miniature furniture, tactile materials, readable character silhouettes.
- Editorial typography, compact data displays, tasteful micro-animations.
- Consistent iconography and excellent visual hierarchy.

Use real 3D objects and interactive scene elements wherever they improve the experience. Do not fake the entire simulation using a collection of flat cards.

## Main application shell

Create a full-screen application with these regions:

1. **Top command bar**
   - Corporate Hell™ identity.
   - Company name and current fiscal day.
   - Play/pause state and simulation speed.
   - Company health indicator.
   - Notification center.
   - Settings and sound controls.

2. **Central 3D viewport**
   - Dominates the screen.
   - Shows the interactive office and animated employees.
   - Supports camera movement, zooming, panning, and room navigation.
   - Includes a compact scene overlay for the selected employee or active event.

3. **Left navigation rail**
   - Office.
   - Employees.
   - Departments.
   - Finance.
   - Incidents.
   - Corporate inbox.
   - CEO campaign objectives.
   - Simulation laboratory.

4. **Right contextual inspector**
   - Appears when selecting an employee, room, or incident.
   - Displays relevant information and available actions.
   - Must not permanently obscure the 3D scene.

5. **Bottom simulation timeline**
   - Pause, resume, and adjustable speed.
   - Current in-game time.
   - Recent events.
   - Upcoming meetings and deadlines.
   - Scrubbable historical timeline only if actual state history supports it; otherwise show a clearly labeled event history.

Make the interface responsive. On mobile, use a compact bottom navigation, collapsible inspector, and touch-friendly camera controls.

# 3. THREE-DIMENSIONAL OFFICE WORLD

Use React Three Fiber, Three.js, and Drei to build the 3D environment.

## Office environment

Construct a fully navigable office featuring:

- Open-plan cubicles.
- CEO corner office.
- Conference room.
- Break room.
- Reception area.
- Server room.
- Pantry and coffee machine.
- Presentation wall.
- Employee desks with computers, chairs, papers, plants, and coffee cups.

Build furniture and environmental props from reusable procedural geometry and carefully selected low-poly models.

Do not depend on unavailable paid assets, external model URLs, or copyrighted game assets. The application must remain visually complete when offline after dependencies have been installed.

Use instancing and reusable geometry where appropriate. Avoid creating excessive draw calls for repeated objects.

## Camera and interaction

Implement:

- Smooth orbit controls with sensible bounds.
- Wheel or pinch-to-zoom.
- Pan and recenter controls.
- Click-to-select employees.
- Click-to-inspect rooms and objects.
- Hover highlighting and subtle selection outlines.
- Camera focus animation when an employee or incident is selected.
- Department navigation that smoothly moves the camera.
- A reset-camera control.
- Clear visual feedback for selectable objects.

Prevent camera controls from interfering with UI buttons or text selection.

## Character design

Create at least 10 visually distinguishable employee characters using procedural low-poly geometry or locally available models.

Characters should have:

- Distinct body proportions and silhouettes.
- Different clothing colors.
- Hair or head accessories where appropriate.
- Simple expressive facial features.
- Walking and idle animations.
- Desk-working animations.
- Meeting and presentation gestures.
- Frustration, celebration, exhaustion, and confusion reactions.

Use a shared character rig or reusable procedural character components. Character diversity should come from data-driven variations rather than ten unrelated implementations.

If external animation assets are unavailable, implement procedural movement with appropriate joint rotations and body movement.

Employees must move between desks and rooms using basic navigation with collision avoidance or a simple waypoint-based movement system.

Characters must not teleport randomly between desks during normal simulation.

## Living office atmosphere

Add subtle ambient activity:

- Monitors displaying changing visualizations.
- Printer activity.
- Coffee-machine animations.
- Meeting-room occupancy.
- Floating, brief thought bubbles above employees.
- Occasional office events with synchronized reactions.
- Subtle dust particles only where appropriate.
- A day/night or working-hours lighting transition.
- Ambient office sound and optional event sound effects.

All animations must be performant and respect reduced-motion preferences.

Provide a fallback presentation if WebGL is unavailable, with readable employee and simulation information rather than a blank screen.

# 4. TWO PLAYABLE GAME MODES

## Mode A — SANDBOX

Purpose: Watch the company descend into glorious dysfunction.

The player creates or selects a company and observes autonomous employees interacting with each other.

Allow the player to:

- Start and stop the simulation.
- Adjust simulation speed.
- Add employees.
- Change employee roles and departments.
- Change workplace policies.
- Trigger controlled random events.
- Assign projects and deadlines.
- Schedule or cancel meetings.
- Reward or reprimand employees.
- Select individual employees and inspect their behavior.
- View office gossip, rivalries, and team relationships.
- Reset the simulation or generate a new company.

Include a scenario generator with presets such as:

- Monday Morning Disaster.
- The Mandatory Team-Building Event.
- The Great Coffee Shortage.
- Quarterly KPI Panic.
- CEO Has Discovered AI.
- Layoff Rumor Season.
- The 47-Slide Presentation.
- The Printer Rebellion.

Each preset must configure actual simulation conditions, not simply change a title or background.

Sandbox should be enjoyable even if the AI service is unavailable. Use deterministic local simulation rules for the core behavior.

## Mode B — CEO CAMPAIGN

Purpose: Survive a series of increasingly absurd corporate crises.

Create a playable campaign with objectives, financial pressure, consequences, and an eventual ending.

The player inherits a dysfunctional company with:

- Limited cash reserves.
- Employee morale problems.
- Conflicting department priorities.
- Pending projects.
- Unnecessary recurring meetings.
- Customer and investor pressure.
- An executive team with questionable competence.

### Campaign loop

1. Begin a fiscal day.
2. Review the previous day's events.
3. Inspect company finances and employee morale.
4. Receive emails, requests, and incidents.
5. Make management decisions.
6. Assign budgets, projects, policies, and resources.
7. Advance time.
8. Resolve employee actions and project outcomes.
9. Review the consequences.
10. Progress toward the next objective.

### CEO decisions

Implement meaningful actions such as:

- Cancel recurring meetings.
- Introduce a four-day workweek.
- Freeze hiring.
- Hire additional employees.
- Approve training budgets.
- Launch a new product.
- Impose a productivity policy.
- Give an employee a promotion.
- Investigate suspicious expenses.
- Allocate resources between departments.
- Offer bonuses.
- Restructure a department.
- Respond to an embarrassing internal email leak.

Every action must affect relevant state variables and produce understandable consequences.

Avoid decisions where every option has the same result.

### Campaign objectives

Examples:

- Survive the first 10 fiscal days.
- Keep cash flow positive.
- Complete a major project before its deadline.
- Recover employee morale above a target.
- Resolve a department conflict.
- Deliver a quarterly report.
- Survive an investor review.
- Avoid bankruptcy while maintaining a minimum workforce.

Track objective progress using actual simulation state.

### Victory and failure

Victory conditions may include completing the final objective, achieving sustained profitability, or successfully stabilizing the company.

Failure conditions may include bankruptcy, prolonged company collapse, or failing a critical deadline.

Provide a post-campaign report showing financial performance, employee outcomes, major decisions, and the absurd events that defined the run.

# 5. EMPLOYEE AI AND PERSONALITIES

Implement a data-driven employee system with persistent identities and distinct behavior.

Each employee should contain:

- ID and name.
- Role and department.
- Personality archetype.
- Skill levels.
- Productivity.
- Morale.
- Stress.
- Energy.
- Ambition.
- Trust.
- Current activity.
- Current task.
- Current location.
- Relationships with other employees.
- Known incidents and memories.
- Personal goals.
- Current concerns.
- Workload and deadlines.

Use bounded numeric values with clearly defined minimums and maximums.

## Employee archetypes

Create at least these 10 archetypes:

1. **The Meeting Addict**
   - Solves every problem by scheduling another meeting.
   - Consumes time and occasionally improves coordination.

2. **The Corporate Bootlicker**
   - Tries to impress leadership.
   - May improve executive relationships while damaging peer trust.

3. **The Silent Genius**
   - Highly skilled but avoids unnecessary communication.
   - Can produce excellent results when given uninterrupted time.

4. **The LinkedIn Motivational Speaker**
   - Generates endless inspirational corporate language.
   - Occasionally boosts morale, often wastes time.

5. **The Professional Procrastinator**
   - Delays work until deadlines approach.
   - May produce a last-minute breakthrough or a catastrophic failure.

6. **The Office Gossip**
   - Collects and spreads information.
   - Can reveal useful information while worsening conflicts.

7. **The KPI Manipulator**
   - Optimizes measured performance rather than real outcomes.
   - May inflate reports while creating hidden risks.

8. **The Burned-Out Veteran**
   - Experienced and capable but sensitive to excessive workload.
   - Can mentor others if given time and support.

9. **The Unnecessary Manager**
   - Delegates everything and produces little direct work.
   - May coordinate teams but introduces bureaucracy.

10. **The AI Evangelist**
    - Wants to automate every task.
    - Sometimes improves efficiency and sometimes breaks a functioning process.

Give employees names, short biographies, strengths, weaknesses, goals, and relationship tendencies.

## Decision engine

Do not rely on a language model for every simulation tick.

Use deterministic local rules to calculate employee actions based on:

- Personality.
- Current needs.
- Workload.
- Task priorities.
- Department policies.
- Relationships.
- Recent events.
- Available resources.
- Randomness from a seeded random-number generator.

An employee should choose among valid actions such as:

- Work on a task.
- Take a break.
- Request help.
- Start a meeting.
- Chat with a colleague.
- Avoid work.
- Resolve a conflict.
- Escalate an incident.
- Work toward a personal goal.

Use utility scoring or a behavior-state machine to select actions.

The same initial seed and action sequence should reproduce the same local simulation results wherever practical.

# 6. THE SIMULATION ENGINE

Create a dedicated simulation engine independent of React rendering.

Use a fixed simulation tick with configurable speed. The rendering frame rate must never determine the simulation's business logic.

Suggested structure:

- `SimulationEngine`
- `CompanyState`
- `EmployeeAgent`
- `TaskScheduler`
- `EventResolver`
- `FinanceEngine`
- `RelationshipEngine`
- `CampaignManager`
- `GameRules`
- `SeededRandom`

Each simulation tick should:

1. Update work progress.
2. Update employee needs.
3. Evaluate employee decisions.
4. Process movement and room occupancy.
5. Resolve scheduled tasks.
6. Generate eligible events.
7. Update financial effects.
8. Update morale and stress.
9. Evaluate campaign objectives.
10. Record significant events.
11. Emit a new state snapshot.

Use explicit action validation. The simulation must reject impossible actions and preserve state invariants.

Avoid updating every component on every tick if the relevant data has not changed.

## Core company metrics

Implement actual calculations for:

- Cash reserves.
- Daily revenue.
- Daily operating costs.
- Net profit or loss.
- Productivity.
- Employee morale.
- Average stress.
- Employee turnover risk.
- Project completion.
- Customer satisfaction.
- Company reputation.
- Executive confidence.

Define formulas and document them. Metrics must derive from game state rather than random decorative values.

## Example mechanics

- Excessive meetings reduce available work time.
- Overwork increases short-term output but worsens stress.
- High stress can lower productivity and raise resignation risk.
- Training improves skills over time at a financial cost.
- Employee conflict can reduce collaboration.
- Better team coordination can improve project outcomes.
- Bonuses cost money but may improve morale.
- Artificially inflated KPIs can trigger audits and reputation penalties.
- Project delays can damage revenue and investor confidence.
- Office gossip can reveal real problems but may create new conflicts.

Balance the game so players can recover from mistakes, while reckless decisions can still cause a collapse.

# 7. RANDOM EVENTS AND OFFICE DRAMA

Build an event system with typed event definitions and validated effects.

Include at least 30 distinct events spanning:

- Employee drama.
- Project crises.
- Financial surprises.
- Management mistakes.
- Office equipment failures.
- Customer complaints.
- HR incidents.
- AI mishaps.
- Corporate celebrations.
- Unexpected successes.

Examples:

**The Reply-All Incident**
An employee accidentally sends a private complaint to the entire company.

**The Coffee Machine Uprising**
Employees refuse to work until the coffee machine is repaired.

**Synergy Emergency**
A manager requests a three-hour meeting to discuss reducing meetings.

**The KPI Miracle**
Productivity numbers increase dramatically, but an audit may reveal that nobody completed additional work.

**The CEO's Inspirational Speech**
The speech may boost morale, increase embarrassment, or create a new office meme.

**The Phantom Intern**
Someone reports an employee nobody remembers hiring.

**The Spreadsheet Apocalypse**
A corrupted financial spreadsheet creates conflicting reports.

**The Mandatory Fun Initiative**
Management introduces a team-building activity that may backfire.

Every event must have a real effect on game state or a meaningful player decision.

Use event weights, eligibility conditions, cooldowns, and consequences. Avoid repetitive event spam.

Maintain an event history with timestamps, severity, participants, and effects.

# 8. AI INTEGRATION — NVIDIA GLM-5.3

Use NVIDIA's hosted model API to power dynamic employee dialogue, event narration, office gossip, management emails, and contextual character reactions.

Do not use an LLM to calculate authoritative game state.

## Configuration

Use environment variables:

- `NVIDIA_API_KEY`
- `NVIDIA_MODEL`
- `NVIDIA_BASE_URL`

Use the current NVIDIA-hosted model identifier for GLM-5.3 only after verifying that it is available in the NVIDIA Build catalog and supports the required chat API. Do not invent model identifiers or assume that every model has the same capabilities.

Use the official NVIDIA API documentation and current catalog to confirm the endpoint, model identifier, request format, and rate limits.

Prefer the OpenAI-compatible client interface when supported by the selected NVIDIA endpoint.

Configure the base URL explicitly according to NVIDIA's current documentation. Never assume that the NVIDIA endpoint is identical to OpenAI's production API.

## Security

All model requests must pass through the backend.

Never expose the NVIDIA API key in:

- Client-side JavaScript.
- Vite environment variables exposed to the browser.
- Network responses.
- Source maps.
- Git commits.
- Browser local storage.

Create a `.env.example` containing placeholder values, but never put real credentials in it.

Validate all environment variables on startup and return helpful configuration errors without leaking secrets.

## Backend AI service

Create a dedicated service responsible for:

- Model requests.
- System prompts.
- Context construction.
- Structured response validation.
- Request timeouts.
- Retry and backoff policies.
- Rate limiting.
- Response caching where appropriate.
- Logging request metadata without logging secrets.
- Graceful degradation.

Use Pydantic models to validate AI output.

Ask the model for structured JSON where supported. If structured output is unavailable, parse and validate the response safely.

If the model returns invalid output, times out, or becomes unavailable, fall back to deterministic dialogue templates.

The game must remain playable without a valid API key.

## AI employee context

Every dialogue request should receive a limited context containing:

- Employee identity and personality.
- Relevant company state.
- Current task.
- Recent relevant events.
- Relevant relationships.
- The player's recent decision.
- A short, relevant memory summary.

Do not send the entire simulation history with every request.

## AI output schema

Prefer an output equivalent to:

- `dialogue`: employee's spoken line.
- `emotion`: one of the allowed emotion values.
- `thought`: short internal thought suitable for the game's interface.
- `referencedEventIds`: IDs of relevant existing events.
- `suggestedAction`: an optional action from an explicitly allowed list.
- `confidence`: a bounded score when meaningful.

Treat AI-generated suggested actions as proposals, never as authoritative commands. Validate every proposal against the game rules before applying it.

Do not allow the model to arbitrarily set company finances, employee attributes, campaign results, or other authoritative state.

## AI personalities

Write distinct system prompts for different archetypes. A meeting addict should not sound like a burned-out engineer.

Dialogue should be short, characterful, situationally relevant, and funny.

Avoid making every character sound like the same generic chatbot.

## AI cost and performance

- Generate dialogue on meaningful events or explicit user interaction, not every frame.
- Cache repeatable responses where appropriate.
- Limit concurrent requests.
- Apply timeouts and request budgets.
- Allow the user to disable AI dialogue.
- Display a clear indicator when dialogue is AI-generated or using fallback mode.

# 9. FRONTEND TECHNOLOGY

Use the following stack unless the existing repository provides a compelling reason to adapt it.

### Frontend

- React.
- TypeScript with strict mode.
- Vite.
- React Three Fiber.
- Three.js.
- Drei.
- Zustand for shared client state.
- TanStack Query for server state.
- Framer Motion for interface transitions.
- Lucide React for icons.
- A lightweight chart library for meaningful financial and performance visualizations.
- Tailwind CSS or a consistent CSS-module design system.

Use stable, mutually compatible package versions.

Do not install unnecessary dependencies. Avoid multiple libraries performing the same job.

### Backend

- Python.
- FastAPI.
- Pydantic.
- Official NVIDIA API client or the supported OpenAI-compatible client.
- SQLAlchemy.
- SQLite for local development and persistence.
- PostgreSQL compatibility for production.
- Alembic for schema migrations.

Use a repository/service architecture with explicit validation and typed schemas.

### Communication

Implement REST endpoints for ordinary actions and Server-Sent Events for live simulation updates if appropriate.

Use a single authoritative backend simulation state when running a persistent multiplayer-ready or server-authoritative session.

For the initial single-player experience, the core simulation can run locally in a dedicated TypeScript engine, with the backend providing AI dialogue and optional persistent campaign storage. Choose one clear authority for game state and never maintain competing unsynchronized copies.

Document the architecture and the trade-offs.

# 10. RECOMMENDED PROJECT STRUCTURE

Use a maintainable structure similar to:

```text
frontend/
  src/
    app/
    components/
      ui/
    scene/
      characters/
      environment/
      interaction/
    features/
      sandbox/
      campaign/
      employees/
      finance/
      events/
      inbox/
    game/
      engine/
      models/
      rules/
      scenarios/
    state/
    services/
    styles/

backend/
  app/
    main.py
    api/
    core/
    models/
    schemas/
    services/
    ai/
    repositories/
    db/
  tests/
```

Add configuration, documentation, environment examples, and scripts as needed.

Keep simulation rules separate from rendering, AI prompts separate from API handlers, and database access separate from business logic.

# 11. GAMEPLAY USER EXPERIENCE

Build the following screens:

### Launch screen
A compact, animated corporate identity reveal. Show the company logo, tagline, and start controls without forcing the user through a long cinematic.

### Company setup
Choose company name, industry, difficulty, and starting scenario.

### Mode selection
Choose Sandbox or CEO Campaign.

### Main office
The primary interactive 3D experience.

### Employee dossier
Inspect an employee's personality, performance, skills, relationships, goals, current task, and recent incidents.

### Finance and performance
Display meaningful financial metrics, trends, expenses, departmental productivity, and cash runway.

### Corporate inbox
Show contextual messages from employees, managers, customers, and investors. Messages should connect to real events and decisions.

### Incident center
Review active problems, their causes, severity, available responses, and consequences.

### Campaign briefing
Show objectives, deadlines, current risks, and the decisions required for the current day.

### End-of-day report
Summarize changes, completed tasks, financial results, employee morale, incidents, and campaign progress.

### Settings
Control sound, quality, motion, simulation speed, and AI integration.

Every screen must be functional and visually consistent.

# 12. INTERACTION DETAILS

Create satisfying micro-interactions:

- Employees visibly react when morale changes.
- A promotion triggers a celebration.
- A reprimand creates an appropriate reaction.
- Meetings gather employees in the conference room.
- A deadline warning appears before a project expires.
- Critical incidents briefly focus the camera on the relevant location.
- Financial losses appear as readable event notifications.
- Employee selection smoothly opens the dossier.
- Completed objectives trigger clear feedback.
- Pausing the simulation freezes simulation-driven movement and calculations.

Keep effects restrained enough that users can still understand what is happening.

Implement keyboard shortcuts for play/pause, camera reset, and opening the employee inspector. Document them in the interface.

Provide tooltips and short onboarding instructions.

# 13. AUDIO

Add optional, locally bundled or procedurally generated sound effects for:

- Notification events.
- Meeting starts.
- Employee celebrations.
- Important financial alerts.
- UI interaction.

If appropriate audio assets are unavailable, use Web Audio API-generated tones or omit the sound gracefully.

Never depend on remote audio files.

Respect browser autoplay restrictions. Audio must start only after user interaction.

Provide mute and volume controls.

# 14. DATA PERSISTENCE

Persist campaign progress, employee state, company metrics, unlocked scenarios, settings, and event history.

For a local-first implementation, use IndexedDB or another suitable browser persistence mechanism for game state.

Use the backend database for user-independent or server-managed records where necessary, including saved campaign snapshots and validated AI-generated content.

Provide:

- Save game.
- Load game.
- New game.
- Reset campaign with confirmation.
- Versioned save schema.
- Safe migration or fallback behavior for outdated saves.
- Export/import save data where practical.

Do not store API keys in browser persistence.

# 15. TESTING AND VALIDATION

Write automated tests for the actual game mechanics.

### Simulation tests
- Seeded simulations are reproducible where intended.
- Employee stats remain within valid bounds.
- Financial calculations are correct.
- Invalid management actions are rejected.
- Employee decisions obey eligibility rules.
- Project progress respects deadlines and available resources.
- Meetings consume time.
- Bonuses affect finances and morale.
- Stress and morale respond to workload.
- Events apply effects exactly once.
- Campaign objectives update correctly.
- Bankruptcy and victory conditions are enforced.
- Save/load round trips preserve essential state.

### AI tests
- Invalid model responses are rejected.
- Timeouts fall back gracefully.
- AI proposals cannot bypass game rules.
- Missing credentials do not crash the application.
- Secrets are never returned to the frontend.
- Rate limiting and request timeouts work.

### Frontend tests
- Main navigation works.
- Simulation controls work.
- Employee selection and inspection work.
- Campaign decisions update state.
- Responsive layouts are usable.
- The interface handles WebGL or API failures gracefully.

Use the appropriate test frameworks for the chosen stack. Run the tests and resolve failures instead of merely writing tests that have not been executed.

# 16. PERFORMANCE AND ACCESSIBILITY

Target a smooth experience on a modern laptop with integrated or dedicated graphics.

- Aim for 60 FPS on capable hardware, with a graceful lower-quality mode.
- Use instancing for repeated objects.
- Limit expensive post-processing.
- Avoid unnecessary React re-renders.
- Reuse geometries and materials.
- Dispose of unused GPU resources.
- Pause or reduce simulation activity when the application is backgrounded.
- Support keyboard navigation for the primary interface.
- Add visible focus states.
- Maintain adequate text contrast.
- Respect `prefers-reduced-motion`.
- Avoid conveying critical information through color alone.
- Provide a reduced-quality mode and non-WebGL fallback.

# 17. ERROR HANDLING

Handle the following cases gracefully:

- NVIDIA API unavailable.
- Invalid API key.
- Model not found.
- Rate limit exceeded.
- Request timeout.
- Malformed AI output.
- Database connection failure.
- Failed save or load.
- WebGL initialization failure.
- Invalid user action.
- Missing environment configuration.

Show clear, nontechnical messages to the player and preserve the current game state wherever possible.

Never display stack traces, secrets, or raw provider error payloads in the production UI.

# 18. DOCUMENTATION AND DEVELOPER EXPERIENCE

Create:

- A comprehensive README.
- `.env.example`.
- `.gitignore`.
- Frontend setup instructions.
- Backend setup instructions.
- NVIDIA model configuration instructions.
- Architecture overview.
- Simulation rules and formulas.
- Testing instructions.
- Production build instructions.
- Deployment instructions.
- Troubleshooting guide.

Provide one convenient development workflow that starts the frontend and backend.

Do not assume credentials exist. If NVIDIA credentials are unavailable, enable a fully playable demo using local fallback dialogue.

# 19. IMPLEMENTATION PLAN

Execute the work in these stages.

**Stage 1 — Inspect and establish the foundation**
Inspect the repository, establish the project structure, configure dependencies, define game models, and create the initial visual system.

**Stage 2 — Build the simulation engine**
Implement company state, employee agents, seeded randomness, projects, finances, events, relationships, and campaign rules. Test these systems independently of the frontend.

**Stage 3 — Build the 3D world**
Create the office geometry, characters, camera, interactions, room navigation, procedural animations, and responsive quality settings.

**Stage 4 — Build the game interface**
Implement the main application shell, employee dossier, incident center, finance screen, inbox, timeline, and campaign controls.

**Stage 5 — Integrate AI**
Implement the backend model service, verify the current NVIDIA GLM-5.3 endpoint and identifier, add structured dialogue generation, and implement deterministic fallbacks.

**Stage 6 — Add persistence**
Implement save/load, campaign continuation, and versioned state migration.

**Stage 7 — Test and polish**
Run tests, launch the application, inspect the rendered experience, fix runtime errors, improve visual quality, and verify both gameplay modes.

**Stage 8 — Deliver**
Provide the finished implementation, setup instructions, test results, known limitations, and the exact command to run the project.

Prioritize a complete, playable vertical slice before adding secondary features.

# 20. DEFINITION OF DONE

The project is complete only when:

- The application starts successfully.
- The 3D office renders correctly.
- Employees are selectable and visibly animated.
- Employees make autonomous decisions.
- Simulation time and game speed work.
- Sandbox mode is playable.
- CEO Campaign mode has actual objectives and consequences.
- Financial metrics derive from real game state.
- Events modify the simulation correctly.
- AI dialogue works when NVIDIA credentials and a verified model are available.
- The game remains playable without AI credentials.
- Save/load works.
- The interface is responsive and visually polished.
- Automated tests pass.
- The README contains working setup instructions.

Do not claim features work unless they have been implemented and tested.

## FINAL CREATIVE DIRECTION

Make the experience feel like a premium indie management game disguised as a corporate productivity tool.

The humor should be clever, specific, and absurd—not merely a collection of profanity and random memes.

Use cinematic camera movement, beautiful miniature environments, expressive employees, polished typography, smooth transitions, and satisfying feedback.

The user should be able to open the application, immediately understand the premise, enter the office, click an employee, witness a ridiculous situation, make a decision, and see its consequences.

**Build CORPORATE HELL™ as a real game. Not a mockup. Not a landing page. Not just a chatbot.**

Start by inspecting the existing workspace and then implement the complete project.
