export interface AlertItem {
  id: string;
  type: 'ups' | 'hardware' | 'software' | 'missing';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  department: string;
  floor: string;
}

export interface MaintenanceEvent {
  assetSL: string;
  date: string;
  title: string;
  meta: string;
  tag: 'New Asset' | 'Maintenance' | 'Hardware Fix' | 'Action needed' | 'Critical';
  color: string;
}

export interface IPEntry {
  id: string;
  host: string;
  ip: string;
  dept: string;
  floor: string;
  status: 'active' | 'warn';
}

export const mockAlerts: AlertItem[] = [
  { id: 'TU-009', type: 'ups', severity: 'critical', description: 'TUD04 · 10th Floor A', department: 'Team Leader', floor: '10th Floor A' },
  { id: 'TU-025', type: 'ups', severity: 'critical', description: 'TUD20 · 10th Floor A', department: 'Designer', floor: '10th Floor A' },
  { id: 'TU-039', type: 'ups', severity: 'critical', description: 'TUD34 · 10th Floor A', department: 'Designer', floor: '10th Floor A' },
  { id: 'TU-040', type: 'hardware', severity: 'warning', description: 'TUD35 · HDMI port problem, needs converter', department: 'Designer', floor: '10th Floor A' },
  { id: 'TU-068', type: 'hardware', severity: 'info', description: 'TUD65 · RAM Issue', department: 'QC', floor: '6th Floor' },
];

export const mockMaintenanceLog: MaintenanceEvent[] = [
  { assetSL: 'TU-085', date: '11 Jul 2025', title: 'TU-085 — New asset added', meta: 'AMD Ryzen 9 9950X · RTX 5060 Ti · 3D dept · 6th Floor', tag: 'New Asset', color: '#22c55e' },
  { assetSL: 'TU-057', date: '07 Aug 2025', title: 'TU-057 — Power supply replaced', meta: 'TUD54 · Designer · 6th Floor', tag: 'Maintenance', color: '#3b82f6' },
  { assetSL: 'TU-033', date: '06 May 2025', title: 'TU-033 — Power supply replaced', meta: 'TUD28 · Team Leader · 10th Floor A', tag: 'Maintenance', color: '#3b82f6' },
  { assetSL: 'TU-019', date: '05 May 2025', title: 'TU-019 — Power supply changed', meta: 'TUD14 · Team Leader · 10th Floor A', tag: 'Maintenance', color: '#3b82f6' },
  { assetSL: 'TU-068', date: 'Ongoing', title: 'TU-068 — RAM issue resolved', meta: 'TUD65 · QC · 6th Floor', tag: 'Hardware Fix', color: '#eab308' },
  { assetSL: 'TU-040', date: 'Pending', title: 'TU-040 — HDMI port issue', meta: 'TUD35 · Designer · 10th Floor A · needs converter', tag: 'Action needed', color: '#f97316' },
  { assetSL: 'TU-042', date: '23 Oct 2024', title: 'TU-042 — Power supply changed', meta: 'TUD37 · Designer · 10th Floor A', tag: 'Maintenance', color: '#a855f7' },
  { assetSL: 'TU-009', date: 'Pending', title: 'TU-009, 025, 039 — UPS needed', meta: '10th Floor A · Team Leader + Designer', tag: 'Critical', color: '#ef4444' },
];

export const mockIPDirectory: IPEntry[] = [
  { id: 'TU-001', host: 'TUS01', ip: '192.168.0.15', dept: 'IT', floor: '10th Floor A', status: 'active' },
  { id: 'TU-002', host: 'TUSW01', ip: '192.168.0.61', dept: 'IT', floor: 'Server Room', status: 'active' },
  { id: 'TU-003', host: 'TUSW02', ip: '192.168.0.62', dept: 'IT', floor: 'Server Room', status: 'active' },
  { id: 'TU-004', host: 'TUSW03', ip: '192.168.0.63', dept: 'IT', floor: 'Server Room', status: 'active' },
  { id: 'TU-005', host: 'TUSW04', ip: '192.168.0.64', dept: 'IT', floor: 'Server Room', status: 'active' },
  { id: 'TU-006', host: 'Arif', ip: '192.168.0.71', dept: 'AGM', floor: '6th Floor', status: 'active' },
  { id: 'TU-007', host: 'TUD02', ip: '192.168.0.72', dept: 'Shift Incharge', floor: '10th Floor A', status: 'active' },
  { id: 'TU-009', host: 'TUD04', ip: '192.168.0.74', dept: 'Team Leader', floor: '10th Floor A', status: 'warn' },
  { id: 'TU-016', host: 'TUD11', ip: '192.168.0.81', dept: 'Team Leader', floor: '10th Floor A', status: 'active' },
  { id: 'TU-024', host: 'TUD19', ip: '192.168.0.89', dept: 'Team Leader', floor: '10th Floor A', status: 'active' },
  { id: 'TU-052', host: 'TUD49', ip: '192.168.0.153', dept: 'QC', floor: '6th Floor', status: 'active' },
  { id: 'TU-058', host: 'TUW01', ip: '192.168.0.50', dept: 'IT', floor: '10th Floor A', status: 'active' },
  { id: 'TU-059', host: 'TUW02', ip: '192.168.0.12', dept: 'IT', floor: '6th Floor', status: 'active' },
  { id: 'TU-068', host: 'TUD65', ip: '192.168.0.169', dept: 'QC', floor: '6th Floor', status: 'warn' },
  { id: 'TU-085', host: 'TU3D07', ip: '192.168.0.186', dept: '3D', floor: '6th Floor', status: 'active' },
  { id: 'TU-096', host: 'TUSW04', ip: '192.168.0.65', dept: 'IT', floor: '1st Floor', status: 'active' },
  { id: 'TU-100', host: 'TUD71', ip: '192.168.0.200', dept: 'Marketing', floor: '1st Floor', status: 'active' },
  { id: 'TU-108', host: 'TUD79', ip: '192.168.0.208', dept: 'Accounts', floor: '1st Floor', status: 'active' },
  { id: 'TU-110', host: 'TUD81', ip: '192.168.0.210', dept: 'Accounts', floor: '1st Floor', status: 'active' },
];
