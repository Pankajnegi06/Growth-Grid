import { slugify } from './base';

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

// Curated real open-source programs with accurate info
export async function scrapeOpenSource(): Promise<ScrapedOpenSource[]> {
  const programs: ScrapedOpenSource[] = [
    // GSoC Projects
    { title: 'Google Summer of Code 2026', organization: 'Google', program: 'GSoC', techStack: ['Python', 'JavaScript', 'C++', 'Java', 'Go', 'Rust'], description: 'Work on open source projects with mentoring organizations worldwide. 12-week coding program for contributors new to open source.', stipend: '$1500-$6600 (based on location)', timeline: 'May - August 2026', mentors: 'Organization mentors', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://summerofcode.withgoogle.com', slug: '' },
    { title: 'GSoC - TensorFlow', organization: 'TensorFlow', program: 'GSoC', techStack: ['Python', 'C++', 'TensorFlow'], description: 'Contribute to TensorFlow ecosystem — models, tools, documentation, and ML infrastructure', stipend: '$1500-$6600', timeline: 'May - August 2026', mentors: 'TensorFlow team', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.tensorflow.org', slug: '' },
    { title: 'GSoC - Mozilla', organization: 'Mozilla', program: 'GSoC', techStack: ['Rust', 'JavaScript', 'Python', 'C++'], description: 'Work on Firefox, MDN Web Docs, Servo, and other Mozilla projects', stipend: '$1500-$6600', timeline: 'May - August 2026', mentors: 'Mozilla engineers', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.mozilla.org', slug: '' },
    { title: 'GSoC - Kubernetes', organization: 'CNCF', program: 'GSoC', techStack: ['Go', 'Kubernetes', 'Docker'], description: 'Contribute to cloud-native projects under CNCF — Kubernetes, Prometheus, Envoy', stipend: '$1500-$6600', timeline: 'May - August 2026', mentors: 'CNCF mentors', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.cncf.io', slug: '' },
    { title: 'GSoC - Apache Foundation', organization: 'Apache', program: 'GSoC', techStack: ['Java', 'Python', 'Scala'], description: 'Work on Apache Kafka, Spark, Airflow, and 300+ open source projects', stipend: '$1500-$6600', timeline: 'May - August 2026', mentors: 'Apache committers', applyLink: 'https://summerofcode.withgoogle.com', sourceUrl: 'https://www.apache.org', slug: '' },
    // LFX Mentorship
    { title: 'LFX Mentorship - Linux Foundation', organization: 'Linux Foundation', program: 'LFX', techStack: ['Go', 'C', 'Rust', 'Kubernetes'], description: 'Mentorship program by Linux Foundation. Work on CNCF, Hyperledger, and Linux projects.', stipend: '$3000-$6600', timeline: 'Rolling terms (Spring/Summer/Fall)', mentors: 'LF project maintainers', applyLink: 'https://mentorship.lfx.linuxfoundation.org', sourceUrl: 'https://mentorship.lfx.linuxfoundation.org', slug: '' },
    { title: 'LFX - Kubernetes SIG Projects', organization: 'CNCF', program: 'LFX', techStack: ['Go', 'Kubernetes'], description: 'Work on Kubernetes Special Interest Group projects — networking, storage, CLI tools', stipend: '$3000-$6600', timeline: 'Rolling terms', mentors: 'K8s SIG leads', applyLink: 'https://mentorship.lfx.linuxfoundation.org', sourceUrl: 'https://mentorship.lfx.linuxfoundation.org', slug: '' },
    // Outreachy
    { title: 'Outreachy Internship', organization: 'Outreachy', program: 'Outreachy', techStack: ['Python', 'JavaScript', 'Rust', 'Various'], description: 'Paid remote internships in FOSS for people subject to systemic bias. Projects in Mozilla, GNOME, Wikimedia, etc.', stipend: '$7000', timeline: 'May-Aug or Dec-Mar cycles', mentors: 'Project mentors', applyLink: 'https://www.outreachy.org', sourceUrl: 'https://www.outreachy.org', slug: '' },
    // Other programs
    { title: 'MLH Fellowship', organization: 'Major League Hacking', program: 'Other', techStack: ['JavaScript', 'Python', 'React', 'Node.js'], description: '12-week internship alternative for aspiring software engineers. Work on open source or startup projects.', stipend: '$5000', timeline: 'Spring/Summer/Fall batches', mentors: 'MLH mentors + sponsors', applyLink: 'https://fellowship.mlh.io', sourceUrl: 'https://fellowship.mlh.io', slug: '' },
    { title: 'GirlScript Summer of Code', organization: 'GirlScript Foundation', program: 'Other', techStack: ['JavaScript', 'Python', 'Java', 'Various'], description: 'India\'s largest open-source program for beginners. 3-month contribution period with leaderboard and prizes.', stipend: 'Certificates + prizes', timeline: 'March - May 2026', mentors: 'Project admins', applyLink: 'https://gssoc.girlscript.tech', sourceUrl: 'https://gssoc.girlscript.tech', slug: '' },
    { title: 'Social Summer of Code (SSOC)', organization: 'Social Foundation', program: 'Other', techStack: ['JavaScript', 'Python', 'React', 'Various'], description: 'Open-source contribution program for students in India. Contribute and earn certificates, swag, and recognition.', stipend: 'Certificates + swag', timeline: 'April - July 2026', mentors: 'Project mentors', applyLink: 'https://ssoc.devfolio.co', sourceUrl: 'https://ssoc.devfolio.co', slug: '' },
    { title: 'Hacktoberfest', organization: 'DigitalOcean', program: 'Other', techStack: ['Any'], description: 'Month-long celebration of open source. Make 4 PRs to any public repo and earn a digital badge and tree plantation.', stipend: 'Digital badge + tree planted', timeline: 'October 2026', mentors: 'Open source maintainers', applyLink: 'https://hacktoberfest.com', sourceUrl: 'https://hacktoberfest.com', slug: '' },
  ];

  return programs.map(p => ({
    ...p,
    slug: slugify(p.title + '-os'),
  }));
}
