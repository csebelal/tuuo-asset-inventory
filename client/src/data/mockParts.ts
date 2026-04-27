import type { AssetForParts, ChangeRecord, ComponentSpec } from '../types/parts.types';

export const ASSETS: AssetForParts[] = [
  { sl: 'TU-006', hostname: 'Arif', department: 'AGM', floor: '6th Floor', ipAddress: '192.168.0.71', employeeName: 'Arifur Rahman', assetType: 'Desktop' },
  { sl: 'TU-007', hostname: 'TUD02', department: 'Shift Incharge', floor: '10th Floor A', ipAddress: '192.168.0.72', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-009', hostname: 'TUD04', department: 'Team Leader', floor: '10th Floor A', ipAddress: '192.168.0.74', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-016', hostname: 'TUD11', department: 'Team Leader', floor: '10th Floor A', ipAddress: '192.168.0.81', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-019', hostname: 'TUD14', department: 'Team Leader', floor: '10th Floor A', ipAddress: '192.168.0.84', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-024', hostname: 'TUD19', department: 'Team Leader', floor: '10th Floor A', ipAddress: '192.168.0.89', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-033', hostname: 'TUD28', department: 'Team Leader', floor: '10th Floor A', ipAddress: '192.168.0.98', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-040', hostname: 'TUD35', department: 'Designer', floor: '10th Floor A', ipAddress: '192.168.0.105', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-042', hostname: 'TUD37', department: 'Designer', floor: '10th Floor A', ipAddress: '192.168.0.107', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-045', hostname: 'TUD40', department: 'QC', floor: '10th Floor B', ipAddress: '192.168.0.110', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-052', hostname: 'TUD49', department: 'QC', floor: '6th Floor', ipAddress: '192.168.0.153', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-057', hostname: 'TUD54', department: 'Designer', floor: '6th Floor', ipAddress: '192.168.0.158', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-068', hostname: 'TUD65', department: 'QC', floor: '6th Floor', ipAddress: '192.168.0.169', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-085', hostname: 'TU3D07', department: '3D', floor: '6th Floor', ipAddress: '192.168.0.186', employeeName: '', assetType: 'Desktop' },
  { sl: 'TU-100', hostname: 'TUD71', department: 'Marketing', floor: '1st Floor', ipAddress: '192.168.0.200', employeeName: 'Alvi', assetType: 'Laptop' },
  { sl: 'TU-108', hostname: 'TUD79', department: 'Accounts', floor: '1st Floor', ipAddress: '192.168.0.208', employeeName: 'Tofayel', assetType: 'Laptop' },
];

