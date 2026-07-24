# Ayush Saraf — Portfolio (Next.js)

Animated single-page portfolio on a warm Claude/Anthropic palette. Next.js 14 (App Router)
+ Tailwind, ready to version in Git and deploy to Vercel/Netlify.

## Stack
- **Next.js 14** (App Router, JSX — no TypeScript)
- **React 18**
- **Tailwind CSS 3** (utility layer; component styling is inline for exact parity with the design)
- **three.js** — the "Liquid Core" cinematic intro

## Getting started
```bash
cd nextjs-portfolio
npm install
npm run dev        # http://localhost:3000
```
Build for production:
```bash
npm run build && npm start
```

## Deploy
- **Vercel:** import the repo, root directory = `nextjs-portfolio`, framework auto-detected. Deploy.
- **Netlify:** build command `next build`, publish `.next` (or use the Next.js runtime plugin).

## Project structure
```
app/
  layout.jsx      # <html>, fonts (Space Grotesk / JetBrains Mono / Syne), metadata
  page.jsx        # renders <Portfolio/>
  work/page.jsx   # /work archive — header + <WorkGraph/>
  globals.css     # colour tokens (the whole palette), resets, keyframes, responsive rules
components/
  Portfolio.jsx   # 'use client' orchestrator — owns the root ref + ALL effects
                  # (cursor, particle field, three.js intro, typing, scroll reveal,
                  #  hero parallax, TL;DR toggle, stack accordion, tilt, magnetic, nav spy)
  Hero.jsx  Marquee.jsx  About.jsx  Skills.jsx  Codolio.jsx  Projects.jsx
  Experience.jsx  Education.jsx  Contact.jsx   # presentational sections
  Cursor.jsx      # the ring+dot cursor — used by BOTH / and /work
  WorkGraph.jsx   # 'use client' constellation canvas + filters + a11y list
  SectionTag.jsx  # small shared "01 / ABOUT" tag
lib/
  data.js         # all copy/content + worksOverrides/allWorks for the archive
  codolio.js      # server-only fetch + normalise of the live Codolio coding stats
  works.generated.json  # committed GitHub snapshot (npm run fetch:works)
scripts/
  fetch-works.mjs # regenerates works.generated.json from the GitHub API
public/
  Ayush-Saraf-Resume.pdf      # SDE resume — linked from the hero "RESUME.PDF" button
  Ayush-Saraf-Resume-AI.pdf   # AI/ML variant — shipped but not linked (swap `resumeHref` to use it)
```

### How the effects work
Section components are pure markup carrying `data-*` hooks (`data-reveal`, `data-tilt`,
`data-magnetic`, `data-panel`, `data-hero`, etc.). `Portfolio.jsx` holds a single root ref and,
in one `useEffect`, wires every behavior by querying those hooks — so sections stay simple and
all animation logic lives in one place. The effect returns a full cleanup (RAFs, listeners,
three.js dispose, IntersectionObserver).

## Editing content
Everything textual lives in `lib/data.js`. `Contact.jsx` keys its inline SVG icons off each
contact's `type`, so adding a new social link means adding a matching icon there too.

## Loading screens

There are two. The cinematic one is what everyone gets; the static one is the fallback
for browsers that can't run WebGL (probed on a throwaway canvas before three.js
touches the real one):

| | shown when | what it is |
| --- | --- | --- |
| `[data-intro]` | default | the cinematic WebGL sphere + boot log |
| `[data-simpleload]` | WebGL unavailable | static HUD screen — grid, corner brackets, gradient wordmark, live status rows, progress bar |

Both exit on a **real readiness signal**, not a timer. It's split into three milestones —
`dom` (`DOMContentLoaded`), `fonts` (`document.fonts.ready`) and `assets` (`window.load`) —
which drive the status rows and the progress bar, capped at 6 s so a stalled font CDN
can't strand anyone. The cinematic version additionally plays its full animation first and
holds the last frame if the page isn't ready yet; its pre-existing 7 s safety still forces
an exit regardless. Measured: on a throttled connection the loader correctly holds ~700 ms
longer than on a fast one.

