/* Snapshots the public GitHub repos into lib/works.generated.json.
 *
 * Run with `npm run fetch:works`. The JSON is committed on purpose: /work then
 * has no runtime API dependency, no rate limit, and no failure mode in prod.
 *
 * This only produces the *mechanical* facts (name, dates, language, links).
 * Anything editorial — real display names, proper tech lists, categories,
 * which repos are featured or hidden — belongs in `worksOverrides` in
 * lib/data.js, which is merged over this file. Re-running never clobbers it.
 */

const USER = 'wizardofvoid';
const API = `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`;
const OUT = new URL('../lib/works.generated.json', import.meta.url);

/* Repos that are never portfolio entries: the GitHub profile README, and
   anything that is content rather than code. */
const NOISE = new Set([USER, `${USER}.github.io`, '.github', 'config', 'dotfiles']);

/* Words that survive prettification with their own casing. */
const KEEP_CASE = {
  pdf: 'PDF', css: 'CSS', html: 'HTML', api: 'API', ui: 'UI', cli: 'CLI',
  ai: 'AI', ml: 'ML', nlp: 'NLP', rag: 'RAG', js: 'JS', db: 'DB', qa: 'Q&A',
  multipdf: 'MultiPDF', xchange: 'Xchange',
};

const prettify = (slug) =>
  slug
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')   // DrumKit -> Drum Kit
    .trim()
    .split(/\s+/)
    .map((w) => KEEP_CASE[w.toLowerCase()] ?? (w[0].toUpperCase() + w.slice(1)))
    .join(' ');

/* Word-boundary matching only works if separators are real spaces first:
   `resume_feedback` never matches /\bresume\b/ because `_` is a word char, and
   `DiceGame` never matches /\bgame\b/. Normalise before testing. */
const normalise = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_/.]+/g, ' ').toLowerCase();

/* Category from whatever signal exists. First hit wins, so specific buckets are
   listed before general ones — "scanner" must beat "website", and a toy game
   must beat "javascript". */
const CATEGORY_RULES = [
  ['AI/ML', /\b(ai|ml|llm|rag|nlp|chatbot|linker|predictor|prediction|classif\w*|regression|disease|resume|langchain|langgraph|tensorflow|pytorch|sklearn|scikit|jupyter|pandas|numpy)\b/],
  ['Coursework', /\b(game|dice|drum|kit|tutorial|practice|basic|hackathon|thon|tkinter)\b/],
  // NB: no bare "script" here — camel-splitting turns JavaScript/TypeScript
  // into "java script", which would swallow every web repo.
  ['Tools', /\b(scanner|scaffold|tool|cli|automation|vulnerability|converter)\b/],
  ['Full-stack', /\b(portfolio|platform|website|web|next|react|node|express|django|flask|supabase|mongo|learning|typescript|javascript|html|css)\b/],
];

const categorise = (haystack) => {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(haystack)) return cat;
  return 'Tools';
};

async function main() {
  const res = await fetch(API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': `${USER}-portfolio-build` },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
  const repos = await res.json();
  if (!Array.isArray(repos)) throw new Error(`Unexpected payload: ${JSON.stringify(repos).slice(0, 200)}`);

  const works = repos
    .filter((r) => !r.fork && !r.archived && !r.private && !NOISE.has(r.name))
    .map((r) => {
      const created = new Date(r.created_at);
      const topics = Array.isArray(r.topics) ? r.topics : [];
      // Language is often the ONLY tech signal — none of these repos carry
      // topics — so overrides do the real work for anything notable.
      const tech = [...new Set([...(r.language ? [r.language] : []), ...topics])];
      // Only the repo *name* gets camel-split (DiceGame -> "dice game"); the
      // language and topics stay whole so "JavaScript" isn't torn in two.
      const haystack = [
        normalise(r.name),
        (r.description ?? '').toLowerCase().replace(/[-_/.]+/g, ' '),
        (r.language ?? '').toLowerCase(),
        ...topics.map((t) => t.toLowerCase()),
      ].join(' ');
      return {
        slug: r.name,
        name: prettify(r.name),
        year: created.getUTCFullYear(),
        month: created.getUTCMonth() + 1,
        tech,
        cat: categorise(haystack),
        repoUrl: r.html_url,
        liveUrl: r.homepage || null,
        desc: r.description || '',
      };
    })
    // newest first, stable
    .sort((a, b) => (b.year - a.year) || (b.month - a.month) || a.slug.localeCompare(b.slug));

  const { writeFile } = await import('node:fs/promises');
  await writeFile(OUT, JSON.stringify(works, null, 2) + '\n', 'utf8');
  console.log(`wrote ${works.length} works -> lib/works.generated.json`);
  const missing = works.filter((w) => !w.desc).length;
  if (missing) console.log(`note: ${missing}/${works.length} repos have no GitHub description — set desc in worksOverrides.`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
