import mongoose, { Schema, Document } from 'mongoose';

export interface IScheme extends Document {
  title: string;
  ministry: string;
  description: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  category: string;
  targetGroup: string;
  sourceUrl: string;
  source: string;
  isActive: boolean;
  scrapedAt: Date;
  slug: string;
}

const SchemeSchema = new Schema<IScheme>({
  title: { type: String, required: true },
  ministry: { type: String, default: '' },
  description: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  benefits: { type: String, default: '' },
  applicationProcess: { type: String, default: '' },
  category: { type: String, default: 'General' },
  targetGroup: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  source: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true },
});

SchemeSchema.index({ title: 'text', description: 'text', eligibility: 'text' });

export default mongoose.models.Scheme || mongoose.model<IScheme>('Scheme', SchemeSchema);
