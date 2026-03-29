import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Internship from '@/models/Internship';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
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
    return NextResponse.json({ internships, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Internships API error:', error);
    return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
  }
}
