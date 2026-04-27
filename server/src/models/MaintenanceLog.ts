import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceLog extends Document {
  assetSL: string;
  maintenanceType: string;
  title?: string;
  peripheralType?: 'Mouse' | 'Keyboard' | 'Mouse + Keyboard';
  oldPeripheral?: string;
  newPeripheral?: string;
  description: string;
  technician: string;
  performedAt: Date;
  status?: 'completed' | 'pending' | 'in_progress';
  nextDueDate: Date | null;
  cost?: number;
  createdAt: Date;
}

const MaintenanceLogSchema: Schema = new Schema({
  assetSL: { type: String, required: true, index: true },
  maintenanceType: { 
    type: String, 
    required: true
  },
  title: { type: String, default: '' },
  peripheralType: { type: String, default: '' },
  oldPeripheral: { type: String, default: '' },
  newPeripheral: { type: String, default: '' },
  description: { type: String, default: '' },
  technician: { type: String, default: '' },
  performedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['completed', 'pending', 'in_progress'],
    default: 'completed'
  },
  nextDueDate: { type: Date, default: null },
  cost: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'maintenancelogs'
});

MaintenanceLogSchema.index({ performedAt: -1 });
MaintenanceLogSchema.index({ maintenanceType: 1 });
MaintenanceLogSchema.index({ status: 1 });

export default mongoose.model<IMaintenanceLog>('MaintenanceLog', MaintenanceLogSchema);
