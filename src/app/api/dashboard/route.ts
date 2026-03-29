import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
import Job from '@/models/Job';
import Scheme from '@/models/Scheme';
import Internship from '@/models/Internship';
import Hackathon from '@/models/Hackathon';
import OpenSource from '@/models/OpenSource';

export async function GET() {
  try {
    await connectDB();
    const [jobs, schemes, internships, hackathons, openSource] = await Promise.all([
      Job.find({ isActive: true }).sort({ scrapedAt: -1 }).limit(6).lean(),
      Scheme.find({ isActive: true }).sort({ scrapedAt: -1 }).limit(6).lean(),
      Internship.find({ isActive: true }).sort({ scrapedAt: -1 }).limit(6).lean(),
      Hackathon.find({ isActive: true }).sort({ scrapedAt: -1 }).limit(6).lean(),
      OpenSource.find({}).sort({ scrapedAt: -1 }).limit(6).lean(),
    ]);

    return NextResponse.json({
      jobs, schemes, internships, hackathons, openSource,
      stats: {
        totalJobs: await Job.countDocuments({ isActive: true }),
        totalSchemes: await Scheme.countDocuments({ isActive: true }),
        totalInternships: await Internship.countDocuments({ isActive: true }),
        totalHackathons: await Hackathon.countDocuments({ isActive: true }),
        totalOpenSource: await OpenSource.countDocuments({}),
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
