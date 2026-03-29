import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  ageGroup: '15-18' | '18-22' | '22-25' | '25+';
  education: '10th' | '12th' | 'Graduate' | 'Post-Graduate';
  stream: 'Science' | 'Commerce' | 'Arts' | 'Engineering' | 'Medical' | 'Other';
  skills: string[];
  interests: string[];
  bookmarks: { type: string; refId: string }[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  ageGroup: { type: String, enum: ['15-18', '18-22', '22-25', '25+'], default: '18-22' },
  education: { type: String, enum: ['10th', '12th', 'Graduate', 'Post-Graduate'], default: '12th' },
  stream: { type: String, enum: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other'], default: 'Other' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  bookmarks: [{ type: { type: String }, refId: { type: String } }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
