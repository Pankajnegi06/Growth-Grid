import { fetchPage, cleanText, slugify } from './base';

export interface ScrapedScheme {
  title: string;
  ministry: string;
  description: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  category: string;
  targetGroup: string;
  sourceUrl: string;
  source: string;
  slug: string;
}

export async function scrapeMyScheme(): Promise<ScrapedScheme[]> {
  const schemes: ScrapedScheme[] = [];
  try {
    const $ = await fetchPage('https://myscheme.gov.in');

    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = cleanText($(el).text());
      if (text.length > 10 && text.length < 200 && (href.includes('/scheme/') || href.includes('myscheme.gov.in'))) {
        const fullUrl = href.startsWith('http') ? href : `https://myscheme.gov.in${href}`;
        schemes.push({
          title: text,
          ministry: '',
          description: text,
          eligibility: '',
          benefits: '',
          applicationProcess: `Apply at ${fullUrl}`,
          category: 'General',
          targetGroup: 'Students & Job Seekers',
          sourceUrl: fullUrl,
          source: 'myscheme',
          slug: slugify(text + '-ms'),
        });
      }
    });

    // Add well-known Indian government schemes for students
    const knownSchemes = [
      { title: 'PM Vidyalaxmi Scheme', ministry: 'Ministry of Education', description: 'Financial support for higher education through interest-free loans for meritorious students', eligibility: 'Students admitted to QS top-ranked institutions in India', benefits: 'Interest-free education loans up to Rs 10 lakh', category: 'Education', targetGroup: 'Students' },
      { title: 'Central Sector Scheme of Scholarships (CSSS)', ministry: 'Ministry of Education', description: 'Scholarship for college and university students based on 12th board exam merit', eligibility: 'Above 80th percentile in 12th board exam, family income below Rs 8 lakh', benefits: 'Rs 10,000-20,000 per annum', category: 'Education', targetGroup: 'Students' },
      { title: 'PM-YASASVI Scholarship', ministry: 'Ministry of Social Justice', description: 'Scholarship for OBC, EBC, DNT students', eligibility: 'OBC/EBC/DNT students, family income below Rs 2.5 lakh', benefits: 'Rs 75,000-1,25,000 per annum', category: 'Education', targetGroup: 'Students' },
      { title: 'National Apprenticeship Promotion Scheme (NAPS)', ministry: 'Ministry of Skill Development', description: 'Promotes apprenticeship training in India by sharing stipend cost', eligibility: 'ITI/Diploma/Graduate candidates', benefits: 'Stipend support up to Rs 1500/month from GoI', category: 'Employment', targetGroup: 'Job Seekers' },
      { title: 'Startup India Seed Fund Scheme', ministry: 'DPIIT', description: 'Financial assistance for early-stage startups for proof of concept, prototype, product trials', eligibility: 'DPIIT recognized startups less than 2 years old', benefits: 'Up to Rs 50 lakh grant, Rs 20 lakh for validation', category: 'Entrepreneurship', targetGroup: 'Entrepreneurs' },
      { title: 'PM Mudra Yojana', ministry: 'Ministry of Finance', description: 'Micro-finance loans for non-corporate, non-farm small business activities', eligibility: 'Any Indian citizen with a business plan', benefits: 'Loans from Rs 50,000 to Rs 10 lakh', category: 'Employment', targetGroup: 'Job Seekers' },
      { title: 'Skill India Digital Hub', ministry: 'Ministry of Skill Development', description: 'Free online skill development courses and certifications', eligibility: 'Any Indian citizen', benefits: 'Free skill courses, digital certificates, job matching', category: 'Skills', targetGroup: 'Students & Job Seekers' },
      { title: 'National Career Service Portal', ministry: 'Ministry of Labour', description: 'One-stop solution for employment and career services', eligibility: 'Any Indian citizen', benefits: 'Free job matching, career counseling, skill development', category: 'Employment', targetGroup: 'Job Seekers' },
      { title: 'Post Matric Scholarship for SC Students', ministry: 'Ministry of Social Justice', description: 'Scholarship for SC students pursuing post-matric education', eligibility: 'SC students, family income below Rs 2.5 lakh', benefits: 'Full tuition fee, maintenance allowance', category: 'Education', targetGroup: 'Students' },
      { title: 'Pragati Scholarship for Girls', ministry: 'AICTE', description: 'Scholarship for girl students in technical education', eligibility: 'Girl students in AICTE approved institutions', benefits: 'Rs 50,000 per annum', category: 'Education', targetGroup: 'Students' },
    ];

    for (const s of knownSchemes) {
      schemes.push({
        ...s,
        applicationProcess: 'Visit myscheme.gov.in or respective ministry portal',
        sourceUrl: 'https://myscheme.gov.in',
        source: 'myscheme',
        slug: slugify(s.title + '-gov'),
      });
    }
  } catch (error) {
    console.error('MyScheme scraper error:', error);
  }
  return schemes;
}