⚠️ Both loaders are dismissed by JS, so the `<noscript>` block in `app/layout.jsx` hides
**both** — without that, a visitor with JS disabled would stare at a loading screen forever.

## Motion policy

The site **deliberately ignores `prefers-reduced-motion`** — every visitor gets the full
experience (WebGL intro, particle field, custom cursor, marquee, parallax, tilt/magnetic).
This is a product decision by the owner, not an oversight: do not "restore" the media query
without asking. There is no `reduceMotion` branch left in `Portfolio.jsx` and no
`@media (prefers-reduced-motion)` block in `globals.css`.

## Selected Work & the /work archive

**Homepage** (`components/Projects.jsx`) is a ledger of index rows, not cards. Each row *is*
the modal trigger — it still carries `data-viewmore`, so `initProjectModals` in
`Portfolio.jsx` is untouched. `initWorkRows` (also in `Portfolio.jsx`) drives the row hover
states and the single shared floating preview card, positioned on a rAF-throttled
`mousemove`. The preview is disabled under 860px and on `(hover: none)` — it's a pointer
affordance with nowhere to live on a phone.

**`/work`** renders every public repo as a force-directed constellation on a plain canvas
(no new deps). Edges join projects that share a technology; weight = how many shared, and
heavier links pull shorter.

⚠️ **A canvas has no semantics.** The same data is *always* in the DOM as `.work-list` —
screen-reader-only on desktop, and it **replaces** the graph below 720px / on touch. Don't
"clean up" that list; it is the accessible content, not a duplicate.

### Where the archive data comes from

```bash
npm run fetch:works    # rewrites lib/works.generated.json from the GitHub API
```

The JSON is **committed on purpose** — `/work` has no runtime API dependency, no rate limit,
and no prod failure mode. The script only captures mechanical facts (name, language, dates,
links). Everything editorial lives in `worksOverrides` in `lib/data.js` and is merged over
the top, so re-running the fetch never clobbers your edits.

This matters more than it sounds: **none of the repos carry GitHub topics and most have no
description**, so the raw snapshot gives little beyond name + language. The overrides map is
where the real tech lists, display names and categories live — and the tech lists are what
give the graph its edges.

`featured` is derived from `projects[].repo` in `lib/data.js`, so the four homepage projects
are automatically the four ringed nodes — one source of truth. Setting `featured: true` in
`worksOverrides` still works for anything without a homepage entry. `hidden: true` excludes
a repo (currently just `obsidian-vault`, which is notes rather than code).

## Colour

The palette is **Claude / Anthropic** — warm paper-and-ink with a single terracotta signal.
Every colour lives in the token block at the top of `app/globals.css`. **Nothing else in the
codebase hardcodes a colour** — components use `var(--token)`, and the canvas / three.js intro
read the same tokens off `:root` at runtime. If you find yourself typing a hex value outside
that block, add a token instead.

What actually makes it read as Claude is the **warm neutral ground** (`#1F1E1D` dark, bone
`#F0EEE6` light), not the accent on its own. Swapping only the accent onto a blue-grey base
does not work.

| token | means | notes |
| --- | --- | --- |
| `--accent` | interactive / brand | book-cloth terracotta — the one hero colour, used sparingly |
| `--accent-3` / `--accent-4` | kraft / manilla | brand-gradient stops only, never solo |
| `--data` | **metrics and outcomes only** | kraft-sand: lighter and flatter than the accent, so numbers never look clickable |
| `--good` | genuine positive status | muted sage — heatmap, "ok" rows, Easy. **Not** for labels or chrome |
| `--alert` | hard difficulty, destructive | clay |

Two rules do the design work:

