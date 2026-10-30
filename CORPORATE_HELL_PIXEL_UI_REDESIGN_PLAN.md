# CORPORATE HELL™: Pixel-Art Immersive UI Redesign Plan

> **Design goal:** the office is the interface. You don't *open a dashboard*, you *sit at your desk, open your laptop, and click an app*. Everything is pixel art, nothing is a wall of numbers.

*Planned from your 9 screenshots plus the original code zip. Component and folder names for the newer views (Kanban, GitBub, AWSome…) are assumed, so adjust them to your repo.*

---

## 1. What's wrong today (from your screenshots)

| Screenshot | Problem | Why it hurts immersion |
|---|---|---|
| **Office view** | 17-icon left rail, plus 3 stacked left panels (player card, Executive Command, Live Activity Log), plus a right employee list of 13, plus a top bar with 6 room tabs, speed, 3 stats and Phone | The 3D office covers maybe 40% of the screen. You're managing a *website*, not standing in a *world* |
| **Office view** | Thought bubbles as long text, black blocky furniture, flat dark SaaS panels over a warm diorama | Two visual languages fighting each other |
| **Kanban** | 6 columns with horizontal scroll, every card showing type, points, progress, assignee | Reads like Jira. Nothing to *do* with your hands |
| **GitBub / CI-CD** | Table-like lists, a 9-box row, a console log | Info display, not gameplay |
| **AWSome / NVIDIOT** | Card grids with small text and +/- buttons | Spreadsheet energy |
| **Social / War Room / Growth** | Dense text, 3–5 sections per screen | The *fun* moments (viral post, launch, funding) are presented like reports |

**Root cause:** every system got its own full-page dashboard, and navigation is a permanent sidebar. Fixing that is a structural change, not a re-skin.

---

## 2. Design Principles

1. **World first, UI second.** The 3D/pixel office takes ~90% of the screen in normal play.
2. **Diegetic information.** Show state *in the world*: a smoking coffee machine = equipment incident; a red-blinking server rack = outage; wilting plants and dim lights = low morale.
3. **One focus at a time.** Only one of these is active: *World*, *Laptop*, *Phone*, *Meeting*, *Mini-game*.
4. **The 3-second rule.** Any screen should be understood in 3 seconds with **≤ 5 visible numbers**. Everything else lives in hover cards or a "Nerd Mode" toggle.
5. **Make the player *do* things.** Drag the sticky note, pull the lever, plug in the server, swipe the PR. Buttons are the last resort.
6. **One visual language.** Pixel art everywhere: world, characters, UI, fonts, icons, sound.
7. **Juice on every action.** Sound, particles, small screen shake, little animations. Cheap to build, huge for feel.

---

## 3. Target Experience (the new flow)

```
 WORLD (pixel office, almost no UI)
   │  walk to your desk, press [E]
   ▼
 CAMERA DOLLIES into the laptop → screen takes over (CRT bezel, boot blip)
   │
   ▼
 CorpOS DESKTOP  (icons: Kanban · GitBub · Pipeline · AWSome · NVIDIOT · Chirper · Launch · Investors · Mail · Team)
   │  click an app → small pixel WINDOW opens inside the laptop screen
   ▼
 [Esc] closes window → [Esc] again closes laptop → camera pulls back to the office
```

The same pattern applies elsewhere: **Phone** (`Tab`) for inbox/chat/log, **whiteboard** for meetings, **server rack** for SRE shortcuts, **CEO desk** for investors and directives. No sidebar anywhere.

### 3.1 The "world HUD" (everything that remains on screen in World mode)

```
┌──────────────────────────────────────────────────────────────┐
│ [Corporate Hell Inc.]                  Day 2  09:15  ▶ 1x 2x │  ← tiny, top corners only
│                                                              │
│                                                              │
│                  (pixel office, full screen)                 │
│                                                              │
│                                                              │
│ ♥ energy  ◆ focus  ! stress           [E] Use laptop         │  ← vitals bottom-left, prompt bottom-center
│                                       $58k   ☺69%  ⚙65%      │  ← 3 chips bottom-right
└──────────────────────────────────────────────────────────────┘
```

That's it. No rails, no panels. Toasts slide in from the top for events (auto-dismiss in 4 s, click to open the relevant app).

### 3.2 Where every existing piece of UI goes

