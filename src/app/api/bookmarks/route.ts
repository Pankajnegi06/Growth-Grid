import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Internship from '@/models/Internship';
import Hackathon from '@/models/Hackathon';
import Scheme from '@/models/Scheme';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawBookmarks = (user as any).bookmarks || [];

    // Enrich bookmarks with actual data
    const enriched = [];
    for (const bm of rawBookmarks) {
      try {
        let item = null;
        switch (bm.type) {
          case 'job':
            item = await Job.findById(bm.refId).lean();
            if (item) enriched.push({
              ...bm, _id: bm.refId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: (item as any).title, organization: (item as any).organization,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              location: (item as any).location, salary: (item as any).salary,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              applyLink: (item as any).applyLink, source: (item as any).source,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              jobType: (item as any).type,
            });
            break;
          case 'internship':
            item = await Internship.findById(bm.refId).lean();
            if (item) enriched.push({
              ...bm, _id: bm.refId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: (item as any).title, organization: (item as any).company || (item as any).organization,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              location: (item as any).location, salary: (item as any).stipend,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              applyLink: (item as any).applyLink,
            });
            break;
          case 'hackathon':
            item = await Hackathon.findById(bm.refId).lean();
            if (item) enriched.push({
              ...bm, _id: bm.refId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: (item as any).title, organization: (item as any).organizer,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              applyLink: (item as any).applyLink,
            });
            break;
          case 'scheme':
            item = await Scheme.findById(bm.refId).lean();
            if (item) enriched.push({
              ...bm, _id: bm.refId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              title: (item as any).title, organization: (item as any).ministry,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              applyLink: (item as any).applyLink,
            });
            break;
          default:
            enriched.push({ ...bm, _id: bm.refId, title: 'Unknown', organization: '' });
        }
      } catch {
        // Skip bookmark if item not found
      }
    }

    return NextResponse.json({ bookmarks: enriched });
  } catch (error) {
    console.error('Bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { type, refId } = await req.json();
    if (!type || !refId) return NextResponse.json({ error: 'Missing type or refId' }, { status: 400 });
    await connectDB();
    await User.findOneAndUpdate({ email: session.user.email }, { $addToSet: { bookmarks: { type, refId } } });
    return NextResponse.json({ message: 'Bookmarked' });
  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json({ error: 'Failed to bookmark' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { type, refId } = await req.json();
    await connectDB();
    await User.findOneAndUpdate({ email: session.user.email }, { $pull: { bookmarks: { type, refId } } });
    return NextResponse.json({ message: 'Removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
