# Beetle Care Tracker

A web app for tracking care of a pet Rainbow Stag Beetle, built for a child user
(with a parent helping set it up). Brawl Stars-inspired visual style — bold colors,
playful icons, chunky rounded buttons, badge/achievement graphics.

## Tech stack
- Single-page web app: React + Tailwind CSS
- No backend — all data stored in browser localStorage (single-device, single-user app)
- Deployed as static site, added to iPad home screen (behaves like a standalone app)
- Mobile-first layout (primary device is iPad, portrait orientation)

### Deployment
- **Live at https://charleschow2045.github.io/beetle-care-app/** — GitHub
  Pages, served from the `main` branch root, same pattern as the sibling
  `english-ops`/`chinese-ops` projects (each its own repo under the
  `charleschow2045` GitHub account, each with Pages enabled via
  `gh api repos/<name>/pages -X POST -f "source[branch]=main" -f "source[path]=/"`).
  This repo (`beetle-care-app/`) has its **own** git history, separate from
  the parent `Claude` folder's `sketch-echo` repo — `git` commands here
  only see this folder.
  This is now the primary way to use the app (works from any device,
  including the iPad, with no local server running) — the local
  `StaticServer.exe` setup below is for **development/testing only**.
  To publish a change: commit + `git push` from `beetle-care-app/`; Pages
  rebuilds automatically (takes ~30-60s — poll
  `gh api repos/charleschow2045/beetle-care-app/pages` for `"status":"built"`).

### Implementation detail: no build step
- No Node.js required: React, ReactDOM, Babel Standalone, and Tailwind are
  loaded via `<script>` CDN tags (same pattern as the sibling `sketch-echo`
  project's single-file approach, extended to a few classic `.jsx` script
  files for maintainability)
- JSX files are plain classic `<script type="text/babel" src="...">` tags,
  loaded in dependency order, sharing a single global namespace object `App`
  (each file attaches what it defines to `window.App.*`) — no ES modules,
  no bundler
- Requires being served over http(s) (not opened via `file://`) because
  Babel Standalone fetches `src` scripts via XHR. Local testing uses
  `.claude/StaticServer.exe` (a small multi-threaded C# static file server,
  source in `.claude/StaticServer.cs`, compiled with the C# compiler that
  ships with Windows — `csc.exe`) since this machine has no working
  Python or Node — run it with
  `.claude\StaticServer.exe --root beetle-care-app --port 5500`.
  Bound to all network interfaces (not just loopback) so it's reachable
  from other devices on the same Wi-Fi — e.g. the iPad, at
  `http://<this-PC's-LAN-IP>:5500`, found via `Get-NetIPAddress`.
  An earlier PowerShell-based version (`static-server.ps1`, still present
  for two unrelated sibling projects' launch configs — don't touch it)
  hung under concurrent load: it was single-threaded and this page fires
  ~20 concurrent requests on load (one per `<script src>` tag), which
  overwhelmed it. The C# version handles each connection on its own
  thread. It was also loopback-only at first (`HttpListener` refuses to
  bind non-localhost prefixes without admin rights); the C# version uses
  a raw `TcpListener`, which has no such restriction.

