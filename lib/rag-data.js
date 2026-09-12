import {
  aboutParas,
  skillGroups,
  projects,
  experience,
  education,
  awards,
  contacts,
  marqueeItems,
  typeWords
} from './data.js';

/**
 * Normalises text by removing extra spaces and combining text parts.
 */
function extractText(parts) {
  if (typeof parts === 'string') return parts;
  if (Array.isArray(parts)) {
    return parts.map(p => (typeof p === 'string' ? p : p.t)).join('');
  }
  return '';
}

/**
 * Builds an array of text chunks for embedding from the portfolio data.
 * Each chunk includes its source text and some metadata to help the LLM.
 */
export function getPortfolioChunks() {
  const chunks = [];

  // 1. About section
  const aboutText = aboutParas.map(p => extractText(p.parts)).join(' ');
  chunks.push({
    id: 'about',
    category: 'bio',
    text: `About Ayush: ${aboutText}`,
    metadata: { section: 'About' }
  });

  // 2. Skills
  skillGroups.forEach(group => {
    chunks.push({
      id: `skills-${group.tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      category: 'skills',
      text: `Skills in ${group.tag}: ${group.desc} Focus: ${group.focus}. Tools/Languages: ${group.items.join(', ')}.`,
      metadata: { section: 'Skills', group: group.tag }
    });
  });

  // 3. Projects
  projects.forEach(project => {
    const details = project.details || {};
    const overview = (details.overview || []).join(' ');
    chunks.push({
      id: `project-${project.repo || project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      category: 'project',
      text: `Project: ${project.name} (${project.period}). ${project.desc} Tagline: ${details.tagline || ''}. Details: ${overview} Technologies used: ${project.tech.join(', ')}. Metrics: ${(project.metrics || []).map(m => m.k + ' ' + m.v).join(', ')}.`,
      metadata: { section: 'Projects', project: project.name, url: details.access?.[0]?.href }
    });
  });

  // 4. Experience
  experience.forEach((exp, idx) => {
    chunks.push({
      id: `experience-${idx}`,
      category: 'experience',
      text: `Experience: ${exp.role} at ${exp.company} (${exp.period}). Responsibilities/Achievements: ${exp.points.join(' ')}`,
      metadata: { section: 'Experience', company: exp.company, role: exp.role }
    });
  });

  // 5. Education
  education.forEach((edu, idx) => {
    chunks.push({
      id: `education-${idx}`,
      category: 'education',
      text: `Education: ${edu.degree} at ${edu.school} (${edu.period}). Score: ${edu.score}.`,
      metadata: { section: 'Education', school: edu.school }
    });
  });

  // 6. Awards & Certifications
  const awardsText = awards.map(a => a.title + ' (' + a.sub + ')').join(', ');
  chunks.push({
    id: 'awards',
    category: 'awards',
    text: `Awards and Certifications: ${awardsText}`,
    metadata: { section: 'Awards' }
  });

  // 7. Contact info
  const contactText = contacts.map(c => c.label + ': ' + c.href).join(', ');
  chunks.push({
    id: 'contact',
    category: 'contact',
    text: `Contact Information: ${contactText}`,
    metadata: { section: 'Contact' }
  });

  // 8. Headlines / Marquee / Roles
  chunks.push({
    id: 'headlines',
    category: 'bio',
    text: `Professional headlines and focus areas: ${marqueeItems.join('. ')}. Desired roles: ${typeWords.join(', ')}.`,
    metadata: { section: 'Headlines' }
  });

  return chunks;
}