| Today | Becomes |
|---|---|
| `LeftNavRail` (17 items) | **Deleted.** Replaced by laptop apps and world objects |
| Player card + daily obligations (left) | 3 pixel vitals bars (HUD) + obligations in the **Phone → Today** page |
| `ExecutiveCommand` (AI directive box) | App on the CEO's laptop: **"Directive.exe"** |
| `LiveActivityLog` | **Phone → Feed** |
| `FloatingEmployeesPanel` (13 people) | **Team app**, plus click a character to get a pixel **ID card** |
| `EmployeeDossier` | Pixel ID card with 3 stats and a "More…" flip side |
| `TopCommandBar` room tabs | Mini-map / `M` key fast-travel, or click doors |
| Treasury / Morale / Productivity | 3 bottom-right chips; morale also drives lighting and music |
| `BottomTimeline` | Clock chip + toast queue; "Next meeting 10:00" appears as a calendar ping |
| `IncidentsView` | World alerts (props flash) + **Pager app** on the laptop and phone |
| `EndOfDayModal`, `SettingsModal` | Pixel dialogs; Settings is the `Esc` pause menu |
| `CampaignView`, `Goals` | **Goals** sticky on the office wall + **Investors** app |

---

## 4. Pixel-Art Visual Direction

### 4.1 Rendering approach: three options

| Option | How | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A. Pixelate the existing 3D scene** | Low-res render + palette quantize + outline + toon lighting | 1–2 days, keeps your whole scene | Characters still look 3D unless replaced | **Phase 1** |
| **B. Hybrid: pixelated 3D world + sprite characters** | Option A for rooms/props, animated sprite billboards for people on a fixed orthographic camera | True pixel-art characters, still uses your scene, cheap to render | Camera rotation must be locked (sprites need fixed angles) | **Recommended end state** |
| **C. Full 2D tilemap rewrite** (Phaser/PixiJS) | Replace R3F entirely | Purest pixel art | Throws away the 3D scene and camera work; biggest effort | Only if you later want it |

**Recommendation: A → B.** You get a pixel look immediately, then upgrade characters.

### 4.2 Resolution and scaling (important for crisp pixels)

- **Virtual resolution: 480 × 270** (16:9). At 1080p that's an exact **4×** scale, at 1440p about 5.33×, so use **integer scaling** and letterbox the rest: `scale = floor(min(w/480, h/270))`.
- **Laptop OS virtual resolution: 320 × 180**, scaled by an integer inside the laptop bezel.
- Never use fractional scaling for pixel layers (it causes shimmer). Use `image-rendering: pixelated` everywhere.
- Mobile portrait: render the world at 270 × 480 with a virtual joystick, laptop opens full-screen.

### 4.3 Palette ("CH-16", extend to 32 later)

Your master prompt already defines the mood: charcoal, warm off-white, corporate blue, toxic lime, amber, restrained red. Lock a **small shared palette** so the world, UI and sprites all match:

| Role | Hex | Role | Hex |
|---|---|---|---|
| Ink (outline/bg) | `#14121C` | Corporate blue | `#3E6EC0` |
| Charcoal | `#2A2838` | Sky/monitor glow | `#8FD3FF` |
| Slate | `#4B4A5E` | Toxic lime (success) | `#B6E52D` |
| Fog | `#8C8AA0` | Amber (warning) | `#F2A93B` |
| Cream (paper/UI) | `#F4ECD8` | Alert red | `#D9453D` |
| Wood light | `#C58A55` | Plant green | `#3F8F4E` |
| Wood dark | `#7A4A2D` | Purple (ML/GPU accent) | `#8B5CF6` |
| Skin tones | 3–4 swatches | Hair/outfit swatches | from `EmployeeVisual` |

Rules: **no gradients, no blur, no rounded corners, no drop-shadows**. Depth comes from 1px highlights and 2–3 step shading.

### 4.4 Typography
- **Headings / labels:** a pixel display font (e.g. *Press Start 2P* or *Silkscreen*).
- **Body / numbers:** a readable pixel font (e.g. *Pixelify Sans* or *VT323*).
- All are available as `@fontsource/*` packages (you already use fontsource), so it works offline.
- Render text at **multiples of the font's native pixel size** and turn off font smoothing for the pixel layer.
- Provide a **"Readable font" toggle** in Settings (see Section 11).

