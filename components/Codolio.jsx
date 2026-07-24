import SectionTag from './SectionTag';
import { sectionTags } from '../lib/data';

const mono = "'JetBrains Mono',monospace";
const syne = "'Syne',sans-serif";

/* Categorical chart ramp. In a warm palette three oranges side by side are
   indistinguishable, so these are separated by LIGHTNESS as well as hue:
   sage → manilla (lightest) → kraft (mid) → clay (deepest) → grey. Keys are the
   semantic names `lib/codolio.js` emits, not colour names. */
const C = {
  easy: 'var(--good)',
  medium: 'var(--accent-4)',
  basic: 'var(--accent-3)',
  hard: 'var(--alert)',
  unrated: 'var(--text-4)',
};
const LANG_COLORS = ['var(--accent)', 'var(--accent-4)', 'var(--good)', 'var(--accent-3)', 'var(--alert)', 'var(--text-3)'];

const card = {
  border: '1px solid var(--border)',
  borderRadius: '16px',
  background: 'var(--card-grad)',
};
const reveal = { opacity: 0, transform: 'translateY(34px)' };
const label = (t) => (
  <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '16px' }}>{t}</div>
);

/* GitHub-style contribution grid. Horizontally scrollable on narrow screens so
   the page body itself never scrolls sideways. */
