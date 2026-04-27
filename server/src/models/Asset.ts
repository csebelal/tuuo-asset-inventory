import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  assetSL: string;
  assetType: string;
  buyDate?: Date;
  expiryDate?: Date;
  expiryLeadDays?: number;
  hostName: string;
  ipAddress: string;
  iaGroup: string;
  status?: string;
  employeeName: string;
  adName: string;
  department: string;
  unit: string;
  serialNoMAC: string;
  modelName: string;
  motherboard: string;
  processor: string;
  processorSpeed: string;
  hdd: string;
  ssd: string;
  ram: string;
  graphicsCardModel: string;
  graphicsCardGB: string;
  dateOfPurchase: Date | null;
  installedOS: string;
  licenseOS: string;
  serialNoOS: string;
  antivirusLicense: string;
  installedSoftware: string;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  lastCleaned: Date | null;
  displayCount?: number;
  condition?: 'good' | 'fair' | 'poor' | 'needs_repair' | 'dispose';
  storeLocation?: string;
  warrantyProvider?: string;
  warrantyType?: 'basic' | 'extended' | 'manufacturer' | 'third_party';
  warrantyCost?: number;
  isWarrantyActive?: boolean;
  assignedTo?: string;
  assignedDate?: Date;
  assignmentHistory?: {
    assignedTo: string;
    assignedDate: Date;
    returnedDate?: Date;
    notes?: string;
  }[];
}

const AssetSchema: Schema = new Schema({
  assetSL: { type: String, required: true, unique: true, index: true },
  assetType: { type: String, required: true, index: true },
  hostName: { type: String, default: '' },
  ipAddress: { type: String, default: '', index: true },
  iaGroup: { type: String, default: '' },
  status: { type: String, default: 'With user', index: true },
  employeeName: { type: String, default: '' },
  adName: { type: String, default: '' },
  department: { type: String, default: '', index: true },
  unit: { type: String, default: '', index: true },
  serialNoMAC: { type: String, default: '' },
  modelName: { type: String, default: '' },
  motherboard: { type: String, default: '' },
  processor: { type: String, default: '' },
  processorSpeed: { type: String, default: '' },
  hdd: { type: String, default: '' },
  ssd: { type: String, default: '' },
  ram: { type: String, default: '' },
  graphicsCardModel: { type: String, default: '' },
  graphicsCardGB: { type: String, default: '' },
  dateOfPurchase: { type: Date, default: null },
  installedOS: { type: String, default: '' },
  licenseOS: { type: String, default: '' },
  serialNoOS: { type: String, default: '' },
  antivirusLicense: { type: String, default: '' },
  installedSoftware: { type: String, default: '' },
  remarks: { type: String, default: '' },
  lastModifiedBy: { type: String, default: 'system' },
  lastCleaned: { type: Date, default: null },
  buyDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  expiryLeadDays: { type: Number, default: 30 },
  displayCount: { type: Number, default: 1 },
  condition: { 
    type: String, 
    enum: ['good', 'fair', 'poor', 'needs_repair', 'dispose', 'damaged'],
    default: null 
  },
  storeLocation: { type: String, default: '' },
  warrantyProvider: { type: String, default: '' },
  warrantyType: { 
    type: String, 
    enum: ['basic', 'extended', 'manufacturer', 'third_party'],
    default: null 
  },
  warrantyCost: { type: Number, default: null },
  isWarrantyActive: { type: Boolean, default: true },
  assignedTo: { type: String, default: '' },
  assignedDate: { type: Date, default: null },
  assignmentHistory: [{
    assignedTo: { type: String, required: true },
    assignedDate: { type: Date, required: true },
    returnedDate: { type: Date },
    notes: { type: String }
  }],
}, {
  timestamps: true,
  collection: 'assets'
});

AssetSchema.index({
  assetSL: 'text',
  hostName: 'text',
  employeeName: 'text',
  ipAddress: 'text',
  serialNoMAC: 'text',
  department: 'text',
  modelName: 'text',
  remarks: 'text'
});

AssetSchema.index({ condition: 1 });
AssetSchema.index({ storeLocation: 1 });

export default mongoose.model<IAsset>('Asset', AssetSchema);