### 4.5 The pixel look in the 3D scene (Option A details)
1. **Low-res canvas:** `<Canvas dpr={1/SCALE} gl={{ antialias:false }} style={{ imageRendering:'pixelated' }}>`. This single change makes everything chunky and also makes rendering very cheap.
2. **Palette quantization** post-process: map each pixel to the nearest palette color (lookup texture) with a small **Bayer dither** for shadows.
3. **Outline pass:** 1px dark edge from depth/normal differences, so objects and characters get that classic pixel silhouette.
4. **Toon lighting:** 3–4 light steps (`MeshToonMaterial` or a ramp), no soft shadows. Use blob or hard-edged shadows.
5. **Texel snapping:** snap camera position to the pixel grid (`pos = round(pos × pxPerUnit) / pxPerUnit`) to avoid shimmering while panning.
6. **Day/night = palette swap**, not light intensity. Evening shifts blues and ambers, which also looks great through the office windows.
7. **Replace black furniture** with palette materials (warm wood, cream, slate). The current near-black props are why the office reads as muddy.

### 4.6 Pixel characters (Option B)

Your characters are data-driven (`EmployeeVisual`: skin, hair, outfit, hairStyle, accessory), so **do the same with sprites using palette swapping**:

- **Paper-doll layers:** body, outfit, hair (6 styles), accessory (6). Draw each once in *indexed grayscale/base colors*, then **recolor in a shader** from `EmployeeVisual`. One drawing set ⇒ 13+ distinct employees. Matches your "diversity from data, not 10 separate implementations" rule.
- **Size:** 24 × 32 px frames (or 32 × 48 if you want more detail).
- **Directions:** 4 (down, up, left, right; mirror left/right to halve the work).
- **Animation set** (matches your `ActionKind` and `Emotion`):

| Group | Animations |
|---|---|
| Movement | idle, walk (4–6 frames) |
| Work | typing, reading, thinking, phone |
| Social | talk, laugh, argue, gossip-whisper |
| Needs | drink coffee, nap, ping-pong |
| Reactions | frustrated, celebrate, exhausted, confused, panic, embarrassed |
| Meeting | present, listen, doze |

- **Emote bubbles:** replace long text thought-bubbles with **small pixel icons** (☕ coffee, 💡 idea, ! alert, ?, 💢, 💤, $ ). Show full text only on hover/click. This alone removes most screen clutter.
- **Rendering:** sprite quads in the scene (`THREE.NearestFilter`, no mipmaps), y-sorted, with a small round blob shadow. Selection = 1px blinking outline.

**How to get the art (pick one):**
1. **Bake your existing procedural 3D characters into sprites** with a build script: render each from 4 angles per animation frame at ~32px through the same pixel pipeline into an atlas. Fastest path, since the rig already exists.
2. **Draw in a pixel editor** (Aseprite, or the free LibreSprite / Piskel). Best control; most time.
3. **Asset packs** (itch.io, Kenney, OpenGameArt). Check each pack's **license** and attribution requirements before shipping.

### 4.7 Pixel UI kit
Build a small component library in `frontend/src/ui/pixel/`:

`PixelWindow` · `PixelButton` · `PixelPanel` · `PixelBar` (segmented, not smooth) · `PixelIcon` · `PixelText` · `PixelDialog` · `PixelToast` · `PixelTooltip` · `PixelTabs` · `PixelToggle` · `PixelSlider` (stepped)

Tech notes:
- 9-slice borders via CSS `border-image` using small PNGs (or SVG-generated at build time).
- `image-rendering: pixelated` on every asset; icons are 16 × 16 or 8 × 8 sprites in one sheet.
- Animations use `steps()` timing so motion looks frame-based.
- Hover = 1px shift and color step; press = 1px down. No fades or easing.

---

## 5. The Laptop OS ("CorpOS")

### 5.1 Flow and technique
1. Press `E` at a desk → `uiStore.focus = 'laptop'`.
2. **Camera dolly** to the laptop mesh (you already have `CameraController.tsx`), 0.6 s ease.
3. Crossfade (or a pixel-dissolve) to a **DOM overlay framed by a laptop bezel image**, with a boot blip and a subtle scanline layer.
4. *(Optional upgrade)* use drei `<Html transform occlude>` to place the UI *on* the 3D screen mesh so the whole thing feels physical. Start with the overlay approach since it is more robust, and upgrade later if you want.

### 5.2 Desktop layout (320 × 180 virtual)

