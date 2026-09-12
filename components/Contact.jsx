import { contacts } from '../lib/data';

const icons = {
  gmail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9V9Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
  // Codolio — the aggregated coding profile; drawn as a code glyph over a bar chart.
  codolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 7-4 4.5L8 16" />
      <path d="m16 7 4 4.5-4 4.5" />
      <path d="M13.4 5.6 10.6 18" />
    </svg>
  ),
};

export default function Contact() {
  return (
    <section id="contact" aria-label="Contact" style={{ padding: '14vh 8vw 8vh', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <div data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '3px', color: 'var(--accent)', marginBottom: '22px' }}>// LET&apos;S_CONNECT</div>
      <h2 data-reveal style={{ opacity: 0, transform: 'translateY(34px)', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(36px,7vw,90px)', lineHeight: 1, margin: '0 0 20px', letterSpacing: '-.03em' }}>
        Let&apos;s build<br />
        <span style={{ background: 'linear-gradient(92deg,var(--accent),var(--accent-3),var(--accent-4))', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'gradmove 6s ease infinite' }}>something great.</span>
      </h2>
      <p data-reveal style={{ opacity: 0, transform: 'translateY(34px)', color: 'var(--text-2)', fontSize: '17px', maxWidth: '520px', margin: '0 auto 48px' }}>Always open to interesting problems and good conversations. Drop a message — I reply fast.</p>
      <div data-reveal style={{ opacity: 0, transform: 'translateY(34px)', display: 'flex', gap: '22px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={c.label}
            title={c.label}
            data-magnetic
            data-tilt
            className="social-logo"
            style={{
              '--brand': c.color,
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              border: '1px solid var(--border-2)',
              background: 'var(--card-grad)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d',
            }}
          >
            {icons[c.type]}
          </a>
        ))}
      </div>
      <div className="contact-footer" style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '26px', borderTop: '1px solid var(--border)', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: 'var(--text-3)' }}>
        <span>© {new Date().getFullYear()} AYUSH SARAF</span>
        <span>STILL BUILDING ✦ ALWAYS SHIPPING</span>
      </div>
    </section>
  );
}
