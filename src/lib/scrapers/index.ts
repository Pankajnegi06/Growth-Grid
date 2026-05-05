import connectDB from '../mongodb';
import Job from '@/models/Job';
import Scheme from '@/models/Scheme';
import Internship from '@/models/Internship';
import Hackathon from '@/models/Hackathon';
import OpenSource from '@/models/OpenSource';
import { scrapeFreeJobAlert, scrapeIndGovtJobs, scrapeMySarkariNaukri, scrapeFreshersworld, scrapeTimesJobs, fetchRemoteOKJobs, fetchJobicyJobs, fetchJSearchJobs, scrapeNaukriIndia, scrapeShineIndia } from './jobs';
import { scrapeMyScheme } from './schemes';
import { scrapeInternshala } from './internships';
import { scrapeDevfolio } from './hackathons';
import { scrapeOpenSource } from './opensource';
import { markCategoryRefreshed } from '../freshness';

/** Refresh ONLY jobs category (govt + private from live APIs) */
export async function refreshJobs() {
  await connectDB();
  let count = 0;

  // Purge old hardcoded curated jobs that have broken/generic URLs
  const OLD_CURATED_SOURCES = ['naukri', 'linkedin', 'indeed', 'upwork', 'shine', 'monster', 'glassdoor'];
  await Job.deleteMany({ source: { $in: OLD_CURATED_SOURCES } });

  // Expire private jobs older than 2 days (48 hours)
  const PRIVATE_MAX_AGE = 2 * 24 * 60 * 60 * 1000; // 2 days
  const privateCutoff = new Date(Date.now() - PRIVATE_MAX_AGE);
  await Job.updateMany(
    { type: 'private', scrapedAt: { $lt: privateCutoff } },
    { $set: { isActive: false } }
  );

  // Run all job sources in parallel for speed
  const [fjaJobs, igjJobs, msnJobs, remoteJobs, jobicyJobs, fwJobs, tjJobs, jsJobs, nkrJobs, shnJobs] = await Promise.allSettled([
    scrapeFreeJobAlert(),
    scrapeIndGovtJobs(),
    scrapeMySarkariNaukri(),
    fetchRemoteOKJobs(),
    fetchJobicyJobs(),
    scrapeFreshersworld(),
    scrapeTimesJobs(),
    fetchJSearchJobs(),
    scrapeNaukriIndia(),
    scrapeShineIndia(),
  ]);

  const allJobs = [
    ...(fjaJobs.status === 'fulfilled' ? fjaJobs.value : []),
    ...(igjJobs.status === 'fulfilled' ? igjJobs.value : []),
    ...(msnJobs.status === 'fulfilled' ? msnJobs.value : []),
    ...(remoteJobs.status === 'fulfilled' ? remoteJobs.value : []),
    ...(jobicyJobs.status === 'fulfilled' ? jobicyJobs.value : []),
    ...(fwJobs.status === 'fulfilled' ? fwJobs.value : []),
    ...(tjJobs.status === 'fulfilled' ? tjJobs.value : []),
    ...(jsJobs.status === 'fulfilled' ? jsJobs.value : []),
    ...(nkrJobs.status === 'fulfilled' ? nkrJobs.value : []),
    ...(shnJobs.status === 'fulfilled' ? shnJobs.value : []),
  ];

  // Log source counts for debugging
  const sourceCounts: Record<string, number> = {};
  for (const j of allJobs) {
    sourceCounts[j.source] = (sourceCounts[j.source] || 0) + 1;
  }
  console.log('📊 Jobs by source:', sourceCounts);

  for (const job of allJobs) {
    try {
      await Job.findOneAndUpdate({ slug: job.slug }, { ...job, scrapedAt: new Date(), isActive: true }, { upsert: true, returnDocument: 'after' });
      count++;
    } catch { /* skip duplicates */ }
  }

  markCategoryRefreshed('jobs');
  return count;
}

/** Refresh ONLY schemes category */
export async function refreshSchemes() {
  await connectDB();
  let count = 0;
  const schemes = await scrapeMyScheme();
  for (const scheme of schemes) {
    try {
      await Scheme.findOneAndUpdate({ slug: scheme.slug }, { ...scheme, scrapedAt: new Date(), isActive: true }, { upsert: true, returnDocument: 'after' });
      count++;
    } catch { /* skip */ }
  }
  markCategoryRefreshed('schemes');
  return count;
}

/** Refresh ONLY internships category */
export async function refreshInternships() {
  await connectDB();
  let count = 0;
  const internships = await scrapeInternshala();
  for (const internship of internships) {
    try {
      await Internship.findOneAndUpdate({ slug: internship.slug }, { ...internship, scrapedAt: new Date(), isActive: true }, { upsert: true, returnDocument: 'after' });
      count++;
    } catch { /* skip */ }
  }
  markCategoryRefreshed('internships');
  return count;
}

/** Refresh ONLY hackathons category */
export async function refreshHackathons() {
  await connectDB();
  let count = 0;
  const hackathons = await scrapeDevfolio();
  for (const hackathon of hackathons) {
    try {
      await Hackathon.findOneAndUpdate({ slug: hackathon.slug }, { ...hackathon, scrapedAt: new Date(), isActive: true }, { upsert: true, returnDocument: 'after' });
      count++;
    } catch { /* skip */ }
  }
  markCategoryRefreshed('hackathons');
  return count;
}

/** Refresh ONLY open source category */
export async function refreshOpenSource() {
  await connectDB();
  let count = 0;
  const openSource = await scrapeOpenSource();
  for (const os of openSource) {
    try {
      await OpenSource.findOneAndUpdate({ slug: os.slug }, { ...os, scrapedAt: new Date() }, { upsert: true, returnDocument: 'after' });
      count++;
    } catch { /* skip */ }
  }
  markCategoryRefreshed('opensources');
  return count;
}

/** Run ALL scrapers (used by /api/scrape and cron) */
export async function runAllScrapers() {
  await connectDB();
  const results = { jobs: 0, schemes: 0, internships: 0, hackathons: 0, openSource: 0, errors: [] as string[] };

  try { results.jobs = await refreshJobs(); } catch (e) { results.errors.push(`Jobs: ${e}`); }
  try { results.schemes = await refreshSchemes(); } catch (e) { results.errors.push(`Schemes: ${e}`); }
  try { results.internships = await refreshInternships(); } catch (e) { results.errors.push(`Internships: ${e}`); }
  try { results.hackathons = await refreshHackathons(); } catch (e) { results.errors.push(`Hackathons: ${e}`); }
  try { results.openSource = await refreshOpenSource(); } catch (e) { results.errors.push(`OpenSource: ${e}`); }

  return results;
}
