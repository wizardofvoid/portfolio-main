import { marqueeItems } from '../lib/data';

const sepColors = ['var(--accent)', 'var(--accent-3)', 'var(--accent-4)'];

function sequence(keyPrefix) {
  return marqueeItems.map((t, i) => (
    <span key={keyPrefix + i} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.04em',
          color: 'var(--text)',
          whiteSpace: 'nowrap',
        }}
      >
        {t}
      </span>
      <span
        style={{
          margin: '0 clamp(26px,3.6vw,54px)',
          color: sepColors[i % sepColors.length],
          fontSize: '.62em',
          textShadow: `0 0 12px ${sepColors[i % sepColors.length]}`,
          transform: 'translateY(-.05em)',
        }}
      >
        ✦
      </span>
    </span>
  ));
}

export default function Marquee() {
  return (
    <div
      className="marquee-wrap"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        padding: 'clamp(20px,3vh,32px) 0',
        background: 'var(--surface)',
        WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)',
        maskImage: 'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)',
      }}
    >
      <div
        className="marquee-track"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          willChange: 'transform',
          animation: 'marquee 40s linear infinite',
          fontSize: 'clamp(19px,2.5vw,32px)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{sequence('a')}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true">{sequence('b')}</span>
      </div>
    </div>
  );
}