```
┌─ CorpOS ─────────────────────────────── 09:15  ▮▮▮ wifi ─┐
│                                                          │
│  [📋]Kanban   [🌿]GitBub    [⚙]Pipeline   [☁]AWSome      │
│                                                          │
│  [🧠]NVIDIOT  [🐤]Chirper   [🚀]Launch    [📈]Investors  │
│                                                          │
│  [✉]Mail(3)  [👥]Team       [🎯]Goals     [🧪]Sim Lab    │
│                                                          │
│ ┌ window ───────────────────────────────┐                │
│ └───────────────────────────────────────┘                │
│ [dock: open windows]                      [battery 80%]  │
└──────────────────────────────────────────────────────────┘
```

- **Icon grid**, double-click or `Enter` to open. **Badges** on icons (Mail 3, Pipeline red dot when CI fails). The desktop itself *is* the notification system.
- **Window manager (lite):** max 2 windows, drag by title bar, minimize, close. Snap-to-grid to stay pixel-aligned.
- **Wallpaper** reflects company stage (garage photo → neon city skyline). Cosmetic progression for free.

### 5.3 Role- and stage-aware desktops
```ts
interface AppDef {
  id: string; title: string; icon: string;
  roles?: PlayerRole[];       // which roles see it
  unlockStage?: Stage;        // e.g. NVIDIOT unlocks at Series A
  badge?: (s: CompanyState) => number | 'alert' | null;
  component: React.ComponentType;
}
```
- **Developer:** Kanban, GitBub, Pipeline, Mail, Chirper (read-only).
- **DevOps:** Pipeline, AWSome, NVIDIOT, Pager.
- **CEO:** Investors, Finance, Directive.exe, Launch, Team.
- **Designer / PM:** Design Board, Kanban, Launch (landing page), Feedback.
- Locked apps show as greyed icons with "🔒 Series A", which makes progression visible and exciting.

---

## 6. Redesigning Each App (less info, more play)

> Rule: **one screen = one job.** Keep ≤ 5 numbers visible. Detailed stats go behind a "📊 details" button.

| App | Today | Redesign |
|---|---|---|
| **Kanban** | 6 columns, horizontal scroll, dense cards | **Corkboard with sticky notes.** Show 3 lanes (To-do / Doing / Done) with the others as tabs. Cards are small colored notes (color = type) with a points badge. **Drag a note to a teammate's portrait to assign.** WIP limit shown as a "full" board stamp. Sprint progress is a single bar at the top |
| **GitBub** | PR list and branch tabs | **Subway-map branch graph:** `main` is a track, branches fork off, commits are stations. A PR is a little train heading to `main`. Review = **swipe card** (Approve / Request changes / Merge). Reviewer comment shown as a speech bubble from their pixel face |
| **Pipeline (CI/CD)** | 9 boxes and a console log | **Factory conveyor:** 9 machines on a belt, a little build-robot walks through. A failure = machine sparks and stops. Click it to open a short **fix mini-game** (pick the right fix / spot the failing line). Console log is a collapsed drawer |
| **AWSome** | Card grid with +/− | **Server-farm diorama:** rack sprites you plug in/out (instances), a **traffic crowd** of tiny pixel users queuing at the door vs capacity. Autoscale/CDN/Backups are **toggle switches** on a wall panel. Bill shown as one big meter |
| **NVIDIOT** | Price cards and an empty list | **Trading-floor style:** a live spot-price line with a "BUY NOW / WAIT" lever, GPU racks as slots that light up when rented. Preemption = rack flickers and *poof*. Job progress as a chunky bar |
| **Chirper (Social)** | Long feed with 3 reply buttons per comment | **Phone-style feed with swipe/tap:** big post card, floating pixel hearts and shares. Replying is a **3-icon choice** (🤝 helpful / 😎 meme / 🛡 defensive) with instant reaction animation. Viral spike = screen flash and a "server load!" warning |
| **Launch (War Room)** | Checklist plus channel cards | **Mission-control screen:** pre-launch checklist as 4 big lights (green/amber/red). Channels are selectable "boosters" for a rocket. Launch = 60 s real-time screen with a traffic graph, error meter and hotkey actions |
| **Investors (Growth)** | Ladder cards and funnel table | **Skyline climb:** your company is a building that gains floors per stage. Funnel is a literal pixel **funnel with coins** dropping through. "Pitch Investors" opens the pitch mini-game |
| **Mail / Phone** | Inbox view | Pixel mail list, 3 choice buttons for decision emails |
| **Team** | 13-item list | **Grid of pixel ID photos** with a tiny mood icon each. Click for the ID card |