## Core features (build in this order)
0. **Setup / Add Beetle form** — MUST be built first, since all other features
   depend on this data. When adding a beetle, capture:
   - Beetle photo (optional — upload or take a photo; resized client-side
     before being stored, since there's no backend)
   - Nickname
   - Species (free text, no field guide/database needed)
   - Last jelly change date (optional, defaults to today if unknown)
   - Last substrate/grass change date (optional, defaults to today)
   - Last misting date (optional, defaults to today)
   - Last wood change date (optional, defaults to today)
   - Eclosion date (date it became an adult) — optional, used for age calculator
   - Current life stage: larva / pupa / adult
   This data feeds the reminder countdowns and age calculator in later features.
   All of the above must also be editable after creation (not just set-once)
   via an "Edit Profile" action on the beetle's profile card — reusing the
   same form pre-filled with the beetle's current values.
1. **Reminders + multi-beetle support** — beetle switcher (add/select beetle),
   four reminder types per beetle (jelly, substrate, misting, wood), each with
   editable frequency in days, dashboard cards showing days until due / overdue,
   "mark done" button resets the countdown.
   - **Substrate is the one reminder whose frequency depends on life stage**,
     not a flat number (`Storage.SUBSTRATE_FREQUENCY_BY_STAGE` in
     `storage.jsx`): larva 60 days, pupa **no reminder at all** (hidden from
     the Missions dashboard, with a note explaining why), adult 30 days.
     Verified against species care guides rather than assumed — see the
     comment above `SUBSTRATE_FREQUENCY_BY_STAGE` for sources and reasoning.
     Applied at beetle creation, at profile edit (life stage picker), and
     when a Feature 4 growth/molt event changes life stage. A one-time
     migration (`Storage.reconcileSubstrateForStage`, run at app load)
     upgrades beetles saved before this existed, but only touches
     larva/pupa beetles whose substrate frequency is still exactly the old
     universal default (30) — a real customization happening to equal
     exactly 30 is unlikely, so this won't clobber a deliberate edit.
2. **Photo log / diary** — photo + short note + date, shown as scrollable timeline.
3. **Temperature & humidity log** — manual entry, simple line chart over time.
   Chart is hand-rolled SVG (`src/TempHumidityLog.jsx`, `MiniLineChart`) —
   no charting library, consistent with the no-build-step approach. Two
   separate small charts (temperature, humidity) rather than one dual-axis
   chart, since their scales differ and a single shared axis would be
   confusing for a child reading it. Either value can be logged without the
   other. Worth +5 points per reading (diary-entry-sized, since it's a quick
   log) and counts as a care action for the Feature 6 streak.
   - **Reference range for the Rainbow Stag Beetle** (`REFERENCE_RANGE` in
     `TempHumidityLog.jsx`): 22–26°C, 70–85% humidity. Verified against
     species care guides, not assumed — see sources in the comment above
     `REFERENCE_RANGE`. Explicitly labeled as Rainbow-Stag-Beetle-specific
     in both the info note and the i18n string text, since `species` is
     free text and a future beetle of a different species would need a
     different range this app has no way to know. Shown as: a text note at
     the top of the tab, an "Ideal range" line under each chart, and a
     shaded green band drawn behind each chart's line (the chart's Y domain
     expands to include the reference band even when actual readings fall
     outside it, so the band is always visible for comparison).
