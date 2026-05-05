import connectDB from './mongodb';
import mongoose from 'mongoose';

// In-memory debounce per serverless instance
const refreshTimestamps: Record<string, number> = {};
const DEBOUNCE_MS = 10 * 60 * 1000; // 10 min: don't re-scrape more often

// Data older than this is considered stale
const STALE_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3 hours

export async function shouldRefreshCategory(collectionName: string): Promise<boolean> {
  const last = refreshTimestamps[collectionName];
  if (last && Date.now() - last < DEBOUNCE_MS) return false;

  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return true;

    const newest = await db.collection(collectionName)
      .findOne({}, { sort: { scrapedAt: -1 }, projection: { scrapedAt: 1 } });

    if (!newest?.scrapedAt) return true;
    return Date.now() - new Date(newest.scrapedAt).getTime() > STALE_THRESHOLD_MS;
  } catch {
    return true;
  }
}

export function markCategoryRefreshed(collectionName: string) {
  refreshTimestamps[collectionName] = Date.now();
}

export async function getLastScrapedTime(collectionName: string): Promise<string | null> {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return null;

    const newest = await db.collection(collectionName)
      .findOne({}, { sort: { scrapedAt: -1 }, projection: { scrapedAt: 1 } });

    return newest?.scrapedAt ? new Date(newest.scrapedAt).toISOString() : null;
  } catch {
    return null;
  }
}
