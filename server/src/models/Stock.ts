import mongoose, { Schema, Document } from 'mongoose';

export interface IStock extends Document {
  itemType: 'mouse' | 'keyboard' | 'ups';
  quantity: number;
  location: string;
  department: string;
  sourceStockId?: mongoose.Types.ObjectId;
  supplier?: string;
  costPerUnit?: number;
  boughtDate?: Date;
  expiryDate?: Date;
  expiryLeadDays: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const StockSchema: Schema = new Schema({
  itemType: { 
    type: String, 
    required: true, 
    enum: ['mouse', 'keyboard', 'ups'] 
  },
  quantity: { type: Number, required: true, min: 0 },
  location: { type: String, default: 'Store' },
  department: { type: String, default: '' },
  sourceStockId: { type: Schema.Types.ObjectId, ref: 'Stock', default: null },
  supplier: { type: String, default: '' },
  costPerUnit: { type: Number, default: 0 },
  boughtDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  expiryLeadDays: { type: Number, default: 30 },
  notes: { type: String, default: '' }
}, {
  timestamps: true,
  collection: 'stock'
});

StockSchema.index({ itemType: 1, location: 1 });
StockSchema.index({ itemType: 1, department: 1 });

export default mongoose.model<IStock>('Stock', StockSchema);
