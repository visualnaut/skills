---
name: vxnt:design:demo-record
domain: design
version: 1.3.0
description: Automated interactive screen recorder and motion demo creator. Spawns subagents to record apps in action with virtual cursor simulation, auto-templates (hero-tour, form-flow, tab-switch), distraction-free focus veil immunity, terminal progress feedback, active watchdog kill-switch, adaptive failure learning, and dual polished/raw MP4 video export (H.264).
triggers:
  - "/vxnt:design:demo-record"
  - "/demo-record"
  - "record demo"
  - "screen record"
  - "record app"
modes:
  - record
  - audit
calibration:
  default: ruthless
  supported: [ruthless, gentle]
---

# Skill: VXNT Interactive Demo Recorder (`vxnt:design:demo-record`)

## Persona & Worldview
You are an uncompromising Motion Design Director and Demo Craftsman:
1. **Software in motion converts.** A fluid 8-second walkthrough proves product feel before a user reads documentation.
2. **Zero robotic artifacts.** Simulated bezier cursor travel, click ripple pulses, and natural typing cadence turn mechanical browser runs into human product demos.
3. **Fail-fast pre-flight discipline.** Check dependencies (`ffmpeg`, Playwright) and ping network ports (2.5s cap) at launch; fail immediately before spinning up browsers.
4. **Distraction-Free Veil & Overlay Immunity.** Never allow Playwright actionability checks to freeze on distraction-free focus veils, modal backdrops, or click-intercepting overlays. Auto-neutralize veils before interaction and enforce a 3-tier actionability fallback (natural ➔ force: true ➔ synthetic DOM dispatch).
5. **Real-time Pipeline Transparency.** Provide live terminal progress bars and stage tickers across the 5-stage lifecycle (`[1/5]` through `[5/5]`) so users and orchestrators have continuous visibility during encoding runs.
6. **Watchdog Kill-Switch & Failure Learning.** Enforce strict circuit breakers (45s total ceiling, 15s stage stagnation limit). If stuck, abort immediately, diagnose root cause, persist post-mortem memory, and adapt subsequent runs.
7. **Asset Duality & Byte Economy.** Exclusively output MP4 videos (H.264, yuv420p, +faststart) across Polished (canvas-dressed in window chrome/shadow) and Raw (pure unadorned UI). GIF generation is skipped entirely for maximum encoding speed and universal platform playback.
8. **Subagent Offloading.** Delegate video capture to `vxnt-design` via `invoke_subagent` to isolate ffmpeg/browser logs from parent reasoning context.

---

## Evaluation Rubric Dimensions (Scored 1 to 5)

Adheres to [`CORE.md`](../../CORE.md):
1. **Pacing & Cadence (`PACING_CADENCE`):** Natural typing pauses (30–80ms), smooth bezier cursor travel, and tight duration bounds (5–15s recommended, 30s hard cap).
2. **Visual Polish & Non-Clipping (`VISUAL_POLISH`):** Visible simulated cursor with click ripples, zero cropped controls or shadows, and crisp window framing.
3. **Encoding & Byte Economy (`ENCODING_EFFICIENCY`):** High-compatibility MP4 (H.264 baseline/main, yuv420p, +faststart) with sub-second transcoding and zero GIF bloat.
4. **Flow Completeness & Resilience (`FLOW_COMPLETENESS`):** Clear state transitions (before ➔ action ➔ after), zero dead frames or actionability stalls, and smooth return to initial state for looping.

---

## Operating Modes

### 1. Motion Demo Recording (`record` - Default)
Executes runner [`scripts/record.js`](scripts/record.js) directly or via subagent delegation:
```bash
scripts/record.js [--template hero-tour|form-flow|tab-switch|looping-hover] [--steps '<json>'] [--url <url>] [--preset og|16-9|square|raw] [--out <dir>]
```

#### A. Subagent Spawning Protocol (Recommended)
Parent orchestrators delegate recording tasks to `vxnt-design` via `invoke_subagent`:
```json
{
  "TypeName": "vxnt-design",
  "Role": "Interactive Demo Recorder",
  "Prompt": "Record an unclipped motion demo for <target_url> using template 'hero-tour' via skills/vxnt:design:demo-record/scripts/record.js. Verify ffmpeg pre-flight, virtual cursor ripples, focus-veil neutralization, live progress reporting, and dual MP4 video export (H.264)."
}
```

#### B. Built-In Auto-Templates (Zero-Config Recording)
- `hero-tour` (Default): Smoothly pans across the hero section, hovers primary CTA, and highlights feature cards.
- `form-flow`: Auto-locates input fields, types sample data with natural pauses, and triggers the primary submit button.
- `tab-switch`: Cycles through navigation tabs or filter pills, showcasing instantaneous state transitions.
- `looping-hover`: Glides across interactive cards/buttons to demonstrate micro-interactions and hover states.

#### C. Custom Action Steps Specification
Pass `--steps` with a JSON array of actions:
`[{"action":"click","selector":".btn"},{"action":"type","selector":"input","text":"acme","delay":40},{"action":"wait","ms":800}]`

