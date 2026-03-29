import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scheme from '@/models/Scheme';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
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
    return NextResponse.json({ schemes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Schemes API error:', error);
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}
