import axios from 'axios';
import https from 'https';
import { fetchPage, cleanText, slugify, delay, getRandomUA } from './base';

// Reusable HTTPS agent for direct axios calls in this file
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface ScrapedJob {
  title: string;
  organization: string;
  location: string;
  salary: string;
  category: string;
  type: 'government' | 'private';
  vacancies: string;
  description: string;
  eligibility: string;
  applicationProcess: string;
  importantDates: { notificationDate: string; lastDate: string; examDate: string };
  qualificationRequired: string;
  ageLimit: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  slug: string;
}

export async function scrapeFreeJobAlert(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const $ = await fetchPage('https://www.freejobalert.com/latest-notifications/');
    const rows = $('table.lattbl tbody tr, table tbody tr').toArray();

    for (const row of rows.slice(0, 30)) {
      try {
        const cells = $(row).find('td');
        if (cells.length < 4) continue;

        const postName = cleanText($(cells[0]).text());
        const qualification = cleanText($(cells[1]).text());
        const lastDate = cleanText($(cells[2]).text());
        const link = $(cells[0]).find('a').attr('href') || $(row).find('a').first().attr('href');

        if (!postName || postName.length < 5) continue;

        const detailUrl = link && link.startsWith('http') ? link : link ? `https://www.freejobalert.com${link}` : '';

        jobs.push({
          title: postName,
          organization: postName.split(' ').slice(0, 3).join(' '),
          location: 'India',
          salary: '',
          category: qualification.includes('10th') ? '10th Pass' : qualification.includes('12th') ? '12th Pass' : qualification.includes('Degree') || qualification.includes('Graduate') ? 'Graduate' : 'General',
          type: 'government',
          vacancies: '',
          description: `${postName}. Qualification: ${qualification}`,
          eligibility: qualification,
          applicationProcess: detailUrl ? `Apply online at ${detailUrl}` : 'Visit official website',
          importantDates: { notificationDate: '', lastDate, examDate: '' },
          qualificationRequired: qualification,
          ageLimit: '',
          applyLink: detailUrl,
          sourceUrl: detailUrl || 'https://www.freejobalert.com',
          source: 'freejobalert',
          slug: slugify(postName + '-fja'),
        });
      } catch { continue; }
    }

    // Also scrape links from sidebar/main listing
    if (jobs.length === 0) {
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = cleanText($(el).text());
        if (text.includes('Recruitment') && text.length > 15 && text.length < 200 && href.includes('freejobalert.com')) {
          jobs.push({
            title: text,
            organization: text.split(' Recruitment')[0] || text.split(' ').slice(0, 3).join(' '),
            location: 'India',
            salary: '',
            category: 'General',
            type: 'government',
            vacancies: '',
            description: text,
            eligibility: '',
            applicationProcess: `Apply at ${href}`,
            importantDates: { notificationDate: '', lastDate: '', examDate: '' },
            qualificationRequired: '',
            ageLimit: '',
            applyLink: href,
            sourceUrl: href,
            source: 'freejobalert',
            slug: slugify(text + '-fja'),
          });
        }
      });
    }
  } catch (error) {
    console.error('FreeJobAlert scraper error:', error);
  }
  return jobs.slice(0, 40);
}

// Optimized: only scrape listing page (no detail pages) to stay within Vercel timeout
export async function scrapeIndGovtJobs(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const $ = await fetchPage('https://www.indgovtjobs.in');
    
    $('h2 a, h3 a, .post-title a').each((_, el) => {
      const href = $(el).attr('href');
      const text = cleanText($(el).text());
      if (href && text.length > 10 && (text.includes('Recruitment') || text.includes('Vacancy') || text.includes('Jobs') || text.includes('Apply'))) {
        jobs.push({
          title: text,
          organization: text.split(' Recruitment')[0] || text.split(' ').slice(0, 4).join(' '),
          location: 'India',
          salary: '',
          category: 'General',
          type: 'government',
          vacancies: '',
          description: text,
          eligibility: '',
          applicationProcess: `Apply at ${href}`,
          importantDates: { notificationDate: '', lastDate: '', examDate: '' },
          qualificationRequired: '',
          ageLimit: '',
          applyLink: href,
          sourceUrl: href,
          source: 'indgovtjobs',
          slug: slugify(text + '-igj'),
        });
      }
    });
  } catch (error) {
    console.error('IndGovtJobs scraper error:', error);
  }
  return jobs.slice(0, 30);
}

