import mongoose, { Schema, Document } from 'mongoose';

export interface IOpenSource extends Document {
  title: string;
  organization: string;
  program: 'GSoC' | 'LFX' | 'Outreachy' | 'Other';
  techStack: string[];
  description: string;
  stipend: string;
  timeline: string;
  mentors: string;
  applyLink: string;
  sourceUrl: string;
  scrapedAt: Date;
  slug: string;
}

const OpenSourceSchema = new Schema<IOpenSource>({
  title: { type: String, required: true },
  organization: { type: String, default: '' },
  program: { type: String, enum: ['GSoC', 'LFX', 'Outreachy', 'Other'], default: 'GSoC' },
  techStack: [{ type: String }],
  description: { type: String, default: '' },
  stipend: { type: String, default: '' },
  timeline: { type: String, default: '' },
  mentors: { type: String, default: '' },
  applyLink: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  scrapedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true },
});

export default mongoose.models.OpenSource || mongoose.model<IOpenSource>('OpenSource', OpenSourceSchema);