Mini-games and choices should trigger **instant, animated feedback** (stamp, coin burst, red flash) so decisions feel physical.

---

## 7. The World: Diegetic Information

| Game state | How it shows in the world |
|---|---|
| Low morale | Lights dim, plants droop, music slows, characters hunch |
| High stress (one person) | Tiny sweat-drop and red outline pulse above them |
| Coffee machine broken | Smoke particles, queue of grumpy employees |
| CI red | Red beacon light spins above the **Pipeline wall screen** |
| Outage / traffic spike | Server rack sparks, alarm sound, screen-edge flash |
| Funding raised | Confetti, a new desk row appears next day |
| Product viral | Wall TV shows trending graph, employees cheer |
| Meeting soon | Clock on wall pulses; conference-room door glows |
| Money low | Vending machine and fridge look emptier (small props change) |
| Stage upgrade | **Office physically expands** (new floor, bigger server cage, rooftop) |

**Outside the windows:** a parallax pixel city skyline with day/night, weather, and rare fun events (a helicopter during funding news).

**Selection UX:** click a character → 1px blinking outline plus a small **ID card** popup (name, role, mood icon, 3 bars, "More…").

---

## 8. Immersion and Juice Checklist

**Camera and transitions:** dolly-in to laptop/whiteboard/server rack; pixel-dissolve between scenes; small screen shake on outages (respect reduced-motion).

**Audio:** keep your `audio.ts`. Add synthesized chiptune bleeps (Web Audio, no assets needed): typing clicks, coin on revenue, error buzz on red build, success jingle on merge, laptop boot blip, page-flip on mail. **Adaptive music:** a calm loop that adds layers as stress or chaos rises.

**Particles (pixel squares):** confetti on merge/launch, smoke on broken equipment, hearts on viral posts, coins on revenue.

**Feedback:** button press = 1px down plus click sound; a successful action pops a tiny floating "+$500" or "+3 morale" above the source.

**Personality:** a mascot assistant for onboarding (e.g. "Synergy the Stapler") who explains one thing at a time during the Intern tutorial instead of a long help screen.

**Achievements:** pixel trophy toasts ("Friday Deploy Survivor").

---

## 9. Technical Architecture

### 9.1 Folder structure
```
frontend/src/
  ui/pixel/            PixelWindow, PixelButton, PixelBar, PixelToast, tokens.css, icons sheet
  os/                  Laptop.tsx, Desktop.tsx, WindowManager.tsx, Dock.tsx, appRegistry.ts
  os/apps/             KanbanApp, GitbubApp, PipelineApp, AwsomeApp, NvidiotApp, ChirperApp,
                       LaunchApp, InvestorsApp, MailApp, TeamApp, DirectiveApp, PagerApp
  hud/                 WorldHud.tsx, VitalsBars.tsx, StatChips.tsx, InteractPrompt.tsx, Phone.tsx
  scene/pixel/         PixelPipeline.tsx (quantize + outline), palette.ts, snapCamera.ts
  scene/sprites/       SpriteCharacter.tsx, spriteAtlas.ts, paletteSwap.glsl, emotes.ts
  assets/sprites/      characters/, props/, emotes/, ui/
  stores/uiStore.ts    focus mode, open apps, windows, phone state
```

### 9.2 UI state
```ts
type Focus = 'world' | 'laptop' | 'phone' | 'meeting' | 'minigame' | 'pause';
interface UiState {
  focus: Focus;
  openWindows: { appId: string; x: number; y: number; z: number }[];
  nerdMode: boolean;           // dense stats toggle
  readableFont: boolean;
  reducedMotion: boolean;
  scale: number;               // integer pixel scale
}
```
Input is routed by `focus`: WASD moves the avatar only in `world`; `Esc` always steps focus back one level.

### 9.3 Pixel pipeline (sketch)
```tsx
// Canvas at low resolution, upscaled with nearest-neighbor
<Canvas
  orthographic
  dpr={1 / scale}
  gl={{ antialias: false, powerPreference: 'high-performance' }}
  style={{ imageRendering: 'pixelated', width: '100vw', height: '100vh' }}
>
  <PixelScene />
  <PixelPipeline palette={CH16} dither outline />
</Canvas>
```
Palette-quantize fragment shader idea: sample the scene, find the nearest color in a `1 × N` palette texture (N ≤ 32), optionally offset by a 4 × 4 Bayer matrix before the lookup for dithering. Keep it in `scene/pixel/` so it can be toggled for debugging and low-end devices.