export async function scrapeMySarkariNaukri(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const $ = await fetchPage('https://www.mysarkarinaukri.com/find/all-jobs');
    
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = cleanText($(el).text());
      if (text.includes('Recruitment') && text.length > 20 && text.length < 250 && href.includes('mysarkarinaukri.com')) {
        const postMatch = text.match(/for (\d+)/);
        jobs.push({
          title: text,
          organization: text.split(' Recruitment')[0] || '',
          location: 'India',
          salary: '',
          category: 'General',
          type: 'government',
          vacancies: postMatch ? postMatch[1] + ' Posts' : '',
          description: text,
          eligibility: '',
          applicationProcess: `Apply at ${href}`,
          importantDates: { notificationDate: '', lastDate: '', examDate: '' },
          qualificationRequired: '',
          ageLimit: '',
          applyLink: href,
          sourceUrl: href,
          source: 'mysarkarinaukri',
          slug: slugify(text + '-msn'),
        });
      }
    });
  } catch (error) {
    console.error('MySarkariNaukri scraper error:', error);
  }
  return jobs.slice(0, 40);
}

export async function scrapeFreshersworld(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const urls = [
    { url: 'https://www.freshersworld.com/jobs/freshers', cat: 'Freshers' },
    { url: 'https://www.freshersworld.com/jobs/it-jobs', cat: 'IT' },
    { url: 'https://www.freshersworld.com/jobs/engineering-jobs', cat: 'Engineering' },
  ];
  for (const { url, cat } of urls) {
    try {
      await delay(700);
      const $ = await fetchPage(url);
      $('a[href*="/job/"]').each((_, el) => {
        const text = cleanText($(el).text());
        const href = $(el).attr('href') || '';
        if (text.length < 8 || text.length > 150) return;
        const container = $(el).closest('div, li, article');
        const company = cleanText(container.find('span, small, .company').first().text());
        const location = cleanText(container.find('[class*="location"]').first().text());
        const salary = cleanText(container.find('[class*="salary"], [class*="ctc"]').first().text());
        const fullUrl = href.startsWith('http') ? href : `https://www.freshersworld.com${href}`;
        jobs.push({
          title: text,
          organization: company || 'Various Companies',
          location: location || 'India',
          salary: salary || 'As per industry standards',
          category: cat,
          type: 'private',
          vacancies: '',
          description: `${text} — ${cat} role for freshers. Company: ${company || 'Various'}`,
          eligibility: 'Freshers / 0-2 years',
          applicationProcess: `Apply at ${fullUrl}`,
          importantDates: { notificationDate: '', lastDate: '', examDate: '' },
          qualificationRequired: cat === 'Engineering' ? 'B.E/B.Tech' : 'Graduate',
          ageLimit: '',
          applyLink: fullUrl,
          sourceUrl: fullUrl,
          source: 'freshersworld',
          slug: slugify(text + '-' + (company || '').substring(0, 15) + '-fw'),
        });
      });
    } catch (err) {
      console.error(`Freshersworld error for ${cat}:`, err);
    }
  }
  const seen = new Set<string>();
  return jobs.filter(j => { if (seen.has(j.slug)) return false; seen.add(j.slug); return true; }).slice(0, 60);
}

