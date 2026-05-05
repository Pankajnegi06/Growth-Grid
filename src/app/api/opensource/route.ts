import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OpenSource from '@/models/OpenSource';
import { shouldRefreshCategory, getLastScrapedTime } from '@/lib/freshness';
import { refreshOpenSource } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Auto-refresh if data is stale
    const stale = await shouldRefreshCategory('opensources');
    if (stale) {
      try { await refreshOpenSource(); } catch (e) { console.error('Auto-refresh opensource failed:', e); }
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const program = searchParams.get('program') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;

    const query: Record<string, unknown> = {};
    if (program) query.program = program;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await OpenSource.countDocuments(query);
    const programs = await OpenSource.find(query).sort({ scrapedAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const lastUpdated = await getLastScrapedTime('opensources');

    return NextResponse.json({ programs, total, page, totalPages: Math.ceil(total / limit), lastUpdated });
  } catch (error) {
    console.error('OpenSource API error:', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}
