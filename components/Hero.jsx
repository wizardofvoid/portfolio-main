import { resumeHref } from '../lib/data';

export default function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8vw', position: 'relative', overflow: 'hidden' }}
    >
      <div data-hgridwrap style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '52vh', overflow: 'hidden', pointerEvents: 'none', opacity: 0.55 }}>
        <div
          style={{
            position: 'absolute', bottom: '-40px', left: '-20%', right: '-20%', height: '100%',
            backgroundImage: 'linear-gradient(color-mix(in oklab, var(--accent) 50%, transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in oklab, var(--accent) 50%, transparent) 1px,transparent 1px)',
            backgroundSize: '46px 46px', animation: 'gridflow 3.4s linear infinite', transformOrigin: 'bottom',
            WebkitMaskImage: 'linear-gradient(transparent,#000 60%)', maskImage: 'linear-gradient(transparent,#000 60%)',
          }}
        />
      </div>

      <a
        href={resumeHref} download data-hero data-magnetic className="resume-btn"
        style={{ position: 'absolute', top: 'clamp(18px,3vh,30px)', right: 'clamp(16px,6vw,72px)', zIndex: 10, padding: 'clamp(9px,1.2vh,13px) clamp(13px,1.6vw,22px)', border: '1px solid var(--border-2)', borderRadius: '10px', fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(10px,1.1vw,12px)', letterSpacing: '1px', color: 'var(--text-2)', transition: 'all .3s', whiteSpace: 'nowrap' }}
      >
        ⤓ RESUME.PDF
      </a>

      <div data-hpx style={{ position: 'relative', zIndex: 2, willChange: 'transform,opacity' }}>
        <div data-hero style={{ position: 'relative', zIndex: 2, fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', letterSpacing: '3px', color: 'var(--accent)', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '34px', height: '1px', background: 'var(--accent)' }} />HELLO_WORLD.INIT()
        </div>
        <h1 data-hero className="hero-name" style={{ position: 'relative', zIndex: 2, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,12vw,168px)', lineHeight: 0.92, margin: 0, letterSpacing: '-.03em' }}>
          <span style={{ display: 'block', background: 'linear-gradient(92deg,var(--text),var(--text-2) 55%,var(--text))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>AYUSH</span>
          <span style={{ display: 'block', background: 'linear-gradient(92deg,var(--accent),var(--accent-3),var(--accent-4),var(--accent))', backgroundSize: '280% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'gradmove 6s ease infinite' }}>SARAF</span>
        </h1>
        <div data-hero style={{ position: 'relative', zIndex: 2, marginTop: '26px', fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(14px,2vw,20px)', color: 'var(--text-2)', height: '1.6em' }}>
          <span style={{ color: 'var(--text-3)' }}>&gt; </span>
          <span data-type></span>
          <span style={{ display: 'inline-block', width: '9px', height: '1.05em', background: 'var(--accent)', verticalAlign: '-3px', marginLeft: '3px', animation: 'blink 1s step-end infinite' }} />
        </div>
        <p data-hero className="hero-desc" style={{ position: 'relative', zIndex: 2, maxWidth: '580px', marginTop: '26px', color: 'var(--text-2)', fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.65 }}>
          Final-year CS student at VIT and an Oracle-certified Java developer. I build backend and full-stack applications in Python and Java — RAG pipelines, agents, and NLP systems included — on strong DSA fundamentals, with a bias toward code that&apos;s fast, correct, and actually shipped.
        </p>
      </div>

      <div data-hero data-scroll-ind className="hero-scroll-ind" style={{ position: 'absolute', bottom: '34px', left: '50%', zIndex: 4, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', letterSpacing: '3px', color: 'var(--text-3)' }}>SCROLL</span>
        <div style={{ width: '20px', height: '32px', border: '1px solid var(--text-4)', borderRadius: '12px', position: 'relative', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
          <span style={{ width: '3px', height: '6px', borderRadius: '2px', background: 'var(--accent)', animation: 'scrollpip 1.8s infinite' }} />
        </div>
      </div>
    </section>
  );
}