export async function scrapeTimesJobs(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const searchTerms = ['software+developer', 'data+analyst', 'marketing+executive', 'business+analyst'];
  for (const term of searchTerms) {
    try {
      await delay(800);
      const $ = await fetchPage(`https://www.timesjobs.com/candidate/job-search.html?searchType=personalizedSearch&from=submit&txtKeywords=${term}&txtLocation=India`);
      const cat = term.replace('+', ' ').replace(/\b\w/g, l => l.toUpperCase());
      $('li.clearfix[data-job-id], .job-bx, ul.new-joblist li').each((_, el) => {
        const titleEl = $(el).find('h2 a, h3 a, .job-title a').first();
        const title = cleanText(titleEl.text());
        const href = titleEl.attr('href') || '';
        if (!title || title.length < 5) return;
        const company = cleanText($(el).find('.joblist-comp-name, h3.joblist-comp-name').first().text());
        const location = cleanText($(el).find('[class*="location"] span, li.srp-zindex').first().text());
        const experience = cleanText($(el).find('.srp-exp, [class*="exp"] span').first().text());
        const salary = cleanText($(el).find('.srp-salary, [class*="salary"]').first().text());
        const applyLink = href.startsWith('http') ? href : href ? `https://www.timesjobs.com${href}` : `https://www.timesjobs.com`;
        jobs.push({
          title,
          organization: company || 'Various Companies',
          location: location || 'India',
          salary: salary || 'Competitive',
          category: cat,
          type: 'private',
          vacancies: '',
          description: `${title} at ${company || 'a reputed company'}. ${experience ? 'Experience: ' + experience : ''}`,
          eligibility: experience || 'As per requirements',
          applicationProcess: `Apply at ${applyLink}`,
          importantDates: { notificationDate: '', lastDate: '', examDate: '' },
          qualificationRequired: 'Graduate / B.Tech',
          ageLimit: '',
          applyLink,
          sourceUrl: applyLink,
          source: 'timesjobs',
          slug: slugify(title + '-' + (company || '').substring(0, 15) + '-tj'),
        });
      });
    } catch (err) {
      console.error(`TimesJobs error:`, err);
    }
  }
  const seen = new Set<string>();
  return jobs.filter(j => { if (seen.has(j.slug)) return false; seen.add(j.slug); return true; }).slice(0, 40);
}

/**
 * Fetch live remote/private jobs from RemoteOK API (free, no key needed).
 * Replaces the old hardcoded getCuratedPrivateJobs().
 */
export async function fetchRemoteOKJobs(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data } = await axios.get('https://remoteok.com/api', {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'application/json',
      },
      timeout: 8000,
      httpsAgent,
    });

    const listings = Array.isArray(data) ? data.slice(1) : []; // first element is metadata
    for (const item of listings.slice(0, 50)) {
      if (!item.position || !item.company) continue;

      const tags = Array.isArray(item.tags) ? item.tags : [];
      const salaryStr = item.salary_min && item.salary_max
        ? `$${Number(item.salary_min).toLocaleString()}-$${Number(item.salary_max).toLocaleString()}/yr`
        : 'Competitive';
      const postedDate = item.date ? new Date(item.date).toLocaleDateString('en-IN') : '';

      jobs.push({
        title: item.position,
        organization: item.company,
        location: item.location || 'Remote / WFH',
        salary: salaryStr,
        category: tags.slice(0, 2).join(', ') || 'IT/Remote',
        type: 'private',
        vacancies: '',
        description: item.description
          ? cleanText(item.description.replace(/<[^>]*>/g, '')).substring(0, 300)
          : `${item.position} at ${item.company}`,
        eligibility: tags.join(', ') || 'As per requirements',
        applicationProcess: `Apply at ${item.url || 'https://remoteok.com'}`,
        importantDates: {
          notificationDate: postedDate,
          lastDate: 'Rolling',
          examDate: '',
        },
        qualificationRequired: tags.join(', ') || 'Relevant experience',
        ageLimit: '',
        applyLink: item.url || 'https://remoteok.com',
        sourceUrl: item.url || 'https://remoteok.com',
        source: 'remoteok',
        slug: slugify(item.position + '-' + item.company + '-rok'),
      });
    }
  } catch (error) {
    console.error('RemoteOK API error:', error);
  }
  return jobs;
}

