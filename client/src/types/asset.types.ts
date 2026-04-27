export interface IAsset {
  _id: string;
  assetSL: string;
  assetType: string;
  buyDate?: string;
  expiryDate?: string;
  expiryLeadDays?: number;
  displayCount?: number;
  condition?: 'good' | 'fair' | 'poor' | 'needs_repair' | 'dispose';
  storeLocation?: string;
  hostName: string;
  ipAddress: string;
  iaGroup: string;
  status: string;
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
  dateOfPurchase: string | null;
  installedOS: string;
  licenseOS: string;
  serialNoOS: string;
  antivirusLicense: string;
  installedSoftware: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  lastCleaned: string | null;
  warrantyProvider?: string;
  warrantyType?: 'basic' | 'extended' | 'manufacturer' | 'third_party';
  warrantyCost?: number;
  isWarrantyActive?: boolean;
  assignedTo?: string;
  assignedDate?: string;
  assignmentHistory?: {
    assignedTo: string;
    assignedDate: string;
    returnedDate?: string;
    notes?: string;
  }[];
}

export interface IMaintenanceLog {
  _id: string;
  assetSL: string;
  maintenanceType: 'Dust Clean' | 'Peripheral Change' | 'Hardware Fix' | 'Software Update' | 'Inspection' | 'Other';
  peripheralType?: string;
  oldPeripheral?: string;
  newPeripheral?: string;
  description: string;
  technician: string;
  performedAt: string;
  nextDueDate: string | null;
  cost?: number;
  createdAt: string;
}

export interface MaintenanceSchedule {
  floors: {
    _id: string;
    lastCleaned: string | null;
    totalAssets: number;
    cleanedCount: number;
  }[];
  overdueFloors: any[];
  overdueCount: number;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'viewer' | 'editor';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AssetsResponse {
  assets: IAsset[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalAssets: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byAccess: Record<string, number>;
  byFloor: Record<string, number>;
  byDepartment: Record<string, number>;
  incompleteAssets: number;
  byOS: Record<string, number>;
}
