import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Reusable HTTPS agent that skips certificate verification for scraped sites
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': getRandomUA(), 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.9' },
    timeout: 15000,
    httpsAgent,
  });
  return cheerio.load(data);
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100);
}
