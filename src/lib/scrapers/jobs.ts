import { fetchPage, cleanText, slugify, delay } from './base';

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

export async function scrapeIndGovtJobs(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const $ = await fetchPage('https://www.indgovtjobs.in');
    
    const articleLinks: { url: string; title: string }[] = [];
    $('h2 a, h3 a, .post-title a').each((_, el) => {
      const href = $(el).attr('href');
      const text = cleanText($(el).text());
      if (href && text.length > 10 && (text.includes('Recruitment') || text.includes('Vacancy') || text.includes('Jobs') || text.includes('Apply'))) {
        articleLinks.push({ url: href, title: text });
      }
    });

    for (const link of articleLinks.slice(0, 20)) {
      try {
        await delay(500);
        const detail$ = await fetchPage(link.url);
        
        let eligibility = '';
        let importantDates = { notificationDate: '', lastDate: '', examDate: '' };
        let vacancies = '';
        
        detail$('h2, h3').each((_, el) => {
          const heading = cleanText(detail$(el).text()).toLowerCase();
          const nextContent = cleanText(detail$(el).nextAll('table, p, div, ul').first().text());
          
          if (heading.includes('eligibility') || heading.includes('qualification')) {
            eligibility = nextContent.substring(0, 500);
          }
          if (heading.includes('important dates') || heading.includes('dates')) {
            const dateText = nextContent;
            if (dateText.includes('Last')) importantDates.lastDate = dateText.substring(0, 200);
            else importantDates.notificationDate = dateText.substring(0, 200);
          }
          if (heading.includes('vacancy') || heading.includes('list')) {
            vacancies = nextContent.substring(0, 200);
          }
        });

        const applyLink = detail$('a').filter((_, el) => {
          const t = cleanText(detail$(el).text()).toLowerCase();
          return t.includes('apply online') || t.includes('click here');
        }).first().attr('href') || link.url;

        jobs.push({
          title: link.title,
          organization: link.title.split(' Recruitment')[0] || link.title.split(' ').slice(0, 4).join(' '),
          location: 'India',
          salary: '',
          category: 'General',
          type: 'government',
          vacancies,
          description: link.title,
          eligibility,
          applicationProcess: `Apply at ${applyLink}`,
          importantDates,
          qualificationRequired: eligibility.substring(0, 200),
          ageLimit: '',
          applyLink,
          sourceUrl: link.url,
          source: 'indgovtjobs',
          slug: slugify(link.title + '-igj'),
        });
      } catch { continue; }
    }
  } catch (error) {
    console.error('IndGovtJobs scraper error:', error);
  }
  return jobs;
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

