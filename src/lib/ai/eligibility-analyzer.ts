import { generateJSONWithGemini } from '../gemini';

const SYSTEM_INSTRUCTION = `You are an Indian career eligibility analyzer AI. You deeply understand Indian government job eligibility criteria (age limits, educational qualifications, caste-based reservations), exam eligibility (UPSC, SSC, Banking, GATE, etc.), and private sector requirements. Analyze user profiles against available opportunities.`;

export interface EligibilityResult {
  summary: string;
  eligibleJobs: { title: string; reason: string; matchScore: number }[];
  eligibleExams: { title: string; reason: string; matchScore: number }[];
  partialMatches: { title: string; reason: string; gap: string }[];
  skillGaps: string[];
  suggestions: string[];
}

export async function analyzeEligibility(
  profile: { education: string; stream: string; skills: string[]; ageGroup: string },
  jobs: { title: string; eligibility: string; qualificationRequired: string }[],
  exams: { title: string; eligibility: string }[]
): Promise<EligibilityResult> {
  const jobList = jobs.slice(0, 15).map(j => `- ${j.title}: ${j.eligibility || j.qualificationRequired}`).join('\n');
  const examList = exams.slice(0, 10).map(e => `- ${e.title}: ${e.eligibility}`).join('\n');

  const prompt = `Analyze this Indian student/job seeker's eligibility:

Profile:
- Education: ${profile.education}
- Stream: ${profile.stream}
- Skills: ${profile.skills.join(', ') || 'Not specified'}
- Age Group: ${profile.ageGroup}

Available Jobs:
${jobList || 'No jobs currently available'}

Available Exams:
${examList || 'No exams currently available'}

Analyze which jobs and exams they are eligible for. Consider:
1. Educational qualification matching (e.g., "Graduate" includes B.Tech, BBA, B.Sc etc.)
2. Age eligibility
3. Stream relevance

Respond as JSON:
{
  "summary": "Brief overview of their eligibility landscape",
  "eligibleJobs": [{ "title": "", "reason": "why eligible", "matchScore": 85 }],
  "eligibleExams": [{ "title": "", "reason": "", "matchScore": 90 }],
  "partialMatches": [{ "title": "", "reason": "partially eligible", "gap": "what's missing" }],
  "skillGaps": ["skills they should develop"],
  "suggestions": ["actionable next steps"]
}`;

  return await generateJSONWithGemini(prompt, SYSTEM_INSTRUCTION);
}
