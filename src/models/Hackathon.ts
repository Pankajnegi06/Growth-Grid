import mongoose, { Schema, Document } from 'mongoose';

export interface IHackathon extends Document {
  title: string;
  organizer: string;
  themes: string[];
  mode: 'online' | 'offline' | 'hybrid';
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  participants: string;
  prizes: string;
  description: string;
  applyLink: string;
  sourceUrl: string;
  source: string;
  isActive: boolean;
  scrapedAt: Date;
  slug: string;
}

const HackathonSchema = new Schema<IHackathon>({
  title: { type: String, required: true },
  organizer: { type: String, default: '' },
  themes: [{ type: String }],
  mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  registrationDeadline: { type: String, default: '' },
  participants: { type: String, default: '' },
  prizes: { type: String, default: '' },
  description: { type: String, default: '' },
  applyLink: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  source: { type: String, default: 'devfolio' },
  isActive: { type: Boolean, default: true },
  scrapedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, required: true },
});

export default mongoose.models.Hackathon || mongoose.model<IHackathon>('Hackathon', HackathonSchema);
