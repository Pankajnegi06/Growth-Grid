import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  title: string;
  conductingBody: string;
  description: string;
  eligibility: string;
  examDate: string;
  applicationDates: { start: string; end: string };
  category: string;
  sourceUrl: string;
  source: string;
  scrapedAt: Date;
  slug: string;
}

const ExamSchema = new Schema<IExam>({
  title: { type: String, required: true },
  conductingBody: { type: String, default: '' },
  description: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  examDate: { type: String, default: '' },
  applicationDates: { start: { type: String, default: '' }, end: { type: String, default: '' } },
  category: { type: String, default: 'General' },
  sourceUrl: { type: String, default: '' },
  source: { type: String, default: '' },
  scrapedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true },
});

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