function Heatmap({ heatmap }) {
  const { cols, peak } = heatmap;
  const shade = (n) => {
    if (!n) return 'var(--surface)';
    const step = Math.min(4, Math.ceil((n / peak) * 4));
    return `color-mix(in oklab, var(--good) ${[0, 25, 45, 70, 100][step]}%, transparent)`;
  };
  return (
    <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', gap: '3px', minWidth: 'min-content' }}>
        {cols.map((week, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day) => (
              <span
                key={day.ts}
                title={`${day.count} contribution${day.count === 1 ? '' : 's'}`}
                style={{ width: '10px', height: '10px', borderRadius: '2px', background: shade(day.count), flex: 'none' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* One horizontal stacked bar — used for both difficulty split and languages. */
function StackedBar({ segments, total }) {
  return (
    <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', background: 'var(--surface)' }}>
      {segments.map((s, i) => (
        <span
          key={i}
          title={`${s.label} — ${s.display}`}
          style={{ width: `${(s.value / total) * 100}%`, background: s.color, transition: 'width .6s cubic-bezier(.16,1,.3,1)' }}
        />
      ))}
    </div>
  );
}

function Legend({ segments }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: '14px' }}>
      {segments.map((s, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: mono, fontSize: '11.5px', color: 'var(--text-2)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flex: 'none' }} />
          {s.label} <span style={{ color: 'var(--text)' }}>{s.display}</span>
        </span>
      ))}
    </div>
  );
}

export default function Codolio({ data }) {
  if (!data) return null; // Codolio unreachable at build time — section stays out of the page.

  const { totals, difficulty, platforms, topics, github, profileUrl, syncedAt } = data;
  const diffTotal = difficulty.reduce((n, d) => n + d.count, 0);
  const diffSegments = difficulty.map((d) => ({ label: d.label, value: d.count, display: String(d.count), color: C[d.color] }));
  const langSegments = github.languages.map((l, i) => ({
    label: l.name, value: l.pct, display: `${Math.round(l.pct * 100)}%`, color: LANG_COLORS[i % LANG_COLORS.length],
  }));
  const topTopic = topics[0]?.count || 1;

  const stats = [
    // All four are metrics, so they all take --data. Hue is reserved for the
    // categorical charts below, where colour actually encodes something.
    { k: totals.solved, v: 'problems solved' },
    { k: totals.activeDays, v: 'active days' },
    { k: totals.platforms, v: 'platforms tracked' },
    { k: github.commits, v: 'commits pushed' },
  ];

  return (
    <section id="coding" aria-label="Coding practice statistics" style={{ padding: '10vh 8vw', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionTag num={sectionTags.coding[0]} label={sectionTags.coding[1]} />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', margin: '16px 0 44px' }}>
        <div data-reveal style={{ ...reveal, minWidth: 0 }}>
          <h2 style={{ fontFamily: syne, fontWeight: 800, fontSize: 'clamp(30px,4.5vw,56px)', margin: 0, letterSpacing: '-.02em' }}>Proof of Work</h2>
          {syncedAt && (
            <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '.5px', color: 'var(--text-3)', marginTop: '10px' }}>
              Aggregated across platforms · last synced {syncedAt}
            </div>
          )}
        </div>
        <a
          data-reveal data-magnetic href={profileUrl} target="_blank" rel="noopener noreferrer" className="modal-link-btn"
          style={{ ...reveal, display: 'inline-flex', alignItems: 'center', gap: '9px', fontFamily: mono, fontSize: '11.5px', letterSpacing: '1px', color: 'var(--text-2)', border: '1px solid var(--border-2)', padding: '9px 15px', borderRadius: '20px', background: 'var(--surface)', cursor: 'none' }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--good)', animation: 'pulseGlow 2s infinite', flex: 'none' }} />
          VIA CODOLIO <span aria-hidden>↗</span>
        </a>
      </div>

      {/* headline numbers */}
      <div data-reveal style={{ ...reveal, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {stats.map((s) => (
          <div key={s.v} data-tilt style={{ ...card, padding: '24px 26px', transformStyle: 'preserve-3d', transition: 'transform .2s,border-color .3s' }}>
            <div style={{ fontFamily: syne, fontWeight: 800, fontSize: 'clamp(34px,4vw,46px)', lineHeight: 1, color: 'var(--data)' }}>{s.k}</div>
            <div style={{ color: 'var(--text-2)', fontSize: '12.5px', marginTop: '8px', fontFamily: mono, letterSpacing: '.5px' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* difficulty split */}
      <div data-reveal style={{ ...reveal, ...card, padding: '28px 30px', marginBottom: '24px' }}>
        {label('Difficulty split')}
        <StackedBar segments={diffSegments} total={diffTotal} />
        <Legend segments={diffSegments} />
      </div>

      <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* per-platform breakdown */}
        <div data-reveal style={{ ...reveal, ...card, padding: '28px 30px' }}>
          {label('Where')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {platforms.map((p) => {
              const parts = [
                p.easy && `${p.easy} easy`,
                p.medium && `${p.medium} med`,
                p.hard && `${p.hard} hard`,
                p.basic && `${p.basic} basic`,
              ].filter(Boolean).join(' · ');
              return (
                <a
                  key={p.key} href={p.url} target="_blank" rel="noopener noreferrer" className="modal-link-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '16px 18px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg)', cursor: 'none' }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: syne, fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>{p.name} <span aria-hidden style={{ color: 'var(--text-3)', fontSize: '12px' }}>↗</span></span>
                    <span style={{ display: 'block', fontFamily: mono, fontSize: '11px', color: 'var(--text-3)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      @{p.handle}{parts && ` · ${parts}`}
                    </span>
                  </span>
                  <span style={{ fontFamily: syne, fontWeight: 800, fontSize: '26px', color: 'var(--data)', flex: 'none' }}>{p.total}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* topic strength */}
        <div data-reveal style={{ ...reveal, ...card, padding: '28px 30px' }}>
          {label('Strongest topics')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
            {topics.map((t) => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ flex: '0 0 116px', fontSize: '13px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                <span style={{ flex: 1, height: '8px', borderRadius: '4px', background: 'var(--surface)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: `${(t.count / topTopic) * 100}%`, height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,var(--accent),var(--accent-3))' }} />
                </span>
                <span style={{ flex: '0 0 28px', textAlign: 'right', fontFamily: mono, fontSize: '12px', color: 'var(--text)' }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* github activity */}
      <div data-reveal style={{ ...reveal, ...card, padding: '28px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {label('Shipping activity')}
          {github.url && (
            <a href={github.url} target="_blank" rel="noopener noreferrer" className="modal-link-btn" style={{ fontFamily: mono, fontSize: '11px', color: 'var(--text-3)', cursor: 'none' }}>@{github.handle} ↗</a>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', marginBottom: '22px', fontFamily: mono, fontSize: '12.5px', color: 'var(--text-2)' }}>
          <span><b style={{ color: 'var(--data)', fontFamily: syne, fontSize: '17px' }}>{github.contributions}</b> contributions</span>
          <span><b style={{ color: 'var(--data)', fontFamily: syne, fontSize: '17px' }}>{github.commits}</b> commits</span>
          <span><b style={{ color: 'var(--data)', fontFamily: syne, fontSize: '17px' }}>{github.activeDays}</b> active days</span>
          {totals.maxStreak > 0 && <span><b style={{ color: 'var(--data)', fontFamily: syne, fontSize: '17px' }}>{totals.maxStreak}</b> day best streak</span>}
        </div>

        {github.heatmap && <Heatmap heatmap={github.heatmap} />}

        {langSegments.length > 0 && (
          <div style={{ marginTop: '26px', paddingTop: '22px', borderTop: '1px solid var(--border)' }}>
            {label('Languages by volume')}
            <StackedBar segments={langSegments} total={langSegments.reduce((n, s) => n + s.value, 0)} />
            <Legend segments={langSegments} />
          </div>
        )}
      </div>
    </section>
  );
}