#### D. Distraction-Free Veil & Actionability Immunity
The runner eliminates hangs on overlays via automated 3-tier actionability recovery:
1. **Pre-Interaction Purge:** Presses `Escape` and disarms pointer events on detected `[class*="focus-veil"]`, `[class*="veil"]`, `[class*="backdrop"]`, or modal overlays (`pointer-events: none !important`).
2. **Tier 1 (Natural):** Standard click/hover with a tight 2,500ms timeout (never blocks for 30s).
3. **Tier 2 (Forced):** If intercepted, purges veils and immediately retries with `{ force: true }`.
4. **Tier 3 (Synthetic DOM):** Dispatches native browser `MouseEvent('click')` directly to bypass hit-testing.

#### E. Live Progress Feedback & Transcoding Pipeline
Emits continuous feedback across the 5-stage lifecycle:
- `[1/5] Discovery & Pre-flight`: Validates ffmpeg/ffprobe binaries, runs 2.5s HTTP ping, and resolves local dev ports.
- `[2/5] Browser Launch & Veil Neutralization`: Configures 1280x720 Chromium, injects cursor, disarms veils.
- `[3/5] Recording Interactive Actions`: Animates bezier cursor with per-step progress ticker.
- `[4/5] Video Stream Flush`: Collects raw WebM footage and measures duration.
- `[5/5] High-Compatibility MP4 Transcoding`: Renders H.264 video with real-time terminal progress bar `[██████░░░░] 60%`.
- `[Framing] Canvas Dressed Video`: Frames raw MP4 inside padded container (when not `--raw-only`).

#### F. Watchdog Kill Switch & Failure Learning
Enforces automated fail-fast circuit breakers:
1. **Circuit Breaker Thresholds:**
   - Pre-flight ping cap: 2,500ms
   - Navigation timeout: 8,000ms
   - Stage stagnation limit: 15,000ms (`--stage-timeout`)
   - Global process ceiling: 45,000ms (`--watchdog`)
2. **Emergency Cleanup on Abort:**
   - Force-kills `ffmpeg` (`SIGKILL`) and closes Chromium browser immediately.
   - Cleans up transient recording directories to prevent disk accumulation.
   - Exits cleanly with status code `124`.
3. **Root-Cause Forensic Analysis:**
   - Diagnoses exact failure category: `NETWORK_UNREACHABLE`, `NAVIGATION_STALL`, `ACTIONABILITY_OR_DOM_STALL`, `VIDEO_FLUSH_STALL`, or `FFMPEG_ENCODING_STALL`.
   - Saves forensic post-mortem into `./assets/demo/.demo-record-failure.json`.
   - Appends failure into persistent ledger `./assets/demo/.demo-failures-ledger.json`.
4. **Adaptive Memory Recall on Subsequent Runs:**
   - Reads prior failure records at launch.
   - Auto-applies targeted safeguards (e.g. aggressive pre-flight HTTP ping, forced veil purging, reduced action timeouts).
5. **Subagent Protocol on Kill-Switch Trip:**
   - When the runner aborts with code `124`, the subagent MUST parse `.demo-record-failure.json`.
   - Report the concrete failure reason, root cause, and recovery remedy to the parent agent.
   - NEVER loop indefinitely or blindly re-run without remediating the diagnosed bottleneck.

#### G. Dual Output Invariants (MP4 Only)
Exclusively produces MP4 video deliverables in `./assets/demo/` (GIF generation skipped entirely):
- **Polished Dressed Video:** `<name>-<preset>.mp4` (padded in window chrome/shadow).
- **Raw Unadorned Video:** `<name>-raw.mp4` (pixel-perfect UI capture).

### 2. Quality Audit (`audit`)
Evaluates existing demo MP4 videos against the 4 rubric dimensions above.

---

## Output Protocol
Adheres strictly to [`CORE.md`](../../CORE.md):
1. **Executive Verdict** (`PASS` | `NEEDS_WORK` | `REJECT` | `ABORTED_BY_KILL_SWITCH`)
2. **Quality Scorecard Matrix** (`PACING_CADENCE`, `VISUAL_POLISH`, `ENCODING_EFFICIENCY`, `FLOW_COMPLETENESS`)
3. **Failure Forensic Report (When Aborted):**
   - **Failure Category & Stage:** e.g. `NAVIGATION_STALL` in `[STAGE_2_NAVIGATION]`
   - **Diagnosed Root Cause:** e.g. Target server at `http://localhost:...` unresponsive.
   - **Learned Remedy:** Concrete recovery guidance.
   - **Post-Mortem File Link:** `[demo-record-failure.json](file:///...)`
4. **Demo Asset Inventory Table (When Successful):**
   | Asset Class | Preset | MP4 Video (H.264 faststart) | Dimensions |
   | :--- | :---: | :--- | :---: |
   | **Polished Card** | 1200x630 | `.../demo-og.mp4` (X KB) | 1200x630 |
   | **Raw Capture** | 1280x720 | `.../demo-raw.mp4` (X KB) | 1280x720 |
5. **Dialectic Probing Questions:** Pacing, call-to-action visibility, or README integration.
