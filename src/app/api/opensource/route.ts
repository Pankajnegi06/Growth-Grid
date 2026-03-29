import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import OpenSource from '@/models/OpenSource';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
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
    return NextResponse.json({ programs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('OpenSource API error:', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}
