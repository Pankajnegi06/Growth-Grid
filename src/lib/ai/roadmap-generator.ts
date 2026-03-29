import { generateJSONWithGemini } from '../gemini';

const SYSTEM_INSTRUCTION = `You are an expert Indian career advisor AI. You understand the Indian education system (CBSE, ICSE, State Boards, UGC, AICTE), competitive exams (UPSC, SSC, Banking, GATE, CAT, NEET, JEE), government job landscape, and private sector opportunities in India. You provide actionable, structured career roadmaps.`;

export interface RoadmapPhase {
  title: string;
  duration: string;
  description: string;
  skills: string[];
  resources: string[];
  milestones: string[];
}

export interface CareerRoadmap {
  summary: string;
  phases: RoadmapPhase[];
  careerGoals: string[];
  alternativePaths: string[];
  examsSuggested: string[];
  estimatedTimeline: string;
}

export async function generateCareerRoadmap(profile: {
  education: string;
  stream: string;
  skills: string[];
  interests: string[];
  ageGroup: string;
}): Promise<CareerRoadmap> {
  const prompt = `Generate a detailed, personalized career roadmap for an Indian student/job seeker with the following profile:

Education: ${profile.education}
Stream: ${profile.stream}
Current Skills: ${profile.skills.join(', ') || 'None specified'}
Interests: ${profile.interests.join(', ') || 'General'}
Age Group: ${profile.ageGroup}

Create a roadmap with 4-6 phases, each containing:
- title: Phase name
- duration: How long this phase should take
- description: What to focus on
- skills: Skills to acquire in this phase
- resources: Specific free/affordable resources (Indian context — NPTEL, SWAYAM, Coursera, YouTube channels, books)
- milestones: Measurable achievements to hit

Also include:
- summary: A 2-3 sentence personalized summary
- careerGoals: Top 5 career goals they can achieve
- alternativePaths: 3 alternative career directions
- examsSuggested: Relevant competitive exams in India
- estimatedTimeline: Total estimated time

Respond as JSON matching this structure:
{
  "summary": "string",
  "phases": [{ "title": "", "duration": "", "description": "", "skills": [], "resources": [], "milestones": [] }],
  "careerGoals": [],
  "alternativePaths": [],
  "examsSuggested": [],
  "estimatedTimeline": ""
}`;

  return await generateJSONWithGemini(prompt, SYSTEM_INSTRUCTION);
}
