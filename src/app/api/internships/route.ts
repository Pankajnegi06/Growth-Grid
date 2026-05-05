import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Internship from '@/models/Internship';
import { shouldRefreshCategory, getLastScrapedTime } from '@/lib/freshness';
import { refreshInternships } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-refresh if data is stale
    const stale = await shouldRefreshCategory('internships');
    if (stale) {
      try { await refreshInternships(); } catch (e) { console.error('Auto-refresh internships failed:', e); }
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
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
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query).sort({ scrapedAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const lastUpdated = await getLastScrapedTime('internships');

    return NextResponse.json({ internships, total, page, totalPages: Math.ceil(total / limit), lastUpdated });
  } catch (error) {
    console.error('Internships API error:', error);
    return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
  }
}
