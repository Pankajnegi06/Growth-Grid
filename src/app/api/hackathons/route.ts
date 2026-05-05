import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hackathon from '@/models/Hackathon';
import { shouldRefreshCategory, getLastScrapedTime } from '@/lib/freshness';
import { refreshHackathons } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-refresh if data is stale
    const stale = await shouldRefreshCategory('hackathons');
    if (stale) {
      try { await refreshHackathons(); } catch (e) { console.error('Auto-refresh hackathons failed:', e); }
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const query: Record<string, unknown> = { isActive: true };
    if (mode) query.mode = mode;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { themes: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Hackathon.countDocuments(query);
    const hackathons = await Hackathon.find(query).sort({ scrapedAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const lastUpdated = await getLastScrapedTime('hackathons');

    return NextResponse.json({ hackathons, total, page, totalPages: Math.ceil(total / limit), lastUpdated });
  } catch (error) {
    console.error('Hackathons API error:', error);
    return NextResponse.json({ error: 'Failed to fetch hackathons' }, { status: 500 });
  }
}
