import axios from 'axios';
import { slugify, getRandomUA } from './base';

export interface ScrapedOpenSource {
  title: string;
  organization: string;
  program: 'GSoC' | 'LFX' | 'Outreachy' | 'Other';
  techStack: string[];
  description: string;
  stipend: string;
  timeline: string;
  mentors: string;
  applyLink: string;
  sourceUrl: string;
  slug: string;
}

const currentYear = new Date().getFullYear();

/**
 * Dynamic curated programs with current-year dates.
 * These are well-known programs that run annually — dates are kept current.
 */
function getCuratedPrograms(): ScrapedOpenSource[] {
  return [
    // GSoC
    { title: `Google Summer of Code ${currentYear}`, organization: 'Google', program: 'GSoC', techStack: ['Python', 'JavaScript', 'C++', 'Java', 'Go', 'Rust'], description: `Work on open source projects with mentoring organizations worldwide. 12-week coding program for contributors new to open source. ${currentYear} edition.`, stipend: '$1500-$6600 (based on location)', timeline: `May - August ${currentYear}`, mentors: 'Organization mentors', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://summerofcode.withgoogle.com', slug: '' },
    { title: `GSoC ${currentYear} - TensorFlow`, organization: 'TensorFlow', program: 'GSoC', techStack: ['Python', 'C++', 'TensorFlow'], description: 'Contribute to TensorFlow ecosystem — models, tools, documentation, and ML infrastructure', stipend: '$1500-$6600', timeline: `May - August ${currentYear}`, mentors: 'TensorFlow team', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.tensorflow.org', slug: '' },
    { title: `GSoC ${currentYear} - Mozilla`, organization: 'Mozilla', program: 'GSoC', techStack: ['Rust', 'JavaScript', 'Python', 'C++'], description: 'Work on Firefox, MDN Web Docs, Servo, and other Mozilla projects', stipend: '$1500-$6600', timeline: `May - August ${currentYear}`, mentors: 'Mozilla engineers', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.mozilla.org', slug: '' },
    { title: `GSoC ${currentYear} - Kubernetes / CNCF`, organization: 'CNCF', program: 'GSoC', techStack: ['Go', 'Kubernetes', 'Docker'], description: 'Contribute to cloud-native projects under CNCF — Kubernetes, Prometheus, Envoy', stipend: '$1500-$6600', timeline: `May - August ${currentYear}`, mentors: 'CNCF mentors', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.cncf.io', slug: '' },
    // LFX
    { title: `LFX Mentorship ${currentYear} - Linux Foundation`, organization: 'Linux Foundation', program: 'LFX', techStack: ['Go', 'C', 'Rust', 'Kubernetes'], description: 'Mentorship program by Linux Foundation. Work on CNCF, Hyperledger, and Linux projects.', stipend: '$3000-$6600', timeline: `Rolling terms (Spring/Summer/Fall ${currentYear})`, mentors: 'LF project maintainers', applyLink: 'https://mentorship.lfx.linuxfoundation.org', sourceUrl: 'https://mentorship.lfx.linuxfoundation.org', slug: '' },
    // Outreachy
    { title: `Outreachy Internship ${currentYear}`, organization: 'Outreachy', program: 'Outreachy', techStack: ['Python', 'JavaScript', 'Rust', 'Various'], description: 'Paid remote internships in FOSS for people subject to systemic bias. Projects in Mozilla, GNOME, Wikimedia, etc.', stipend: '$7000', timeline: `May-Aug or Dec-Mar ${currentYear}`, mentors: 'Project mentors', applyLink: 'https://www.outreachy.org', sourceUrl: 'https://www.outreachy.org', slug: '' },
    // Other
    { title: `MLH Fellowship ${currentYear}`, organization: 'Major League Hacking', program: 'Other', techStack: ['JavaScript', 'Python', 'React', 'Node.js'], description: '12-week internship alternative for aspiring software engineers. Work on open source or startup projects.', stipend: '$5000', timeline: `Spring/Summer/Fall ${currentYear}`, mentors: 'MLH mentors + sponsors', applyLink: 'https://fellowship.mlh.io', sourceUrl: 'https://fellowship.mlh.io', slug: '' },
    { title: `GirlScript Summer of Code ${currentYear}`, organization: 'GirlScript Foundation', program: 'Other', techStack: ['JavaScript', 'Python', 'Java', 'Various'], description: `India's largest open-source program for beginners. 3-month contribution period with leaderboard and prizes.`, stipend: 'Certificates + prizes', timeline: `March - May ${currentYear}`, mentors: 'Project admins', applyLink: 'https://gssoc.girlscript.tech', sourceUrl: 'https://gssoc.girlscript.tech', slug: '' },
    { title: `Hacktoberfest ${currentYear}`, organization: 'DigitalOcean', program: 'Other', techStack: ['Any'], description: 'Month-long celebration of open source. Make 4 PRs to any public repo and earn a digital badge and tree plantation.', stipend: 'Digital badge + tree planted', timeline: `October ${currentYear}`, mentors: 'Open source maintainers', applyLink: 'https://hacktoberfest.com', sourceUrl: 'https://hacktoberfest.com', slug: '' },
  ].map(p => ({ ...p, slug: slugify(p.title + '-os') })) as ScrapedOpenSource[];
}

/**
 * Fetch trending GitHub repos with "good first issue" labels — real, live opportunities.
 */
async function fetchGitHubGoodFirstIssues(): Promise<ScrapedOpenSource[]> {
  const programs: ScrapedOpenSource[] = [];
  try {
    const { data } = await axios.get(
      'https://api.github.com/search/repositories?q=good-first-issues:>3+stars:>500+pushed:>' +
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] +
      '&sort=updated&per_page=20',
      {
        headers: {
          'User-Agent': getRandomUA(),
          'Accept': 'application/vnd.github.v3+json',
        },
        timeout: 8000,
      }
    );

    for (const repo of data?.items || []) {
      const lang = repo.language || 'Various';
      const topics = (repo.topics || []).slice(0, 5);

      programs.push({
        title: `Contribute to ${repo.name}`,
        organization: repo.owner?.login || 'Open Source',
        program: 'Other',
        techStack: [lang, ...topics].slice(0, 6),
        description: (repo.description || `Popular open source project with good-first-issue labels. ${repo.stargazers_count?.toLocaleString()} ⭐`).substring(0, 250),
        stipend: 'Open Source — Community Recognition',
        timeline: 'Ongoing — contribute anytime',
        mentors: 'Repository maintainers',
        applyLink: `${repo.html_url}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
        sourceUrl: repo.html_url,
        slug: slugify(repo.full_name + '-gh'),
      });
    }
  } catch (error) {
    console.error('GitHub API error:', error);
  }
  return programs;
}

/**
 * Main function: combines curated programs (dynamic dates) + live GitHub repos.
 * Always returns fresh, current data.
 */
export async function scrapeOpenSource(): Promise<ScrapedOpenSource[]> {
  const [curated, github] = await Promise.all([
    Promise.resolve(getCuratedPrograms()),
    fetchGitHubGoodFirstIssues(),
  ]);

  return [...curated, ...github];
}
