'use client';

import { useEffect, useRef } from 'react';

/* The custom ring+dot cursor. Extracted from Portfolio.jsx so /work gets it too
   — `body { cursor: none }` is global, so any page without this component would
   have no visible cursor at all.
   Hover-grow is delegated off `document`, not a page root, so it works on every
   route without either page knowing about the other. */
export default function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    // Touch-only devices have no pointer to track; CSS restores the native one.
    if (window.matchMedia('(hover: none)').matches) return;
    const ring = ringRef.current, dot = dotRef.current;
    if (!ring || !dot) return;

    const cleanups = [];
    const on = (t, e, f) => { t.addEventListener(e, f); cleanups.push(() => t.removeEventListener(e, f)); };

    let rx = 0, ry = 0, mx = 0, my = 0, id = 0;
    on(window, 'mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });

    const tick = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      id = requestAnimationFrame(tick);
    };
    tick();
    cleanups.push(() => cancelAnimationFrame(id));

    const INTERACTIVE = 'a,button,[data-tilt],[data-magnetic]';
    on(document, 'mouseover', (e) => {
      if (!e.target.closest?.(INTERACTIVE)) return;
      ring.style.width = '54px'; ring.style.height = '54px';
      ring.style.background = 'color-mix(in oklab, var(--accent) 10%, transparent)';
      ring.style.borderColor = 'color-mix(in oklab, var(--accent) 90%, transparent)';
    });
    on(document, 'mouseout', (e) => {
      if (!e.target.closest?.(INTERACTIVE)) return;
      ring.style.width = '34px'; ring.style.height = '34px';
      ring.style.background = 'transparent';
      ring.style.borderColor = 'color-mix(in oklab, var(--accent) 70%, transparent)';
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <div ref={ringRef} className="custom-cursor-ring" style={{ position: 'fixed', top: 0, left: 0, width: '34px', height: '34px', border: '1px solid color-mix(in oklab, var(--accent) 70%, transparent)', borderRadius: '50%', transform: 'translate(-50%,-50%)', zIndex: 9998, pointerEvents: 'none', transition: 'width .25s,height .25s,background .25s,border-color .25s', mixBlendMode: 'screen' }} />
      <div ref={dotRef} className="custom-cursor-dot" style={{ position: 'fixed', top: 0, left: 0, width: '5px', height: '5px', background: 'var(--accent)', borderRadius: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, pointerEvents: 'none' }} />
    </>
  );
}