/**
 * Fetch live jobs from Jobicy API (free, no key needed, remote-friendly).
 */
export async function fetchJobicyJobs(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const { data } = await axios.get('https://jobicy.com/api/v2/remote-jobs?count=50', {
      headers: { 'User-Agent': getRandomUA() },
      timeout: 8000,
      httpsAgent,
    });

    const listings = data?.jobs || [];
    for (const item of listings) {
      if (!item.jobTitle || !item.companyName) continue;

      jobs.push({
        title: item.jobTitle,
        organization: item.companyName,
        location: item.jobGeo || 'Remote',
        salary: item.annualSalaryMin && item.annualSalaryMax
          ? `$${item.annualSalaryMin}-$${item.annualSalaryMax}/yr`
          : 'Competitive',
        category: item.jobIndustry?.[0] || 'IT/Remote',
        type: 'private',
        vacancies: '',
        description: item.jobExcerpt || item.jobTitle,
        eligibility: item.jobLevel || 'As per requirements',
        applicationProcess: `Apply at ${item.url}`,
        importantDates: {
          notificationDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('en-IN') : '',
          lastDate: 'Rolling',
          examDate: '',
        },
        qualificationRequired: item.jobLevel || 'Relevant experience',
        ageLimit: '',
        applyLink: item.url || 'https://jobicy.com',
        sourceUrl: item.url || 'https://jobicy.com',
        source: 'jobicy',
        slug: slugify(item.jobTitle + '-' + item.companyName + '-jby'),
      });
    }
  } catch (error) {
    console.error('Jobicy API error:', error);
  }
  return jobs;
}

/**
 * Fetch India-specific private jobs from JSearch API (RapidAPI).
 * Aggregates from LinkedIn, Indeed, Glassdoor, and other major job boards.
 * Free tier: 500 requests/month — we rotate queries to maximize variety.
 */
