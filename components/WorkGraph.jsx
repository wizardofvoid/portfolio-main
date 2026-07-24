'use client';

import { useEffect, useRef, useState } from 'react';
import { allWorks, workLinks, workCategories } from '../lib/data';

const mono = "'JetBrains Mono',monospace";
const syne = "'Syne',sans-serif";

/* Category -> token. Separated by lightness as well as hue, because the palette
   is warm and three oranges side by side are not distinguishable. */
const CAT_TOKEN = {
  'AI/ML': '--accent',      // terracotta
  'Full-stack': '--good',   // sage
  Tools: '--accent-4',      // sand
  Coursework: '--text-2',   // warm grey — least prominent category, dimmest swatch
};
const catToken = (cat) => CAT_TOKEN[cat] ?? '--text-3';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const stamp = (w) => `${MONTHS[(w.month || 1) - 1]} ${w.year}`;

export default function WorkGraph() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const tipRef = useRef(null);
  const [filter, setFilter] = useState('ALL');
  const filterRef = useRef('ALL');
  filterRef.current = filter;

  useEffect(() => {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    const tip = tipRef.current;
    if (!cv || !wrap) return;

    const cleanups = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); cleanups.push(() => t.removeEventListener(e, f, o)); };

    /* Canvas needs colour as values, so read the tokens off :root exactly like
       Portfolio.jsx does — the graph then follows the theme for free. */
    const css = getComputedStyle(document.documentElement);
    const rgb = (name, fallback) => {
      const hex = (css.getPropertyValue(name).trim() || fallback).replace('#', '');
      const v = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const n = parseInt(v, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const CAT_RGB = Object.fromEntries(workCategories.map((c) => [c, rgb(catToken(c), '#D97757')]));
    const EDGE = rgb('--border-2', '#55534D');
    const LABEL = rgb('--text-3', '#87857C');
    const LABEL_ON = rgb('--text', '#F5F4EE');
    const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

    const links = workLinks(allWorks);
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    // Seeded ring layout: deterministic, so the graph doesn't reshuffle on every
    // mount (Math.random would also differ between renders).
    const nodes = allWorks.map((w, i) => {
      const a = (i / allWorks.length) * Math.PI * 2;
      return {
        w, x: Math.cos(a) * 180, y: Math.sin(a) * 180, vx: 0, vy: 0,
        r: w.featured ? 15 : 9, dragging: false,
      };
    });

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width; H = rect.height;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    on(window, 'resize', resize);

    // Centre the ring once we know the box.
    nodes.forEach((n) => { n.x += W / 2; n.y += H / 2; });

    const ctx = cv.getContext('2d');
    let hover = null, raf = 0;

    const dimmed = (n) => filterRef.current !== 'ALL' && n.w.cat !== filterRef.current;

    const step = () => {
      const PAD = 54; // keeps labels off the frame
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const d = Math.sqrt(d2);
          const f = 5200 / d2;
          const ux = dx / d, uy = dy / d;
          a.vx -= ux * f; a.vy -= uy * f;
          b.vx += ux * f; b.vy += uy * f;
        }
      }
      // springs — heavier shared-tech pulls shorter
      for (const l of links) {
        const a = nodes[l.source], b = nodes[l.target];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const target = 260 - Math.min(l.weight, 4) * 34;
        const f = (d - target) * 0.0016 * l.weight;
        const ux = dx / d, uy = dy / d;
        a.vx += ux * f; a.vy += uy * f;
        b.vx -= ux * f; b.vy -= uy * f;
      }
      // gentle centring + damping + clamp
      for (const n of nodes) {
        if (n.dragging) { n.vx = 0; n.vy = 0; continue; }
        n.vx += (W / 2 - n.x) * 0.0016;
        n.vy += (H / 2 - n.y) * 0.0016;
        n.vx *= 0.86; n.vy *= 0.86;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(PAD, Math.min(W - PAD, n.x));
        n.y = Math.max(PAD, Math.min(H - PAD, n.y));
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const l of links) {
        const a = nodes[l.source], b = nodes[l.target];
        const off = dimmed(a) || dimmed(b);
        const lit = hover && (hover === a || hover === b);
        // Edges have to survive a dark ground AND a low-contrast warm palette;
        // the first pass at 0.06 was effectively invisible.
        const alpha = off ? 0.05 : (lit ? 0.7 : 0.16 + Math.min(l.weight, 4) * 0.08);
        ctx.strokeStyle = rgba(lit ? CAT_RGB[hover.w.cat] ?? EDGE : EDGE, alpha);
        ctx.lineWidth = lit ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      for (const n of nodes) {
        const off = dimmed(n);
        const c = CAT_RGB[n.w.cat] ?? EDGE;
        const isHover = hover === n;
        const alpha = off ? 0.13 : 1;

        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.2);
        glow.addColorStop(0, rgba(c, 0.34 * alpha));
        glow.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = rgba(c, alpha);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (isHover ? 2 : 0), 0, Math.PI * 2); ctx.fill();

        if (n.w.featured) {
          ctx.strokeStyle = rgba(c, 0.55 * alpha);
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 7, 0, Math.PI * 2); ctx.stroke();
        }

        const label = n.w.name.length > 26 ? n.w.name.slice(0, 25) + '…' : n.w.name;
        ctx.font = `11px ${mono}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(isHover ? LABEL_ON : LABEL, off ? 0.13 : 1);
        ctx.fillText(label, n.x, n.y + n.r + 18);
      }
    };

    const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); };
    loop();
    cleanups.push(() => cancelAnimationFrame(raf));

    /* ---- pointer ---- */
    const at = (e) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const pick = (px, py) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (dimmed(n)) continue;
        if (Math.hypot(px - n.x, py - n.y) <= n.r + 8) return n;
      }
      return null;
    };

    let drag = null;
    const showTip = (n, e) => {
      if (!tip) return;
      tip.innerHTML = '';
      const head = document.createElement('div');
      head.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap';
      const nm = document.createElement('span');
      nm.style.cssText = `font-family:${syne};font-weight:700;font-size:15px;color:var(--text)`;
      nm.textContent = n.w.name;
      head.appendChild(nm);
      if (n.w.featured) {
        const pill = document.createElement('span');
        pill.style.cssText = `font-family:${mono};font-size:9px;letter-spacing:1px;color:var(--data);border:1px solid var(--data-line);padding:2px 6px;border-radius:20px`;
        pill.textContent = '★ SELECTED';
        head.appendChild(pill);
      }
      const meta = document.createElement('div');
      meta.style.cssText = `font-family:${mono};font-size:10px;letter-spacing:1px;margin-top:7px;color:var(${catToken(n.w.cat)})`;
      meta.textContent = `${stamp(n.w)} · ${n.w.cat.toUpperCase()}`;
      const tech = document.createElement('div');
      tech.style.cssText = 'font-size:11.5px;margin-top:9px;color:var(--text-2);line-height:1.5';
      tech.textContent = n.w.tech.join(' · ');
      const hint = document.createElement('div');
      hint.style.cssText = `font-family:${mono};font-size:9px;letter-spacing:1.5px;margin-top:11px;padding-top:9px;border-top:1px solid var(--border);color:var(--text-3)`;
      hint.textContent = 'CLICK → GITHUB';
      tip.append(head, meta, tech, hint);

      const r = wrap.getBoundingClientRect();
      const w = 260;
      let x = e.clientX - r.left + 18;
      if (x + w > r.width) x = e.clientX - r.left - 18 - w;
      const y = Math.min(Math.max(8, e.clientY - r.top + 14), r.height - 130);
      tip.style.transform = `translate(${Math.max(8, x)}px,${y}px)`;
      tip.style.opacity = '1';
      tip.style.visibility = 'visible';
    };
    const hideTip = () => { if (tip) { tip.style.opacity = '0'; tip.style.visibility = 'hidden'; } };

    on(cv, 'mousemove', (e) => {
      const { x, y } = at(e);
      if (drag) { drag.x = x; drag.y = y; return; }
      const n = pick(x, y);
      if (n !== hover) { hover = n; if (n) showTip(n, e); else hideTip(); }
      else if (n) showTip(n, e);
    });
    on(cv, 'mousedown', (e) => {
      const { x, y } = at(e);
      const n = pick(x, y);
      if (n) { drag = n; n.dragging = true; }
    });
    on(window, 'mouseup', () => { if (drag) { drag.dragging = false; drag = null; } });
    on(cv, 'mouseleave', () => { hover = null; hideTip(); });
    on(cv, 'click', (e) => {
      const { x, y } = at(e);
      const n = pick(x, y);
      if (n) window.open(n.w.repoUrl, '_blank', 'noopener,noreferrer');
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const counts = { ALL: allWorks.length };
  workCategories.forEach((c) => { counts[c] = allWorks.filter((w) => w.cat === c).length; });

  return (
    <>
      {/* filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        {['ALL', ...workCategories].map((c) => {
          const active = filter === c;
          return (
            <button
              key={c} type="button" onClick={() => setFilter(c)}
              className="work-chip"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontFamily: mono, fontSize: '11px', letterSpacing: '1px',
                padding: '8px 14px', borderRadius: '20px', cursor: 'none',
                border: '1px solid ' + (active ? 'var(--accent-line)' : 'var(--border)'),
                background: active ? 'var(--accent-tint)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-3)',
              }}
            >
              {c !== 'ALL' && (
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: `var(${catToken(c)})`, flex: 'none' }} />
              )}
              {c.toUpperCase()} <span style={{ color: 'var(--text-4)' }}>{counts[c]}</span>
            </button>
          );
        })}
      </div>

      {/* canvas frame — hidden below 720px / on touch, list takes over */}
      <div
        ref={wrapRef}
        className="work-graph"
        style={{
          position: 'relative', height: 'min(70vh,640px)', borderRadius: '20px',
          border: '1px solid var(--border)', overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 40%, var(--surface), var(--bg) 78%)',
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', cursor: 'none' }} />

        <div
          ref={tipRef} aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, width: '260px', padding: '14px 16px',
            borderRadius: '14px', border: '1px solid var(--border-2)',
            background: 'linear-gradient(150deg,var(--card),var(--surface))',
            boxShadow: '0 24px 60px -20px var(--shadow)',
            opacity: 0, visibility: 'hidden', pointerEvents: 'none',
            transition: 'opacity .18s ease',
          }}
        />

        <div style={{ position: 'absolute', left: '18px', bottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px', pointerEvents: 'none' }}>
          {workCategories.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: mono, fontSize: '10px', letterSpacing: '1px', color: 'var(--text-3)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: `var(${catToken(c)})`, flex: 'none' }} />
              {c.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Same data as text. Canvas is not accessible, so this is the real
          content for screen readers — and it replaces the graph on small /
          touch screens rather than sitting alongside it. */}
      <ul className="work-list" style={{ listStyle: 'none', margin: '28px 0 0', padding: 0, borderTop: '1px solid var(--border)' }}>
        {allWorks.map((w) => (
          <li key={w.slug} style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', gap: '16px', alignItems: 'baseline', padding: '18px 4px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: mono, fontSize: '11px', color: 'var(--text-4)' }}>{stamp(w)}</span>
            <span>
              <span style={{ fontFamily: syne, fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{w.name}</span>
              {w.featured && <span style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '1px', color: 'var(--data)', marginLeft: '9px' }}>★ SELECTED</span>}
              <span style={{ display: 'block', fontFamily: mono, fontSize: '10.5px', letterSpacing: '1px', marginTop: '5px', color: `var(${catToken(w.cat)})` }}>{w.cat.toUpperCase()}</span>
              <span style={{ display: 'block', fontSize: '12.5px', marginTop: '6px', color: 'var(--text-2)' }}>{w.tech.join(' · ')}</span>
            </span>
            <a href={w.repoUrl} target="_blank" rel="noopener noreferrer" className="modal-link-btn" style={{ fontFamily: mono, fontSize: '10.5px', letterSpacing: '1px', color: 'var(--accent)', border: '1px solid var(--accent-line)', padding: '6px 12px', borderRadius: '20px', whiteSpace: 'nowrap', cursor: 'none' }}>CODE ↗</a>
          </li>
        ))}
      </ul>
    </>
  );
}
