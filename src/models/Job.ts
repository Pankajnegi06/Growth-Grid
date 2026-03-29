import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  organization: string;
  location: string;
  salary: string;
  category: string;
  type: 'private' | 'government';
  vacancies: string;
  description: string;
  eligibility: string;
  applicationProcess: string;
  importantDates: {
    notificationDate: string;
    lastDate: string;
    examDate: string;
  };
  qualificationRequired: string;
  ageLimit: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  isActive: boolean;
  scrapedAt: Date;
  slug: string;
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  organization: { type: String, default: '' },
  location: { type: String, default: 'India' },
  salary: { type: String, default: '' },
  category: { type: String, default: 'General' },
  type: { type: String, enum: ['private', 'government'], default: 'government' },
  vacancies: { type: String, default: '' },
  description: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  applicationProcess: { type: String, default: '' },
  importantDates: {
    notificationDate: { type: String, default: '' },
    lastDate: { type: String, default: '' },
    examDate: { type: String, default: '' },
  },
  qualificationRequired: { type: String, default: '' },
  ageLimit: { type: String, default: '' },
  applyLink: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  source: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true },
});

JobSchema.index({ title: 'text', description: 'text', eligibility: 'text' });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
