import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
  assetSL?: string;
  performedBy: string;
  details: string;
  timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  assetSL: { type: String },
  performedBy: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