export const COMPONENT_SPECS: ComponentSpec[] = [
  { id: 'cs-001', assetSL: 'TU-006', componentType: 'mouse', brand: 'Logitech', model: 'M100', specification: 'Wired USB', condition: 'good', installedDate: '01.2026', installedBy: 'IT Team', notes: '', isOriginal: false },
  { id: 'cs-002', assetSL: 'TU-006', componentType: 'keyboard', brand: 'A4Tech', model: 'KR-85', specification: 'Wired Membrane', condition: 'worn', installedDate: '01.2026', installedBy: 'IT Team', notes: 'Keys faded', isOriginal: false },
  { id: 'cs-003', assetSL: 'TU-006', componentType: 'ram', brand: 'Unknown', model: 'DDR4', specification: '32GB DDR4', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-004', assetSL: 'TU-006', componentType: 'ssd', brand: 'Unknown', model: 'SSD', specification: '1TB SSD', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-005', assetSL: 'TU-006', componentType: 'hdd', brand: 'Unknown', model: 'HDD', specification: '8+15+1TB', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-010', assetSL: 'TU-016', componentType: 'mouse', brand: 'Logitech', model: 'M90', specification: 'Wired USB', condition: 'damaged', installedDate: null, installedBy: null, notes: 'Scroll wheel broken', isOriginal: true },
  { id: 'cs-011', assetSL: 'TU-016', componentType: 'keyboard', brand: 'HP', model: 'K1000', specification: 'Wired USB', condition: 'good', installedDate: '11.2025', installedBy: 'IT Team', notes: '', isOriginal: false },
  { id: 'cs-012', assetSL: 'TU-016', componentType: 'ram', brand: 'Unknown', model: 'DDR4', specification: '32GB DDR4', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-013', assetSL: 'TU-016', componentType: 'ssd', brand: 'Unknown', model: 'SSD', specification: '256GB', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-020', assetSL: 'TU-033', componentType: 'psu', brand: 'Corsair', model: 'CV550', specification: '550W 80+ Bronze', condition: 'good', installedDate: '06.05.2025', installedBy: 'IT Team', notes: 'Replaced after failure', isOriginal: false },
  { id: 'cs-021', assetSL: 'TU-033', componentType: 'ram', brand: 'Unknown', model: 'DDR4', specification: '40GB DDR4', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-022', assetSL: 'TU-033', componentType: 'ssd', brand: 'Unknown', model: 'SSD', specification: '256GB', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-023', assetSL: 'TU-033', componentType: 'hdd', brand: 'Unknown', model: 'HDD', specification: '1TB', condition: 'good', installedDate: null, installedBy: null, notes: '', isOriginal: true },
  { id: 'cs-030', assetSL: 'TU-085', componentType: 'mouse', brand: 'Logitech', model: 'G305', specification: 'Wireless Gaming', condition: 'good', installedDate: '07.2025', installedBy: 'IT Team', notes: '', isOriginal: false },
  { id: 'cs-031', assetSL: 'TU-085', componentType: 'keyboard', brand: 'Logitech', model: 'K845', specification: 'Wired Mechanical', condition: 'good', installedDate: '07.2025', installedBy: 'IT Team', notes: '', isOriginal: false },
  { id: 'cs-032', assetSL: 'TU-085', componentType: 'ram', brand: 'Unknown', model: 'DDR5', specification: '64GB (32x2)', condition: 'new', installedDate: '11.07.2025', installedBy: 'IT Team', notes: '', isOriginal: true },
  { id: 'cs-033', assetSL: 'TU-085', componentType: 'ssd', brand: 'Unknown', model: 'NVMe', specification: '1TB NVMe', condition: 'new', installedDate: '11.07.2025', installedBy: 'IT Team', notes: '', isOriginal: true },
  { id: 'cs-034', assetSL: 'TU-085', componentType: 'hdd', brand: 'Unknown', model: 'HDD', specification: '2TB', condition: 'new', installedDate: '11.07.2025', installedBy: 'IT Team', notes: '', isOriginal: true },
  { id: 'cs-035', assetSL: 'TU-085', componentType: 'gpu', brand: 'MSI', model: 'RTX 5060 Ti 16G', specification: '16GB GDDR7', condition: 'new', installedDate: '11.07.2025', installedBy: 'IT Team', notes: '', isOriginal: true },
  { id: 'cs-036', assetSL: 'TU-085', componentType: 'psu', brand: 'Corsair', model: 'RM850', specification: '850W 80+ Gold', condition: 'new', installedDate: '11.07.2025', installedBy: 'IT Team', notes: '', isOriginal: true },
];

export const CHANGE_RECORDS: ChangeRecord[] = [
  { id: 'cr-001', assetSL: 'TU-033', assetHostname: 'TUD28', department: 'Team Leader', floor: '10th Floor A', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 450W', oldCondition: 'damaged', newBrand: 'Corsair', newModel: 'CV550 550W', newSpec: '550W 80+ Bronze', reason: 'broken', changeDate: '06.05.2025', changedBy: 'IT Team', cost: 2500, invoiceNo: '', notes: 'Power supply replace 06.05.2025' },
  { id: 'cr-002', assetSL: 'TU-019', assetHostname: 'TUD14', department: 'Team Leader', floor: '10th Floor A', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 450W', oldCondition: 'damaged', newBrand: 'Corsair', newModel: 'CV550 550W', newSpec: '550W 80+ Bronze', reason: 'broken', changeDate: '05.05.2025', changedBy: 'IT Team', cost: 2500, invoiceNo: '', notes: 'Power Supply Change 05.05.2025' },
  { id: 'cr-003', assetSL: 'TU-057', assetHostname: 'TUD54', department: 'Designer', floor: '6th Floor', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 450W', oldCondition: 'damaged', newBrand: 'Corsair', newModel: 'CV550 550W', newSpec: '550W 80+ Bronze', reason: 'broken', changeDate: '07.08.2025', changedBy: 'IT Team', cost: 2500, invoiceNo: '', notes: 'Power supply change 07.08.2025' },
  { id: 'cr-004', assetSL: 'TU-042', assetHostname: 'TUD37', department: 'Designer', floor: '10th Floor A', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 400W', oldCondition: 'damaged', newBrand: 'Unknown', newModel: 'Replacement 500W', newSpec: '500W', reason: 'broken', changeDate: '23.10.2024', changedBy: 'IT Team', cost: 2000, invoiceNo: '', notes: 'Power supply change 23.10.24' },
  { id: 'cr-005', assetSL: 'TU-045', assetHostname: 'TUD40', department: 'QC', floor: '10th Floor B', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 400W', oldCondition: 'damaged', newBrand: 'Unknown', newModel: 'Replacement 500W', newSpec: '500W', reason: 'broken', changeDate: '23.10.2024', changedBy: 'IT Team', cost: 2000, invoiceNo: '', notes: 'Power supply change 23.10.24' },
  { id: 'cr-006', assetSL: 'TU-068', assetHostname: 'TUD65', department: 'QC', floor: '6th Floor', componentType: 'ram', oldBrand: 'Unknown', oldModel: 'DDR4 32GB', oldCondition: 'damaged', newBrand: 'Unknown', newModel: 'DDR4 32GB', newSpec: '32GB DDR4', reason: 'broken', changeDate: '2025', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'RAM Issue solve — reseated' },
  { id: 'cr-007', assetSL: 'TU-006', assetHostname: 'Arif', department: 'AGM', floor: '6th Floor', componentType: 'keyboard', oldBrand: 'A4Tech', oldModel: 'KRS-83', oldCondition: 'worn', newBrand: 'A4Tech', newModel: 'KR-85', newSpec: 'Wired USB Membrane', reason: 'worn_out', changeDate: '01.2026', changedBy: 'IT Team', cost: 500, invoiceNo: '', notes: 'Keys faded — replaced' },
  { id: 'cr-008', assetSL: 'TU-016', assetHostname: 'TUD11', department: 'Team Leader', floor: '10th Floor A', componentType: 'mouse', oldBrand: 'Logitech', oldModel: 'M90', oldCondition: 'damaged', newBrand: 'Logitech', newModel: 'M100', newSpec: 'Wired USB Optical', reason: 'broken', changeDate: '11.2025', changedBy: 'IT Team', cost: 600, invoiceNo: '', notes: 'Scroll wheel broken' },
];

export const ALL_FLOORS = ['10th Floor A', '10th Floor B', '6th Floor', '1st Floor', 'Server Room'];
export const ALL_DEPARTMENTS = ['AGM', 'Designer', 'QC', 'Team Leader', '3D', 'Marketing', 'Accounts', 'IT', 'Customer Support', 'Shift Incharge', 'Video Editor'];
