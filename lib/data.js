import generatedWorks from './works.generated.json';

// Hosted on Drive rather than the local PDFs in /public, so the resume can be
// swapped without a redeploy. Opens in a new tab — cross-origin, so `download`
// would be ignored by the browser anyway.
export const resumeHref = 'https://drive.google.com/file/d/1tbrDKP9ahJAxzB30T6ykRunyIn4L73tW/view?usp=sharing';

// Codolio aggregates the LeetCode / GfG / HackerRank profiles. `lib/codolio.js`
// reads this handle to fetch the live stats rendered in the Practice section.
export const codolioUser = 'AyushSaraf';
export const codolioProfileUrl = `https://codolio.com/profile/${codolioUser}`;

export const marqueeItems = [
  'I build things that ship',
  'Java · Python · C++ · SQL',
  'DSA fundamentals, production instincts',
  'From rough idea to working system',
  'Backend logic that holds up',
  'Oracle certified in Java',
  'I learn by building',
  'AI when it earns its place',
];

export const navItems = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'coding', label: 'Coding', href: '#coding' },
  { id: 'projects', label: 'Work', href: '#projects' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'education', label: 'Education', href: '#education' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export const sectionTags = {
  about: ['01', 'ABOUT'],
  skills: ['02', 'TOOLKIT'],
  coding: ['03', 'PRACTICE'],
  projects: ['04', 'PROJECTS'],
  experience: ['05', 'CAREER'],
  education: ['06', 'EDUCATION'],
  awards: ['07', 'EXTRAS'],
};

export const typeWords = [
  'Software Engineer',
  'Backend Developer',
  'DSA Problem Solver',
  'Full-Stack Builder',
  'AI Systems Engineer',
];

export const skillGroups = [
  { no: '01', tag: 'LANGUAGES', desc: 'The core toolkit — where I write day-to-day application code and interview code alike.', focus: 'PRIMARY · Java + Python', items: ['Java', 'Python', 'C/C++', 'JavaScript', 'TypeScript', 'SQL'] },
  { no: '02', tag: 'CORE CS', desc: 'The fundamentals under the code — what actually decides whether a system holds up.', focus: 'FOCUS · DSA + System Design', items: ['Data Structures', 'Algorithms', 'OOP', 'Operating Systems', 'System Design'] },
  { no: '03', tag: 'DATABASES', desc: 'Relational for the application, vector for retrieval — modelled, indexed, and queried.', focus: 'PRIMARY · PostgreSQL', items: ['PostgreSQL', 'SQLite', 'SQL', 'FAISS', 'Pinecone'] },
  { no: '04', tag: 'AI / ML', desc: 'Applied work — pipelines, agents, and models built to live inside real applications.', focus: 'PRIMARY · LangChain / LangGraph', items: ['LangChain', 'LangGraph', 'Scikit-learn', 'NumPy', 'Pandas', 'NLTK', 'Streamlit'] },
  { no: '05', tag: 'TOOLS', desc: 'The workflow around the code — version it, explore it, ship it.', focus: 'DAILY DRIVER · Git + VS Code', items: ['Git', 'GitHub', 'VS Code', 'Cursor', 'Jupyter', 'REST APIs'] },
];

export const projects = [
  {
    num: '01', repo: 'multiPDF-chatbot', name: 'RAG Document Q&A Platform', period: 'May 2026',
    desc: 'An end-to-end full-stack web application — Streamlit UI over a Python backend — that lets users upload private PDFs and query them conversationally. Four AI APIs (Gemini Vision, Gemini Embeddings, Groq LLM, FAISS) sit behind a single ingestion-and-retrieval pipeline. The engineering win was throughput: parallel embedding generation across an 8-worker ThreadPoolExecutor plus incremental PDF-timestamp caching cut indexing time by roughly 10×, so unchanged files re-index within 5 seconds.',
    tech: ['Python', 'LangChain', 'FAISS', 'Streamlit', 'Gemini API', 'Groq'],
    metrics: [{ k: '~10×', v: 'faster indexing' }, { k: '8', v: 'parallel workers' }, { k: '<5s', v: 'incremental re-index' }],
    details: {
      tagline: 'Upload your own documents, ask questions in plain language, and get answers grounded in the files — without shipping them off to anyone.',
      overview: [
        'The system is a full-stack application, not a notebook: a Streamlit front end for upload and conversation, and a Python backend that owns the whole document lifecycle — parsing PDFs, chunking them, generating embeddings, storing them in a FAISS index, and retrieving the right context at query time before it ever reaches an LLM.',
        'Four separate AI APIs are integrated behind one interface — Google Gemini Vision for document parsing, Gemini Embeddings for vectorisation, Groq for fast inference, and FAISS for similarity search — so any one of them can be swapped without the rest of the pipeline noticing.',
        'The hard part was making re-indexing cheap. Embedding generation was the bottleneck, so it runs in parallel across an 8-worker ThreadPoolExecutor, and an incremental cache keyed on PDF modification timestamps skips any file that has not changed. Together that took indexing roughly 10× faster and brought a re-run over an unchanged corpus down to under 5 seconds.',
      ],
      access: [
        { icon: '💻', label: 'github.com/wizardofvoid', href: 'https://github.com/wizardofvoid' },
      ],
    },
  },
  {
    num: '02', repo: 'resume_feedback', name: 'Resume Feedback System', period: 'Oct 2025',
    desc: 'A full-stack explainable hiring-assist platform (Streamlit + SQLite) that parses a resume, matches its skills against a job description, and returns a scored, explainable verdict with persistent evaluation history. The scoring engine is weighted and deterministic — TF-IDF over 1,000 features with cosine similarity for skill matching (~70%) and section completeness (~30%) — producing a 1–100% score with skill-gap visualisations, with the Gemini API layered on top for narrative feedback.',
    tech: ['Python', 'Streamlit', 'SQLite', 'NLTK', 'TF-IDF', 'Gemini API'],
    metrics: [{ k: '1,000', v: 'TF-IDF features' }, { k: '70/30', v: 'scoring weights' }, { k: '5', v: 'resume sections parsed' }],
    details: {
      tagline: 'An ATS score you can argue with — every point is traceable to a matched skill or a missing section, not to a model’s opinion.',
      overview: [
        'Most resume scorers are a black box: a number appears and nothing explains it. This one splits the job into two halves. The deterministic half is a weighted scoring engine — TF-IDF vectorisation over up to 1,000 features with cosine similarity, weighting dynamic skill-match density at roughly 70% and section/layout completeness at roughly 30% — which produces a 1–100% score that can be broken down line by line.',
        'A two-layer text-extraction pipeline pulls content out of the uploaded file, and an NLTK sentence tokenizer segments it into five resume sections so completeness can be measured per section rather than over one undifferentiated blob. Skill gaps come back as visualisations, so the missing keywords are visible rather than implied.',
        'Only after the deterministic score is computed does the Google Gemini API get involved, turning the structured result into readable feedback. Evaluations persist in SQLite, so a candidate can re-run against a new job description and compare history instead of starting from zero.',
      ],
      access: [
        { icon: '💻', label: 'github.com/wizardofvoid', href: 'https://github.com/wizardofvoid' },
      ],
    },
  },
  {
    num: '03', repo: 'obsidian-linker', name: 'Obsidian Linker', period: 'May 2026',
    desc: 'A LangGraph agent with a 7-node pipeline that reads a 200+ note Obsidian vault and auto-generates [[wiki-links]] and #tags, with Groq and Gemini as swappable LLM backends behind Pydantic-typed contracts. Built for efficiency: LLM calls run concurrently through asyncio.gather, and MD5 hash-based change detection means a re-run over an unchanged vault costs zero API calls.',
    tech: ['Python', 'LangGraph', 'FAISS', 'Pydantic', 'asyncio', 'Groq'],
    metrics: [{ k: '200+', v: 'notes processed' }, { k: '7', v: 'pipeline nodes' }, { k: '0', v: 'redundant LLM calls' }],
    details: {
      tagline: 'A knowledge vault links itself — the agent reads 200+ notes, works out what relates to what, and writes the wiki-links and tags back in.',
      overview: [
        'The pipeline is modelled explicitly as a 7-node LangGraph agent rather than one long prompt, so each stage — reading the vault, embedding notes, finding related material, proposing links, proposing tags, validating, and writing back — is inspectable and independently debuggable. Pydantic models type the data crossing every node boundary, which is what makes Groq and Gemini interchangeable as backends: the graph only depends on the contract, not the provider.',
        'Cost and latency drove the design. LLM calls fan out concurrently via asyncio.gather instead of running note by note, and every note is fingerprinted with an MD5 hash so unchanged content is skipped entirely — a re-run over a vault with no edits issues zero LLM calls, which is what makes it practical to run repeatedly rather than once.',
      ],
      access: [
        { icon: '💻', label: 'github.com/wizardofvoid', href: 'https://github.com/wizardofvoid' },
      ],
    },
  },
  {
    num: '04', repo: 'student-performance-predictor', name: 'Student Performance Predictor', period: 'Jul 2025',
    desc: 'A classification system over quiz, midterm, and assignment data that predicts student pass/fail outcomes at 94.5% accuracy using a RandomForestClassifier — with Meta’s LLaMA wired in behind it to convert raw model output into a personalised, natural-language feedback report for each student.',
    tech: ['Python', 'Scikit-learn', 'RandomForest', 'LLaMA', 'Pandas'],
    metrics: [{ k: '94.5%', v: 'accuracy' }, { k: '3', v: 'assessment signals' }],
    details: {
      tagline: 'A pass/fail prediction is useless to a student on its own — this turns it into feedback they can act on.',
      overview: [
        'A RandomForestClassifier trained on quiz, midterm, and assignment performance predicts whether a student is on track to pass, reaching 94.5% accuracy on the evaluation set.',
        'The second half is what makes it usable: Meta’s LLaMA takes the model’s output and rewrites it as a personalised, plain-language report per student — turning a bare classification into specific, readable guidance.',
      ],
      access: [
        { icon: '💻', label: 'github.com/wizardofvoid', href: 'https://github.com/wizardofvoid' },
      ],
    },
  },
];

export const experience = [
  {
    period: 'MAY 2026 – JUN 2026', role: 'AI Intern', company: 'La Net Team Software Solutions',
    points: [
      'Architected a RAG-based chatbot from scratch with LangChain and LangGraph, owning the retrieval pipeline end to end — Gemini API embeddings → Pinecone vector search → Ollama local LLM inference.',
      'Designed the document ingestion and query pipeline over a repository of 50+ internal company documents, enabling accurate Q&A across proprietary knowledge bases with no external data exposure.',
    ],
  },
  {
    period: 'MAY 2025 – JUL 2025', role: 'AI/ML Intern', company: 'SentiAid',
    points: [
      'Cleaned and pre-processed a 4,292-video speech/text dataset (AI4Bharat) for an Indian Sign Language translator, using Python, key-point detection, and pose-based animation.',
      'Applied Pandas, Scikit-learn, and Regex to strip noise and align glosses with ASR output, improving training data quality.',
    ],
  },
];

export const education = [
  { school: 'Vellore Institute of Technology', degree: 'B.Tech in Computer Science (Core)', period: '2023 – PRESENT', score: 'CGPA 8.88' },
  { school: 'Bhagwan Mahavir International School', degree: 'Senior Secondary — Class XII', period: '2023', score: '83.6%' },
  { school: 'L.P. Savani School', degree: 'Secondary — Class X', period: '2021', score: '88.86%' },
];

export const awards = [
  { icon: '[✓]', title: 'Oracle Certified Foundations Associate, Java', sub: '1Z0-811 · Oracle University · 2026' },
  { icon: '[★]', title: 'DSA & Problem Solving', sub: 'Core focus — targeting SDE roles' },
  { icon: '[»]', title: '2× Engineering Internships', sub: 'La Net Team · SentiAid' },
  { icon: '[+]', title: 'CGPA 8.88 / 10', sub: 'B.Tech CSE, VIT Vellore' },
  { icon: '[~]', title: 'Self-directed Learning', sub: 'Communication, teamwork, time management' },
];

// email opens a Gmail compose window pre-addressed to you
export const contactEmail = 'sarafa736@gmail.com';

export const contacts = [
  { type: 'gmail', label: 'Email', color: '#EA4335', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}` },
  { type: 'linkedin', label: 'LinkedIn', color: '#0A66C2', href: 'https://www.linkedin.com/in/saraf--ayush/' },
  { type: 'github', label: 'GitHub', color: '#e8ecf4', href: 'https://github.com/wizardofvoid' },
  { type: 'codolio', label: 'Coding Profile', color: '#8b5cf6', href: codolioProfileUrl },
];

export const aboutParas = [
  {
    align: 'flex-start', textAlign: 'left',
    parts: [
      { t: "I'm a final-year ", key: false },
      { t: 'Computer Science student at VIT Vellore', key: true },
      { t: ', and most of what I know I picked up by ', key: false },
      { t: 'building software end to end', key: true },
      { t: '. I write my application code in ', key: false },
      { t: 'Python and Java', key: true },
      { t: ', back it with ', key: false },
      { t: 'SQL databases', key: true },
      { t: ', and keep sharpening the fundamentals underneath — ', key: false },
      { t: 'data structures, algorithms, OOP, and operating systems', key: true },
      { t: '.', key: false },
    ],
  },
  {
    align: 'center', textAlign: 'left',
    parts: [
      { t: "I'm targeting ", key: false },
      { t: 'SDE roles', key: true },
      { t: ", and the work I'm proudest of is the engineering rather than the demo — ", key: false },
      { t: 'cutting indexing time ~10× with parallel workers and incremental caching', key: true },
      { t: ', writing a ', key: false },
      { t: 'deterministic scoring engine', key: true },
      { t: ' instead of handing the judgement to a model, and ', key: false },
      { t: 'eliminating redundant API calls with hash-based change detection', key: true },
      { t: '. Along the way I got ', key: false },
      { t: 'Oracle certified in Java', key: true },
      { t: '.', key: false },
    ],
  },
  {
    align: 'flex-end', textAlign: 'right',
    parts: [
      { t: 'A lot of my recent work happens to involve ', key: false },
      { t: 'AI — RAG pipelines, LangGraph agents, NLP systems', key: true },
      { t: ' — but I build those as ', key: false },
      { t: 'application backends', key: true },
      { t: ', with the same concerns as any other system: ', key: false },
      { t: 'correctness, latency, cost, and clean interfaces', key: true },
      { t: '. The environments I do my best work in are ones where people are ', key: false },
      { t: 'curious, direct, and actually ship', key: true },
      { t: '.', key: false },
    ],
  },
];

/* ─── Archive (/work) ───────────────────────────────────────────────────────
   `works.generated.json` is a mechanical snapshot of the public GitHub repos
   (`npm run fetch:works`). It only knows name, language, dates and links —
   none of these repos carry GitHub topics and most have no description — so
   everything editorial lives here and is merged over the top. Re-running the
   fetch script never touches this map.

   Per-slug keys: name, desc, tech, cat, liveUrl, featured, hidden.           */
export const worksOverrides = {
  // ── the four on the homepage ─────────────────────────────────────────────
  // `featured` is derived from `projects[].repo` below, so it isn't repeated
  // here — but setting `featured: true` in this map still works if you want to
  // promote something that has no homepage entry.
  'multiPDF-chatbot': {
    name: 'RAG Document Q&A Platform',
    desc: 'Streamlit + Python app over four AI APIs; parallel embedding and incremental caching cut indexing ~10×.',
    tech: ['Python', 'LangChain', 'FAISS', 'Streamlit', 'Gemini API', 'Groq'],
    cat: 'AI/ML',
  },
  resume_feedback: {
    name: 'Resume Feedback System',
    desc: 'Explainable ATS scoring — a deterministic TF-IDF/cosine engine, with Gemini only for the narrative.',
    tech: ['Python', 'Streamlit', 'SQLite', 'NLTK', 'TF-IDF', 'Gemini API'],
    cat: 'AI/ML',
  },
  'obsidian-linker': {
    name: 'Obsidian Linker',
    desc: '7-node LangGraph agent that auto-links a 200+ note vault; MD5 change detection means zero redundant LLM calls.',
    tech: ['Python', 'LangGraph', 'FAISS', 'Pydantic', 'asyncio', 'Groq'],
    cat: 'AI/ML',
  },
  'student-performance-predictor': {
    name: 'Student Performance Predictor',
    desc: 'RandomForest pass/fail prediction at 94.5% accuracy, with LLaMA turning output into per-student feedback.',
    tech: ['Python', 'Scikit-learn', 'RandomForest', 'LLaMA', 'Pandas'],
    cat: 'AI/ML',
  },

  // ── everything else ──────────────────────────────────────────────────────
  'obsidian-pdf-chatbot': {
    name: 'Obsidian PDF Chatbot',
    desc: 'RAG chatbot over a personal vault — Gemini embeddings into Pinecone, answered by a local Ollama model.',
    tech: ['Python', 'LangChain', 'Pinecone', 'Ollama', 'Streamlit'],
    cat: 'AI/ML',
  },
  heart_disease: {
    name: 'Heart Disease Classifier',
    desc: 'Notebook classifier over clinical features — preprocessing, model comparison, and the usual metrics pass.',
    tech: ['Python', 'Scikit-learn', 'Pandas', 'Jupyter'],
    cat: 'AI/ML',
  },
  'website-vulnerability-scanner': {
    name: 'Website Vulnerability Scanner',
    desc: 'Python scanner that probes a target site for common web weaknesses and reports what it finds.',
    tech: ['Python', 'Requests', 'Security'],
    cat: 'Tools',
  },
  'bone-scaffold': {
    name: 'Bone Scaffold',
    desc: 'Project scaffolding CLI — lays down a working skeleton so a new build starts from something runnable.',
    tech: ['Python', 'CLI'],
    cat: 'Tools',
  },
  Portfolio: {
    name: 'Personal Portfolio',
    desc: 'This site — Next.js App Router, a three.js intro, and a coding-stats section fetched server-side.',
    tech: ['Next.js', 'React', 'three.js', 'Tailwind CSS', 'JavaScript'],
    cat: 'Full-stack',
  },
  'portfolio-anusha': {
    name: 'Portfolio — Anusha',
    desc: 'A portfolio site built for someone else, in Next.js and TypeScript.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    cat: 'Full-stack',
  },
  'E-learning-Platform': {
    name: 'E-Learning Platform',
    desc: 'Course browsing and lesson pages, put together with vanilla JS on a Node backend.',
    tech: ['JavaScript', 'Node.js', 'HTML', 'CSS'],
    cat: 'Full-stack',
  },
  ListXchange: {
    name: 'ListXchange',
    desc: 'Early web build — a listings exchange, written before any framework was involved.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    cat: 'Full-stack',
  },
  'Code-a-thon': {
    name: 'Code-a-thon — Team ReCodex',
    desc: 'Hackathon entry built with the ReCodex team.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    cat: 'Coursework',
  },
  'CSS-Portfolio': { tech: ['HTML', 'CSS'], cat: 'Coursework' },
  DrumKit: { name: 'Drum Kit', desc: 'Keyboard-driven drum machine — a DOM and audio-events exercise.', tech: ['JavaScript', 'HTML', 'CSS'], cat: 'Coursework' },
  DiceGame: { name: 'Dice Game', desc: 'Two-player dice roll — early DOM manipulation practice.', tech: ['JavaScript', 'HTML', 'CSS'], cat: 'Coursework' },
  'FeetToMeters-app': { name: 'Feet → Meters', tech: ['Python', 'Tkinter'], cat: 'Coursework' },

  // Notes, not code — keep it out of the archive.
  'obsidian-vault': { hidden: true },
};

/* Generated snapshot + editorial overrides -> what /work actually renders.
   Newest first. */
export const allWorks = (() => {
  const featuredSlugs = new Set(projects.map((p) => p.repo).filter(Boolean));
  return generatedWorks
    .map((w) => ({ ...w, ...(worksOverrides[w.slug] ?? {}) }))
    .filter((w) => !w.hidden)
    .map((w) => ({ ...w, featured: w.featured ?? featuredSlugs.has(w.slug) }))
    .sort((a, b) => (b.year - a.year) || (b.month - a.month) || a.name.localeCompare(b.name));
})();

/* Two projects are linked when they share any tech; weight = how many.
   Used by the /work graph for its edges AND by the page header for its count,
   so the two can never disagree. */
export function workLinks(works = allWorks) {
  const links = [];
  for (let i = 0; i < works.length; i++) {
    for (let j = i + 1; j < works.length; j++) {
      const shared = works[i].tech.filter((t) => works[j].tech.includes(t));
      if (shared.length) links.push({ source: i, target: j, weight: shared.length, shared });
    }
  }
  return links;
}

export const workCategories = [...new Set(allWorks.map((w) => w.cat))];
export const workYearRange = (() => {
  const years = allWorks.map((w) => w.year);
  return { from: Math.min(...years), to: Math.max(...years) };
})();
