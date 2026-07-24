import SectionTag from './SectionTag';
import { sectionTags, aboutParas } from '../lib/data';

const paraKey = { color: 'var(--text)', fontWeight: 600, letterSpacing: '-.004em' };

export default function About() {
  return (
    <section id="about" aria-label="About me" style={{ padding: '8vh 8vw 14vh', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionTag num={sectionTags.about[0]} label={sectionTags.about[1]} />

      <div style={{ marginTop: '34px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(16px,3vw,28px)', justifyContent: 'space-between' }}>
        <div data-reveal style={{ opacity: 0, transform: 'translateY(34px)', minWidth: 0, flex: '1 1 200px' }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(38px,5.5vw,72px)', lineHeight: 1, margin: 0, letterSpacing: '-.03em' }}>
            I am<span style={{ color: 'var(--accent)' }}>?</span>
          </h2>
          <button data-hltoggle style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '13px', cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit' }}>
            <span data-track style={{ position: 'relative', display: 'block', width: '62px', height: '30px', borderRadius: '20px', background: 'var(--border)', border: '1px solid var(--border-2)', transition: 'background .3s', flexShrink: 0 }}>
              <span data-knob style={{ position: 'absolute', top: '3px', left: '3px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--text-2)', transition: 'transform .35s cubic-bezier(.6,0,.2,1),background .3s' }} />
            </span>
            <span data-hllabel style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '2px', color: 'var(--text-3)' }}>TL;DR — OFF</span>
          </button>
        </div>
        <div data-reveal data-tilt className="about-meta-card" style={{ opacity: 0, transform: 'translateY(34px)', padding: '20px 30px', border: '1px solid var(--border)', borderRadius: '14px', background: 'var(--card-grad)', textAlign: 'center', transformStyle: 'preserve-3d', transition: 'transform .2s,border-color .3s', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '46px', lineHeight: 1, background: 'linear-gradient(92deg,var(--accent-2),var(--data))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>8.88</div>
          <div style={{ color: 'var(--text-2)', fontSize: '12px', marginTop: '6px', fontFamily: "'JetBrains Mono',monospace", letterSpacing: '1px' }}>CGPA · VIT VELLORE</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '66px' }}>
        {aboutParas.map((para, i) => (
          <p
            key={i} data-reveal data-para
            style={{ opacity: 0, transform: 'translateY(34px)', alignSelf: para.align, textAlign: para.textAlign, margin: 0, maxWidth: '540px', fontSize: 'clamp(16px,1.5vw,19px)', lineHeight: 1.95, color: 'var(--text-2)', textWrap: 'pretty' }}
          >
            {para.parts.map((part, j) =>
              part.key
                ? <span key={j} data-key style={paraKey}>{part.t}</span>
                : <span key={j} data-fill>{part.t}</span>
            )}
          </p>
        ))}
      </div>
    </section>
  );
}
