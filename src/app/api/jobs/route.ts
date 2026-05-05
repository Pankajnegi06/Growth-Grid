import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import { shouldRefreshCategory, getLastScrapedTime } from '@/lib/freshness';
import { refreshJobs } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for scraping on Vercel Pro (10s on Hobby)

// Max age for scraped data: 7 days for govt, 2 days for private
const MAX_STALE_GOVT_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_STALE_PRIVATE_MS = 2 * 24 * 60 * 60 * 1000;

// Helper: try to parse various date strings into a Date object
function parseLastDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // "Rolling" or similar text = always valid
  if (/rolling|ongoing|open/i.test(dateStr)) return null;
  // Try direct parse first
  const d = new Date(dateStr);
  if (!isNaN(d.getTime()) && d.getFullYear() > 2020) return d;
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 2020) return new Date(c, b - 1, a); // DD/MM/YYYY
    if (a > 2020) return new Date(a, b - 1, c); // YYYY/MM/DD
  }
  return null;
}

function isJobFresh(job: Record<string, unknown>, now: Date): boolean {
  // 1. Check if the last date has passed
  const dates = job.importantDates as Record<string, string> | undefined;
  const lastDate = dates?.lastDate;
  if (lastDate && !/rolling|ongoing|open/i.test(lastDate)) {
    const parsed = parseLastDate(lastDate);
    if (parsed && parsed < now) return false; // expired
  }
  // 2. Check if scraped data is too old (stale)
  const scrapedAt = job.scrapedAt as Date | string | undefined;
  const jobType = job.type as string;
  const maxStale = jobType === 'private' ? MAX_STALE_PRIVATE_MS : MAX_STALE_GOVT_MS;

  if (scrapedAt) {
    const scrapedTime = new Date(scrapedAt).getTime();
    const age = now.getTime() - scrapedTime;
    if (age > maxStale) {
      // Keep "Rolling" jobs even if old
      if (lastDate && /rolling|ongoing|open/i.test(lastDate)) return true;
      // For scraped jobs with no specific deadline, hide if too old
      if (!lastDate) return false;
      // If last date hasn't passed yet, keep showing
      const parsed = parseLastDate(lastDate);
      if (parsed && parsed >= now) return true;
      return false;
    }
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-refresh if data is stale (>3 hours old)
    const stale = await shouldRefreshCategory('jobs');
    if (stale) {
      try { await refreshJobs(); } catch (e) { console.error('Auto-refresh jobs failed:', e); }
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const query: Record<string, unknown> = { isActive: true };
    if (type) query.type = type;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const allJobs = await Job.find(query).sort({ scrapedAt: -1 }).lean();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const activeJobs = allJobs.filter((job: Record<string, unknown>) => isJobFresh(job, now));
    const total = activeJobs.length;
    const paginatedJobs = activeJobs.slice((page - 1) * limit, page * limit);

    const lastUpdated = await getLastScrapedTime('jobs');

    return NextResponse.json({ jobs: paginatedJobs, total, page, totalPages: Math.ceil(total / limit), lastUpdated });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
