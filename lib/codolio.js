/* Live coding stats, pulled from Codolio's public profile API.
 *
 * Fetched on the SERVER (from `app/page.jsx`) and passed down as a prop, so
 * there's no CORS dance, no API key in the bundle, and no client-side spinner.
 * Next revalidates on a timer, so the page is static between refreshes.
 *
 * Every field is optional-chained and the whole thing is wrapped in try/catch:
 * if Codolio is down or changes its response shape, `getCodolioStats()` returns
 * null and the section simply doesn't render. The build must never break
 * because a third party had a bad day.
 */

import { codolioUser, codolioProfileUrl } from './data';

const API = 'https://api.codolio.com';
const REVALIDATE_SECONDS = 60 * 60 * 6; // 4 refreshes a day is plenty
const TIMEOUT_MS = 10_000;

/* Codolio only stores handles, so each platform needs its own profile-URL shape. */
const PLATFORMS = {
  leetcode: { name: 'LeetCode', url: (h) => `https://leetcode.com/u/${h}/` },
  geeksforgeeks: { name: 'GeeksforGeeks', url: (h) => `https://www.geeksforgeeks.org/user/${h}/` },
  hackerrank: { name: 'HackerRank', url: (h) => `https://www.hackerrank.com/profile/${h}` },
  codeforces: { name: 'Codeforces', url: (h) => `https://codeforces.com/profile/${h}` },
  codechef: { name: 'CodeChef', url: (h) => `https://www.codechef.com/users/${h}` },
};

/* Platforms label the same concept differently ("Strings" vs "String"), and mix
   in language/meta tags that aren't topics at all. Normalise before merging. */
const TOPIC_ALIASES = {
  Strings: 'String',
  Mathematical: 'Math',
  'Queue and Stacks': 'Stacks & Queues',
  'HashMap and Set': 'HashMap & Set',
  'two-pointer-algorithm': 'Two Pointers',
  'sliding-window': 'Sliding Window',
  'doubly-linked-list': 'Linked Lists',
  'prefix-sum': 'Prefix Sum',
  'Greedy Algorithms': 'Greedy',
  'Dynamic Programming': 'Dynamic Programming',
  'Divide and Conquer': 'Divide & Conquer',
  permutation: 'Permutations',
  'Modular Arithmetic': 'Math',
};
const TOPIC_BLOCKLIST = new Set([
  'Algorithms', 'CPP', 'CPP-Control-Flow', 'Java', 'Python', 'C++', 'implementation',
  'constructive algo', 'Design-Pattern', 'Design',
]);

async function getJson(path) {
  const res = await fetch(`${API}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Codolio ${path} → HTTP ${res.status}`);
  const json = await res.json();
  if (!json?.status?.success) throw new Error(`Codolio ${path} → unsuccessful payload`);
  return json.data;
}

/* Collapse the day→count map into GitHub-style week columns, anchored on the
   most recent day Codolio knows about (not on "today", so the strip is stable
   between rebuilds and always ends on real data). */
function buildHeatmap(activity, weeks = 26) {
  const days = Object.keys(activity || {}).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!days.length) return null;

  const DAY = 86400;
  const last = days[days.length - 1];
  // Walk the anchor forward to the end of its week so the final column is full.
  const lastDow = new Date(last * 1000).getUTCDay();
  const end = last + (6 - lastDow) * DAY;
  const start = end - (weeks * 7 - 1) * DAY;

  const cols = [];
  let peak = 0;
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const ts = start + (w * 7 + d) * DAY;
      const count = activity?.[ts] ?? activity?.[String(ts)] ?? 0;
      if (count > peak) peak = count;
      col.push({ ts, count });
    }
    cols.push(col);
  }
  return { cols, peak };
}

/* Formatted on the server with an explicit UTC format — a locale-dependent
   date string would differ between server and client and trip hydration. */
