import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication {
  opportunityId: string;
  opportunityType: 'job' | 'internship' | 'hackathon' | 'opensource' | 'scheme';
  title: string;
  organization: string;
  appliedAt: Date;
  status: 'applied' | 'in-review' | 'accepted' | 'rejected' | 'expired';
  applyLink: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  ageGroup: '1-18' | '18-24' | '25-40' | '40+';
  education: '10th' | '12th' | 'Graduate' | 'Post-Graduate';
  stream: 'Science' | 'Commerce' | 'Arts' | 'Engineering' | 'Medical' | 'Other';
  skills: string[];
  interests: string[];
  bookmarks: { type: string; refId: string }[];
  applications: IApplication[];
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  opportunityId: { type: String, required: true },
  opportunityType: { type: String, enum: ['job', 'internship', 'hackathon', 'opensource', 'scheme'], required: true },
  title: { type: String, required: true },
  organization: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['applied', 'in-review', 'accepted', 'rejected', 'expired'], default: 'applied' },
  applyLink: { type: String, default: '' },
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  ageGroup: { type: String, enum: ['1-18', '18-24', '25-40', '40+'], default: '18-24' },
  education: { type: String, enum: ['10th', '12th', 'Graduate', 'Post-Graduate'], default: '12th' },
  stream: { type: String, enum: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other'], default: 'Other' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  bookmarks: [{ type: { type: String }, refId: { type: String } }],
  applications: [ApplicationSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
