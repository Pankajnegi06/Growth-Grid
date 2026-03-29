import { fetchPage, cleanText, slugify } from './base';

export interface ScrapedHackathon {
  title: string;
  organizer: string;
  themes: string[];
  mode: 'online' | 'offline' | 'hybrid';
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  participants: string;
  prizes: string;
  description: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  slug: string;
}

export async function scrapeDevfolio(): Promise<ScrapedHackathon[]> {
  const hackathons: ScrapedHackathon[] = [];
  try {
    const $ = await fetchPage('https://devfolio.co/hackathons');

    $('a[href*=".devfolio.co"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const container = $(el).closest('div');
      const title = cleanText($(el).find('h3, h2').first().text() || $(el).text());
      
      if (!title || title.length < 3 || title.length > 150) return;
      if (title.toLowerCase().includes('past') || title.toLowerCase().includes('devfolio')) return;

      // Extract theme badges
      const themes: string[] = [];
      container.find('span, [class*="tag"], [class*="badge"]').each((_, t) => {
        const theme = cleanText($(t).text());
        if (['AI/ML', 'Blockchain', 'Web3', 'HealthTech', 'IoT/Hardware', 'FinTech', 'EdTech', 'No Restrictions'].some(k => theme.includes(k))) {
          themes.push(theme);
        }
      });

      // Mode detection
      const fullText = cleanText(container.text()).toLowerCase();
      let mode: 'online' | 'offline' | 'hybrid' = 'offline';
      if (fullText.includes('online')) mode = 'online';
      if (fullText.includes('hybrid')) mode = 'hybrid';

      // Extract dates
      const dateMatch = fullText.match(/starts?\s*(\d{2}\/\d{2}\/\d{2})/);
      const startDate = dateMatch ? dateMatch[1] : '';

      // Extract participants
      const partMatch = fullText.match(/\+?(\d+)\s*participating/);
      const participants = partMatch ? partMatch[1] + '+' : '';

      const applyLink = href.startsWith('http') ? href : `https://${href}`;

      hackathons.push({
        title,
        organizer: 'Devfolio Community',
        themes: themes.length > 0 ? themes : ['No Restrictions'],
        mode,
        startDate,
        endDate: '',
        registrationDeadline: startDate,
        participants,
        prizes: '',
        description: `${title} — ${themes.join(', ') || 'Open theme'} hackathon. ${mode} mode.${participants ? ' ' + participants + ' participants.' : ''}`,
        applyLink,
        sourceUrl: applyLink,
        source: 'devfolio',
        slug: slugify(title + '-df'),
      });
    });
  } catch (error) {
    console.error('Devfolio scraper error:', error);
  }

  // Deduplicate
  const seen = new Set<string>();
  return hackathons.filter(h => {
    if (seen.has(h.slug)) return false;
    seen.add(h.slug);
    return true;
  }).slice(0, 30);
}
