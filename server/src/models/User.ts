import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginLog extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'viewer' | 'editor';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer', 'editor'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

const LoginLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  success: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const LoginLog = mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);

export default mongoose.model<IUser>('User', UserSchema);
