import { fetchPage, cleanText, slugify, delay } from './base';

export interface ScrapedInternship {
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  type: 'in-office' | 'remote' | 'hybrid';
  skills: string[];
  category: string;
  description: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  slug: string;
}

export async function scrapeInternshala(): Promise<ScrapedInternship[]> {
  const internships: ScrapedInternship[] = [];
  const categories = [
    { url: 'https://internshala.com/internships', cat: 'General' },
    { url: 'https://internshala.com/internships/computer-science-internship', cat: 'Computer Science' },
    { url: 'https://internshala.com/internships/engineering-internship', cat: 'Engineering' },
    { url: 'https://internshala.com/internships/marketing-internship', cat: 'Marketing' },
  ];

  for (const { url, cat } of categories) {
    try {
      await delay(800);
      const $ = await fetchPage(url);

      // Parse internship cards
      $('.individual_internship, .internship_meta, [class*="internship"]').each((_, el) => {
        const titleEl = $(el).find('h3 a, .heading_4_5 a, a[href*="/internship/detail/"]').first();
        const title = cleanText(titleEl.text());
        const href = titleEl.attr('href');
        if (!title || title.length < 5) return;

        const company = cleanText($(el).find('.company_name, h4, .heading_6').first().text());
        const location = cleanText($(el).find('.location_link, [class*="location"]').first().text()) || 'India';
        const stipend = cleanText($(el).find('.stipend, [class*="stipend"]').first().text());
        const duration = cleanText($(el).find('.duration, [class*="duration"]').first().text());

        const applyLink = href ? (href.startsWith('http') ? href : `https://internshala.com${href}`) : url;
        const locLower = location.toLowerCase();
        const iType = locLower.includes('remote') || locLower.includes('work from home') ? 'remote' : 'in-office';

        internships.push({
          title,
          company: company || 'Various',
          location: location || 'India',
          stipend: stipend || 'Unpaid',
          duration: duration || 'Not specified',
          type: iType,
          skills: [],
          category: cat,
          description: `${title} at ${company || 'Various Companies'}. ${stipend ? 'Stipend: ' + stipend : ''} ${duration ? 'Duration: ' + duration : ''}`,
          applyLink,
          sourceUrl: applyLink,
          source: 'internshala',
          slug: slugify(title + '-' + (company || '').substring(0, 20) + '-is'),
        });
      });

      // Fallback: parse links
      if (internships.length === 0) {
        $('a[href*="/internship/detail/"]').each((_, el) => {
          const text = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (text.length > 5 && text.length < 150) {
            const fullUrl = href.startsWith('http') ? href : `https://internshala.com${href}`;
            const company = cleanText($(el).closest('div').find('h4, .company_name, .heading_6').first().text());
            internships.push({
              title: text,
              company: company || 'Various',
              location: 'India',
              stipend: '',
              duration: '',
              type: 'in-office',
              skills: [],
              category: cat,
              description: text,
              applyLink: fullUrl,
              sourceUrl: fullUrl,
              source: 'internshala',
              slug: slugify(text + '-is'),
            });
          }
        });
      }
    } catch (error) {
      console.error(`Internshala scraper error for ${cat}:`, error);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return internships.filter(i => {
    if (seen.has(i.slug)) return false;
    seen.add(i.slug);
    return true;
  }).slice(0, 60);
}
