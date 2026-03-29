import { NextRequest, NextResponse } from 'next/server';
import { generateCareerRoadmap } from '@/lib/ai/roadmap-generator';

export async function POST(req: NextRequest) {
  try {
    const { education, stream, skills, interests, ageGroup } = await req.json();
    const roadmap = await generateCareerRoadmap({
      education: education || '12th',
      stream: stream || 'Other',
      skills: skills || [],
      interests: interests || [],
      ageGroup: ageGroup || '18-22',
    });
    return NextResponse.json(roadmap);
  } catch (error) {
    console.error('Roadmap AI error:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
