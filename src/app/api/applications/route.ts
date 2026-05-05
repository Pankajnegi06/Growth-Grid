import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// GET - Fetch user's applications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applications = (user as any).applications || [];

    // Sort by appliedAt descending
    applications.sort((a: { appliedAt: string | Date }, b: { appliedAt: string | Date }) =>
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST - Track a new application
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { opportunityId, opportunityType, title, organization, applyLink } = await req.json();

    if (!opportunityId || !opportunityType || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Check if already applied
    const existing = await User.findOne({
      email: session.user.email,
      'applications.opportunityId': opportunityId,
      'applications.opportunityType': opportunityType,
    });
    if (existing) {
      return NextResponse.json({ error: 'Already applied', alreadyApplied: true }, { status: 409 });
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $push: {
          applications: {
            opportunityId,
            opportunityType,
            title,
            organization: organization || '',
            applyLink: applyLink || '',
            appliedAt: new Date(),
            status: 'applied',
          },
        },
      }
    );

    return NextResponse.json({ message: 'Application tracked successfully' });
  } catch (error) {
    console.error('Applications POST error:', error);
    return NextResponse.json({ error: 'Failed to track application' }, { status: 500 });
  }
}

// DELETE - Remove an application tracking record
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { opportunityId, opportunityType } = await req.json();

    await connectDB();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { applications: { opportunityId, opportunityType } } }
    );

    return NextResponse.json({ message: 'Application removed' });
  } catch (error) {
    console.error('Applications DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove application' }, { status: 500 });
  }
}