### 9.4 Sprite character (sketch)
- One atlas texture per layer (body/outfit/hair/accessory) in grayscale index form.
- Shader uniform arrays: `skin`, `hair`, `outfit`, `outfitAccent` (from `EmployeeVisual`), swapping index shades for real colors.
- Animation state comes from existing `Employee.action` + `reaction` (`ActionKind`/`Emotion`), so **no engine changes** are needed. Just map them in `spriteAtlas.ts`.
- Facing from the existing `facing` angle quantized to 4 directions.

### 9.5 Reusing your existing code
- Engine, stores, `api.ts`, and all game logic stay untouched. The redesign is a **presentation-layer swap**.
- Existing view components become **app bodies** first ("lift and shift" into windows), then get redesigned one by one (Phase U4). That keeps the game playable the whole time.
- Add a feature flag `ui.v3` so you can switch between old and new UI while building.

### 9.6 Performance
- Low-res rendering is dramatically cheaper than your current full-res scene, which helps weaker laptops and mobile.
- Instance repeated props; one sprite atlas per layer; avoid re-rendering the DOM overlay every tick (subscribe to *selected slices* of state per app).

---

## 10. Implementation Phases

Estimates are for 1–2 developers working focused weekends.

### Phase U0: Declutter and tokens (1 day)
- Add `ui.v3` flag. Hide `LeftNavRail`, left panels, and the right employee list behind it.
- Add pixel fonts, `tokens.css`, the CH-16 palette.
- **Done when:** with the flag on, the office fills the screen with only the top bar.

### Phase U1: Pixel render pipeline (1–2 days)
- Low-res `dpr`, `antialias:false`, orthographic camera, palette quantize, outline, toon materials, camera snapping.
- Recolor black furniture with palette materials.
- **Done when:** the existing office already looks pixel-art, and panning doesn't shimmer.

### Phase U2: Pixel UI kit and minimal HUD (3–4 days)
- Build the components in Section 4.7.
- `WorldHud` with vitals, 3 stat chips, interact prompt, clock/speed, toasts.
- **Done when:** the Section 3.1 layout is live and old panels are gone.

### Phase U3: CorpOS laptop shell (4–5 days)
- Camera dolly, bezel, boot animation, desktop icon grid, window manager, dock, app registry with badges and locks.
- Port current views into windows unchanged ("lift and shift").
- **Done when:** `E` at your desk opens the laptop, and Kanban/GitBub/CI-CD/AWSome/NVIDIOT/Social/War Room/Growth all open as apps.

### Phase U4: Redesign apps one by one (6–8 days)
Priority order (biggest feel upgrade first): **Kanban → Pipeline → GitBub → Launch → AWSome → NVIDIOT → Chirper → Investors → Mail/Team**.
- Each app gets a "one job" layout, ≤ 5 visible numbers, a drag/swipe/lever interaction, and a details drawer.
- **Done when:** each app passes the 3-second test (Section 12).

### Phase U5: Pixel characters (5–7 days)
- Choose the art path (bake, draw, or pack). Build the atlas, palette-swap shader, `SpriteCharacter`, animation mapping, emote bubbles.
- Replace thought-bubble text with icon emotes, plus ID card on click.
- **Done when:** all employees are distinct pixel sprites with working walk/work/coffee/meeting animations.

### Phase U6: Diegetic world info (3 days)
- World alerts on props, morale lighting, wall TV, pager beacon, stage-based office expansion variants, pixel skyline outside.
- **Done when:** you can tell the company's state by *looking at the office*.

### Phase U7: Juice and audio (3 days)
- Chiptune SFX set, adaptive music layers, particles, floating "+$" text, transitions, shake.
- **Done when:** every major action has sound plus a visual pop.

### Phase U8: Responsive and accessibility (2–3 days)
- Integer scaling and letterbox, mobile joystick/touch, reduced motion, readable font toggle, colorblind-safe icons, key remapping.

### Phase U9: Playtest and polish (ongoing)
- Watch someone new play for 10 minutes without helping. Fix anything they hesitate on.

---

## 11. Accessibility (pixel art must still be usable)

