import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handleScrape() {
  try {
    const results = await runAllScrapers();
    console.log('✅ Scraping complete:', JSON.stringify(results, null, 2));
    return NextResponse.json({ message: 'Scraping complete', results });
  } catch (error: unknown) {
    // Only log the message, not the full axios config/headers dump
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Scrape error:', msg);
    return NextResponse.json({ error: 'Scraping failed', details: msg }, { status: 500 });
  }
}

export async function GET() {
  return handleScrape();
}

export async function POST() {
  return handleScrape();
}
