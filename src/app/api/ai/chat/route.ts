import { NextRequest, NextResponse } from 'next/server';
import { getCareerAdvice } from '@/lib/ai/career-advisor';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    const response = await getCareerAdvice(message, history || []);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat AI error:', error);
    return NextResponse.json({ error: 'Failed to get advice' }, { status: 500 });
  }
}