- **Readable font toggle:** swap the pixel body font for a clean sans for long text.
- **Minimum effective text size:** ≥ 14–16 CSS px after scaling for body text.
- **Contrast:** keep ≥ 4.5:1 for text on window backgrounds.
- **Don't rely on color alone:** status uses icon *shapes* too (✓ ! ✕), important for the red/green pipeline lights.
- **Reduced motion:** disable shake, parallax, and fast flashes; keep fades instant.
- **Keyboard and controller:** every app reachable with Tab/Enter/Esc; remappable keys.
- **Volume and music toggles** in Settings; no flashing faster than 3 Hz.

---

## 12. Acceptance Tests (how you know it worked)

1. **3-second test:** show any app to someone for 3 seconds. They can say what it's for and what to do next.
2. **Number budget:** no app shows more than 5 numbers by default.
3. **No-sidebar test:** in World mode, UI covers < 10% of the screen.
4. **Pixel integrity:** screenshots at 1080p and 1440p show no blurry or half-pixel edges.
5. **Flow test:** from World → laptop → Kanban → assign a ticket → back out takes < 10 seconds and feels smooth.
6. **Diegetic test:** a new player notices a server outage from the office *without opening any app*.
7. **Performance:** 60 fps on a mid-range laptop at 1080p; stable on a phone.

---

## 13. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Pixel fonts hard to read | Readable-font toggle, larger sizes, short copy |
| Fixed camera loses free orbit | Allow pan and integer zoom steps plus room shortcuts; the art payoff is worth it |
| Sprite art takes too long | Start by baking existing 3D characters; use palette swapping for variety |
| Fractional scaling breaks crispness | Integer scale only, letterbox the rest |
| Rewriting every view is big | Lift-and-shift first, then redesign by priority, with the `ui.v3` flag |
| Over-cutting info frustrates power users | "Nerd Mode" toggle and a details drawer in every app |
| Asset licensing | Prefer self-made or CC0; record attributions in a `CREDITS.md` |

---

## 14. Quick Wins (do these first, about 1 weekend)

1. **Low-res canvas hack** (`dpr={1/4}`, `antialias:false`, `image-rendering: pixelated`): instant chunky look.
2. **Swap fonts** to pixel fonts and remove all rounded corners, gradients and shadows from the CSS.
3. **Hide the left rail and right employee panel** behind a feature flag and open them from a small button, to see how much cleaner the office feels.
4. **Replace the black furniture colors** with the CH-16 wood/cream/slate palette.
5. **Change thought bubbles to icon emotes** (☕ 💡 ! ?) with text only on hover.
6. **Build a basic laptop overlay** (a bezel plus a desktop with 8 icons that open your existing views in a window). This is the single biggest immersion jump.

---

## 15. Prompts for Your AI IDE (copy per phase)

> **Template:** "Inspect the repo first. Implement **Phase U#** of `CORPORATE_HELL_PIXEL_UI_REDESIGN_PLAN.md`. This is a **presentation-layer change only**: do not modify the simulation engine or game rules. Keep all current features working behind the `ui.v3` flag. Use integer pixel scaling, `image-rendering: pixelated`, the CH-16 palette, and the pixel UI kit. Run `npm run build` and `npm test`, and fix failures before stopping."

**Phase U3 example:** *"…Build the CorpOS laptop shell: on `E` at the player's desk, dolly the camera to the laptop, show a bezel overlay with a desktop icon grid driven by `appRegistry.ts` (role/stage aware, with badges), and open the existing Kanban, GitBub, CI/CD, AWSome, NVIDIOT, Social, War Room and Growth views as draggable pixel windows. `Esc` must close window → laptop → return camera."*

**Phase U1 example:** *"…Make the R3F canvas render at 1/4 resolution with `antialias:false`, nearest-neighbor upscaling, an orthographic camera snapped to the pixel grid, a palette-quantize post-process using the CH-16 palette with Bayer dithering, and a 1px outline pass. Replace near-black furniture materials with palette colors."*

---

## 16. One-Paragraph Pitch

> **Corporate Hell™** is a pixel-art software-company sim where the office is the interface. Walk your tiny pixel character to your desk, open your laptop, and run the company through **CorpOS**: drag sticky notes on the Kanban corkboard, ride PRs along a subway-map Git graph, fix a sparking CI conveyor belt, plug in servers as a pixel crowd lines up at the door, and launch your product from a mission-control war room. The office itself tells you how you're doing: lights dim when morale drops, the coffee machine smokes, the server rack sparks, and the building grows a floor every time you raise a round.
