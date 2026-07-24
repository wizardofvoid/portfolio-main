import Link from 'next/link';
import SectionTag from './SectionTag';
import { sectionTags, projects, allWorks, workYearRange } from '../lib/data';

const mono = "'JetBrains Mono',monospace";
const syne = "'Syne',sans-serif";
/* Per-project detail overlay. Rendered hidden; opened/closed by the
   `initProjectModals` controller in Portfolio.jsx via the data-* hooks below. */
function ProjectModal({ p }) {
  const d = p.details || {};
  const overview = d.overview && d.overview.length ? d.overview : [p.desc];
  const features = d.features || [];   // feature-by-feature walkthrough: { name, caption, shots: [src...] }
  const access = d.access || [];       // status pills: { icon, label, href? } — plain if no href, link if href
  const links = d.links || [];

  const label = (t) => (
    <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '12px' }}>{t}</div>
  );

  return (
    <div
      data-projectmodal={p.num} role="dialog" aria-modal="true" aria-label={p.name}
      style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', opacity: 0, visibility: 'hidden', pointerEvents: 'none', transition: 'opacity .4s ease, visibility .4s' }}
    >
      {/* backdrop — clicking it closes */}
      <div data-modalclose style={{ position: 'absolute', inset: 0, background: 'color-mix(in oklab, var(--bg-deep) 82%, transparent)', backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)' }} />

      {/* panel */}
      <div
        data-modalpanel
        className="project-modal-panel"
        style={{ position: 'relative', width: '100%', maxWidth: '720px', maxHeight: '86vh', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '20px', background: 'linear-gradient(150deg,var(--card),var(--surface))', boxShadow: '0 40px 120px -30px var(--shadow)', padding: '42px', transform: 'translateY(24px) scale(.98)', transition: 'transform .45s cubic-bezier(.16,1,.3,1)' }}
      >
        {/* ghost number, mirrors the card treatment */}
        <div style={{ position: 'absolute', top: '-34px', right: '-8px', fontFamily: syne, fontWeight: 800, fontSize: '150px', color: 'var(--surface)', lineHeight: 1, pointerEvents: 'none' }}>{p.num}</div>

        {/* close button */}
        <button
          data-modalclose data-modalclose-btn aria-label="Close details"
          style={{ position: 'absolute', top: '18px', right: '18px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-2)', borderRadius: '10px', background: 'var(--surface)', color: 'var(--text-2)', fontSize: '18px', lineHeight: 1, cursor: 'none' }}
        >✕</button>

        {/* header */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px', paddingRight: '44px' }}>
            <h3 style={{ fontFamily: syne, fontWeight: 700, fontSize: 'clamp(24px,3.4vw,34px)', margin: 0 }}>{p.name}</h3>
            <span style={{ fontFamily: mono, fontSize: '11px', color: 'var(--accent)', border: '1px solid color-mix(in oklab, var(--good) 30%, transparent)', padding: '3px 9px', borderRadius: '20px' }}>{p.period}</span>
            {p.status && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: mono, fontSize: '11px', color: 'var(--data)', border: '1px solid color-mix(in oklab, var(--data) 30%, transparent)', background: 'color-mix(in oklab, var(--data) 7%, transparent)', padding: '3px 9px', borderRadius: '20px' }}>{p.status.icon} {p.status.label}</span>
            )}
          </div>
          {d.tagline && (
            <p style={{ color: 'var(--text-2)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 26px' }}>{d.tagline}</p>
          )}
        </div>

        {/* overview */}
        <div style={{ marginBottom: '28px' }}>
          {label('Overview')}
          {overview.map((para, i) => (
            <p key={i} style={{ color: 'var(--text-2)', fontSize: '15.5px', lineHeight: 1.75, margin: i === 0 ? '0' : '14px 0 0' }}>{para}</p>
          ))}
        </div>

        {/* walkthrough — feature by feature: a sequence of screenshots + an explanation */}
        {features.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            {label('Walkthrough')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {features.map((f, i) => {
                const hasShots = f.shots && f.shots.length > 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontFamily: mono, fontSize: '12px', color: 'var(--accent)' }}>{String(i + 1).padStart(2, '0')}</span>
                      <h4 style={{ fontFamily: syne, fontWeight: 700, fontSize: '18px', margin: 0 }}>{f.name}</h4>
                    </div>
                    <div style={{ marginBottom: '13px' }}>
                      {!hasShots ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '150px', borderRadius: '12px', border: '1px dashed var(--border-2)', background: 'var(--surface)', color: 'var(--text-3)', fontFamily: mono, fontSize: '11px', textAlign: 'center', padding: '20px' }}>
                          <span style={{ fontSize: '20px', opacity: .5 }}>▢</span>
                          <span>screenshot placeholder</span>
                          <span style={{ opacity: .6 }}>drop “{f.name}” image in /public and set shots</span>
                        </div>
                      ) : f.shots.length === 1 ? (
                        <img src={f.shots[0]} alt={f.name} loading="lazy" decoding="async" style={{ width: '100%', display: 'block', borderRadius: '12px', border: '1px solid var(--border)' }} />
                      ) : (
                        <div data-carousel style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border)', transition: 'height .5s cubic-bezier(.16,1,.3,1)' }}>
                          <div data-carousel-track style={{ display: 'flex', alignItems: 'flex-start', transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }}>
                            {f.shots.map((src, j) => (
                              <img key={j} data-carousel-slide src={src} alt={`${f.name} — ${j + 1}`} loading="lazy" decoding="async" style={{ flex: '0 0 100%', width: '100%', display: 'block' }} />
                            ))}
                          </div>
                          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '7px', padding: '6px 9px', borderRadius: '20px', background: 'color-mix(in oklab, var(--bg) 55%, transparent)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                            {f.shots.map((_, j) => (
                              <button key={j} type="button" data-carousel-dot aria-label={`Slide ${j + 1}`} style={{ width: '7px', height: '7px', borderRadius: '50%', border: 'none', padding: 0, background: 'var(--text-3)', cursor: 'none', transition: 'background .3s, width .3s' }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {f.caption && (
                      <p style={{ color: 'var(--text-2)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>{f.caption}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* by the numbers */}
        {p.metrics && p.metrics.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            {label('By the numbers')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {p.metrics.map((m, i) => (
                <div key={i} style={{ flex: '1 1 140px', padding: '16px 18px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg)' }}>
                  <div style={{ fontFamily: syne, fontWeight: 800, fontSize: '26px', color: 'var(--data)' }}>{m.k}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '12.5px', marginTop: '2px' }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* tech */}
        <div style={{ marginBottom: (access.length || links.length) ? '26px' : 0 }}>
          {label('Built with')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {p.tech.map((t) => (
              <span key={t} style={{ fontFamily: mono, fontSize: '11px', color: 'var(--text-2)', padding: '5px 10px', background: 'var(--surface)', borderRadius: '6px' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* access — honest status pills (e.g. private / login required / code on request) */}
        {access.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: links.length ? '20px' : 0 }}>
            {access.map((a, i) => {
              const pill = { display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: mono, fontSize: '11.5px', letterSpacing: '.3px', color: 'var(--text-2)', border: '1px solid var(--border-2)', padding: '8px 14px', borderRadius: '20px', background: 'var(--surface)' };
              const inner = (<>{a.icon && <span aria-hidden>{a.icon}</span>}<span>{a.label}</span></>);
              return a.href
                ? <a key={i} href={a.href} target="_blank" rel="noopener noreferrer" className="modal-link-btn" style={{ ...pill, cursor: 'none' }}>{inner}</a>
                : <span key={i} style={pill}>{inner}</span>;
            })}
          </div>
        )}

        {/* links */}
        {links.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {links.map((l) => (
              <a
                key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                className="modal-link-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: mono, fontSize: '12px', letterSpacing: '.5px', color: 'var(--text)', border: '1px solid var(--border-2)', padding: '10px 16px', borderRadius: '10px', background: 'var(--surface)', cursor: 'none' }}
              >
                {l.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const yearsFrom = workYearRange.from, yearsTo = workYearRange.to;

  return (
    <section id="projects" aria-label="Selected projects" style={{ padding: '10vh 8vw', maxWidth: '1240px', margin: '0 auto' }}>
      <SectionTag num={sectionTags.projects[0]} label={sectionTags.projects[1]} />
      <h2 data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: syne, fontWeight: 800, fontSize: 'clamp(30px,4.5vw,56px)', margin: '16px 0 44px', letterSpacing: '-.02em' }}>Selected Work</h2>

      {/* Ledger/index rows. Each row is the modal trigger — `data-viewmore`
          carries the project num, exactly as the old card button did, so
          `initProjectModals` in Portfolio.jsx is untouched. `data-workrow`
          is the hook the floating preview controller binds to. */}
      <div data-worktable style={{ borderTop: '1px solid var(--border)' }}>
        {projects.map((p) => (
          <button
            key={p.num}
            type="button"
            data-reveal
            data-workrow={p.num}
            data-viewmore={p.num}
            className="work-row"
            style={{
              opacity: 0, transform: 'translateY(34px)',
              display: 'grid', gridTemplateColumns: '64px 1.35fr 1fr auto auto', gap: '24px',
              alignItems: 'center', width: '100%', textAlign: 'left',
              padding: '30px 18px', borderBottom: '1px solid var(--border)',
              background: 'transparent', border: 'none', borderRadius: 0,
              color: 'inherit', font: 'inherit', cursor: 'none',
            }}
          >
            <span data-workrow-num style={{ fontFamily: mono, fontSize: '13px', color: 'var(--text-4)', transition: 'color .35s' }}>{p.num}</span>
            <span data-workrow-name style={{ fontFamily: syne, fontWeight: 700, fontSize: 'clamp(19px,2.2vw,27px)', letterSpacing: '-.01em', color: 'var(--text-2)', transition: 'color .35s' }}>{p.name}</span>
            <span className="work-row-tech" style={{ fontFamily: mono, fontSize: '11.5px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.tech.slice(0, 3).join(' · ')}
            </span>
            <span style={{ fontFamily: mono, fontSize: '11px', color: 'var(--accent)', border: '1px solid var(--accent-line)', padding: '4px 11px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{p.period}</span>
            <span aria-hidden data-workrow-arrow className="work-row-arrow" style={{ fontFamily: mono, fontSize: '16px', color: 'var(--accent)', opacity: 0, transform: 'translateX(-6px)', transition: 'opacity .35s, transform .35s' }}>→</span>
          </button>
        ))}

        {/* CTA in the same table language — the last row of the ledger. */}
        <Link
          href="/work"
          data-reveal
          className="work-row work-cta"
          style={{
            opacity: 0, transform: 'translateY(34px)',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center',
            padding: '30px 18px', borderBottom: '1px solid var(--border)', cursor: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: mono, fontSize: '12.5px', letterSpacing: '2px', color: 'var(--accent)' }}>VIEW THE FULL ARCHIVE</span>
            <span style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '1px', color: 'var(--text-4)' }}>
              {allWorks.length} PROJECTS · {yearsFrom} — {yearsTo}
            </span>
          </span>
          <span aria-hidden data-workrow-arrow className="work-row-arrow" style={{ fontFamily: mono, fontSize: '16px', color: 'var(--accent)', opacity: 1, transition: 'transform .35s' }}>→</span>
        </Link>
      </div>

      {/* Floating hover preview — one shared card, positioned by
          `initWorkRows` in Portfolio.jsx. Disabled on touch/narrow via CSS. */}
      <div
        data-workpreview aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 60, width: '300px',
          padding: '18px 20px', borderRadius: '16px',
          border: '1px solid var(--border-2)',
          background: 'linear-gradient(150deg,var(--card),var(--surface))',
          boxShadow: '0 30px 80px -24px var(--shadow)',
          opacity: 0, visibility: 'hidden', pointerEvents: 'none',
          transform: 'scale(.96)', transformOrigin: 'top left',
          transition: 'opacity .22s ease, transform .22s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <p data-workpreview-tagline style={{ margin: 0, fontSize: '13px', lineHeight: 1.55, color: 'var(--text-2)' }} />
        <div data-workpreview-metrics style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '14px 0 0' }} />
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontFamily: mono, fontSize: '10px', letterSpacing: '2px', color: 'var(--text-3)' }}>
          VIEW DETAILS →
        </div>
      </div>

      {/* detail overlays — hidden until opened by initProjectModals in Portfolio.jsx */}
      {projects.map((p) => (
        <ProjectModal key={p.num} p={p} />
      ))}
    </section>
  );
}
