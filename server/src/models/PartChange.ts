import mongoose, { Schema, Document } from 'mongoose';

export interface IPartChange extends Document {
  assetSL: string;
  assetHostname: string;
  department: string;
  floor: string;
  componentType: string;
  oldBrand: string;
  oldModel: string;
  oldCondition: string;
  newBrand: string;
  newModel: string;
  newSpec: string;
  reason: string;
  changeDate: string;
  changedBy: string;
  cost: number;
  invoiceNo: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartChangeSchema: Schema = new Schema({
  assetSL: { type: String, required: true },
  assetHostname: { type: String, default: '' },
  department: { type: String, default: '' },
  floor: { type: String, default: '' },
  componentType: { type: String, required: true },
  oldBrand: { type: String, default: '' },
  oldModel: { type: String, default: '' },
  oldCondition: { type: String, default: '' },
  newBrand: { type: String, required: true },
  newModel: { type: String, required: true },
  newSpec: { type: String, default: '' },
  reason: { type: String, default: '' },
  changeDate: { type: String, default: '' },
  changedBy: { type: String, default: 'IT Team' },
  cost: { type: Number, default: 0 },
  invoiceNo: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<IPartChange>('PartChange', PartChangeSchema);
