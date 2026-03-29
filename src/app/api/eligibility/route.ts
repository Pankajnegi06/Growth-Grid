import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import Exam from '@/models/Exam';
import { analyzeEligibility } from '@/lib/ai/eligibility-analyzer';

export async function POST(req: NextRequest) {
  try {
    const { education, stream, skills, ageGroup } = await req.json();
    await connectDB();

    const jobs = await Job.find({ isActive: true }).limit(20).lean();
    const exams = await Exam.find({}).limit(15).lean();

    const result = await analyzeEligibility(
      { education, stream, skills: skills || [], ageGroup: ageGroup || '18-22' },
      jobs.map(j => ({ title: j.title, eligibility: j.eligibility, qualificationRequired: j.qualificationRequired })),
      exams.map(e => ({ title: e.title, eligibility: e.eligibility }))
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Eligibility error:', error);
    return NextResponse.json({ error: 'Failed to analyze eligibility' }, { status: 500 });
  }
}
