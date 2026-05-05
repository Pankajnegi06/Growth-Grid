import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import Hackathon from '@/models/Hackathon';

export const dynamic = 'force-dynamic';

// Helper: try to parse various date strings into a Date object
function parseLastDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 1000) return new Date(c, b - 1, a);
    if (a > 1000) return new Date(a, b - 1, c);
  }
  return null;
}

export async function GET() {
  try {
    await connectDB();

    // Get all jobs and filter for expired ones
    const allJobs = await Job.find({ isActive: true }).sort({ scrapedAt: -1 }).lean();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const expiredJobs = (allJobs as Record<string, unknown>[]).filter((job) => {
      const dates = job.importantDates as Record<string, string> | undefined;
      const lastDate = dates?.lastDate;
      if (!lastDate) return false;
      const parsed = parseLastDate(lastDate);
      if (!parsed) return false;
      return parsed < now;
    }).slice(0, 20);

    // Get inactive hackathons or ones with past dates
    const pastHackathons = await Hackathon.find({
      $or: [{ isActive: false }, { endDate: { $ne: '' } }]
    }).sort({ scrapedAt: -1 }).limit(20).lean();

    return NextResponse.json({
      expiredJobs,
      pastHackathons,
      totalExpiredJobs: expiredJobs.length,
      totalPastHackathons: pastHackathons.length,
    });
  } catch (error) {
    console.error('Archives API error:', error);
    return NextResponse.json({ error: 'Failed to fetch archives' }, { status: 500 });
  }
}
