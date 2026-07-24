import Portfolio from '../components/Portfolio';
import { getCodolioStats } from '../lib/codolio';

/* Server component: the Codolio fetch happens here so no API call ships to the
   browser. Next caches the result and revalidates it on the interval set in
   lib/codolio.js. */
export default async function Page() {
  const codolio = await getCodolioStats();
  return <Portfolio codolio={codolio} />;
}