1. **`--data` is metrics only.** Every number on the page is sand — Practice tiles, platform
   totals, shipping stats, project metrics, CGPA. Hue is reserved for charts, where colour
   genuinely encodes a category.
2. **`--good` is status only.** It used to colour section tags, nav dots, period chips and the
   logo pulse, which put a second hue everywhere and fought the terracotta. Those are all
   `--accent` or neutral now. Claude's look is one accent used sparingly, not two competing.

⚠️ **Categorical charts need lightness separation, not just hue.** In a warm palette three
oranges side by side are indistinguishable — Hard and Basic were initially the same colour to
the eye. The ramp in `Codolio.jsx` is ordered sage → manilla (lightest) → kraft (mid) → clay
(deepest) → grey. Keep that spread if you add a category.

### Light theme

Light is defined and works, but it is **opt-in** — `<html data-theme="light">`. It is
deliberately *not* wired to `prefers-color-scheme`, because the WebGL intro and particle
field are built for a dark ground and flipping automatically would ambush anyone whose OS
is set to light. To try it:

```js
document.documentElement.setAttribute('data-theme', 'light')
```

⚠️ Caveat: the 2D particle field samples its colours **once at mount**. Set the theme before
load (or reload after toggling) or the background field keeps the previous theme's tint. DOM
colours all flip instantly. Adding a real toggle means re-reading those tokens on change.

## Performance guardrails

A few things in `components/Portfolio.jsx` are load-bearing for performance — they look like
style choices but aren't:

- **Import three.js by name, never `import * as THREE`.** The namespace import pulls the whole
  library into the route chunk: 188 kB → 149 kB just from switching to named imports.
- **Use `rafLoop()` for any per-frame work.** It holds one live frame id. Pushing ids into an
  array each frame (the old pattern) leaks ~60 entries/second for the life of the tab.
- **`data-reveal` uses an `IntersectionObserver` and unobserves on reveal.** Its safety-net
  timeout is deliberately *conditional* — an unconditional one force-reveals the page before
  the visitor can scroll and kills the effect entirely.
- **`initPointerFx` caches each element's rect on `mouseenter`.** Don't move
  `getBoundingClientRect()` back into the `mousemove` handler.

## Local development

`next dev` and `next build` **share the `.next` directory**. Running `npm run build` while
`npm run dev` is live corrupts the dev server's chunks — it starts serving 500s with
`Cannot find module './###.js'`, and CSS stops loading, which looks exactly like "the
animations broke". Stop the dev server before building, or build with a separate
`--distDir`. If you hit it: kill the dev server, `rm -rf .next`, restart.

## Live coding stats (the "Practice" section)

`app/page.jsx` is an async **server** component: it calls `getCodolioStats()` and passes the
result into `<Portfolio codolio={...}/>`, which hands it to `<Codolio/>`. Because the fetch
happens on the server there is no CORS problem, no API key in the bundle, and no loading
spinner — the numbers are baked into the HTML.

- **Source:** Codolio's public API (`api.codolio.com`), no auth required. The handle is
  `codolioUser` in `lib/data.js`.
- **Refresh:** the route is ISR with a 6-hour `revalidate` (`REVALIDATE_SECONDS` in
  `lib/codolio.js`), so a deployed site re-pulls 4× a day on its own.
- **Freshness caveat:** these numbers are only as current as *Codolio's* last sync with
  LeetCode/GfG/HackerRank, which is a separate thing from our fetch. The section prints that
  date ("last synced …") so it never overstates itself. To move it, hit refresh on the
  Codolio profile.
- **If Codolio is down:** `getCodolioStats()` logs and returns `null`, the section and its nav
  entry don't render, and the rest of the page is unaffected. The build never fails on it.

## Notes
- `cursor: none` hides the native cursor in favor of the custom ring+dot (set in `globals.css`).
- Fonts load from Google Fonts in `app/layout.jsx`.
