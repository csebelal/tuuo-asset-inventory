import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import https from 'https';
import http from 'http';
import { config } from './config/env';
import { connectDB } from './config/db';
import User from './models/User';
import Asset from './models/Asset';
import PartChange from './models/PartChange';
import Stock from './models/Stock';
import authRouter from './routes/auth.routes';
import assetsRouter from './routes/assets.routes';
import dashboardRouter from './routes/dashboard.routes';
import importRouter from './routes/import.routes';
import reportsRouter from './routes/reports.routes';
import maintenanceRouter from './routes/maintenance.routes';
import partsRouter from './routes/parts.routes';
import stockRouter from './routes/stock.routes';
import prtgRouter from './routes/prtg.routes';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/assets', assetsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/import', importRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/maintenance', maintenanceRouter);
app.use('/api/v1/parts', partsRouter);
app.use('/api/v1/stock', stockRouter);
app.use('/api/v1/prtg', prtgRouter);

// Proxy route for network map - fetches from local network and serves to frontend
app.get('/api/v1/network-map-proxy', async (req: Request, res: Response) => {
  try {
    const targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ message: 'URL parameter is required' });
    }

    // Validate URL to prevent SSRF attacks
    const urlObj = new URL(targetUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return res.status(400).json({ message: 'Invalid protocol' });
    }

    const isHttps = urlObj.protocol === 'https:';
    const agent = isHttps 
      ? new https.Agent({ rejectUnauthorized: false })
      : new http.Agent();

    const response = await axios.get(targetUrl, {
      timeout: 30000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/png,image/jpeg,*/*;q=0.8',
      },
      httpAgent: agent,
      httpsAgent: isHttps ? agent : undefined
    });

    console.log('Network map fetched successfully, length:', response.data.length);
    const contentType = response.headers['content-type'] || 'text/html';
    res.set('Content-Type', contentType);
    if (contentType.includes('image')) {
      res.send(Buffer.from(response.data));
    } else {
      res.send(Buffer.from(response.data));
    }
  } catch (error: any) {
    console.error('Network map proxy error:', error.message, error.code);
    res.status(500).json({ 
      message: 'Failed to fetch network map',
      error: error.message,
      code: error.code
    });
  }
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@tuuo.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default admin user created (admin/admin123)');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

const seedLastCleaned = async () => {
  try {
    const lastCleanedDate = new Date('2026-01-04');
    const floorsToUpdate = ['10th Floor A', '10th Floor B', '6th Floor'];
    
    for (const floor of floorsToUpdate) {
      const result = await Asset.updateMany(
        { unit: floor, lastCleaned: null },
        { $set: { lastCleaned: lastCleanedDate } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Set lastCleaned for ${result.modifiedCount} assets in ${floor}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding lastCleaned:', error);
  }
};

const seedParts = async () => {
  try {
    const count = await PartChange.countDocuments();
    if (count > 0) {
      return;
    }
    
    const defaultRecords = [
      { assetSL: 'TU-033', assetHostname: 'TUD28', department: 'Team Leader', floor: '10th Floor A', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 450W', oldCondition: 'damaged', newBrand: 'Corsair', newModel: 'CV550 550W', newSpec: '550W 80+ Bronze', reason: 'broken', changeDate: '06.05.2025', changedBy: 'IT Team', cost: 2500, invoiceNo: '', notes: 'Power supply replace 06.05.2025' },
      { assetSL: 'TU-019', assetHostname: 'TUD14', department: 'Team Leader', floor: '10th Floor A', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 450W', oldCondition: 'damaged', newBrand: 'Corsair', newModel: 'CV550 550W', newSpec: '550W 80+ Bronze', reason: 'broken', changeDate: '05.05.2025', changedBy: 'IT Team', cost: 2500, invoiceNo: '', notes: 'Power Supply Change 05.05.2025' },
      { assetSL: 'TU-057', assetHostname: 'TUD54', department: 'Designer', floor: '6th Floor', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 450W', oldCondition: 'damaged', newBrand: 'Corsair', newModel: 'CV550 550W', newSpec: '550W 80+ Bronze', reason: 'broken', changeDate: '07.08.2025', changedBy: 'IT Team', cost: 2500, invoiceNo: '', notes: 'Power supply change 07.08.2025' },
      { assetSL: 'TU-042', assetHostname: 'TUD37', department: 'Designer', floor: '10th Floor A', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 400W', oldCondition: 'damaged', newBrand: 'Unknown', newModel: 'Replacement 500W', newSpec: '500W', reason: 'broken', changeDate: '23.10.2024', changedBy: 'IT Team', cost: 2000, invoiceNo: '', notes: 'Power supply change 23.10.24' },
      { assetSL: 'TU-045', assetHostname: 'TUD40', department: 'QC', floor: '10th Floor B', componentType: 'psu', oldBrand: 'Unknown', oldModel: 'Generic 400W', oldCondition: 'damaged', newBrand: 'Unknown', newModel: 'Replacement 500W', newSpec: '500W', reason: 'broken', changeDate: '23.10.2024', changedBy: 'IT Team', cost: 2000, invoiceNo: '', notes: 'Power supply change 23.10.24' },
      { assetSL: 'TU-068', assetHostname: 'TUD65', department: 'QC', floor: '6th Floor', componentType: 'ram', oldBrand: 'Unknown', oldModel: 'DDR4 32GB', oldCondition: 'damaged', newBrand: 'Unknown', newModel: 'DDR4 32GB', newSpec: '32GB DDR4', reason: 'broken', changeDate: '2025', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'RAM Issue solve — reseated' },
      { assetSL: 'TU-006', assetHostname: 'Arif', department: 'AGM', floor: '6th Floor', componentType: 'keyboard', oldBrand: 'A4Tech', oldModel: 'KRS-83', oldCondition: 'worn', newBrand: 'A4Tech', newModel: 'KR-85', newSpec: 'Wired USB Membrane', reason: 'worn_out', changeDate: '01.2026', changedBy: 'IT Team', cost: 500, invoiceNo: '', notes: 'Keys faded — replaced' },
      { assetSL: 'TU-016', assetHostname: 'TUD11', department: 'Team Leader', floor: '10th Floor A', componentType: 'mouse', oldBrand: 'Logitech', oldModel: 'M90', oldCondition: 'damaged', newBrand: 'Logitech', newModel: 'M100', newSpec: 'Wired USB Optical', reason: 'broken', changeDate: '11.2025', changedBy: 'IT Team', cost: 600, invoiceNo: '', notes: 'Scroll wheel broken' },
      { assetSL: 'TU-024', assetHostname: 'TU-024', department: '', floor: '', componentType: 'ssd', oldBrand: 'Unknown', oldModel: 'Unknown SSD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '256GB SSD', newSpec: '256GB SSD', reason: 'upgrade', changeDate: '14.11.2024', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'SSD installed 14.11.2024' },
      { assetSL: 'TU-025', assetHostname: 'TU-025', department: '', floor: '', componentType: 'ssd', oldBrand: 'Unknown', oldModel: 'Unknown SSD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '256GB SSD', newSpec: '256GB SSD', reason: 'broken', changeDate: '14.11.2024', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'SSD Dead — replaced 14.11.2024' },
      { assetSL: 'TU-028', assetHostname: 'TU-028', department: '', floor: '', componentType: 'ssd', oldBrand: 'Unknown', oldModel: 'Unknown SSD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '256GB SSD', newSpec: '256GB SSD', reason: 'upgrade', changeDate: '14.11.2024', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'SSD installed 14.11.2024' },
      { assetSL: 'TU-030', assetHostname: 'TU-030', department: '', floor: '', componentType: 'ssd', oldBrand: 'Unknown', oldModel: 'Unknown SSD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '256GB SSD', newSpec: '256GB SSD', reason: 'broken', changeDate: '14.11.2024', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'SSD Dead — replaced 14.11.2024' },
      { assetSL: 'TU-038', assetHostname: 'TU-038', department: '', floor: '', componentType: 'ssd', oldBrand: 'Unknown', oldModel: 'Unknown SSD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '256GB SSD', newSpec: '256GB SSD', reason: 'upgrade', changeDate: '14.11.2024', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'SSD installed 14.11.2024' },
      { assetSL: 'TU-047', assetHostname: 'TU-047', department: '', floor: '', componentType: 'ssd', oldBrand: 'Unknown', oldModel: 'Unknown SSD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '256GB SSD', newSpec: '256GB SSD', reason: 'upgrade', changeDate: '14.11.2024', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'SSD installed 14.11.2024' },
      { assetSL: 'TU-013', assetHostname: 'TU-013', department: '', floor: '', componentType: 'hdd', oldBrand: 'Unknown', oldModel: 'Unknown HDD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '2TB HDD', newSpec: '2TB HDD', reason: 'upgrade', changeDate: '19.02.2025', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'HDD installed 19.02.2025' },
      { assetSL: 'TU-015', assetHostname: 'TU-015', department: '', floor: '', componentType: 'hdd', oldBrand: 'Unknown', oldModel: 'Unknown HDD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '1TB HDD', newSpec: '1TB HDD', reason: 'upgrade', changeDate: '19.02.2025', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'HDD installed 19.02.2025' },
      { assetSL: 'TU-010', assetHostname: 'TU-010', department: '', floor: '', componentType: 'hdd', oldBrand: 'Unknown', oldModel: 'Unknown HDD', oldCondition: 'damaged', newBrand: 'Unknown', newModel: '1TB HDD', newSpec: '1TB HDD', reason: 'upgrade', changeDate: '05.05.2025', changedBy: 'IT Team', cost: 0, invoiceNo: '', notes: 'HDD installed 05.05.2025' },
      { assetSL: 'TU-071', assetHostname: 'TU-071', department: 'Server Room', floor: '10th Floor A', componentType: 'ups', oldBrand: 'Unknown', oldModel: 'Generic UPS', oldCondition: 'damaged', newBrand: 'APC', newModel: 'BR1500G', newSpec: '1500VA/900W', reason: 'broken', changeDate: '15.03.2025', changedBy: 'IT Team', cost: 8500, invoiceNo: '', notes: 'UPS battery replaced - Server Room' },
      { assetSL: 'TU-072', assetHostname: 'TU-072', department: 'Server Room', floor: '10th Floor A', componentType: 'ups', oldBrand: 'Unknown', oldModel: 'Generic UPS', oldCondition: 'damaged', newBrand: 'APC', newModel: 'BR1000G', newSpec: '1000VA/600W', reason: 'broken', changeDate: '20.03.2025', changedBy: 'IT Team', cost: 6500, invoiceNo: '', notes: 'UPS battery replaced - Server Room' }
    ];

    await PartChange.insertMany(defaultRecords);
    console.log(`✅ Seeded parts data (${defaultRecords.length} records)`);
  } catch (error) {
    console.error('❌ Error seeding parts:', error);
  }
};

const seedStock = async () => {
  try {
    const count = await Stock.countDocuments();
    if (count > 0) {
      console.log(`✅ Stock data already exists (${count} records), skipping seed`);
      return;
    }
    const now = new Date();
    const stock = [
      {
        itemType: 'mouse', quantity: 40, location: 'Store', supplier: 'VendorA', costPerUnit: 150,
        boughtDate: now, expiryDate: new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()),
        notes: 'Initial batch'
      },
      {
        itemType: 'keyboard', quantity: 40, location: 'Store', supplier: 'VendorB', costPerUnit: 350,
        boughtDate: now, expiryDate: new Date(now.getFullYear() + 3, now.getMonth(), now.getDate()),
        notes: 'Initial batch'
      },
      {
        itemType: 'ups', quantity: 15, location: 'Store', supplier: 'VendorUPS', costPerUnit: 6000,
        boughtDate: now, expiryDate: new Date(now.getFullYear() + 5, now.getMonth(), now.getDate()),
        notes: 'Initial batch'
      }
    ];
    await Stock.insertMany(stock);
    console.log(`✅ Seeded stock data (${stock.length} records)`);
  } catch (error) {
    console.error('❌ Error seeding stock:', error);
  }
};
  
const seedAssets = async () => {
  try {
    const Asset = (await import('./models/Asset')).default;
    
    const assetsToUpsert = [
      { assetSL: 'TU-MON-001', assetType: 'Monitor', hostName: 'Dell 24"', modelName: 'Dell P2419H', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2026-05-10'), warrantyProvider: 'Dell', warrantyType: 'manufacturer', isWarrantyActive: true },
      { assetSL: 'TU-MON-002', assetType: 'Monitor', hostName: 'Dell 24"', modelName: 'Dell P2419H', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2026-05-20'), warrantyProvider: 'Dell', warrantyType: 'manufacturer', isWarrantyActive: true },
      { assetSL: 'TU-MON-003', assetType: 'Monitor', hostName: 'LG 22"', modelName: 'LG 22MP410', condition: 'fair', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2026-04-15'), warrantyProvider: 'LG', warrantyType: 'basic', isWarrantyActive: true },
      { assetSL: 'TU-MON-004', assetType: 'Monitor', hostName: 'Samsung 24"', modelName: 'S24F350', condition: 'good', storeLocation: 'Store Room F 06th', status: 'In Store - Good', expiryDate: new Date('2027-03-10'), warrantyProvider: 'Samsung', warrantyType: 'manufacturer', isWarrantyActive: true },
      { assetSL: 'TU-MON-005', assetType: 'Monitor', hostName: 'Acer 21"', modelName: 'Acer V226HQL', condition: 'poor', storeLocation: 'Store Room F 10th', status: 'In Store - Bad', expiryDate: new Date('2024-01-15'), warrantyProvider: 'Acer', warrantyType: 'basic', isWarrantyActive: false },
      { assetSL: 'TU-DES-001', assetType: 'Desktop', hostName: 'Dell-Optiplex-7090', modelName: 'Dell OptiPlex 7090', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2026-08-20'), warrantyProvider: 'Dell', warrantyType: 'extended', isWarrantyActive: true, warrantyCost: 2500 },
      { assetSL: 'TU-DES-002', assetType: 'Desktop', hostName: 'HP-ProDesk-600', modelName: 'HP ProDesk 600 G7', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2026-05-25'), warrantyProvider: 'HP', warrantyType: 'manufacturer', isWarrantyActive: true, warrantyCost: 1800 },
      { assetSL: 'TU-DES-003', assetType: 'Desktop', hostName: 'Lenovo-ThinkCentre', modelName: 'Lenovo ThinkCentre M70q', condition: 'good', storeLocation: 'Store Room F 06th', status: 'In Store - Good', expiryDate: new Date('2026-05-05'), warrantyProvider: 'Lenovo', warrantyType: 'manufacturer', isWarrantyActive: true, warrantyCost: 2000 },
      { assetSL: 'TU-DES-004', assetType: 'Desktop', hostName: 'Dell-Optiplex-3080', modelName: 'Dell OptiPlex 3080', condition: 'fair', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2027-07-30'), warrantyProvider: 'Dell', warrantyType: 'basic', isWarrantyActive: true, warrantyCost: 1200 },
      { assetSL: 'TU-DES-005', assetType: 'Desktop', hostName: 'HP-Compaq', modelName: 'HP Compaq 4000 Pro', condition: 'damaged', storeLocation: 'Store Room F 10th', status: 'In Store - Bad', expiryDate: new Date('2023-11-10'), warrantyProvider: 'HP', warrantyType: 'basic', isWarrantyActive: false },
      { assetSL: 'TU-UPS-001', assetType: 'UPS', hostName: 'APC-600VA', modelName: 'APC Back-UPS 600VA', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2026-05-12'), warrantyProvider: 'APC', warrantyType: 'manufacturer', isWarrantyActive: true, warrantyCost: 3500 },
      { assetSL: 'TU-UPS-002', assetType: 'UPS', hostName: 'APC-1000VA', modelName: 'APC Smart-UPS 1000VA', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good', expiryDate: new Date('2027-09-05'), warrantyProvider: 'APC', warrantyType: 'extended', isWarrantyActive: true, warrantyCost: 8500 },
      { assetSL: 'TU-UPS-003', assetType: 'UPS', hostName: 'Eaton-5S', modelName: 'Eaton 5S 650VA', condition: 'fair', storeLocation: 'Store Room F 06th', status: 'In Store - Good', expiryDate: new Date('2026-04-28'), warrantyProvider: 'Eaton', warrantyType: 'manufacturer', isWarrantyActive: true, warrantyCost: 4200 },
      { assetSL: 'TU-RAM-001', assetType: 'RAM', hostName: 'Kingston-8GB', modelName: 'Kingston 8GB DDR4', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good' },
      { assetSL: 'TU-RAM-002', assetType: 'RAM', hostName: 'Samsung-16GB', modelName: 'Samsung 16GB DDR4', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good' },
      { assetSL: 'TU-HDD-001', assetType: 'HDD', hostName: 'WD-1TB', modelName: 'WD Blue 1TB', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good' },
      { assetSL: 'TU-HDD-002', assetType: 'HDD', hostName: 'Seagate-2TB', modelName: 'Seagate Barracuda 2TB', condition: 'good', storeLocation: 'Store Room F 06th', status: 'In Store - Good' },
      { assetSL: 'TU-MB-001', assetType: 'Motherboard', hostName: 'ASUS-H110', modelName: 'ASUS H110M-K', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good' },
      { assetSL: 'TU-MB-002', assetType: 'Motherboard', hostName: 'Gigabyte-B360', modelName: 'Gigabyte B360M DS3H', condition: 'fair', storeLocation: 'Store Room F 10th', status: 'In Store - Good' },
      { assetSL: 'TU-CASE-001', assetType: 'Desktop Casing', hostName: 'Dell-OptiPlex-Case', modelName: 'Dell OptiPlex 7090 Tower', condition: 'good', storeLocation: 'Store Room F 10th', status: 'In Store - Good' },
    ];
    
    for (const asset of assetsToUpsert) {
      await Asset.findOneAndUpdate(
        { assetSL: asset.assetSL },
        { $set: asset },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Asset data seeded/updated (${assetsToUpsert.length} records)`);
  } catch (error) {
    console.error('❌ Error seeding assets:', error);
  }
};

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  await seedLastCleaned();
  await seedParts();
  await seedStock();
  await seedAssets();
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
  });
};

startServer();