// Curated private jobs from 7 portals: Naukri, LinkedIn, Indeed, Upwork, Shine, Monster, Glassdoor
export function getCuratedPrivateJobs(): ScrapedJob[] {
  type L = { title: string; org: string; loc: string; sal: string; cat: string; link: string; qual: string; source: string };
  const listings: L[] = [
    // Naukri
    { title: 'Software Developer (Fresher)', org: 'TCS', loc: 'Bangalore, Mumbai, Hyderabad', sal: '₹3.5-7 LPA', cat: 'IT', link: 'https://www.naukri.com/tcs-jobs', qual: 'B.Tech/B.E. CS/IT', source: 'naukri' },
    { title: 'Associate Software Engineer', org: 'Infosys', loc: 'Multiple Locations', sal: '₹3.6-6 LPA', cat: 'IT', link: 'https://www.naukri.com/infosys-jobs', qual: 'B.Tech/B.E./MCA', source: 'naukri' },
    { title: 'Data Scientist', org: 'Mu Sigma', loc: 'Bangalore', sal: '₹6-12 LPA', cat: 'Data Analytics', link: 'https://www.naukri.com/mu-sigma-jobs', qual: 'B.Tech/M.Tech with Python/R', source: 'naukri' },
    { title: 'Finance Manager', org: 'HDFC Bank', loc: 'Mumbai, Delhi, Bangalore', sal: '₹8-16 LPA', cat: 'Finance', link: 'https://www.naukri.com/hdfc-bank-jobs', qual: 'MBA Finance/CA 3+ years', source: 'naukri' },
    { title: 'Digital Marketing Manager', org: 'Myntra', loc: 'Bangalore', sal: '₹10-18 LPA', cat: 'Marketing', link: 'https://www.naukri.com/myntra-jobs', qual: 'MBA Marketing 4+ years', source: 'naukri' },
    { title: 'React.js Developer', org: 'Persistent Systems', loc: 'Pune, Nagpur', sal: '₹5-12 LPA', cat: 'IT', link: 'https://www.naukri.com/persistent-systems-jobs', qual: 'B.Tech CS with React, Node.js', source: 'naukri' },
    { title: 'Python Backend Developer', org: 'Ola Electric', loc: 'Bangalore', sal: '₹12-22 LPA', cat: 'IT', link: 'https://www.naukri.com/ola-jobs', qual: 'B.Tech CS with Python, Django/FastAPI', source: 'naukri' },
    { title: 'SAP FICO Consultant', org: 'Tech Mahindra', loc: 'Pune, Hyderabad', sal: '₹10-20 LPA', cat: 'IT/ERP', link: 'https://www.naukri.com/tech-mahindra-jobs', qual: 'SAP FICO certified, 3+ years', source: 'naukri' },
    { title: 'Network Engineer', org: 'Jio (Reliance)', loc: 'Mumbai, Delhi, Chennai', sal: '₹4-9 LPA', cat: 'Telecom', link: 'https://www.naukri.com/reliance-jio-jobs', qual: 'B.Tech ECE/CS with CCNA', source: 'naukri' },
    { title: 'Operations Executive', org: 'Delhivery', loc: 'Delhi, Mumbai, Hyderabad', sal: '₹3-5 LPA', cat: 'Logistics', link: 'https://www.naukri.com/delhivery-jobs', qual: 'Any Graduate, logistics knowledge', source: 'naukri' },
    // LinkedIn
    { title: 'Business Development Manager', org: 'Zomato', loc: 'Delhi, Mumbai, Bangalore', sal: '₹8-15 LPA', cat: 'Sales', link: 'https://www.linkedin.com/jobs/search/?company=Zomato', qual: 'MBA/Graduate with B2B sales', source: 'linkedin' },
    { title: 'Senior Backend Engineer', org: 'Razorpay', loc: 'Bangalore (Hybrid)', sal: '₹20-38 LPA', cat: 'IT', link: 'https://www.linkedin.com/jobs/search/?company=Razorpay', qual: 'B.Tech CS 4+ years, Java/Go/Python', source: 'linkedin' },
    { title: 'Product Manager — Consumer', org: 'Swiggy', loc: 'Bangalore', sal: '₹25-50 LPA', cat: 'Product', link: 'https://www.linkedin.com/jobs/search/?company=Swiggy', qual: 'MBA/B.Tech 4+ years consumer PM', source: 'linkedin' },
    { title: 'Data Engineer', org: 'PhonePe', loc: 'Bangalore', sal: '₹15-28 LPA', cat: 'Data Engineering', link: 'https://www.linkedin.com/jobs/search/?company=PhonePe', qual: 'B.Tech CS with Spark, Kafka, Airflow', source: 'linkedin' },
    { title: 'Cloud Solutions Architect', org: 'Microsoft India', loc: 'Hyderabad, Bangalore', sal: '₹25-50 LPA', cat: 'IT', link: 'https://www.linkedin.com/jobs/search/?company=Microsoft', qual: 'B.Tech/M.Tech with Azure 5+ years', source: 'linkedin' },
    { title: 'UI/UX Lead Designer', org: 'CRED', loc: 'Bangalore', sal: '₹18-30 LPA', cat: 'Design', link: 'https://www.linkedin.com/jobs/search/?company=CRED', qual: 'B.Des/B.Tech 5+ years UX, Figma', source: 'linkedin' },
    { title: 'Machine Learning Engineer', org: 'Flipkart', loc: 'Bangalore', sal: '₹18-35 LPA', cat: 'AI/ML', link: 'https://www.linkedin.com/jobs/search/?company=Flipkart', qual: 'M.Tech/B.Tech CS with ML/Python', source: 'linkedin' },
    { title: 'Site Reliability Engineer', org: 'Google India', loc: 'Hyderabad, Bangalore', sal: '₹25-55 LPA', cat: 'IT/SRE', link: 'https://www.linkedin.com/jobs/search/?company=Google', qual: 'B.Tech CS with Linux, Kubernetes', source: 'linkedin' },
    // Indeed India
    { title: 'Customer Support Executive', org: 'Teleperformance', loc: 'Hyderabad, Pune, Noida', sal: '₹2.5-4.5 LPA', cat: 'Customer Support', link: 'https://in.indeed.com/cmp/Teleperformance', qual: 'Graduate, good communication', source: 'indeed' },
    { title: 'Accountant / Jr. Accountant', org: 'Tata Motors', loc: 'Pune, Mumbai', sal: '₹3-6 LPA', cat: 'Finance', link: 'https://in.indeed.com/cmp/Tata-Motors', qual: 'B.Com/M.Com with Tally', source: 'indeed' },
    { title: 'QA Automation Engineer', org: 'Capgemini', loc: 'Mumbai, Pune, Bangalore', sal: '₹4-9 LPA', cat: 'IT', link: 'https://in.indeed.com/cmp/Capgemini', qual: 'B.Tech with Selenium/manual testing', source: 'indeed' },
    { title: 'Java Developer (3-5 yrs)', org: 'Mphasis', loc: 'Bangalore, Pune', sal: '₹8-16 LPA', cat: 'IT', link: 'https://in.indeed.com/cmp/Mphasis', qual: 'B.Tech CS with Spring Boot, Microservices', source: 'indeed' },
    { title: 'Graphic Designer', org: 'Ogilvy India', loc: 'Mumbai, Delhi', sal: '₹3.5-7 LPA', cat: 'Design', link: 'https://in.indeed.com/jobs?q=graphic+designer&l=Mumbai', qual: 'B.Des/BFA with Adobe CC', source: 'indeed' },
    { title: 'Civil Engineer — Site', org: 'L&T Construction', loc: 'Pan India', sal: '₹4-9 LPA', cat: 'Engineering', link: 'https://in.indeed.com/cmp/Larsen-and-Toubro', qual: 'B.E. Civil 2+ years site experience', source: 'indeed' },
    // Upwork (freelance)
    { title: 'Freelance Web Developer (React/Next.js)', org: 'Remote Clients', loc: 'Remote / WFH', sal: '$20-60/hr (₹65k-2L/month)', cat: 'IT/Freelance', link: 'https://www.upwork.com/freelance-jobs/web-development/', qual: 'React/Next.js portfolio required', source: 'upwork' },
    { title: 'Freelance Content Writer (Tech Niche)', org: 'US/UK Clients', loc: 'Remote / WFH', sal: '$10-30/hr (₹33k-1L/month)', cat: 'Content/Freelance', link: 'https://www.upwork.com/freelance-jobs/writing/', qual: 'Strong English, SEO knowledge', source: 'upwork' },
    { title: 'Freelance Data Analyst (Python/SQL)', org: 'Global Clients', loc: 'Remote / WFH', sal: '$15-40/hr (₹50k-1.3L/month)', cat: 'Data/Freelance', link: 'https://www.upwork.com/freelance-jobs/data-science/', qual: 'Python, SQL, Power BI/Tableau', source: 'upwork' },
    { title: 'Freelance Graphic Designer (Branding)', org: 'Startups & Agencies', loc: 'Remote / WFH', sal: '$15-50/hr (₹50k-1.7L/month)', cat: 'Design/Freelance', link: 'https://www.upwork.com/freelance-jobs/design/', qual: 'Adobe Illustrator, Photoshop, strong portfolio', source: 'upwork' },
    { title: 'Freelance Android / Flutter Developer', org: 'International Startups', loc: 'Remote / WFH', sal: '$25-75/hr (₹83k-2.5L/month)', cat: 'Mobile/Freelance', link: 'https://www.upwork.com/freelance-jobs/mobile-development/', qual: 'Flutter/Kotlin, published app portfolio', source: 'upwork' },
    { title: 'Freelance SEO & Digital Marketing', org: 'E-commerce Clients', loc: 'Remote / WFH', sal: '$10-25/hr (₹33k-83k/month)', cat: 'Marketing/Freelance', link: 'https://www.upwork.com/freelance-jobs/seo/', qual: 'SEO tools (Ahrefs, SEMrush), Google Ads', source: 'upwork' },
    { title: 'Freelance AI/ML Engineer', org: 'Global Tech Firms', loc: 'Remote / WFH', sal: '$40-100/hr (₹1.3L-3.3L/month)', cat: 'AI/ML Freelance', link: 'https://www.upwork.com/freelance-jobs/machine-learning/', qual: 'TensorFlow/PyTorch, deployed ML models', source: 'upwork' },
    // Shine.com
    { title: 'Sales Executive (BFSI)', org: 'HDFC Life Insurance', loc: 'Pan India', sal: '₹2.5-5 LPA + incentives', cat: 'Sales/Insurance', link: 'https://www.shine.com/job-search/insurance-jobs', qual: 'Graduate, good communication, 0-2 years', source: 'shine' },
    { title: 'BPO / Call Center Executive', org: 'Concentrix', loc: 'Hyderabad, Bangalore, Pune', sal: '₹2.4-4.2 LPA', cat: 'BPO', link: 'https://www.shine.com/job-search/bpo-jobs', qual: 'Graduate/12th pass, spoken English', source: 'shine' },
    { title: 'Mechanical Engineer (Manufacturing)', org: 'Hero MotoCorp', loc: 'Dharuhera, Gurgaon', sal: '₹4-8 LPA', cat: 'Engineering', link: 'https://www.shine.com/job-search/mechanical-engineer-jobs', qual: 'B.E. Mechanical with manufacturing', source: 'shine' },
    { title: 'Back Office Executive (Banking)', org: 'Axis Bank', loc: 'Delhi, Mumbai, Chennai', sal: '₹2.5-4 LPA', cat: 'Banking', link: 'https://www.shine.com/job-search/back-office-jobs-in-banks', qual: 'Graduate, data entry, MS Office', source: 'shine' },
    { title: 'Technical Support Engineer (L2)', org: 'Microland', loc: 'Bangalore, Hyderabad', sal: '₹4-8 LPA', cat: 'IT Support', link: 'https://www.shine.com/job-search/technical-support-engineer-jobs', qual: 'B.Tech/BCA with networking, ITIL knowledge', source: 'shine' },
    // Monster India
    { title: 'Embedded Systems Engineer', org: 'Qualcomm India', loc: 'Hyderabad, Bangalore', sal: '₹12-25 LPA', cat: 'Hardware/IT', link: 'https://india.monsterindia.com/srp/results.m?q=embedded+systems', qual: 'B.Tech/M.Tech ECE with C/C++, RTOS', source: 'monster' },
    { title: 'Cybersecurity Analyst', org: 'IBM India', loc: 'Bangalore, Pune, Delhi', sal: '₹8-18 LPA', cat: 'Security/IT', link: 'https://india.monsterindia.com/srp/results.m?q=cybersecurity', qual: 'B.Tech CS with CEH/CISSP, 2+ years', source: 'monster' },
    { title: 'Supply Chain Analyst', org: 'Marico', loc: 'Mumbai', sal: '₹6-11 LPA', cat: 'Supply Chain', link: 'https://india.monsterindia.com/srp/results.m?q=supply+chain+analyst', qual: 'MBA Operations/Supply Chain, 2+ years', source: 'monster' },
    { title: 'Power BI / Tableau Developer', org: 'Genpact', loc: 'Hyderabad, Gurugram', sal: '₹6-13 LPA', cat: 'Data Analytics', link: 'https://india.monsterindia.com/srp/results.m?q=power+bi', qual: 'B.Tech/BCA with Power BI, DAX, SQL', source: 'monster' },
    { title: 'Pharmaceutical Sales Officer', org: 'Sun Pharma', loc: 'Pan India', sal: '₹3-6 LPA + TA', cat: 'Pharma/Sales', link: 'https://india.monsterindia.com/srp/results.m?q=pharma+sales', qual: 'B.Pharm/B.Sc 1+ years field sales', source: 'monster' },
    { title: 'Cloud & DevOps Engineer', org: 'HCL Technologies', loc: 'Noida, Chennai, Pune', sal: '₹6-14 LPA', cat: 'IT', link: 'https://india.monsterindia.com/company/hcl-technologies', qual: 'B.Tech CS/IT with AWS/Azure/DevOps', source: 'monster' },
    // Glassdoor
    { title: 'Investment Banking Analyst', org: 'Goldman Sachs India', loc: 'Bangalore, Mumbai', sal: '₹15-30 LPA', cat: 'Finance', link: 'https://www.glassdoor.co.in/Jobs/Goldman-Sachs-Jobs-EI_IE2482.0,12_IN115.htm', qual: 'MBA Finance / CA from top inst', source: 'glassdoor' },
    { title: 'Game Developer (Unity 3D)', org: 'Ubisoft India', loc: 'Pune (Hybrid)', sal: '₹10-22 LPA', cat: 'Gaming/IT', link: 'https://www.glassdoor.co.in/Jobs/Ubisoft-India-Jobs-EI_IE6736.0,6_IL.7,12_IN115.htm', qual: 'B.Tech CS with Unity/C#, game portfolio', source: 'glassdoor' },
    { title: 'Research Scientist — NLP/AI', org: 'Samsung R&D India', loc: 'Bangalore, Noida', sal: '₹18-35 LPA', cat: 'AI/ML Research', link: 'https://www.glassdoor.co.in/Jobs/Samsung-Research-India-Jobs-EI_IE8889.0,20_IN115.htm', qual: 'M.Tech/PhD CS with NLP, deep learning', source: 'glassdoor' },
    { title: 'Full Stack Developer (MERN)', org: 'Zepto', loc: 'Mumbai, Bangalore', sal: '₹15-28 LPA', cat: 'IT', link: 'https://www.glassdoor.co.in/Jobs/Zepto-Jobs-EI_IE4261649.0,5_IN115.htm', qual: 'B.Tech CS with MongoDB, Express, React, Node.js', source: 'glassdoor' },
    { title: 'Management Consultant', org: 'McKinsey India', loc: 'Gurugram, Mumbai', sal: '₹18-35 LPA', cat: 'Consulting', link: 'https://www.glassdoor.co.in/Jobs/McKinsey-and-Company-India-Jobs-EI_IE2893.0,26_IN115.htm', qual: 'MBA/MS from IITs/IIMs, analytics skills', source: 'glassdoor' },
    { title: 'Product Analyst — Growth', org: 'Naukri.com (Info Edge)', loc: 'Noida, Delhi', sal: '₹8-15 LPA', cat: 'Product/Analytics', link: 'https://www.glassdoor.co.in/Jobs/Info-Edge-Jobs-EI_IE240625.0,9_IN115.htm', qual: 'B.Tech/MBA with SQL, product analytics, A/B testing', source: 'glassdoor' },
  ];

  const portals: Record<string, string> = {
    naukri: 'https://www.naukri.com', linkedin: 'https://www.linkedin.com/jobs',
    indeed: 'https://in.indeed.com', upwork: 'https://www.upwork.com',
    shine: 'https://www.shine.com', monster: 'https://india.monsterindia.com',
    glassdoor: 'https://www.glassdoor.co.in',
  };

  return listings.map(c => ({
    title: c.title, organization: c.org, location: c.loc, salary: c.sal,
    category: c.cat, type: 'private' as const, vacancies: 'Multiple openings',
    description: c.title + ' at ' + c.org + '. Salary: ' + c.sal + '. ' + c.loc + '. Required: ' + c.qual,
    eligibility: c.qual,
    applicationProcess: 'Apply at ' + c.link,
    importantDates: { notificationDate: '', lastDate: 'Rolling', examDate: '' },
    qualificationRequired: c.qual, ageLimit: 'As per company policy',
    applyLink: c.link, sourceUrl: portals[c.source] || c.link,
    source: c.source, slug: slugify(c.title + '-' + c.org + '-' + c.source),
  }));
}
