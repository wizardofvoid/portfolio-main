import Link from 'next/link';
import Cursor from '../../components/Cursor';
import WorkGraph from '../../components/WorkGraph';
import { allWorks, workLinks, workYearRange } from '../../lib/data';

const mono = "'JetBrains Mono',monospace";
const syne = "'Syne',sans-serif";

export const metadata = {
  title: 'All Work — Ayush Saraf',
  description: 'Every public project, plotted as a constellation of shared technologies.',
};

export default function WorkPage() {
  const linkCount = workLinks().length;

  return (
    <main style={{ position: 'relative', zIndex: 5, padding: '12vh 8vw 14vh', maxWidth: '1240px', margin: '0 auto' }}>
      <Cursor />
      <Link href="/" className="back-home" style={{ display: 'inline-block', fontFamily: mono, fontSize: '11px', letterSpacing: '2px', color: 'var(--text-3)', cursor: 'none', transition: 'color .3s' }}>
        ← BACK HOME
      </Link>

      <h1 style={{ fontFamily: syne, fontWeight: 800, fontSize: 'clamp(34px,5.5vw,68px)', lineHeight: 1.02, letterSpacing: '-.03em', margin: '26px 0 0' }}>
        All Work
      </h1>
      <p style={{ maxWidth: '620px', margin: '18px 0 0', fontSize: 'clamp(15px,1.4vw,17px)', lineHeight: 1.65, color: 'var(--text-2)' }}>
        Every public repository, plotted as a constellation — two projects are joined when they
        share a technology, and the more they share, the tighter they pull together.
      </p>
      <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '2px', color: 'var(--text-4)', margin: '20px 0 40px' }}>
        {allWorks.length} PROJECTS · {linkCount} SHARED-TECH LINKS · {workYearRange.from} — {workYearRange.to}
      </div>

      <WorkGraph />
    </main>
  );
}
