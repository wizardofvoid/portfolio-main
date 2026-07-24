import SectionTag from './SectionTag';
import { sectionTags, experience } from '../lib/data';

export default function Experience() {
  return (
    <section id="experience" aria-label="Work experience" style={{ padding: '10vh 8vw', maxWidth: '1100px', margin: '0 auto' }}>
      <SectionTag num={sectionTags.experience[0]} label={sectionTags.experience[1]} />
      <h2 data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4.5vw,56px)', margin: '16px 0 50px', letterSpacing: '-.02em' }}>Experience</h2>
      <div style={{ position: 'relative', paddingLeft: 'clamp(22px,4vw,34px)', borderLeft: '1px solid var(--border)' }}>
        {experience.map((e, i) => (
          <div key={i} data-reveal style={{ opacity: 0, transform: 'translateY(34px)', position: 'relative', marginBottom: '44px' }}>
            <span style={{ position: 'absolute', left: 'calc(-1 * clamp(22px,4vw,34px) - 7px)', top: '5px', width: '13px', height: '13px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--accent)', boxShadow: '0 0 14px color-mix(in oklab, var(--accent) 60%, transparent)' }} />
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '1px', color: 'var(--accent)', marginBottom: '6px' }}>{e.period}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '22px', margin: 0 }}>{e.role}</h3>
              <span style={{ color: 'var(--accent)', fontSize: '16px' }}>@ {e.company}</span>
            </div>
            <ul style={{ margin: '14px 0 0', paddingLeft: '18px', color: 'var(--text-2)', fontSize: '15.5px', lineHeight: 1.7 }}>
              {e.points.map((pt, j) => (
                <li key={j} style={{ marginBottom: '7px' }}>{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
