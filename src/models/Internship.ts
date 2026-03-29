import mongoose, { Schema, Document } from 'mongoose';

export interface IInternship extends Document {
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  type: 'in-office' | 'remote' | 'hybrid';
  skills: string[];
  category: string;
  description: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  isActive: boolean;
  scrapedAt: Date;
  slug: string;
}

const InternshipSchema = new Schema<IInternship>({
  title: { type: String, required: true },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  stipend: { type: String, default: '' },
  duration: { type: String, default: '' },
  type: { type: String, enum: ['in-office', 'remote', 'hybrid'], default: 'in-office' },
  skills: [{ type: String }],
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  applyLink: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  source: { type: String, default: 'internshala' },
  isActive: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true },
});

InternshipSchema.index({ title: 'text', description: 'text', company: 'text' });

export default mongoose.models.Internship || mongoose.model<IInternship>('Internship', InternshipSchema);