export async function fetchJSearchJobs(): Promise<ScrapedJob[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn('RAPIDAPI_KEY not set, skipping JSearch');
    return [];
  }

  const jobs: ScrapedJob[] = [];

  // Rotate query based on hour-of-day so each refresh fetches different roles
  const queries = [
    'software developer India',
    'data analyst India',
    'web developer India',
    'frontend developer India',
    'backend developer India',
    'full stack developer India',
    'python developer India',
    'java developer India',
    'devops engineer India',
    'cloud engineer India',
    'machine learning India',
    'business analyst India',
    'product manager India',
    'UI UX designer India',
    'marketing manager India',
    'finance analyst India',
    'cyber security India',
    'mobile developer India',
    'react developer India',
    'node js developer India',
    'fresher engineer India',
    'graduate trainee India',
    'management trainee India',
    'digital marketing India',
  ];
  const queryIndex = new Date().getHours() % queries.length;
  const query = queries[queryIndex];

  try {
    const { data } = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query,
        page: '1',
        num_pages: '1',
        country: 'in',
        date_posted: 'week',
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      timeout: 10000,
      httpsAgent,
    });

    const listings = data?.data || [];
    for (const item of listings) {
      if (!item.job_title || !item.employer_name) continue;

      const salaryMin = item.job_min_salary;
      const salaryMax = item.job_max_salary;
      const salaryCurrency = item.job_salary_currency || '₹';
      const salaryPeriod = item.job_salary_period || 'YEAR';
      let salaryStr = '';
      if (salaryMin && salaryMax) {
        const periodLabel = salaryPeriod === 'YEAR' ? '/yr' : salaryPeriod === 'MONTH' ? '/mo' : '';
        salaryStr = `${salaryCurrency}${Number(salaryMin).toLocaleString('en-IN')}-${Number(salaryMax).toLocaleString('en-IN')}${periodLabel}`;
      } else if (salaryMin) {
        salaryStr = `${salaryCurrency}${Number(salaryMin).toLocaleString('en-IN')}+`;
      }

      const city = item.job_city || '';
      const state = item.job_state || '';
      const location = [city, state, item.job_country || 'India'].filter(Boolean).join(', ');

      const postedDate = item.job_posted_at_datetime_utc
        ? new Date(item.job_posted_at_datetime_utc).toLocaleDateString('en-IN')
        : '';

      const qualifications = (item.job_required_education?.degree || '');
      const experience = item.job_required_experience?.required_experience_in_months
        ? `${Math.round(item.job_required_experience.required_experience_in_months / 12)} years`
        : item.job_experience_in_place_of_education ? 'Experience accepted' : '';

      const publisher = item.job_publisher || 'JSearch';

      jobs.push({
        title: item.job_title,
        organization: item.employer_name,
        location,
        salary: salaryStr || 'Competitive',
        category: item.job_employment_type === 'INTERN' ? 'Internship' : 'IT',
        type: 'private',
        vacancies: '',
        description: item.job_description
          ? cleanText(item.job_description.replace(/<[^>]*>/g, '')).substring(0, 300)
          : `${item.job_title} at ${item.employer_name}`,
        eligibility: [qualifications, experience].filter(Boolean).join(', ') || 'As per requirements',
        applicationProcess: `Apply at ${item.job_apply_link || item.job_google_link || ''}`,
        importantDates: {
          notificationDate: postedDate,
          lastDate: item.job_offer_expiration_datetime_utc
            ? new Date(item.job_offer_expiration_datetime_utc).toLocaleDateString('en-IN')
            : 'Rolling',
          examDate: '',
        },
        qualificationRequired: qualifications || 'Graduate',
        ageLimit: '',
        applyLink: item.job_apply_link || item.job_google_link || '',
        sourceUrl: item.job_apply_link || item.job_google_link || '',
        source: `jsearch-${publisher.toLowerCase().replace(/\s+/g, '')}`,
        slug: slugify(item.job_title + '-' + item.employer_name + '-js'),
      });
    }

    console.log(`✅ JSearch: fetched ${jobs.length} jobs for "${query}"`);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('JSearch API error:', errMsg);
  }
  return jobs;
}

/**
 * Scrape Indian private jobs from Naukri.com listing pages.
 * Fallback for when RapidAPI/JSearch is not working.
 */
