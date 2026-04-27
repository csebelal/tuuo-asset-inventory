import Papa from 'papaparse';
import { IAsset } from '../models/Asset';

export const parseAssetCSV = (buffer: Buffer): Partial<IAsset>[] => {
  const results = Papa.parse(buffer.toString(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return results.data
    .filter((row: any) => row['Assets SL'] && row['Assets SL'].trim() !== '')
    .map((row: any) => ({
      assetSL: cleanStr(row['Assets SL']),
      assetType: cleanStr(row['Asset Type']),
      hostName: cleanStr(row['Host Name']),
      ipAddress: cleanStr(row['IP Address']),
      iaGroup: cleanStr(row['IA Group']),
      status: cleanStr(row['Status']),
      employeeName: cleanStr(row['Employee Name']),
      adName: cleanStr(row['AD Name']),
      department: cleanStr(row['Department']),
      unit: cleanStr(row['Unit']),
      serialNoMAC: cleanStr(row['Serial No/MAC']),
      modelName: cleanStr(row['Model']),
      motherboard: cleanStr(row['M Board']),
      processor: cleanStr(row['Processor']),
      processorSpeed: cleanStr(row['Speed (GHz)']),
      hdd: cleanStr(row['HDD (GB)']),
      ssd: cleanStr(row['SSD (GB)']),
      ram: cleanStr(row['RAM (GB)']),
      graphicsCardModel: cleanStr(row['Grafics Card Model']),
      graphicsCardGB: cleanStr(row['Grafics Card (GB)']),
      dateOfPurchase: parseDate(row['Date Of \nPurchase '] || row['Date Of Purchase']),
      installedOS: cleanStr(row['Installed OS']),
      licenseOS: cleanStr(row['License OS']),
      serialNoOS: cleanStr(row['Serial No. of OS']),
      antivirusLicense: cleanStr(row['Antivirus License']),
      installedSoftware: cleanStr(row['Installed Software']),
      remarks: cleanStr(row['Remarks']),
    }));
};

const cleanStr = (val: any): string =>
  val === undefined || val === null || val === 'N/A' ? '' : String(val).trim();

const parseDate = (val: any): Date | null => {
  if (!val || cleanStr(val) === '') return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export const validateCSVHeaders = (buffer: Buffer): { valid: boolean; missing: string[] } => {
  const results = Papa.parse(buffer.toString(), { header: true, preview: 1 });
  const headers = results.meta.fields || [];
  
  const required = ['Assets SL', 'Asset Type'];
  const missing = required.filter(h => !headers.includes(h));
  
  return { valid: missing.length === 0, missing };
};
