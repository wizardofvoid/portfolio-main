export default function SectionTag({ num, label }) {
  return (
    <div
      data-reveal
      style={{
        opacity: 0,
        transform: 'translateY(34px)',
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: '12px',
        letterSpacing: '3px',
        color: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ color: 'var(--text-3)' }}>{num}</span>
      {label}
      <span data-sectag-line style={{ flex: '0 0 60px', height: '1px', background: 'var(--border-2)' }} />
    </div>
  );
}
