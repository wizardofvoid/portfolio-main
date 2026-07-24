import SectionTag from './SectionTag';
import { sectionTags, skillGroups } from '../lib/data';

export default function Skills() {
  return (
    <section id="skills" aria-label="Skills and tools" style={{ padding: '10vh 8vw', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionTag num={sectionTags.skills[0]} label={sectionTags.skills[1]} />
      <h2 data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4.5vw,56px)', margin: '16px 0 44px', letterSpacing: '-.02em' }}>The Stack</h2>
      {/* `height` is a pre-JS fallback only — initStack measures the tallest
          panel at the current width and sets the real height, so nothing ever
          clips or scrolls. */}
      <div data-reveal data-acc style={{ opacity: 0, transform: 'translateY(34px)', display: 'flex', gap: '14px', height: '480px', alignItems: 'stretch' }}>
        {skillGroups.map((g) => (
          <div
            key={g.no} data-panel
            style={{ position: 'relative', flex: '0 0 94px', minWidth: '94px', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', cursor: 'pointer', background: 'var(--card-grad)', transition: 'flex .55s cubic-bezier(.6,0,.2,1),border-color .3s,background .3s' }}
          >
            <span style={{ position: 'absolute', top: '16px', left: 0, right: 0, textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'var(--text-3)', zIndex: 2 }}>{g.no}</span>
            <div data-vlabel style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity .3s' }}>
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(20px,2vw,30px)', letterSpacing: '1px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{g.tag}</span>
            </div>
            {/* NB: `overflow: hidden` on both axes deliberately. Setting only
                overflow-x makes the spec compute overflow-y to `auto`, which is
                where the stray scrollbar used to come from. */}
            <div data-content style={{ position: 'absolute', inset: 0, padding: '34px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0, visibility: 'hidden', transition: 'opacity .4s ease', minWidth: '380px', maxWidth: '100%', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', right: '20px', bottom: '10px', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '150px', lineHeight: 1, color: 'var(--surface)', pointerEvents: 'none' }}>{g.no}</span>
              <div className="stack-title" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3vw,44px)', letterSpacing: '-.01em', margin: '12px 0 4px' }}>{g.tag}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '2px', color: 'var(--accent)', marginBottom: '16px' }}>{g.no} / STACK</div>
              <p style={{ color: 'var(--text-2)', fontSize: '15px', lineHeight: 1.55, margin: '0 0 24px', maxWidth: '440px' }}>{g.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start' }}>
                {g.items.map((sk) => (
                  <span key={sk} className="chip" style={{ padding: '11px 20px', border: '1px solid var(--border-2)', borderRadius: '11px', fontSize: '15px', color: 'var(--text)', background: 'var(--surface)', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: '14px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flex: 'none' }} />{sk}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: '26px', paddingTop: '22px', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '1px', color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>{g.focus}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
