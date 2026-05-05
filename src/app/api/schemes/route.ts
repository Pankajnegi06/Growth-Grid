import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scheme from '@/models/Scheme';
import { shouldRefreshCategory, getLastScrapedTime } from '@/lib/freshness';
import { refreshSchemes } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-refresh if data is stale
    const stale = await shouldRefreshCategory('schemes');
    if (stale) {
      try { await refreshSchemes(); } catch (e) { console.error('Auto-refresh schemes failed:', e); }
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const query: Record<string, unknown> = { isActive: true };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Scheme.countDocuments(query);
    const schemes = await Scheme.find(query).sort({ scrapedAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const lastUpdated = await getLastScrapedTime('schemes');

    return NextResponse.json({ schemes, total, page, totalPages: Math.ceil(total / limit), lastUpdated });
  } catch (error) {
    console.error('Schemes API error:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}
