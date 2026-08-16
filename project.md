# Comprehensive Architecture & Technical Blueprint — Ayush Saraf Portfolio (`project.md`)

This document serves as the definitive reference manual for understanding the structure, design architecture, data flow, animation pipeline, and deployment workflow of the **Ayush Saraf Portfolio** repository.

---

## 📑 Table of Contents
1. [Executive Summary & High-Level Concept](#1-executive-summary--high-level-concept)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Architecture & Architectural Principles](#3-architecture--architectural-principles)
4. [Complete Directory & File Structure](#4-complete-directory--file-structure)
5. [Data Architecture (`lib/data.js`)](#5-data-architecture-libdatajs)
6. [Component Deep Dive & Layout Flow](#6-component-deep-dive--layout-flow)
7. [The Animation & Interactive Engine (`components/Portfolio.jsx`)](#7-the-animation--interactive-engine-componentsportfoliojsx)
8. [Styles & Responsive Design System (`app/globals.css`)](#8-styles--responsive-design-system-appglobalscss)
9. [Development & Deployment Workflow](#9-development--deployment-workflow)

---

## 1. Executive Summary & High-Level Concept

The **Ayush Saraf Portfolio** is a ultra-modern, single-page web application engineered with Next.js 14. It showcases the technical background, career milestones, software projects, and academic background of **Ayush Saraf** — a final-year Computer Science (Core) student at VIT Vellore targeting SDE roles, with backend and full-stack application experience in Python and Java and two AI/ML engineering internships.

### Key Highlights:
- **Cinematic WebGL Intro (`AS_OS v1.0`)**: A Three.js interactive 3D particle sphere combined with a retro CLI typewriter boot sequence.
- **Custom Cursor & Particle Web**: Interactive dual-ring cursor and a 2D HTML5 Canvas particle grid that reacts dynamically to cursor position.
- **Decoupled Architecture**: All textual content and data are isolated inside `lib/data.js`, while UI components remain purely presentational.
- **Declarative Animation Pipeline**: Components utilize declarative `data-*` attributes (`data-reveal`, `data-tilt`, `data-magnetic`, `data-panel`), allowing a single master controller (`Portfolio.jsx`) to wire up all RAF loops and event handlers in one place.

---

## 2. Tech Stack & Dependencies

| Category | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `14.2.5` | React framework using the App Router model |
| **UI Library** | React | `^18.3.1` | Concurrent mode rendering and Client Components |
| **3D Engine** | Three.js | `^0.160.0` | WebGL canvas rendering for the 3D Liquid Core intro |
| **Styling** | Tailwind CSS | `^3.4.10` | Utility CSS layer & custom color utilities |
| **Post-Processing** | PostCSS / Autoprefixer | `^8.4.41` | CSS parsing and vendor prefixing |
| **Typography** | Google Fonts | Web Fonts | Space Grotesk, JetBrains Mono, Syne |

---

## 3. Architecture & Architectural Principles

The repository follows three main design paradigms:

```
                  +-----------------------+
                  |     lib/data.js       | (Data Layer: Copy, Projects, Experience, Skills)
                  +-----------+-----------+
                              |
                              v
                  +-----------------------+
                  |   app/layout.jsx      | (Global Shell: Fonts, Metadata, Root Layout)
                  +-----------+-----------+
                              |
                              v
                  +-----------------------+
                  |    app/page.jsx       | (Route Entrypoint)
                  +-----------+-----------+
                              |
                              v
                  +-----------------------+
                  | components/Portfolio  | (Master Controller: RAFs, Canvas, Three.js, Listeners)
                  +-----------+-----------+
                              |
     +------------------------+------------------------+
     |                        |                        |
     v                        v                        v
+------------+          +------------+          +------------+
| Hero.jsx   |          | About.jsx  |          | Skills.jsx | ... (Presentational Components with data-* hooks)
+------------+          +------------+          +------------+
```

### 1. Separation of Data and Presentation
No component hardcodes static copy. Everything from nav links to project metrics and work experience bullet points is imported from `lib/data.js`.

### 2. Single Master Controller Hook Pattern
Rather than attaching dozens of separate `useEffect` hooks across individual section components, `components/Portfolio.jsx` attaches a single `rootRef` wrapper. On mount, it queries child nodes by `data-*` selectors and binds animation loops, scroll observers, mouse interactions, and cleans them up cleanly on unmount.

### 3. Tokenised Colour System — Claude / Anthropic palette
All colour is declared once as CSS custom properties at the top of `app/globals.css`; nothing
else in the codebase contains a colour literal. Components reference `var(--token)` from their
inline styles, and the 2D particle field / three.js intro — which need JS values, not CSS —
read the same tokens off `:root` via `getComputedStyle` and convert them (`rgbUnit`,
`rgbTriplet` in `Portfolio.jsx`). One definition drives DOM, canvas and WebGL alike, which is
why re-theming the entire site is a single-file edit.

The palette is warm paper-and-ink with one terracotta signal. The **ground** doing the work:
`#1F1E1D` dark / bone `#F0EEE6` light. An accent swap on a cool base does not read as Claude.

| token | role |
| --- | --- |
| `--bg` / `--bg-deep` / `--surface` / `--card` | warm ground → raised |
| `--border` / `--border-2` | hairline / stronger |
| `--text` … `--text-4` | bone → dimmest |
| `--accent` / `--accent-2` | book-cloth terracotta — the single signal |
| `--accent-3` / `--accent-4` | kraft / manilla — gradient stops only |
| `--data` | **metrics & outcomes only** — kraft-sand |
| `--good` | genuine status only — muted sage |
| `--alert` | hard / destructive — clay |

**Two disciplines.** `--data` covers every metric (Practice tiles, platform totals, shipping
stats, project tiles, CGPA), so numbers never read as interactive. `--good` is restricted to
real status — heatmap, "ok" rows, Easy, the live dot; it previously coloured section tags,
nav dots, period chips and the logo pulse, which put a competing hue on every screen.

**Categorical charts separate by lightness, not hue.** Three warm oranges are
indistinguishable side by side (Hard and Basic collided on the first pass). The ramp in
`Codolio.jsx` runs sage → manilla → kraft → clay → grey, and its keys are semantic
(`easy`/`medium`/`hard`/`basic`/`unrated`) rather than colour names.

**Light theme** is fully defined under `:root[data-theme='light']` and is *opt-in only* — it
is deliberately not attached to `prefers-color-scheme`, since the WebGL intro assumes a dark
ground. Known limit: the particle field samples tokens once at mount, so a runtime toggle
leaves the background tinted for the previous theme until reload.

---

## 4. Complete Directory & File Structure

```
nextjs-portfolio/
├── app/
│   ├── globals.css         # Global styles, resets, keyframe animations, responsive rules
│   ├── icon.svg            # Site favicon / app icon vector asset
│   ├── layout.jsx          # Root layout, Google Fonts injection (Space Grotesk, JetBrains Mono, Syne)
│   └── page.jsx            # Entry point for route `/`, renders <Portfolio />
├── components/
│   ├── Portfolio.jsx       # 'use client' Master Orchestrator (Cursor, WebGL Intro, Particle Canvas, Scroll Spy)
│   ├── Hero.jsx            # Hero section with intro text, typewriter subtitle & resume link
│   ├── Marquee.jsx         # Infinite dual-track text ticker
│   ├── About.jsx           # 3-paragraph biography with custom alignment & TL;DR highlighting
│   ├── Skills.jsx          # Interactive 5-group expandable accordion (Languages, Core CS, Databases, AI/ML, Tools)
│   ├── Projects.jsx        # Project cards + detail modals (metrics, tech tags, walkthroughs)
│   ├── Codolio.jsx         # "Practice" section — live coding stats from the Codolio API
│   ├── Experience.jsx      # Career timeline featuring the two AI/ML internships
│   ├── Education.jsx       # Academic background & qualifications
│   ├── Contact.jsx         # Contact links (Gmail compose window, LinkedIn, GitHub, Codolio)
│   └── SectionTag.jsx      # Reusable section header component (e.g. "01 / ABOUT")
├── lib/
│   ├── data.js             # Centralized content store (All strings, objects, metrics, modal metadata)
│   └── codolio.js          # Server-only fetch + normalise of live Codolio coding stats
├── public/
│   ├── Ayush-Saraf-Resume.pdf     # SDE resume — shipped but no longer linked (hero points at Drive)
│   └── Ayush-Saraf-Resume-AI.pdf  # AI/ML variant — shipped but not linked
├── next.config.mjs         # Next.js configuration
├── package.json            # Node dependencies & project scripts
├── postcss.config.js       # PostCSS plugins configuration
├── tailwind.config.js      # Tailwind CSS theme extension
└── project.md              # Complete technical documentation (This file)
```

---

## 5. Data Architecture (`lib/data.js`)

All dynamic data is exported as named ES Module constants:

1. `resumeHref`: Points to the Google Drive copy of the SDE-targeted resume, opened in a new tab from the hero "RESUME.PDF" button — hosting it off-site means the resume can be swapped without a redeploy. Local copies still ship at `/Ayush-Saraf-Resume.pdf` and `/Ayush-Saraf-Resume-AI.pdf` but are unlinked.
2. `marqueeItems`: Array of punchy slogan strings for the continuous ticker.
3. `navItems`: Navigation items (`Home`, `About`, `Skills`, `Work`, `Experience`, `Education`, `Contact`) with matching hash IDs.
4. `sectionTags`: Index tags mapping section keys to numerical identifiers (`01 / ABOUT`, `02 / TOOLKIT`, etc.).
5. `typeWords`: Rotating strings displayed in the Hero typewriter loop (*Software Engineer*, *Backend Developer*, *DSA Problem Solver*, *Full-Stack Builder*, *AI Systems Engineer*) — ordered SDE-first, with the AI framing last.
6. `skillGroups`: Detailed list of skill categories, ordered so the SDE-relevant panels come first:
   - `01 LANGUAGES` (Java, Python, C/C++, JavaScript, TypeScript, SQL)
   - `02 CORE CS` (Data Structures, Algorithms, OOP, Operating Systems, System Design)
   - `03 DATABASES` (PostgreSQL, SQLite, SQL, FAISS, Pinecone)
   - `04 AI / ML` (LangChain, LangGraph, Scikit-learn, NumPy, Pandas, NLTK, Streamlit)
   - `05 TOOLS` (Git, GitHub, VS Code, Cursor, Jupyter, REST APIs)
7. `projects`: Key projects containing names, dates, descriptions, tech stack tags, metrics, and modal details (`tagline`, `overview`, `access` status pills). Ordered so the full-stack application work leads:
   - **RAG Document Q&A Platform**: Full-stack Streamlit + Python app over four AI APIs; ~10× faster indexing via an 8-worker `ThreadPoolExecutor` and timestamp-based incremental caching.
   - **Resume Feedback System**: Streamlit + SQLite hiring-assist platform with a deterministic weighted TF-IDF/cosine ATS scoring engine (70/30) and Gemini narrative feedback.
   - **Obsidian Linker**: 7-node LangGraph agent over a 200+ note vault; concurrent LLM calls via `asyncio.gather` and MD5 change detection for zero redundant calls.
   - **Student Performance Predictor**: RandomForestClassifier at 94.5% accuracy with LLaMA-generated per-student feedback reports.
8. `experience`: Career records at **La Net Team Software Solutions** (AI Intern) and **SentiAid** (AI/ML Intern).
9. `education`: Academic credentials from **Vellore Institute of Technology** (B.Tech Computer Science Core, CGPA 8.88), **Bhagwan Mahavir International School**, and **L.P. Savani School**.
10. `awards`: Array of certification & highlight objects (*Oracle Certified Foundations Associate, Java 1Z0-811*, *DSA & Problem Solving*, *2× Engineering Internships*, *CGPA 8.88*, *Self-directed Learning*) rendered in the Highlights column of `Education.jsx`.
11. `contacts`: Social links configured with custom branded color tokens (`#EA4335` Gmail, `#0A66C2` LinkedIn, `#e8ecf4` GitHub). `Contact.jsx` keys its inline SVG icon map off `type`, so adding a link requires adding a matching icon.
12. `contactEmail`: Centralized email string (`sarafa736@gmail.com`) driving pre-filled Gmail compose links.
13. `codolioUser` / `codolioProfileUrl`: The Codolio handle (`AyushSaraf`) driving both the "Coding Profile" social icon and the live stats fetch in `lib/codolio.js`.
14. `aboutParas`: Structured narrative paragraph array with alignment attributes (`flex-start`, `center`, `flex-end`), text alignment, and key phrase highlighting markers (`key: true`) for `About.jsx`.

### 5b. Live Coding Stats (`lib/codolio.js`)

The **Practice** section (`03 / PRACTICE`, `components/Codolio.jsx`) is the one part of the site
whose content is not hardcoded — it is pulled from Codolio's public profile API at request time.

**Data flow.** `app/page.jsx` is an `async` React Server Component. It awaits `getCodolioStats()`
and passes the result down as `<Portfolio codolio={...}/>` → `<Codolio data={...}/>`. Doing the
fetch server-side means no CORS preflight, no credentials in the client bundle, and no loading
state — the figures are pre-rendered into the HTML. A build-output check confirms
`api.codolio.com` appears only in `.next/server`, never in `.next/static`.

**Endpoints** (all unauthenticated, `GET`):

| Endpoint | Supplies |
| --- | --- |
| `/user/details?userKey=` | Aggregate totals, GitHub contribution map, language byte counts |
| `/profile?userKey=` | Per-platform question counts, topic distributions, badges |
| `/user/profiles/state?userKey=` | Last-sync timestamps (non-critical; failure is swallowed) |

**Normalisation.** The raw payload includes personal fields (email, avatar URL, profile views)
that are deliberately *not* carried into the returned object — only the specific stats the UI
renders. Topic names are also merged across platforms via `TOPIC_ALIASES` (LeetCode's `"Strings"`
vs GfG's `"String"`) and filtered through `TOPIC_BLOCKLIST` to drop language/meta tags such as
`"CPP"` and the generic `"Algorithms"`, which would otherwise dominate the ranking.

**Caching.** `REVALIDATE_SECONDS` (6 hours) is passed to each `fetch`, which promotes the route to
ISR — `prerender-manifest.json` shows `initialRevalidateSeconds: 21600` for `/`.

**Freshness.** The counts reflect Codolio's own last pull from each platform, which lags the live
platforms. The UI prints that date ("last synced …") rather than implying real-time data.

**Failure mode.** Any network error, non-200, unsuccessful payload, or unexpected shape is caught;
`getCodolioStats()` logs and returns `null`. `<Codolio/>` then renders nothing and `Portfolio.jsx`
filters the `coding` entry out of the side nav, so no dangling anchor is left behind. Verified by
building against an unresolvable host: the build succeeds and every other section is untouched.

---

## 6. Component Deep Dive & Layout Flow

### 1. `app/layout.jsx`
- Configures HTML metadata (`title`, `description`).
- Loads Google Fonts (`Space Grotesk`, `JetBrains Mono`, `Syne`) via standard link tags.
- Wraps application children inside a dark body container.

### 2. `app/page.jsx`
- Simplest route file; imports and renders `<Portfolio />`.

### 3. `components/Portfolio.jsx`
The main orchestrator. It sets up fixed positioning layers:
- **Canvas Layer (z-index: 0)**: HTML5 2D Particle network.
- **Radial Gradients (z-index: 1)**: Subtle ambient glow spots.
- **Custom Cursor Elements (z-index: 9998-9999)**: Follow ring (`ringRef`) + dot (`dotRef`).
- **Cinematic Intro Layer (z-index: 10000)**: Fullscreen Three.js WebGL canvas + CLI boot log (`bootRef`).
- **Side Nav (z-index: 9000)**: Vertical indicator dots with active section detection.
- **Logo (z-index: 9000)**: Top-left glowing `HJ/portfolio` branding.
- **Main Section Stack (z-index: 5)**: Renders `Hero` -> `Marquee` -> `About` -> `Skills` -> `Projects` -> `Experience` -> `Education` -> `Contact`.

### 4. Presentational Section Components
- `Hero.jsx`: Features a dual view mode: standard long intro vs concise **TL;DR** mode, controlled via a toggle switch. Includes magnetic buttons and a resume link that opens the hosted Drive copy in a new tab.
- `About.jsx`: Formatted into three distinct paragraph blocks with alternating text alignments (`left`, `left`, `right`) and highlighted key phrases.
- `Skills.jsx`: A desktop accordion using horizontal flex distribution (`data-acc` / `data-panel`); hover or click expands a category. On mobile (`<860px`) `globals.css` converts it to stacked cards.

  **Resting state.** Nothing is open by default — `initStack` starts at `set(-1)`, where every panel shares the row evenly (`flex: 1 1 0%`). Leaving them at the collapsed `94px` would strand a few hundred px of dead space on the right. Moving the pointer off the row returns it to that resting state; touch devices never fire `mouseleave`, so a tapped panel stays open there.

  **Height is measured, not hardcoded.** Panel content is absolutely positioned, so it cannot grow the row itself. `fitRow()` lays each panel's content out at the width it will have when open — respecting its `min-width`, minus the panel border — takes the tallest, and pins the row to that (capped at `88vh`). Sizing to the *tallest* rather than the current panel stops the row resizing as the pointer moves between panels. It re-runs on resize and after `document.fonts.ready`, and adapts automatically if `skillGroups` changes.

  ⚠️ **Do not set `overflow-x` alone on `[data-content]`.** Per spec, if one axis is not `visible` the other computes to `auto` — an `overflow-x: hidden` there silently produced a vertical scrollbar in every panel. It is `overflow: hidden` on both axes now, which is safe because the row is sized to fit.
- `Projects.jsx`: Interactive project cards with `data-tilt` 3D perspective effect on mouse movement and "VIEW DETAILS" modal trigger (`data-viewmore`). Renders modal overlays (`ProjectModal`) featuring:
  - **Overview & Tagline**: Extended multi-paragraph architecture summaries.
  - **Feature Walkthrough**: Step-by-step module breakdown with detailed captions and interactive screenshot carousels (`data-carousel`).
  - **Sparkline Timeline Charts**: Custom SVG `Sparkline` component rendering area/line metric charts over time.
  - **Access & Status Pills**: Honest credibility badges (e.g. `🔒 msaportal.in · institute login required`, `📄 Paper under review`).
- `Experience.jsx` & `Education.jsx`: Clean cards displaying timeframes, roles, key achievements, and academic credentials.
- `Contact.jsx`: High-visibility CTA section with pre-formatted Gmail compose trigger link and branded social media buttons.

---

## 7. The Animation & Interactive Engine (`components/Portfolio.jsx`)

All interactive effects are initialized within a single `useEffect` block in `Portfolio.jsx`.

### A. Custom Cursor System
- Listens to `mousemove` events across `window`.
- Moves `dotRef` instantly to the mouse position.
- Smoothly interpolates (`lerp`) `ringRef` toward the mouse position with a factor of `0.18`.
- Listens to `mouseover`/`mouseout` on interactive selectors (`a, button, [data-tilt], [data-magnetic]`) to expand the ring size and increase border brightness.

### B. 2D Background Particle Field
- Dynamically scales particle count based on screen area: `Math.floor(innerWidth * innerHeight / 16000)`, capped at 90.
- Updates particle positions with velocity vectors (`vx`, `vy`), bouncing off screen borders.
- Links each particle to the cursor within `150px` and to its neighbours within `120px`, opacity falling off with distance.
- **Hot-loop notes** (this is the only code running every frame for the life of the page):
  - Radii and their squares (`LINK_SQ`, `MOUSE_SQ`) are hoisted to `resize()`. The O(n²) neighbour test compares *squared* distances, so `Math.sqrt` only runs for pairs that actually draw — previously `Math.hypot` ran for all ~4,000 pairs per frame.
  - `ctx.lineWidth` is set once in `resize()` rather than per segment.
  - All dots share one fill colour, so they are batched into a single path: one `beginPath`/`fill` per frame instead of ~90.

### C. 3D WebGL Liquid Core Intro (Three.js)
- **Automatic Scroll Restoration**: Sets `history.scrollRestoration = 'manual'` on mount and calls `resetToTop()` so page refreshes always land cleanly back at the top for the intro sequence.
- **Dual Geometries**: Instantiates a Three.js `Scene`, `PerspectiveCamera`, and `WebGLRenderer`. Constructs an `IcosahedronGeometry(1.7, 5)` particle system (`Points`) layered over a subtle wireframe shell (`LineSegments(WireframeGeometry)`).
- **Particle Timeline Phases**: Animates particle positions across four key phases — Assembly (`ASM`), Hold & Noise Wobble (`HOLD`), Detonation & Explosion (`DET`), and Fade-out (`END`).
- **Adaptive Camera FOV**: Dynamically computes vertical FOV (`getAdaptiveFov()`) from a base horizontal FOV (52°) so the particle sphere maintains constant horizontal proportions across widescreen desktop and narrow portrait mobile viewports (clamped between 52° and 95°).
- **Terminal CLI Sync**: Simultaneously executes a retro terminal boot log (`bootRef` typing sequence) printing system initialization commands line-by-line (`> boot as_os v1.0`, `> mount modules`, etc.).
- **Transition Cleanup**: On completion, triggers a flash effect (`flashRef`), hides the intro overlay (`preRef`), disposes Three.js geometries/materials to prevent memory leaks, and triggers the Hero staggered reveal animation.

### D. Side-Nav Scroll Spy
- Calculates active section based on the scroll position relative to a line set at 40% of window height.
- Highlights the corresponding indicator dot (`oklch(0.85 0.16 150)`) and slides out the label text.

### E. Declarative Hook Handlers
`initPointerFx` binds both pointer effects through one helper. Each element's
`getBoundingClientRect()` is measured **once on `mouseenter`** and reused for every
`mousemove` — it previously re-measured on every move event, which is a layout read dozens
of times a second per hovered element.

- `data-tilt`: Relative cursor position over the element drives `rotateX`/`rotateY`. Resets on `mouseleave`.
- `data-magnetic`: Pulls the element slightly toward the cursor. Resets on `mouseleave`.
- `data-reveal`: Starts at `opacity: 0` / `translateY(34px)`; an `IntersectionObserver`
  (`rootMargin: 0 0 -8% 0`) reveals each element and then **unobserves it**, so the observed
  set shrinks as the visitor scrolls. Entries are sorted into document order before revealing
  so the per-section stagger still runs top-to-bottom.

  ⚠️ **The safety net is conditional and must stay that way.** It was an unconditional
  `setTimeout(revealAll, 4500)`. Since the intro runs ~4.7s, that force-revealed the entire
  page *before the visitor could scroll* — no section below the fold ever animated in, which
  silently defeated the whole feature. It now fires at 5s **only if the observer never
  delivered a callback** (i.e. genuinely broken); a healthy browser delivers one immediately
  on `observe()`. Do not restore the unconditional version.

### F. Project Modals & Feature Carousels
- `initProjectModals`: Binds `data-viewmore` triggers to target `[data-projectmodal]` overlays. Handles modal open/close animations, locks body scrolling (`overflow: hidden`), converts modal images to eager loading on open, fires `recalc` events to resize carousels dynamically, and sets up backdrop click & `Escape` key listeners.
- `initFeatureCarousels`: Auto-advancing screenshot carousel controller (`data-carousel`) for project feature walkthroughs. Dynamically measures active slide height, auto-plays every 4.5 seconds, pauses on mouse hover, and syncs dot indicators.

### F2. Loading Screens & the Readiness Gate

Two overlays exist, both at `z-index: 10000`, both present in the SSR HTML so the page is
covered from first paint. `[data-intro]` is what everyone sees; `[data-simpleload]` is the
fallback for browsers that cannot run WebGL.

```css
[data-simpleload] { display: none; }   /* JS sets display:flex inline when WebGL is missing */
```

No `!important` anywhere here, so JS wins in both directions — it reveals the fallback with
an inline `display: flex` and dismisses whichever loader ran with an inline `display: none`.

WebGL is probed on a **throwaway** canvas, never the real one — binding a `webgl` context on
the intro canvas would stop three.js claiming it with its own attributes:

```js
const webglOK = (() => {
  try { const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
})();
if (!canvas || !webglOK) { runFallbackLoader(); return; }
```

- **`[data-intro]`** — the three.js particle sphere and boot log. Plays its scripted animation
  to `END`, then calls `holdThenFinish()`, which parks on the final frame until the page is
  genuinely ready. The pre-existing 7 s `safety` timeout still forces an exit unconditionally.
- **`[data-simpleload]`** — the designed static counterpart, built to carry the same weight as
  the cinematic version without moving: a masked scanline grid, the site's ambient colour wash,
  four HUD corner brackets, the gradient `AYUSH SARAF` wordmark in Syne, a role line, three
  live status rows, a gradient progress bar, and a `LOADING · n%` → `READY` readout. Fades out
  on ready with an 800 ms floor so it registers instead of flashing past.

**The readiness signal** (`const ready`, top of the effect) is split into three named
milestones so the progress shown is real rather than a decorative timer:

| step | resolves on |
| --- | --- |
| `dom` | `DOMContentLoaded` (or already past `loading`) |
| `fonts` | `document.fonts.ready` |
| `assets` | `window.load` |

`ready` races `Promise.all` of those against a 6 s `READY_CAP_MS` cap. The cap matters — a hung
font request would otherwise hold the overlay indefinitely. Each milestone ticks its row to
`ok` and advances the bar by a third; a `sealed` flag stops a late step (one that lands after
the cap already fired) from dragging a completed bar backwards.

Verified with CDP network throttling (50 KB/s, 400 ms RTT) that the gate is real rather than
cosmetic: the loader held 1385 ms → 2079 ms (fallback screen) and 4726 ms → 5435 ms (cinematic).

> **Bug worth remembering:** the bar's "nudge off zero" timer (60 ms) originally raced
> `ready`, which on a warm cache resolves first — the kick then landed *after* completion and
> dragged a finished bar from 100 % back to 65 %. `ready` now clears that timer.

### G. Motion Policy & Accessibility

- **`prefers-reduced-motion` is deliberately NOT honoured.** Every visitor receives the full
  motion experience — WebGL intro, particle field, custom cursor, marquee, `gradmove`,
  `pulseGlow`, hero parallax, `data-tilt`, `data-magnetic`, carousel auto-advance. This is an
  explicit product decision by the site owner, made with the accessibility trade-off stated.

  There is no `reduceMotion` variable in `Portfolio.jsx` and no `@media (prefers-reduced-motion)`
  block in `globals.css`. **Do not reintroduce either without asking the owner** — a well-meaning
  "accessibility fix" here silently reverts a decision that was made on purpose.

  If it is ever revisited, the better shape is an in-page motion toggle (default follows the OS,
  visitor can opt into full motion) rather than an unconditional media query, since that satisfies
  both the preference and the design intent.

- ⚠️ **Content visibility depends entirely on JS.** `[data-reveal]` elements start at
  `opacity: 0` inline and nothing in CSS forces them visible. Two things guarantee content is
  never permanently blank: the *conditional* force-reveal safety in `initReveal` (5 s, fires
  only if the IntersectionObserver never delivered a callback), and the `<noscript>` block in
  `app/layout.jsx` (which also hides both loaders). **Do not remove either** — and do not make
  the safety unconditional, see section E for why.

- **ARIA & Keyboard Navigation**: Implements structured ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-label="Section navigation"`), manages focus trapping on modal open, restores trigger button focus on modal close, and exposes keyboard `Escape` closing.
- **ARIA & Keyboard Navigation**: Implements structured ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-label="Section navigation"`), manages focus trapping on modal open, restores trigger button focus on modal close, and exposes keyboard `Escape` closing.

### H. Performance Notes

Measured on the production build, headless Chrome at 1440x900. The scroll benchmark is a
fixed 80-step sweep down the page and back.

| | before | after |
| --- | --- | --- |
| Route JS (`/`) | 188 kB | **149 kB** |
| First Load JS | 275 kB | **236 kB** |
| Style recalcs per scroll sweep | 220 | **177** |
| Script time per scroll sweep | ~82 ms | **~67 ms** |
| Layout count per scroll sweep | 6 | 6 (unchanged) |

What produced them:

1. **three.js named imports.** `import * as THREE` pulled the whole library into the route
   chunk; only 13 classes are used. Importing them by name cut 39 kB — by far the largest win
   here. Keep it that way; a namespace import silently undoes it.
2. **`rafLoop()` helper — fixed a real memory leak.** The cursor and particle loops each did
   `rafs.push(requestAnimationFrame(loop))` *every frame*, so a shared array grew by ~60
   entries per second for as long as the tab stayed open, and unmount then walked thousands of
   dead frame ids. Each loop now keeps a single live id and registers one cleanup.
3. **`IntersectionObserver` for `data-reveal`** instead of a scroll listener that measured all
   43 elements on every scroll event, plus `unobserve` on reveal. Note the honest result: this
   did **not** reduce the layout count — the browser was batching those reads well enough that
   the "forced reflow" concern did not materialise. It did cut style recalcs ~20% and script
   time ~19%.
4. **Cached rects in `initPointerFx`** — one `getBoundingClientRect()` per hover instead of one
   per `mousemove`.
5. **Particle hot-loop**: squared-distance culling (no `sqrt` for non-drawing pairs), hoisted
   constants, `lineWidth` set once, and all dots batched into a single path.
6. **`scroller` resolved once** rather than re-walking ancestors with `getComputedStyle` for
   each of the three consumers.

Removed as dead: `state.built`, the `rafs` array, `scrollerOf()`, `@keyframes marqueeRev`,
and three unused fields on the Codolio payload (`tags`, per-platform `badges`, and the
heatmap's `start`/`end`).

---

---

## 8. Styles & Responsive Design System (`app/globals.css`)

`app/globals.css` imports Tailwind CSS base layers and defines key animations and media queries:

### Core Animations & Keyframes
- `@keyframes gridflow`: Creates a perspective grid floor animation.
- `@keyframes blink`: Classic terminal cursor blinking effect.
- `@keyframes pulseGlow`: Subtle opacity pulsing for indicator dots.
- `@keyframes marquee` / `marqueeRev`: Smooth horizontal text scrolling animation.

### Responsive Breakpoints & Adaptive Rules
1. **Desktop (> 1024px)**:
   - Full horizontal expanding accordion for Skills categories (height measured at runtime by `fitRow`, typically ~475–545px).
   - Side navigation bar with scroll spy indicators visible on right edge.
   - Dual-column grid layouts for Projects, Education, and Highlights.
2. **Landscape Tablet / Short Viewports (`max-height: 900px & min-width: 861px`)**:
   - (Removed) A `clamp(340px, 55vh, 430px) !important` cap on the Skills accordion used to live here. It beat the inline height and squeezed the row below what its content needed — the cause of the clipped panels. JS owns this height now.
3. **Large Tablet (`≤ 1024px`)**:
   - Early single-column collapse for Education section (`.edu-col`) to accommodate multi-line institution credentials smoothly.
4. **Tablet / Small Screen (`≤ 860px`)**:
   - Skills accordion converts to a stacked vertically-expanding card layout (`[data-acc]`).
   - About section CGPA badge constrained via `.about-meta-card` (`max-width: 220px`).
5. **Mobile Viewport (`≤ 820px`)**:
   - Side navigation hidden (`.side-nav { display: none !important; }`).
   - General two-column grids collapse to single column (`.two-col`).
   - SectionTag right accent line shrinks from 60px to 30px (`[data-sectag-line]`).
   - Hero scroll indicator hidden (`.hero-scroll-ind`).
   - Resume button position and padding optimized (`.resume-btn` top: 20px, right: 16px).
6. **Medium & Small Mobile (`≤ 600px` & `≤ 480px`)**:
   - About section paragraphs forced to left alignment (`[data-para]`).
   - Project modal overlay inner padding scaled down to 26px (`.project-modal-panel`).
   - Contact footer centered when stacked (`.contact-footer`).
   - Hero description expands to full available width (`.hero-desc`).
   - Timeline left spacing adjusted to prevent dot clipping in Experience (`#experience`).

---

## 9. Development & Deployment Workflow

### Local Development Commands
To run the project locally:

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```
The dev server starts at `http://localhost:3000`.

### Production Build
To create an optimized production build:

```bash
npm run build
npm start
```

### Git & Deployment
- **Git Repository**: Branch `main`. ⚠️ `origin` still points at the upstream template repository (`https://github.com/hardikjalan/portfolio.git`) — repoint it before pushing:
  ```bash
  git remote set-url origin https://github.com/wizardofvoid/<your-repo>.git
  ```
- **Deploying to Vercel**:
  1. Connect your GitHub account to [Vercel](https://vercel.com).
  2. Import the `portfolio` repository.
  3. Framework Preset: **Next.js** (Auto-detected).
  4. Click **Deploy**.

---
*Document maintained for Ayush Saraf's portfolio (design ported from the `hardikjalan/portfolio` template).*
