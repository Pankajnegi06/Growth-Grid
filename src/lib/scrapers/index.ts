import connectDB from '../mongodb';
import Job from '@/models/Job';
import Scheme from '@/models/Scheme';
import Internship from '@/models/Internship';
import Hackathon from '@/models/Hackathon';
import OpenSource from '@/models/OpenSource';
import { scrapeFreeJobAlert, scrapeIndGovtJobs, scrapeMySarkariNaukri, scrapeFreshersworld, scrapeTimesJobs, getCuratedPrivateJobs } from './jobs';
import { scrapeMyScheme } from './schemes';
import { scrapeInternshala } from './internships';
import { scrapeDevfolio } from './hackathons';
import { scrapeOpenSource } from './opensource';

export async function runAllScrapers() {
  await connectDB();
  const results = { jobs: 0, schemes: 0, internships: 0, hackathons: 0, openSource: 0, errors: [] as string[] };

  // Scrape Jobs — Government
  try {
    const [fjaJobs, igjJobs, msnJobs] = await Promise.all([
      scrapeFreeJobAlert(),
      scrapeIndGovtJobs(),
      scrapeMySarkariNaukri(),
    ]);
    for (const job of [...fjaJobs, ...igjJobs, ...msnJobs]) {
      try {
        await Job.findOneAndUpdate({ slug: job.slug }, { ...job, scrapedAt: new Date(), isActive: true }, { upsert: true, new: true });
        results.jobs++;
      } catch { /* skip duplicates */ }
    }
  } catch (e) { results.errors.push(`GovtJobs: ${e}`); }

  // Scrape Jobs — Private (Freshersworld + TimesJobs + Curated multi-portal)
  try {
    const [fwJobs, tjJobs] = await Promise.all([scrapeFreshersworld(), scrapeTimesJobs()]);
    const curatedJobs = getCuratedPrivateJobs();
    for (const job of [...fwJobs, ...tjJobs, ...curatedJobs]) {
      try {
        await Job.findOneAndUpdate({ slug: job.slug }, { ...job, scrapedAt: new Date(), isActive: true }, { upsert: true, new: true });
        results.jobs++;
      } catch { /* skip duplicates */ }
    }
  } catch (e) { results.errors.push(`PrivateJobs: ${e}`); }

  // Scrape Schemes
  try {
    const schemes = await scrapeMyScheme();
    for (const scheme of schemes) {
      try {
        await Scheme.findOneAndUpdate({ slug: scheme.slug }, { ...scheme, scrapedAt: new Date(), isActive: true }, { upsert: true, new: true });
        results.schemes++;
      } catch { /* skip */ }
    }
  } catch (e) { results.errors.push(`Schemes: ${e}`); }

  // Scrape Internships
  try {
    const internships = await scrapeInternshala();
    for (const internship of internships) {
      try {
        await Internship.findOneAndUpdate({ slug: internship.slug }, { ...internship, scrapedAt: new Date(), isActive: true }, { upsert: true, new: true });
        results.internships++;
      } catch { /* skip */ }
    }
  } catch (e) { results.errors.push(`Internships: ${e}`); }

  // Scrape Hackathons
  try {
    const hackathons = await scrapeDevfolio();
    for (const hackathon of hackathons) {
      try {
        await Hackathon.findOneAndUpdate({ slug: hackathon.slug }, { ...hackathon, scrapedAt: new Date(), isActive: true }, { upsert: true, new: true });
        results.hackathons++;
      } catch { /* skip */ }
    }
  } catch (e) { results.errors.push(`Hackathons: ${e}`); }

  // Scrape Open Source
  try {
    const openSource = await scrapeOpenSource();
    for (const os of openSource) {
      try {
        await OpenSource.findOneAndUpdate({ slug: os.slug }, { ...os, scrapedAt: new Date() }, { upsert: true, new: true });
        results.openSource++;
      } catch { /* skip */ }
    }
  } catch (e) { results.errors.push(`OpenSource: ${e}`); }

  return results;
}