4. **Molting / eclosion event log** — separate from daily care; tag entries as
   larva / pupa / adult stage milestones. Updates the beetle's life stage.
   Each stage shows a one-line care tip (Woofz/Dogo-style pairing of
   logging + advice) — e.g. a freshly-eclosed adult should rest before its
   first jelly feeding. The tip for the beetle's *current* stage is always
   visible at the top of the Growth tab, not just right after logging an
   event. Logging a new stage defaults the picker to the natural next stage
   (larva→pupa→adult) but any stage can be picked. Worth +20 points (more
   than a diary entry, since it's a bigger milestone) and counts as a care
   action for the Feature 6 streak.
5. **Lifespan / age calculator** — uses eclosion date from beetle profile,
   auto-displays "days as an adult." Shown as an extra row on the profile
   card right under Eclosion date, only when an eclosion date is set.
6. **Streak & points system** — consecutive days with no missed reminders;
   award points/badges Brawl-Stars-style for milestones. Per-beetle, not
   global — inspired by かぶくわ王 (Japanese beetle-collecting app), where
   each beetle raised is its own "collectible card" with its own stats.
   Points: +10 per reminder marked done, +5 per diary entry. Streak: counts
   consecutive calendar days with nothing overdue (recomputed from current
   reminder state each time the app loads or a care action happens — there's
   no backend/cron, so it's a live derivation, not a stored daily log).
   Badge tiers by total points: 🥉 Bronze (0), 🥈 Silver (50), 🥇 Gold (150),
   💎 Diamond (300). Shown as a stats strip on the beetle's profile card.
7. **Substrate/wood notes** — free text field per beetle for brand/size used
   (single field covering both substrate and wood, since they're commonly
   bought together). Set via the Setup/Edit form, shown as a small note
   card on the profile when non-empty.
8. **Share/export** — composites a shareable "beetle card" PNG on a canvas
   (`src/ShareExport.jsx`, `generateShareImage`): photo, name/species/stage,
   the streak/points/badge stats strip, and a mini collage of up to 4 recent
   diary photos. Button lives next to "Edit Profile" on the profile card.
   Hands the generated file to the native share sheet via `navigator.share`
   with `files` (works on iPad Safari 15+ — AirDrop/Messages/Photos etc.)
   when `navigator.canShare({ files })` is supported, and always offers a
   plain `<a download>` fallback — no backend, no hosted link, since none
   exists for this app.

## Additional features (added outside the original 0-8 plan)
- **Explore tab** — reference info, not per-beetle data:
  - Beetle shops in Hong Kong, each with an embedded Google Maps view
    (keyless `maps.google.com/maps?q=...&output=embed` iframe, no API key)
    plus an "Open in Google Maps" link-out. Shop/address data is sourced
    from public web search, not guaranteed current — UI includes a note to
    call ahead before visiting.
  - Beetle enthusiast websites/communities in Hong Kong & Taiwan (link-out
    cards). Data lives in `src/exploreData.jsx` — update that file to
    add/correct entries.
- **Quiz tab** — 10-question multiple-choice beetle knowledge & handling quiz
  (`src/BeetleQuiz.jsx`), one question at a time with immediate feedback +
  explanation, ending in a score + badge tier (Bronze/Silver/Gold/Master)
  and a restart option. Not tied to beetle data/localStorage — a separate
  badge namespace from the Feature 6 per-beetle care badges above.
- **Bilingual UI (EN / Hong Kong-style Traditional Chinese)** — no i18n
  library; a hand-rolled dictionary + React Context in `src/i18n.jsx`
  (`STRINGS.en` / `STRINGS.zh`, a `t(key, vars)` helper, `useI18n()` hook).
  Toggle lives in the header (EN / 中文), persisted to localStorage
  (`beetleCare:lang`). Quiz questions and Explore shop/community data carry
  their own `{en, zh}` / `note`+`noteZh` fields rather than going through
  the central dictionary, since they're paired content that must stay in
  sync per language. Font stack includes "Noto Sans HK" as a fallback for
  CJK glyphs (Baloo 2 doesn't have them).
- **Tab content stays mounted, hidden via CSS rather than conditionally
  rendered** — fixes a bug where switching tabs used to unmount and reset
  in-progress state (quiz progress restarting at question 1, an open diary
  draft disappearing). All six tab bodies render at once inside
  `activeTab === key ? "" : "hidden"` wrapper divs in `Root.jsx`.
- **Tab bar is a 3-column grid**, not a single flex row — switched once the
  tab count grew to 6, to keep tap targets large enough for a child user on
  narrower screens.
- **Data backup/restore** (`src/BackupSettings.jsx`) — the app has no
  server, so a reset/cleared iPad would otherwise wipe everything
  permanently. A ⚙️ button in the header opens a modal to export the raw
  `beetleCare:v1` localStorage value as a downloadable `.json` file, or
  restore from one. Restoring requires an explicit confirmation step
  (shows beetle count from the file) since it replaces ALL current data.
  `Storage.sanitizeImportedState` validates the file shape and repairs a
  stale/missing `activeBeetleId` before it's allowed to replace live state.
- **Delete for diary entries, growth events, and temp readings** — each
  was previously add-only. Diary: delete button inside the entry-detail
  modal. Growth/temp: a 🗑️ button directly on each list row. All use a
  plain `window.confirm()` rather than custom UI, since it's a single
  destructive tap needing just a yes/no, not full flows like the backup
  restore confirmation. Deleting does **not** retroactively adjust points
  or streak — those are treated as a permanent achievement record, not a
  strict ledger recomputed from current data.
- **"Today Across Your Beetles" overview** (`src/TodayOverview.jsx`) — a
  card at the top of the Missions tab summarizing every beetle with an
  overdue/due-today reminder, so you don't have to switch beetles one by
  one to check. Only renders once there are 2+ beetles; shows an
  all-good message when nothing needs attention rather than disappearing,
  so it still gives a clear "yes, checked, you're fine" signal. Tapping a
  row switches the active beetle.
- **Custom home-screen icon** (`beetle-care-app/icon-512.png`) — gold/amber
  gradient with a hand-drawn vector beetle (plain canvas shapes: ellipses
  + curved leg/antenna strokes), not an emoji glyph — emoji rendered as a
  flat monochrome shape in the headless generation environment (no color
  emoji font), so vector shapes were used instead for a reliable result.
  Wired via `<link rel="apple-touch-icon">` (iOS home screen) and
  `<link rel="icon">` (browser tab/Android). iOS applies its own rounded-
  corner mask automatically, so the source PNG is a plain square.

## Design reference
- Overall look & feel: Planta-style — light background, white cards, real
  photos front and center (not a dark game-UI backdrop; kid testing showed
  the original dark theme read as too dark/uninviting)
- Reminder dashboard cards: structure like plant-care apps (e.g. Planta) —
  countdown card per task, tap to mark done
- Gamification (streaks/points/badges): styled like Habitica, but reskinned
  with Brawl Stars-inspired colors/icons

## Design notes
- Playful UI — mission cards, XP bars, badge icons — on a light, friendly
  canvas rather than a dark one
- Beetle photos (user-uploaded, via the profile photo picker) are the visual
  centerpiece — used in the profile card and the beetle switcher avatar,
  falling back to a 🪲 emoji placeholder only when no photo is set
- Large tap targets (child user)
- Single page app (no complex routing)
- Cantonese/Chinese labels are fine if requested, but default to English unless told otherwise
- Font: "Baloo 2" (Google Fonts) — rounded, bold, playful
- Palette: light lime/cream background, white cards with a soft green-tinted
  border and drop shadow; saturated gold/blue/green/orange/violet/rose still
  used for buttons, badges, and status accents to keep it bold and playful

## Explicitly out of scope for v1
- Species field guide / identification database
- Weather API integration
- Backend, accounts, login, or multi-user data sharing

## Data model (localStorage key `beetleCare:v1`)
```
{
  activeBeetleId: string | null,
  beetles: [
    {
      id: string,
      name: string,
      species: string,               // free text, may be blank
      lifeStage: "larva" | "pupa" | "adult",
      eclosionDate: ISO string | null,
      photoDataUrl: string | null,   // resized JPEG data URL from PhotoPicker
      supplyNotes: string,            // free text, may be blank
      createdAt: ISO string,
      diaryEntries: [
        { id: string, photoDataUrl: string | null, note: string, date: ISO string, createdAt: ISO string }
      ],
      moltEvents: [
        { id: string, stage: "larva" | "pupa" | "adult", note: string, date: ISO string, createdAt: ISO string }
      ],
      tempLogs: [
        { id: string, temperature: number | null, humidity: number | null, date: ISO string, createdAt: ISO string }
      ],
      gamification: {
        points: number, streak: number, bestStreak: number, lastGoodDate: "YYYY-MM-DD" | null
      },
      reminders: {
        jelly:     { frequencyDays: number, lastDoneAt: ISO string },
        substrate: { frequencyDays: number, lastDoneAt: ISO string },
        water:     { frequencyDays: number, lastDoneAt: ISO string },
        wood:      { frequencyDays: number, lastDoneAt: ISO string }
      }
    }
  ]
}
```
## Build status
- [x] Feature 0 — Setup / Add Beetle form
- [x] Feature 1 — Reminders + multi-beetle support
- [x] Feature 2 — Photo log / diary
- [x] Feature 3 — Temperature & humidity log
- [x] Feature 4 — Molting / eclosion event log
- [x] Feature 5 — Lifespan / age calculator
- [x] Feature 6 — Streak & points system
- [x] Feature 7 — Substrate/wood notes
- [x] Feature 8 — Share/export

All 9 original features are now built, plus the Explore/Quiz/bilingual
additions above.
