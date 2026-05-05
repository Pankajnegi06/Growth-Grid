import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
import Job from '@/models/Job';
import Scheme from '@/models/Scheme';
import Internship from '@/models/Internship';
import Hackathon from '@/models/Hackathon';
import OpenSource from '@/models/OpenSource';

// Max age for scraped data to be shown (7 days)
const MAX_STALE_MS = 7 * 24 * 60 * 60 * 1000;

// Helper: try to parse various date strings into a Date object
function parseLastDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (/rolling|ongoing|open/i.test(dateStr)) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020) return d;
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 2020) return new Date(c, b - 1, a);
    if (a > 2020) return new Date(a, b - 1, c);
  }
  return null;
}

function isJobFresh(job: Record<string, unknown>, now: Date): boolean {
  const dates = job.importantDates as Record<string, string> | undefined;
  const lastDate = dates?.lastDate;
  if (lastDate && !/rolling|ongoing|open/i.test(lastDate)) {
    const parsed = parseLastDate(lastDate);
    if (parsed && parsed < now) return false;
  }
  const scrapedAt = job.scrapedAt as Date | string | undefined;
  if (scrapedAt) {
    const age = now.getTime() - new Date(scrapedAt).getTime();
    if (age > MAX_STALE_MS) {
      if (lastDate && /rolling|ongoing|open/i.test(lastDate)) return true;
      if (!lastDate) return false;
    }
  }
  return true;
}

function isItemFresh(item: Record<string, unknown>, now: Date): boolean {
  const scrapedAt = item.scrapedAt as Date | string | undefined;
  if (!scrapedAt) return true;
  const age = now.getTime() - new Date(scrapedAt).getTime();
  return age <= MAX_STALE_MS;
}

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const [allJobs, allSchemes, allInternships, allHackathons, openSource] = await Promise.all([
      Job.find({ isActive: true }).sort({ scrapedAt: -1 }).lean(),
      Scheme.find({ isActive: true }).sort({ scrapedAt: -1 }).lean(),
      Internship.find({ isActive: true }).sort({ scrapedAt: -1 }).lean(),
      Hackathon.find({ isActive: true }).sort({ scrapedAt: -1 }).lean(),
      OpenSource.find({}).sort({ scrapedAt: -1 }).limit(6).lean(),
    ]);

    // Filter out expired/stale jobs
    const activeJobs = (allJobs as Record<string, unknown>[]).filter(job => isJobFresh(job, now));
    // Filter stale internships, hackathons, schemes (>7 days old)
    const freshSchemes = (allSchemes as Record<string, unknown>[]).filter(s => isItemFresh(s, now));
    const freshInternships = (allInternships as Record<string, unknown>[]).filter(i => isItemFresh(i, now));
    const freshHackathons = (allHackathons as Record<string, unknown>[]).filter(h => isItemFresh(h, now));

    // Check if data is stale (all categories have 0 fresh items)
    const needsScrape = activeJobs.length === 0 && freshInternships.length === 0 && freshHackathons.length === 0;

    return NextResponse.json({
      jobs: activeJobs.slice(0, 6),
      schemes: freshSchemes.length > 0 ? freshSchemes.slice(0, 6) : (allSchemes as Record<string, unknown>[]).slice(0, 6),
      internships: freshInternships.slice(0, 6),
      hackathons: freshHackathons.slice(0, 6),
      openSource,
      stats: {
        totalJobs: activeJobs.length,
        totalSchemes: freshSchemes.length > 0 ? freshSchemes.length : allSchemes.length,
        totalInternships: freshInternships.length,
        totalHackathons: freshHackathons.length,
        totalOpenSource: openSource.length,
      },
      lastUpdated: new Date().toISOString(),
      needsScrape,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