function formatSyncDate(stateList) {
  const stamps = (stateList ?? [])
    .map((s) => Number(s?.lastSuccessfulUpdateAt))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!stamps.length) return null;
  const d = new Date(Math.max(...stamps) * 1000);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function normalizeTopics(platformProfiles) {
  const merged = new Map();
  for (const p of platformProfiles) {
    const dist = p?.topicAnalysisStats?.topicWiseDistribution;
    if (!dist) continue;
    for (const [rawName, rawCount] of Object.entries(dist)) {
      const name = TOPIC_ALIASES[rawName] ?? rawName;
      const count = Number(rawCount) || 0;
      if (!count || TOPIC_BLOCKLIST.has(rawName) || TOPIC_BLOCKLIST.has(name)) continue;
      merged.set(name, (merged.get(name) ?? 0) + count);
    }
  }
  return [...merged.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function getCodolioStats() {
  try {
    const [details, profile, state] = await Promise.all([
      getJson(`/user/details?userKey=${encodeURIComponent(codolioUser)}`),
      getJson(`/profile?userKey=${encodeURIComponent(codolioUser)}`),
      // Non-critical: only used for the "synced" stamp, so a failure here
      // shouldn't cost us the whole section.
      getJson(`/user/profiles/state?userKey=${encodeURIComponent(codolioUser)}`).catch(() => null),
    ]);

    const raw = profile?.platformProfiles?.platformProfiles ?? [];
    const platforms = raw
      .map((p) => {
        const meta = PLATFORMS[p?.platform];
        const handle = p?.userStats?.handle;
        const q = p?.totalQuestionStats ?? {};
        const total = Number(q.totalQuestionCounts) || 0;
        if (!meta || !handle || !total) return null;
        const easy = Number(q.easyQuestionCounts) || 0;
        const medium = Number(q.mediumQuestionCounts) || 0;
        const hard = Number(q.hardQuestionCounts) || 0;
        const basic = Number(q.basicQuestionCounts) || 0;
        return {
          key: p.platform,
          name: meta.name,
          handle,
          url: meta.url(handle),
          total,
          easy,
          medium,
          hard,
          basic,
          // Platforms like HackerRank report a total with no difficulty split.
          unrated: Math.max(0, total - easy - medium - hard - basic),
          maxStreak: Number(p?.dailyActivityStatsResponse?.maxStreak) || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.total - a.total);

    if (!platforms.length) return null;

    const sum = (field) => platforms.reduce((n, p) => n + p[field], 0);
    const difficulty = [
      { label: 'Easy', count: sum('easy'), color: 'easy' },
      { label: 'Medium', count: sum('medium'), color: 'medium' },
      { label: 'Hard', count: sum('hard'), color: 'hard' },
      { label: 'Basic', count: sum('basic'), color: 'basic' },
      { label: 'Unrated', count: sum('unrated'), color: 'unrated' },
    ].filter((d) => d.count > 0);

    const card = details?.codolioCardDetails ?? {};
    const gh = details?.githubProfileDetails ?? {};
    const langBytes = gh?.languageDistributions ?? {};
    const totalBytes = Object.values(langBytes).reduce((n, v) => n + (Number(v) || 0), 0);

    return {
      profileUrl: codolioProfileUrl,
      // These numbers are only as fresh as Codolio's last pull from each
      // platform — which is not the same as when *we* fetched them. Surface
      // the real date rather than implying the counts are live to the minute.
      syncedAt: formatSyncDate(state?.platformProfilesStateInfoList),
      totals: {
        solved: Number(card.totalQuestionsSolved) || sum('total'),
        activeDays: Number(card.totalActiveDays) || 0,
        platforms: platforms.length,
        maxStreak: Math.max(0, ...platforms.map((p) => p.maxStreak)),
      },
      difficulty,
      platforms,
      topics: normalizeTopics(raw),
      github: {
        handle: gh?.githubProfile ?? null,
        url: gh?.githubProfile ? `https://github.com/${gh.githubProfile}` : null,
        commits: Number(gh.commitCounts) || 0,
        contributions: Number(gh.totalContributions) || 0,
        activeDays: Number(gh.totalActiveDays) || 0,
        languages: Object.entries(langBytes)
          .map(([name, bytes]) => ({ name, pct: totalBytes ? (Number(bytes) || 0) / totalBytes : 0 }))
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 6),
        heatmap: buildHeatmap(gh?.developmentActivity),
      },
    };
  } catch (err) {
    // Logged for the build output; the section renders nothing when this is null.
    console.error('[codolio] stats unavailable —', err?.message ?? err);
    return null;
  }
}
