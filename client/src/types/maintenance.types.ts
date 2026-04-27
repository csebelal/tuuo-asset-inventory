export type FloorName =
  | '10th Floor A'
  | '10th Floor B'
  | '6th Floor'
  | '1st Floor'
  | 'Server Room';

export type MaintenanceType =
  | 'dust_clean'
  | 'peripheral_change'
  | 'power_supply'
  | 'hardware_repair'
  | 'os_reinstall'
  | 'ups_install'
  | 'other';

export type PeripheralType = 'mouse' | 'keyboard' | 'headset' | 'monitor' | 'ups';

export type PeripheralCondition = 'good' | 'worn' | 'damaged' | 'missing';

export interface DustCleanSession {
  id: string;
  date: string;
  floors: FloorName[];
  assetsCleaned: number;
  cleanedBy: string;
  notes: string;
  status: 'completed' | 'scheduled' | 'overdue';
}

export interface DustCleanSchedule {
  intervalMonths: number;
  lastCleanDate: string;
  lastCleanFloors: FloorName[];
  nextScheduled: ScheduledClean[];
}

export interface ScheduledClean {
  dueDate: string;
  floors: FloorName[];
  status: 'upcoming' | 'due_soon' | 'overdue';
  daysUntilDue: number;
}

export interface Peripheral {
  id: string;
  assetSL: string;
  type: PeripheralType;
  brand: string;
  model: string;
  connectionType?: 'wired' | 'wireless';
  condition: PeripheralCondition;
  lastChanged: string | null;
  changedBy: string | null;
  notes: string;
  serialNo?: string;
}

export interface MaintenanceEvent {
  id: string;
  assetSL: string;
  assetHostname: string;
  department: string;
  floor: FloorName;
  type: MaintenanceType;
  title: string;
  description: string;
  date: string;
  performedBy: string;
  status: 'completed' | 'pending' | 'in_progress';
  cost?: number;
  partsReplaced?: string[];
  nextDueDate?: string;
}

export interface MaintenanceStats {
  totalEvents: number;
  dustCleans: number;
  peripheralChanges: number;
  hardwareRepairs: number;
  pendingActions: number;
  nextDustClean: string;
  daysUntilNextClean: number;
  assetsWithPeripheralIssues: number;
}

export interface IMaintenanceLog {
  _id: string;
  assetSL: string;
  maintenanceType: string;
  title?: string;
  description?: string;
  technician: string;
  performedAt: string;
  status?: string;
  cost?: number;
  nextDueDate?: string;
  createdAt?: string;
}
