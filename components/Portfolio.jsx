'use client';

import { useEffect, useRef } from 'react';
// Named imports (not `import * as THREE`) so the bundler can drop the rest
// of three.js — only these are used by the intro.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
  WireframeGeometry,
} from 'three';
import { navItems, typeWords, projects } from '../lib/data';
import Cursor from './Cursor';
import Hero from './Hero';
import Marquee from './Marquee';
import About from './About';
import Skills from './Skills';
import Codolio from './Codolio';
import Projects from './Projects';
import Experience from './Experience';
import Education from './Education';
import Contact from './Contact';

/* Only what the hover preview renders — kept out of the effect body so the
   controller stays about behaviour, not content. */
const WORK_PREVIEWS = projects.map((p) => ({
  num: p.num,
  tagline: p.details?.tagline ?? p.desc,
  metrics: p.metrics ?? [],
}));

export default function Portfolio({ codolio = null }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const preRef = useRef(null);
  const bootRef = useRef(null);
  const pctRef = useRef(null);
  const introCanvasRef = useRef(null);
  const flashRef = useRef(null);
  const simpleLoadRef = useRef(null);
  const simpleBarRef = useRef(null);
  const simplePctRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups = [];
    const on = (target, ev, fn, opts) => { target.addEventListener(ev, fn, opts); cleanups.push(() => target.removeEventListener(ev, fn, opts)); };
    const state = { introDone: false, heroShown: false, runHeroIntro: null };

    /* Runs `fn` every frame and registers exactly ONE cleanup holding the live
       frame id. The previous version pushed a fresh id into a shared array on
       every tick — that array grew by ~60 entries a second for as long as the
       page stayed open, and cleanup then cancelled thousands of dead ids. */
    const rafLoop = (fn) => {
      let id = 0;
      const tick = () => { fn(); id = requestAnimationFrame(tick); };
      tick();
      cleanups.push(() => cancelAnimationFrame(id));
    };
    // NOTE: `prefers-reduced-motion` is intentionally NOT consulted — every
    // visitor gets the full motion experience, by product decision. The static
    // [data-simpleload] screen is kept only as the no-WebGL fallback below.

    /* Canvas and WebGL take colour as JS values, so they can't use var(--x).
       Read the tokens off :root once instead, and keep the theme as the single
       source of truth rather than duplicating hex literals down here. */
    const tokens = getComputedStyle(document.documentElement);
    const token = (name, fallback) => (tokens.getPropertyValue(name).trim() || fallback);
    /* #rrggbb -> [r,g,b] 0..1, for three.js vertex colours. */
    const rgbUnit = (hex) => {
      const h = hex.replace('#', '');
      const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
      const n = parseInt(v, 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };
    /* #rrggbb -> "r,g,b", so canvas can build rgba() with a live alpha. */
    const rgbTriplet = (hex) => rgbUnit(hex).map((c) => Math.round(c * 255)).join(',');

    // Resolved once: this walks ancestors calling getComputedStyle, and the DOM
    // above the root doesn't change for the life of the effect.
    const scroller = (() => {
      let n = root.parentElement;
      while (n && n !== document.body) { const o = getComputedStyle(n).overflowY; if (o === 'auto' || o === 'scroll') return n; n = n.parentElement; }
      return window;
    })();
    const scrollTarget = scroller === window ? window : scroller;

    /* ---------- real page-readiness signal ----------
       Both loading screens exit on this rather than on a bare timer, so the
       overlay actually covers the work it claims to. Resolves when the document
       has finished loading subresources AND webfonts are ready — whichever is
       slower — with a hard cap so a stalled font CDN can never strand a user
       behind the loader. */
    const READY_CAP_MS = 6000;
    // Split into named milestones so the loading screen can report real progress
    // instead of a made-up percentage.
    const readySteps = {
      dom: new Promise((res) => {
        if (document.readyState !== 'loading') return res();
        on(document, 'DOMContentLoaded', () => res());
      }),
      fonts: document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
      assets: new Promise((res) => {
        if (document.readyState === 'complete') return res();
        on(window, 'load', () => res());
      }),
    };
    const READY_KEYS = Object.keys(readySteps);
    const ready = (() => {
      const settled = Promise.all(READY_KEYS.map((k) => readySteps[k]));
      const capped = new Promise((res) => { const id = setTimeout(res, READY_CAP_MS); cleanups.push(() => clearTimeout(id)); });
      return Promise.race([settled, capped]);
    })();

    /* ---------- always land on the hero after a refresh ---------- */
    // Stop the browser from restoring the previous scroll position on reload,
    // then snap back to the top so the intro always resolves into the home section.
    const resetToTop = () => {
      if (scroller === window) { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; }
      else scroller.scrollTop = 0;
    };
    const prevScrollRestoration = 'scrollRestoration' in history ? history.scrollRestoration : null;
    if (prevScrollRestoration !== null) history.scrollRestoration = 'manual';
    resetToTop();
    cleanups.push(() => { if (prevScrollRestoration !== null) history.scrollRestoration = prevScrollRestoration; });

    /* ---------- background particle field ---------- */
    (function initCanvas() {
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext('2d');
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      // Hoisted out of the frame loop: these only change on resize, and the
      // squared radii let the culling test skip a sqrt per pair.
      const LINK = 120 * DPR, LINK_SQ = LINK * LINK;
      const MOUSE_R = 150 * DPR, MOUSE_SQ = MOUSE_R * MOUSE_R;
      const DOT_R = 1.4 * DPR, TAU = Math.PI * 2;
      // Link-to-cursor uses the interactive colour, particle-to-particle and the
      // dots use the accent gradient partner — so the field re-tints with the theme.
      const C_CURSOR = rgbTriplet(token('--accent', '#8A96FF'));
      const C_LINK = rgbTriplet(token('--accent-3', '#A78BFA'));
      const C_DOT = rgbTriplet(token('--text-2', '#9BA1BE'));
      let W, H, pts = [];
      const mouse = { x: -9999, y: -9999 };
      const resize = () => {
        W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
        cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
        const n = Math.min(90, Math.floor(innerWidth * innerHeight / 16000));
        pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.28 * DPR, vy: (Math.random() - 0.5) * 0.28 * DPR }));
        ctx.lineWidth = DPR; // constant — no need to reassign per segment
      };
      resize();
      on(window, 'resize', resize);
      on(window, 'mousemove', (e) => { mouse.x = e.clientX * DPR; mouse.y = e.clientY * DPR; });

      rafLoop(() => {
        const n = pts.length;
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < n; i++) {
          const p = pts[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx = -p.vx;
          if (p.y < 0 || p.y > H) p.vy = -p.vy;
        }
        for (let i = 0; i < n; i++) {
          const a = pts[i], ax = a.x, ay = a.y;
          const dmx = ax - mouse.x, dmy = ay - mouse.y, dmSq = dmx * dmx + dmy * dmy;
          if (dmSq < MOUSE_SQ) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + C_CURSOR + ',' + (0.16 * (1 - Math.sqrt(dmSq) / MOUSE_R)) + ')';
            ctx.moveTo(ax, ay); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
          for (let j = i + 1; j < n; j++) {
            const b = pts[j], dx = ax - b.x, dy = ay - b.y, dSq = dx * dx + dy * dy;
            if (dSq < LINK_SQ) {
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(' + C_LINK + ',' + (0.12 * (1 - Math.sqrt(dSq) / LINK)) + ')';
              ctx.moveTo(ax, ay); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        // All dots share one fill colour, so they batch into a single path —
        // one fill() per frame instead of one beginPath+fill per point.
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const p = pts[i];
          ctx.moveTo(p.x + DOT_R, p.y);
          ctx.arc(p.x, p.y, DOT_R, 0, TAU);
        }
        ctx.fillStyle = 'rgba(' + C_DOT + ',.55)';
        ctx.fill();
      });
    })();

    /* ---------- hero intro reveal ---------- */
    (function initHeroIntro() {
      const els = [...root.querySelectorAll('[data-hero]')];
      els.forEach((el) => {
        el.style.opacity = '0'; el.style.transform = 'translateY(40px)'; el.style.filter = 'blur(6px)';
        el.style.transition = 'opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1),filter 1s ease';
      });
      state.runHeroIntro = () => {
        if (state.heroShown) return; state.heroShown = true;
        els.forEach((el, i) => { el.style.transitionDelay = (i * 0.13) + 's'; el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; });
      };
      const t = setTimeout(() => state.runHeroIntro && state.runHeroIntro(), 2600); cleanups.push(() => clearTimeout(t));
    })();

    /* ---------- Liquid Core cinematic intro ---------- */
    (function initIntro() {
      const pre = preRef.current, boot = bootRef.current, pct = pctRef.current, flash = flashRef.current, canvas = introCanvasRef.current;
      if (!pre) return;
      /* Fallback loading screen for browsers that can't run the WebGL intro
         (no canvas, WebGL blocked, or context creation refused). Same readiness
         gate, same hand-off to the hero — just no 3D. */
      const runFallbackLoader = () => {
        pre.style.display = 'none';
        const wrap = simpleLoadRef.current, bar = simpleBarRef.current, pctEl = simplePctRef.current;
        const done = () => {
          state.introDone = true;
          if (wrap) {
            wrap.style.opacity = '0'; wrap.style.visibility = 'hidden'; wrap.style.pointerEvents = 'none';
            const hide = setTimeout(() => { wrap.style.display = 'none'; }, 500);
            cleanups.push(() => clearTimeout(hide));
          }
          state.runHeroIntro && state.runHeroIntro();
        };
        if (!wrap) { done(); return; }
        wrap.style.display = 'flex'; // CSS keeps it hidden until it's actually needed
        // A floor so the screen actually reads on a warm cache instead of
        // flashing past — long enough to land, short enough not to feel padded.
        const MIN_MS = 800;
        const started = performance.now();
        // Each milestone ticks its row and advances the bar. `sealed` stops a
        // late-finishing step from dragging a completed bar back down — the same
        // race that previously reset it from 100% to 65%.
        let sealed = false, doneCount = 0;
        READY_KEYS.forEach((k) => {
          readySteps[k].then(() => {
            if (sealed) return;
            doneCount++;
            const cell = wrap.querySelector(`[data-loadstep="${k}"]`);
            if (cell) { cell.textContent = 'ok'; cell.style.color = 'var(--good)'; }
            const frac = doneCount / READY_KEYS.length;
            if (bar) bar.style.width = Math.round(10 + frac * 90) + '%';
            if (pctEl) pctEl.textContent = 'LOADING · ' + Math.round(frac * 100) + '%';
          });
        });
        ready.then(() => {
          sealed = true;
          // The cap can fire before every step lands; show them settled anyway.
          READY_KEYS.forEach((k) => {
            const cell = wrap.querySelector(`[data-loadstep="${k}"]`);
            if (cell && cell.textContent !== 'ok') { cell.textContent = 'ok'; cell.style.color = 'var(--good)'; }
          });
          if (bar) bar.style.width = '100%';
          if (pctEl) { pctEl.textContent = 'READY'; pctEl.style.color = 'var(--good)'; }
          const wait = Math.max(0, MIN_MS - (performance.now() - started));
          const t = setTimeout(done, wait + 220);
          cleanups.push(() => clearTimeout(t));
        });
      };

      const lines = ['> boot as_os v1.0', '> mount modules [python·java·sql]', '> compile identity ✓', '> link secure channel ✓', '> initializing core...'];
      let li = 0, txt = '';
      const typeLine = () => { if (li < lines.length) { txt += lines[li] + '\n'; if (boot) boot.textContent = txt; li++; setTimeout(typeLine, 300); } };
      typeLine();
      const finish = () => {
        if (state.introDone) return; state.introDone = true;
        resetToTop();
        pre.style.opacity = '0'; pre.style.visibility = 'hidden';
        setTimeout(() => { state.introDispose && state.introDispose(); }, 700);
        state.runHeroIntro && state.runHeroIntro();
      };
      // Probe WebGL on a throwaway canvas so we don't bind a context on the real
      // one that THREE then wants to claim with different attributes.
      const webglOK = (() => {
        try {
          const c = document.createElement('canvas');
          return !!(c.getContext('webgl2') || c.getContext('webgl'));
        } catch (e) { return false; }
      })();
      if (!canvas || !webglOK) { runFallbackLoader(); return; }
      const geo = new IcosahedronGeometry(1.7, 5); const target = geo.attributes.position.array.slice(); const N = target.length / 3;
      const startP = new Float32Array(N * 3), explodeP = new Float32Array(N * 3), col = new Float32Array(N * 3);
      // Sphere gradient runs accent -> accent-3 -> good, i.e. the same three
      // stops the brand gradients use elsewhere.
      const cyan = rgbUnit(token('--accent', '#8A96FF'));
      const purple = rgbUnit(token('--accent-3', '#A78BFA'));
      const green = rgbUnit(token('--good', '#4BD79B'));
      const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      for (let i = 0; i < N; i++) {
        const k = i * 3;
        const r = 9 + Math.random() * 8, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
        startP[k] = r * Math.sin(ph) * Math.cos(th); startP[k + 1] = r * Math.sin(ph) * Math.sin(th); startP[k + 2] = r * Math.cos(ph) - 3;
        const ex = 2.2 + Math.random() * 2.4; explodeP[k] = target[k] * ex; explodeP[k + 1] = target[k + 1] * ex; explodeP[k + 2] = target[k + 2] * ex + Math.random() * 3;
        const tc = (target[k + 1] / 1.7 + 1) / 2, c = tc < 0.5 ? mix(green, purple, tc * 2) : mix(purple, cyan, (tc - 0.5) * 2);
        col[k] = c[0]; col[k + 1] = c[1]; col[k + 2] = c[2];
      }
      const pg = new BufferGeometry();
      pg.setAttribute('position', new BufferAttribute(new Float32Array(startP), 3));
      pg.setAttribute('color', new BufferAttribute(col, 3));
      const pts = new Points(pg, new PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.96, blending: AdditiveBlending, depthWrite: false }));
      const wire = new LineSegments(new WireframeGeometry(new IcosahedronGeometry(1.7, 2)), new LineBasicMaterial({ color: 0x9b7bff, transparent: true, opacity: 0 }));
      const scene = new Scene(), cam = new PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 100); cam.position.z = 6.2;
      const group = new Group(); group.add(pts); group.add(wire); scene.add(group);
      const rn = new WebGLRenderer({ canvas, alpha: true, antialias: true });
      rn.setPixelRatio(Math.min(2, devicePixelRatio || 1));

      // Compute vertical FOV so the horizontal coverage stays constant across aspect ratios.
      // Base horizontal FOV = 52° (feels good on 16:9 landscape desktops).
      // On portrait phones this raises to ~80°+ so the sphere fills the narrow width.
      const BASE_HFOV_RAD = 2 * Math.atan(Math.tan((52 * Math.PI) / 360) * (16 / 9));
      const getAdaptiveFov = () => {
        const aspect = innerWidth / innerHeight;
        // Derive vertical FOV that gives the same horizontal coverage as BASE_HFOV_RAD
        const vFovRad = 2 * Math.atan(Math.tan(BASE_HFOV_RAD / 2) / aspect);
        // Cap between 52° (desktop) and 95° (extreme portrait) to avoid fisheye distortion
        return Math.min(95, Math.max(52, vFovRad * (180 / Math.PI)));
      };
      const getBaseZ = () => {
        // On wider screens the camera can sit further back; on portrait pull in a bit
        return innerWidth < 768 ? 6.0 : 6.2;
      };

      const resize = () => {
        rn.setSize(innerWidth, innerHeight, false);
        cam.aspect = innerWidth / innerHeight;
        cam.fov = getAdaptiveFov();
        cam.position.z = getBaseZ();
        cam.updateProjectionMatrix();
      };
      resize(); on(window, 'resize', resize);
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const ASM = [450, 2200], HOLD = 2200, DET = [3150, 3700], END = 3800;
      const t0 = performance.now(); let raf;
      const loop = (now) => {
        const t = now - t0, pos = pg.attributes.position.array;
        const a = clamp((t - ASM[0]) / (ASM[1] - ASM[0]), 0, 1), ea = ease(a);
        const d = clamp((t - DET[0]) / (DET[1] - DET[0]), 0, 1), ed = ease(d);
        for (let i = 0; i < N; i++) {
          const k = i * 3; let tx = target[k], ty = target[k + 1], tz = target[k + 2];
          if (t > HOLD) { const n = 1 + 0.14 * Math.sin(tx * 2.5 + t * 0.002) + 0.14 * Math.sin(ty * 2.5 + t * 0.0017) + 0.1 * Math.sin(tz * 3 + t * 0.0023); tx *= n; ty *= n; tz *= n; }
          let x = startP[k] + (tx - startP[k]) * ea, y = startP[k + 1] + (ty - startP[k + 1]) * ea, z = startP[k + 2] + (tz - startP[k + 2]) * ea;
          if (d > 0) { x += (explodeP[k] - x) * ed; y += (explodeP[k + 1] - y) * ed; z += (explodeP[k + 2] - z) * ed; }
          pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
        }
        pg.attributes.position.needsUpdate = true;
        pts.material.opacity = 0.96 * (1 - ed * 0.7); pts.material.size = 0.03 + ed * 0.11;
        wire.material.opacity = clamp((a - 0.55) / 0.45, 0, 1) * 0.3 * (1 - ed); wire.scale.setScalar(1 + (t > HOLD ? 0.04 * Math.sin(t * 0.003) : 0));
        group.rotation.y = t * 0.0004 + ed * 0.6; group.rotation.x = Math.sin(t * 0.0005) * 0.12;
        cam.position.z = getBaseZ() - ea * 0.3 - ed * 3.2;
        if (flash) { const f = clamp((t - (DET[0] + 180)) / 150, 0, 1) * (1 - clamp((t - (DET[0] + 390)) / 210, 0, 1)); flash.style.opacity = String(Math.max(0, f)); }
        if (pct) pct.textContent = 'INITIALIZING · ' + Math.min(100, Math.floor((t / END) * 100)) + '%';
        rn.render(scene, cam);
        if (t < END) raf = requestAnimationFrame(loop); else holdThenFinish();
      };
      // The animation has played out; hold the last frame until the page is
      // actually ready rather than revealing a half-loaded document. The 7s
      // safety below still forces an exit no matter what.
      let held = false;
      const holdThenFinish = () => {
        if (held) return; held = true;
        ready.then(() => {
          if (pct) pct.textContent = 'READY';
          const t2 = setTimeout(finish, 140); cleanups.push(() => clearTimeout(t2));
        });
      };
      raf = requestAnimationFrame(loop);
      state.introDispose = () => { cancelAnimationFrame(raf); try { rn.dispose(); pg.dispose(); geo.dispose(); } catch (e) {} };
      const safety = setTimeout(() => finish(), 7000); cleanups.push(() => clearTimeout(safety));
    })();

    /* ---------- typing effect ---------- */
    (function initType() {
      const el = root.querySelector('[data-type]'); if (!el) return;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}#$%&';
      let wi = 0;
      const settle = (target, cb) => {
        let frame = 0; const dur = target.length + 8;
        const iv = setInterval(() => {
          let out = '';
          for (let i = 0; i < target.length; i++) {
            if (i < frame - 6) out += target[i];
            else if (i < frame) out += chars[Math.floor(Math.random() * chars.length)];
            else out += '';
          }
          el.textContent = out; el.style.color = 'var(--text-2)';
          frame++; if (frame > dur) { clearInterval(iv); el.textContent = target; cb && cb(); }
        }, 35);
      };
      const cycle = () => { settle(typeWords[wi], () => { wi = (wi + 1) % typeWords.length; setTimeout(cycle, 2100); }); };
      const t = setTimeout(cycle, 1400); cleanups.push(() => clearTimeout(t));
    })();

    /* ---------- scroll reveal ---------- */
    (function initReveal() {
      const els = [...root.querySelectorAll('[data-reveal]')];
      if (!els.length) return;
      const order = new Map(els.map((el, i) => [el, i]));
      const groups = new Map();
      els.forEach((el) => { el.style.transition = 'opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)'; });
      const reveal = (el) => {
        if (el.dataset.shown) return; el.dataset.shown = '1';
        const sec = el.closest('section') || document.body;
        const n = groups.get(sec) || 0; groups.set(sec, n + 1);
        el.style.transitionDelay = (Math.min(n, 6) * 0.07) + 's';
        el.style.opacity = '1'; el.style.transform = 'none';
      };

      /* Was a scroll listener that called getBoundingClientRect() on every
         [data-reveal] element on every scroll event — a forced synchronous
         layout each time, growing with the page. IntersectionObserver does the
         same job off the scroll path, and each element is unobserved the moment
         it has been revealed, so the work shrinks as you scroll.
         rootMargin -8% reproduces the old "top < 92% of viewport" trigger. */
      let observerFired = false;
      if (typeof IntersectionObserver === 'function') {
        const io = new IntersectionObserver((entries) => {
          observerFired = true;
          // Entries aren't guaranteed to arrive in document order; sort so the
          // per-section stagger still runs top-to-bottom.
          entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => order.get(a.target) - order.get(b.target))
            .forEach((e) => { reveal(e.target); io.unobserve(e.target); });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
        els.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      } else {
        els.forEach(reveal);
      }

      /* Safety net — content must never be stuck invisible, since nothing in CSS
         forces [data-reveal] visible (see project.md).
         This used to be an unconditional `setTimeout(revealAll, 4500)`, which
         quietly destroyed the feature: the intro runs ~4.7s, so every element on
         the page was force-revealed before the visitor could scroll and no
         section below the fold ever animated in. It now only fires if the
         observer never delivered a single callback — i.e. genuinely broken —
         which a healthy browser does immediately on observe(). */
      const safety = setTimeout(() => { if (!observerFired) els.forEach(reveal); }, 5000);
      cleanups.push(() => clearTimeout(safety));
    })();

    /* ---------- hero parallax ---------- */
    (function initHeroParallax() {
      const home = root.querySelector('#home');
      const wrap = root.querySelector('[data-hpx]');
      const gridw = root.querySelector('[data-hgridwrap]');
      const scrollInd = root.querySelector('[data-scroll-ind]');
      if (!home || !wrap) return;
      let ticking = false;
      const apply = () => {
        ticking = false;
        const r = home.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (-r.top) / Math.max(1, r.height)));
        const e = p * p * (3 - 2 * p);
        // keep the hero fully visible while it drifts, then fade only as it nears the top edge
        const fade = Math.max(0, Math.min(1, 1 - (p - 0.5) / 0.35));
        wrap.style.transform = 'perspective(1200px) translateY(' + (-e * 46) + 'px) translateZ(' + (-e * 80) + 'px) scale(' + (1 - e * 0.03) + ')';
        wrap.style.opacity = String(fade);
        wrap.style.filter = p > 0.55 ? ('blur(' + ((p - 0.55) * 7) + 'px)') : 'none';
        if (gridw) { gridw.style.transform = 'translateY(' + (e * 50) + 'px)'; gridw.style.opacity = String(0.55 * fade); }
        if (scrollInd) scrollInd.style.opacity = String(Math.max(0, 1 - p * 5));
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
      on(scrollTarget, 'scroll', onScroll, { passive: true });
      on(window, 'resize', onScroll, { passive: true });
      apply();
    })();

    /* ---------- about TL;DR toggle ---------- */
    (function initAbout() {
      const btn = root.querySelector('[data-hltoggle]'); if (!btn) return;
      const knob = btn.querySelector('[data-knob]'), track = btn.querySelector('[data-track]'), label = btn.querySelector('[data-hllabel]');
      const fills = root.querySelectorAll('#about [data-fill]'), keys = root.querySelectorAll('#about [data-key]');
      let hl = false;
      const apply = () => {
        btn.setAttribute('aria-pressed', String(hl));
        if (hl) {
          knob.style.transform = 'translateX(32px)'; knob.style.background = 'var(--accent)';
          track.style.background = 'color-mix(in oklab, var(--accent) 18%, transparent)'; track.style.borderColor = 'color-mix(in oklab, var(--accent) 40%, transparent)';
          label.textContent = 'TL;DR — ON'; label.style.color = 'var(--accent-2)';
          fills.forEach((s) => { s.style.color = 'var(--text-4)'; s.style.textDecoration = 'line-through'; s.style.opacity = '.6'; });
          keys.forEach((s) => { s.style.color = 'var(--text)'; });
        } else {
          knob.style.transform = 'translateX(0)'; knob.style.background = 'var(--text-2)';
          track.style.background = 'var(--border)'; track.style.borderColor = 'var(--border-2)';
          label.textContent = 'TL;DR — OFF'; label.style.color = 'var(--text-3)';
          fills.forEach((s) => { s.style.color = ''; s.style.textDecoration = ''; s.style.opacity = ''; });
          keys.forEach((s) => { s.style.color = 'var(--text)'; });
        }
      };
      on(btn, 'click', () => { hl = !hl; apply(); });
      apply();
    })();

    /* ---------- project "view details" modals ---------- */
    (function initProjectModals() {
      const triggers = [...root.querySelectorAll('[data-viewmore]')];
      const modals = [...root.querySelectorAll('[data-projectmodal]')];
      if (!modals.length) return;
      const byNum = (num) => modals.find((m) => m.getAttribute('data-projectmodal') === num);
      let openEl = null, lastFocus = null;
      const lockScroll = (lock) => { document.body.style.overflow = lock ? 'hidden' : ''; };
      const open = (num, trigger) => {
        const m = byNum(num); if (!m) return;
        if (openEl && openEl !== m) hide(openEl);
        openEl = m; lastFocus = trigger || null;
        m.style.visibility = 'visible'; m.style.opacity = '1'; m.style.pointerEvents = 'auto';
        const panel = m.querySelector('[data-modalpanel]');
        if (panel) { panel.style.transform = 'none'; panel.scrollTop = 0; }
        lockScroll(true);
        // Now visible → force any lazy modal images to load, then resize carousels to the active slide.
        m.querySelectorAll('img[loading="lazy"]').forEach((im) => { im.loading = 'eager'; });
        m.querySelectorAll('[data-carousel]').forEach((c) => c.dispatchEvent(new Event('recalc')));
        const closeBtn = m.querySelector('[data-modalclose-btn]');
        if (closeBtn) closeBtn.focus();
      };
      const hide = (m) => {
        m.style.opacity = '0'; m.style.pointerEvents = 'none'; m.style.visibility = 'hidden';
        const panel = m.querySelector('[data-modalpanel]');
        if (panel) panel.style.transform = 'translateY(24px) scale(.98)';
      };
      const close = () => {
        if (!openEl) return;
        hide(openEl); openEl = null; lockScroll(false);
        if (lastFocus) { lastFocus.focus(); lastFocus = null; }
      };
      triggers.forEach((t) => on(t, 'click', () => open(t.getAttribute('data-viewmore'), t)));
      modals.forEach((m) => m.querySelectorAll('[data-modalclose]').forEach((c) => on(c, 'click', close)));
      on(document, 'keydown', (e) => { if (e.key === 'Escape' && openEl) close(); });
      cleanups.push(() => lockScroll(false));
    })();

    /* ---------- feature screenshot carousels (auto-advance every few seconds) ---------- */
    (function initFeatureCarousels() {
      root.querySelectorAll('[data-carousel]').forEach((c) => {
        const track = c.querySelector('[data-carousel-track]');
        const imgs = track ? [...track.children] : [];
        const slides = imgs.length;
        const dots = [...c.querySelectorAll('[data-carousel-dot]')];
        if (!track || slides < 2) return;
        let idx = 0, timer = null;
        // size the frame to the active slide so differing aspect ratios never stretch or gap
        const setHeight = () => { const h = imgs[idx] && imgs[idx].getBoundingClientRect().height; if (h) c.style.height = h + 'px'; };
        const paint = () => {
          track.style.transform = 'translateX(' + (-idx * 100) + '%)';
          setHeight();
          dots.forEach((d, k) => {
            const on_ = k === idx;
            d.style.background = on_ ? 'var(--accent)' : 'var(--text-3)';
            d.style.width = on_ ? '18px' : '7px';
            d.style.borderRadius = on_ ? '4px' : '50%';
          });
        };
        const go = (i) => { idx = (i + slides) % slides; paint(); };
        const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
        const start = () => { stop(); timer = setInterval(() => go(idx + 1), 4500); };
        dots.forEach((d, k) => on(d, 'click', () => { go(k); start(); }));
        imgs.forEach((im) => on(im, 'load', setHeight));
        on(c, 'recalc', setHeight);                 // fired when the modal opens (lazy images now load)
        on(c, 'mouseenter', stop);
        on(c, 'mouseleave', () => { start(); });
        on(window, 'resize', setHeight);
        paint(); start();
        cleanups.push(stop);
      });
    })();

    /* ---------- Selected Work rows + floating hover preview ---------- */
    (function initWorkRows() {
      const rows = [...root.querySelectorAll('[data-workrow]')];
      const card = root.querySelector('[data-workpreview]');
      if (!rows.length) return;

      // Row hover styling is done here rather than in CSS because three separate
      // children change together (num, name, arrow) and the row is a <button>.
      rows.forEach((row) => {
        const num = row.querySelector('[data-workrow-num]');
        const name = row.querySelector('[data-workrow-name]');
        const arrow = row.querySelector('[data-workrow-arrow]');
        const paint = (on) => {
          if (num) num.style.color = on ? 'var(--accent)' : 'var(--text-4)';
          if (name) name.style.color = on ? 'var(--text)' : 'var(--text-2)';
          if (arrow) { arrow.style.opacity = on ? '1' : '0'; arrow.style.transform = on ? 'translateX(0)' : 'translateX(-6px)'; }
        };
        on(row, 'mouseenter', () => paint(true));
        on(row, 'mouseleave', () => paint(false));
        on(row, 'focus', () => paint(true));
        on(row, 'blur', () => paint(false));
      });

      // The preview is a pointer affordance — pointless on touch, and there is
      // no room for it under the responsive breakpoint.
      const canPreview = () => !window.matchMedia('(hover: none)').matches && window.innerWidth > 860;
      if (!card) return;

      const tagline = card.querySelector('[data-workpreview-tagline]');
      const metricsBox = card.querySelector('[data-workpreview-metrics]');
      const byNum = new Map(WORK_PREVIEWS.map((w) => [w.num, w]));
      let shown = false, mx = 0, my = 0, queued = false;

      const place = () => {
        queued = false;
        const w = card.offsetWidth, h = card.offsetHeight, pad = 12, off = 26;
        // Flip to the left of the cursor near the right edge, and clamp
        // vertically so the card never hangs off the viewport.
        let x = mx + off;
        if (x + w + pad > window.innerWidth) x = mx - off - w;
        x = Math.max(pad, x);
        const y = Math.max(pad, Math.min(my - 20, window.innerHeight - h - pad));
        card.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (shown ? 1 : 0.96) + ')';
      };
      const queue = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };

      const show = (num) => {
        const data = byNum.get(num);
        if (!data) return;
        if (tagline) tagline.textContent = data.tagline;
        if (metricsBox) {
          metricsBox.textContent = '';
          data.metrics.forEach((m) => {
            const tile = document.createElement('div');
            tile.style.cssText = 'padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--bg)';
            const k = document.createElement('div');
            k.style.cssText = "font-family:'Syne',sans-serif;font-weight:800;font-size:19px;color:var(--data);line-height:1";
            k.textContent = m.k;
            const v = document.createElement('div');
            v.style.cssText = 'font-size:11px;margin-top:4px;color:var(--text-3)';
            v.textContent = m.v;
            tile.append(k, v);
            metricsBox.appendChild(tile);
          });
        }
        shown = true;
        card.style.visibility = 'visible';
        card.style.opacity = '1';
        place();
      };
      const hide = () => { shown = false; card.style.opacity = '0'; card.style.visibility = 'hidden'; };

      rows.forEach((row) => {
        const num = row.getAttribute('data-workrow');
        on(row, 'mouseenter', (e) => { if (!canPreview()) return; mx = e.clientX; my = e.clientY; show(num); });
        on(row, 'mousemove', (e) => { if (!shown) return; mx = e.clientX; my = e.clientY; queue(); });
        on(row, 'mouseleave', hide);
      });
      on(window, 'scroll', () => { if (shown) hide(); }, { passive: true });
      cleanups.push(hide);
    })();

    /* ---------- stack accordion ---------- */
    (function initStack() {
      const panels = [...root.querySelectorAll('[data-panel]')];
      if (!panels.length) return;
      // active < 0 == the resting state: nothing open, panels share the row
      // evenly. (Leaving them all at the 94px collapsed width would strand a few
      // hundred px of dead space on the right.)
      const set = (active) => {
        const resting = active < 0;
        panels.forEach((p, i) => {
          const isOn = i === active;
          p.style.flex = resting ? '1 1 0%' : (isOn ? '1 1 0%' : '0 0 94px');
          p.style.borderColor = isOn ? 'color-mix(in oklab, var(--accent) 40%, transparent)' : 'var(--border)';
          p.style.background = isOn ? 'linear-gradient(150deg,color-mix(in oklab, var(--accent) 10%, transparent),var(--surface))' : 'var(--card-grad)';
          const c = p.querySelector('[data-content]'), v = p.querySelector('[data-vlabel]');
          if (c) { c.style.opacity = isOn ? '1' : '0'; c.style.visibility = isOn ? 'visible' : 'hidden'; c.style.transitionDelay = isOn ? '.16s' : '0s'; }
          if (v) { v.style.opacity = isOn ? '0' : '1'; }
        });
      };
      panels.forEach((p, i) => { on(p, 'mouseenter', () => set(i)); on(p, 'click', () => set(i)); });
      // Leaving the row returns it to the resting state, so "nothing open" is
      // somewhere the user can actually get back to. Touch devices never fire
      // mouseleave, so a tapped panel stays open there — which is what you want.
      const acc = root.querySelector('[data-acc]');
      if (acc) on(acc, 'mouseleave', () => set(-1));

      /* ---- size the row so no panel ever clips or scrolls ----
         Panel content is absolutely positioned, so it can't grow the row by
         itself. Measure each panel's natural height at the width it will have
         when open, take the tallest, and pin the row to that. Sizing to the
         tallest (not the current one) keeps the row from resizing as the user
         moves between panels. Re-runs on resize, and adapts automatically if
         `skillGroups` in lib/data.js changes. */
      const GAP = 14, COLLAPSED = 94;
      const fitRow = () => {
        if (!acc) return;
        // Below 860px CSS stacks the panels vertically at auto height — leave it alone.
        if (window.matchMedia('(max-width: 860px)').matches) { acc.style.height = ''; return; }
        const openW = acc.clientWidth - (panels.length - 1) * (COLLAPSED + GAP);
        if (openW <= 0) return;
        let tallest = 0;
        panels.forEach((p) => {
          const c = p.querySelector('[data-content]'); if (!c) return;
          // The panel's own border eats into the box the content actually gets,
          // both ways. Measure at the true inner width, then add the vertical
          // border back — otherwise the row lands a few px short and clips.
          const pcs = getComputedStyle(p);
          const bx = (parseFloat(pcs.borderLeftWidth) || 0) + (parseFloat(pcs.borderRightWidth) || 0);
          const by = (parseFloat(pcs.borderTopWidth) || 0) + (parseFloat(pcs.borderBottomWidth) || 0);
          // Content has its own min-width; below that it stops narrowing (and
          // overflows the panel instead). Measure at the width it will really
          // render at, or narrow viewports over-wrap and we size the row far
          // taller than needed.
          const minW = parseFloat(getComputedStyle(c).minWidth) || 0;
          const s = c.style;
          const keep = { w: s.width, mw: s.minWidth, xw: s.maxWidth, b: s.bottom, h: s.height, v: s.visibility, o: s.opacity, ov: s.overflow, t: s.transition };
          // Lay it out unconstrained at the open width, hidden so nothing paints.
          s.transition = 'none'; s.visibility = 'hidden'; s.opacity = '0';
          s.minWidth = '0px'; s.maxWidth = 'none'; s.width = Math.max(openW - bx, minW) + 'px';
          s.bottom = 'auto'; s.height = 'auto'; s.overflow = 'visible';
          tallest = Math.max(tallest, c.offsetHeight + by);
          s.width = keep.w; s.minWidth = keep.mw; s.maxWidth = keep.xw; s.bottom = keep.b;
          s.height = keep.h; s.visibility = keep.v; s.opacity = keep.o; s.overflow = keep.ov;
          s.transition = keep.t;
        });
        if (tallest <= 0) return;
        // Never taller than the viewport. If content genuinely can't fit even
        // then, scrolling that one panel beats clipping it — but at every real
        // breakpoint the measured height wins and nothing scrolls.
        const cap = Math.round(window.innerHeight * 0.88);
        const want = Math.max(360, Math.ceil(tallest));
        acc.style.height = Math.min(want, cap) + 'px';
        const mustScroll = want > cap;
        panels.forEach((p) => {
          const c = p.querySelector('[data-content]');
          if (c) c.style.overflow = mustScroll ? 'auto' : 'hidden';
        });
      };
      fitRow();
      // Webfonts change text metrics, so re-measure once they've settled.
      ready.then(fitRow);
      let fitTick = false;
      on(window, 'resize', () => { if (fitTick) return; fitTick = true; requestAnimationFrame(() => { fitTick = false; fitRow(); }); }, { passive: true });

      set(-1);
    })();

    /* ---------- tilt & magnetic ----------
       Both used to call getBoundingClientRect() on every single mousemove,
       forcing a synchronous layout dozens of times a second while the pointer
       moved. The rect can't change while the pointer is inside the element
       without a scroll or resize, so it's measured once on enter and reused. */
    (function initPointerFx() {
      const bind = (sel, apply, reset) => {
        root.querySelectorAll(sel).forEach((el) => {
          let r = null;
          on(el, 'mouseenter', () => { r = el.getBoundingClientRect(); });
          on(el, 'mousemove', (e) => { if (!r) r = el.getBoundingClientRect(); apply(el, e, r); });
          on(el, 'mouseleave', () => { r = null; reset(el); });
        });
      };

      bind('[data-tilt]', (el, e, r) => {
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateX(' + (-py * 7) + 'deg) rotateY(' + (px * 7) + 'deg) translateZ(6px)';
        el.style.borderColor = 'color-mix(in oklab, var(--accent) 40%, transparent)';
      }, (el) => { el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; el.style.borderColor = ''; });

      bind('[data-magnetic]', (el, e, r) => {
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.35 + 'px)';
      }, (el) => { el.style.transform = 'translate(0,0)'; });
    })();

    /* ---------- side-nav scroll spy ---------- */
    (function initNav() {
      const links = root.querySelectorAll('[data-nav]');
      const setActive = (id) => {
        links.forEach((a) => {
          const isOn = a.getAttribute('data-nav') === id;
          const dot = a.querySelector('[data-navdot]'), lab = a.querySelector('[data-navlabel]');
          if (dot) { dot.style.background = isOn ? 'var(--accent)' : 'var(--text-4)'; dot.style.transform = isOn ? 'scale(1.5)' : 'scale(1)'; dot.style.boxShadow = isOn ? '0 0 12px color-mix(in oklab, var(--good) 80%, transparent)' : 'none'; }
          if (lab) { lab.style.opacity = isOn ? '1' : '0'; lab.style.transform = isOn ? 'translateX(0)' : 'translateX(6px)'; }
          a.style.color = isOn ? 'var(--text)' : 'var(--text-3)';
        });
      };
      links.forEach((a) => {
        on(a, 'mouseenter', () => { const l = a.querySelector('[data-navlabel]'); if (l) { l.style.opacity = '1'; l.style.transform = 'translateX(0)'; } });
        on(a, 'mouseleave', () => { const isActive = a.style.color === 'rgb(232, 236, 244)'; const l = a.querySelector('[data-navlabel]'); if (l && !isActive) { l.style.opacity = '0'; l.style.transform = 'translateX(6px)'; } });
      });
      const secs = [...root.querySelectorAll('section[id]')];
      let navTick = false;
      const pickActive = () => {
        navTick = false;
        const line = (window.innerHeight || document.documentElement.clientHeight) * 0.4;
        let current = secs[0];
        for (const s of secs) { if (s.getBoundingClientRect().top <= line) current = s; }
        if (current) setActive(current.id);
      };
      const onNavScroll = () => { if (!navTick) { navTick = true; requestAnimationFrame(pickActive); } };
      on(scrollTarget, 'scroll', onNavScroll, { passive: true });
      on(window, 'resize', onNavScroll, { passive: true });
      pickActive();
    })();

    return () => {
      cleanups.forEach((fn) => fn());
      state.introDispose && state.introDispose();
    };
  }, []);

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.55 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(circle at 78% 12%,color-mix(in oklab, var(--accent-3) 12%, transparent),transparent 42%),radial-gradient(circle at 8% 88%,color-mix(in oklab, var(--accent-2) 12%, transparent),transparent 44%)' }} />

      {/* custom cursor — hidden on touch devices via CSS */}
      {/* custom cursor — shared with /work, see components/Cursor.jsx */}
      <Cursor />

      {/* cinematic intro */}
      <div ref={preRef} data-intro style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'radial-gradient(circle at 50% 46%,var(--surface),var(--bg-deep) 72%)', overflow: 'hidden', transition: 'opacity .6s ease,visibility .6s' }}>
        <canvas ref={introCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }} />
        {/* Scanline grid — tighter cells on mobile */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'linear-gradient(color-mix(in oklab, var(--accent) 6%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab, var(--accent) 6%, transparent) 1px,transparent 1px)', backgroundSize: 'clamp(22px,5.5vw,42px) clamp(22px,5.5vw,42px)', WebkitMaskImage: 'radial-gradient(circle at 50% 48%,#000,transparent 70%)', maskImage: 'radial-gradient(circle at 50% 48%,#000,transparent 70%)' }} />
        {/* Boot log — constrained so lines wrap on narrow screens */}
        <div ref={bootRef} style={{ position: 'absolute', left: '6vw', top: '8vh', right: '6vw', zIndex: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(10px,2vw,12px)', lineHeight: 1.8, color: 'var(--accent)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', textShadow: '0 0 10px color-mix(in oklab, var(--accent) 50%, transparent)' }} />
        {/* Bottom row — percentage left, version right; wraps on very narrow screens */}
        <div style={{ position: 'absolute', left: '6vw', right: '6vw', bottom: '8vh', zIndex: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div ref={pctRef} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(9px,2vw,11px)', letterSpacing: 'clamp(1px,0.5vw,3px)', color: 'var(--text-3)' }} />
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(9px,2vw,11px)', letterSpacing: 'clamp(1px,0.5vw,3px)', color: 'var(--text-4)' }}>AS_OS · v1.0</div>
        </div>
        <div ref={flashRef} style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'radial-gradient(circle at 50% 50%,var(--flash),var(--flash-2))', opacity: 0, pointerEvents: 'none' }} />
      </div>

      {/* Reduced-motion loading screen. The cinematic intro above is pure motion,
          so it's suppressed for those users — this is the calm equivalent. Which
          one is visible is decided by a CSS media query (see globals.css), not by
          JS, so the correct loader covers the page from the very first paint. */}
      <div
        ref={simpleLoadRef} data-simpleload role="status" aria-live="polite" aria-label="Loading"
        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'radial-gradient(circle at 50% 42%,var(--surface),var(--bg-deep) 74%)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '6vh 7vw', overflow: 'hidden', transition: 'opacity .45s ease,visibility .45s' }}
      >
        {/* Static scanline grid, mask-faded at the edges — the cinematic intro's
            texture, minus the movement. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(color-mix(in oklab, var(--accent) 7%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab, var(--accent) 7%, transparent) 1px,transparent 1px)', backgroundSize: 'clamp(22px,5.5vw,44px) clamp(22px,5.5vw,44px)', WebkitMaskImage: 'radial-gradient(circle at 50% 45%,#000,transparent 72%)', maskImage: 'radial-gradient(circle at 50% 45%,#000,transparent 72%)' }} />
        {/* Colour wash, matching the site's ambient gradients. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 76% 14%,color-mix(in oklab, var(--accent-3) 16%, transparent),transparent 44%),radial-gradient(circle at 10% 86%,color-mix(in oklab, var(--accent-2) 16%, transparent),transparent 46%)' }} />

        {/* HUD corner brackets */}
        {[
          { top: '4vh', left: '5vw', borderWidth: '1px 0 0 1px' },
          { top: '4vh', right: '5vw', borderWidth: '1px 1px 0 0' },
          { bottom: '4vh', left: '5vw', borderWidth: '0 0 1px 1px' },
          { bottom: '4vh', right: '5vw', borderWidth: '0 1px 1px 0' },
        ].map((pos, i) => (
          <span key={i} aria-hidden style={{ position: 'absolute', width: '26px', height: '26px', borderStyle: 'solid', borderColor: 'color-mix(in oklab, var(--accent) 35%, transparent)', zIndex: 1, ...pos }} />
        ))}

        <div style={{ position: 'relative', zIndex: 2, width: 'min(520px,100%)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '3px', color: 'var(--accent)' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--good)', flex: 'none' }} />
            AS<span style={{ color: 'var(--text-4)' }}>/</span><span style={{ color: 'var(--text-3)' }}>portfolio</span>
          </div>

          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(34px,7vw,60px)', lineHeight: 1, letterSpacing: '-.03em', margin: '22px 0 0', background: 'linear-gradient(92deg,var(--text),var(--text-2) 45%,var(--accent))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            AYUSH SARAF
          </h2>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(9px,1.6vw,11px)', letterSpacing: '2.5px', color: 'var(--text-3)', marginTop: '12px' }}>
            SOFTWARE ENGINEER · VIT VELLORE
          </div>

          {/* Real milestones, filled in as each one actually completes. */}
          <div style={{ margin: '34px 0 26px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {[['document', 'dom'], ['typefaces', 'fonts'], ['assets', 'assets']].map(([label, key]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(9px,1.5vw,11px)' }}>
                <span style={{ color: 'var(--text-4)', flex: 'none' }}>▸</span>
                <span style={{ color: 'var(--text-2)', flex: 'none' }}>{label}</span>
                <span aria-hidden style={{ flex: 1, borderBottom: '1px dotted var(--border-2)', transform: 'translateY(-3px)' }} />
                <span data-loadstep={key} style={{ color: 'var(--text-4)', flex: 'none', minWidth: '46px', textAlign: 'right' }}>····</span>
              </div>
            ))}
          </div>

          <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'var(--surface)', overflow: 'hidden' }}>
            <div ref={simpleBarRef} data-loadbar style={{ width: '10%', height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,var(--accent),var(--accent-3) 55%,var(--accent-4))', transition: 'width .4s cubic-bezier(.16,1,.3,1)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '14px', fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(9px,1.5vw,10px)', letterSpacing: '2.5px' }}>
            <span ref={simplePctRef} style={{ color: 'var(--text-3)' }}>LOADING</span>
            <span style={{ color: 'var(--text-4)' }}>AS_OS · v1.0</span>
          </div>
        </div>
      </div>

      {/* side nav */}
      <nav className="side-nav" aria-label="Section navigation" style={{ position: 'fixed', right: '28px', top: '50%', transform: 'translateY(-50%)', zIndex: 9000, display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-end' }}>
        {navItems.filter((item) => item.id !== 'coding' || codolio).map((item) => (
          <a key={item.id} href={item.href} data-nav={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-3)', transition: 'color .3s' }}>
            <span data-navlabel style={{ opacity: 0, transform: 'translateX(6px)', transition: 'opacity .3s,transform .3s' }}>{item.label}</span>
            <span data-navdot style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--text-4)', transition: 'all .3s', flex: 'none' }} />
          </a>
        ))}
      </nav>

      {/* logo */}
      <div style={{ position: 'fixed', top: '26px', left: '34px', zIndex: 9000, fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '2px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulseGlow 2s infinite' }} />AS<span style={{ color: 'var(--text-4)' }}>/</span><span style={{ color: 'var(--text-3)' }}>portfolio</span>
      </div>

      <main style={{ position: 'relative', zIndex: 5 }}>
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Codolio data={codolio} />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
    </div>
  );
}
