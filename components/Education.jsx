import SectionTag from './SectionTag';
import { sectionTags, education, awards } from '../lib/data';

export default function Education() {
  return (
    <section id="education" aria-label="Education and highlights" style={{ padding: '10vh 8vw', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="two-col edu-col" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '48px', alignItems: 'start' }}>
        <div>
          <SectionTag num={sectionTags.education[0]} label={sectionTags.education[1]} />
          <h2 data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', margin: '16px 0 34px', letterSpacing: '-.02em' }}>Education</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {education.map((ed, i) => (
              <div
                key={i} data-reveal data-tilt
                style={{ opacity: 0, transform: 'translateY(34px)', padding: '24px 26px', border: '1px solid var(--border)', borderRadius: '14px', background: 'var(--card-grad)', transition: 'transform .2s,border-color .3s', transformStyle: 'preserve-3d' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '19px', margin: 0 }}>{ed.school}</h3>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: 'var(--accent)' }}>{ed.period}</span>
                </div>
                <div style={{ color: 'var(--text-2)', fontSize: '15px', marginTop: '6px' }}>{ed.degree}</div>
                <div style={{ display: 'inline-block', marginTop: '10px', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'var(--accent-2)', border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)', padding: '4px 10px', borderRadius: '20px' }}>{ed.score}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTag num={sectionTags.awards[0]} label={sectionTags.awards[1]} />
          <h2 data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', margin: '16px 0 34px', letterSpacing: '-.02em' }}>Highlights</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {awards.map((a, i) => (
              <div key={i} data-reveal style={{ opacity: 0, transform: 'translateY(34px)', display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 18px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)' }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--accent)', fontSize: '13px', marginTop: '1px' }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>{a.title}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '13px', marginTop: '2px' }}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
