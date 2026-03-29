import { NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scrapers';

async function handleScrape() {
  try {
    const results = await runAllScrapers();
    console.log('✅ Scraping complete:', JSON.stringify(results, null, 2));
    return NextResponse.json({ message: 'Scraping complete', results });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}

export async function GET() {
  return handleScrape();
}

export async function POST() {
  return handleScrape();
}