export async function scrapeNaukriIndia(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const searches = [
    { url: 'https://www.naukri.com/software-developer-jobs', cat: 'Software Developer' },
    { url: 'https://www.naukri.com/data-analyst-jobs', cat: 'Data Analyst' },
    { url: 'https://www.naukri.com/web-developer-jobs', cat: 'Web Developer' },
    { url: 'https://www.naukri.com/fresher-jobs', cat: 'Freshers' },
  ];

  for (const { url, cat } of searches) {
    try {
      await delay(600);
      const $ = await fetchPage(url);

      // Naukri job cards
      $('article.jobTuple, .cust-job-tuple, .srp-jobtuple-wrapper, [data-job-id]').each((_, el) => {
        const titleEl = $(el).find('a.title, .title a, h2 a, .row1 a').first();
        const title = cleanText(titleEl.text());
        const href = titleEl.attr('href') || '';
        if (!title || title.length < 5) return;

        const company = cleanText($(el).find('.comp-name, .subTitle a, .companyInfo a').first().text());
        const exp = cleanText($(el).find('.exp, .expwdth, [class*="experience"]').first().text());
        const salary = cleanText($(el).find('.sal, .ni-job-tuple-icon-srp-rupee, [class*="salary"]').first().text());
        const location = cleanText($(el).find('.loc, .locWdth, [class*="location"]').first().text());

        const fullUrl = href.startsWith('http') ? href : `https://www.naukri.com${href}`;

        jobs.push({
          title,
          organization: company || 'Various Companies',
          location: location || 'India',
          salary: salary || 'Competitive',
          category: cat,
          type: 'private',
          vacancies: '',
          description: `${title} at ${company || 'a reputed company'}. ${exp ? 'Exp: ' + exp : ''}`,
          eligibility: exp || 'As per requirements',
          applicationProcess: `Apply at ${fullUrl}`,
          importantDates: { notificationDate: '', lastDate: 'Rolling', examDate: '' },
          qualificationRequired: 'Graduate / B.Tech',
          ageLimit: '',
          applyLink: fullUrl,
          sourceUrl: fullUrl,
          source: 'naukri_india',
          slug: slugify(title + '-' + (company || '').substring(0, 15) + '-nkr'),
        });
      });

      // Fallback: scrape any job links on page
      if (jobs.length === 0) {
        $('a[href*="naukri.com/job-listings"]').each((_, el) => {
          const text = cleanText($(el).text());
          const href = $(el).attr('href') || '';
          if (text.length > 10 && text.length < 150) {
            jobs.push({
              title: text,
              organization: '',
              location: 'India',
              salary: 'Competitive',
              category: cat,
              type: 'private',
              vacancies: '',
              description: text,
              eligibility: 'As per requirements',
              applicationProcess: `Apply at ${href}`,
              importantDates: { notificationDate: '', lastDate: 'Rolling', examDate: '' },
              qualificationRequired: 'Graduate',
              ageLimit: '',
              applyLink: href,
              sourceUrl: href,
              source: 'naukri_india',
              slug: slugify(text + '-nkr'),
            });
          }
        });
      }
    } catch (err) {
      console.error(`Naukri India error for ${cat}:`, err);
    }
  }

  const seen = new Set<string>();
  return jobs.filter(j => { if (seen.has(j.slug)) return false; seen.add(j.slug); return true; }).slice(0, 50);
}

/**
 * Scrape Indian private jobs from Shine.com listing pages.
 */
export async function scrapeShineIndia(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const searches = [
    { url: 'https://www.shine.com/job-search/software-developer-jobs', cat: 'Software Developer' },
    { url: 'https://www.shine.com/job-search/data-analyst-jobs', cat: 'Data Analyst' },
    { url: 'https://www.shine.com/job-search/fresher-jobs', cat: 'Freshers' },
  ];

  for (const { url, cat } of searches) {
    try {
      await delay(600);
      const $ = await fetchPage(url);

      $('a[href*="/job/"]').each((_, el) => {
        const text = cleanText($(el).text());
        const href = $(el).attr('href') || '';
        if (text.length < 8 || text.length > 150) return;

        const container = $(el).closest('div, li, article');
        const company = cleanText(container.find('[class*="company"], .compName').first().text());
        const location = cleanText(container.find('[class*="loc"]').first().text());
        const experience = cleanText(container.find('[class*="exp"]').first().text());

        const fullUrl = href.startsWith('http') ? href : `https://www.shine.com${href}`;

        jobs.push({
          title: text,
          organization: company || 'Various Companies',
          location: location || 'India',
          salary: 'Competitive',
          category: cat,
          type: 'private',
          vacancies: '',
          description: `${text} at ${company || 'a reputed company'}. ${experience ? 'Exp: ' + experience : ''}`,
          eligibility: experience || 'As per requirements',
          applicationProcess: `Apply at ${fullUrl}`,
          importantDates: { notificationDate: '', lastDate: 'Rolling', examDate: '' },
          qualificationRequired: 'Graduate / B.Tech',
          ageLimit: '',
          applyLink: fullUrl,
          sourceUrl: fullUrl,
          source: 'shine_india',
          slug: slugify(text + '-' + (company || '').substring(0, 15) + '-shn'),
        });
      });
    } catch (err) {
      console.error(`Shine India error for ${cat}:`, err);
    }
  }

  const seen = new Set<string>();
  return jobs.filter(j => { if (seen.has(j.slug)) return false; seen.add(j.slug); return true; }).slice(0, 40);
}
