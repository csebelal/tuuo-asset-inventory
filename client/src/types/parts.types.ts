export type ComponentType =
  | 'mouse' | 'keyboard' | 'monitor' | 'headset'
  | 'psu' | 'ram' | 'ssd' | 'hdd'
  | 'motherboard' | 'gpu' | 'cpu' | 'cooling_fan'
  | 'ups' | 'other';

export type ChangeReason =
  | 'broken' | 'worn_out' | 'upgrade' | 'lost' | 'preventive' | 'other';

export type PartCondition = 'new' | 'good' | 'worn' | 'damaged' | 'missing';

export interface ComponentSpec {
  id: string;
  assetSL: string;
  componentType: ComponentType;
  brand: string;
  model: string;
  specification: string;
  condition: PartCondition;
  installedDate: string | null;
  installedBy: string | null;
  notes: string;
  isOriginal: boolean;
}

export interface ChangeRecord {
  _id?: string;
  id: string;
  assetSL: string;
  assetHostname: string;
  department: string;
  floor: string;
  componentType: ComponentType;
  oldBrand: string;
  oldModel: string;
  oldCondition: PartCondition;
  newBrand: string;
  newModel: string;
  newSpec: string;
  reason: ChangeReason;
  changeDate: string;
  changedBy: string;
  cost: number;
  invoiceNo: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetForParts {
  sl: string;
  hostname: string;
  department: string;
  floor: string;
  ipAddress: string;
  employeeName: string;
  assetType: string;
}
