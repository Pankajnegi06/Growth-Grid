import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Scheme from '@/models/Scheme';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const scheme = await Scheme.findById(id).lean();
    if (!scheme) return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    return NextResponse.json({ scheme });
  } catch (error) {
    console.error('Scheme detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch scheme' }, { status: 500 });
  }
}
