import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ bookmarks: user.bookmarks || [] });
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
