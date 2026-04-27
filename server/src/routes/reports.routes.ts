import { Router, Response } from 'express';
import Asset from '../models/Asset';
import ActivityLog from '../models/ActivityLog';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/csv', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { department, status, type, warranty } = req.query;
    const filter: any = {};
    
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (type) filter.assetType = type;
    if (warranty === 'expiring') {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      filter.expiryDate = { $lte: thirtyDays, $gte: new Date() };
    } else if (warranty === 'expired') {
      filter.expiryDate = { $lt: new Date() };
    }
    
    const assets = await Asset.find(filter);
    
    const headers = [
      'assetSL', 'assetType', 'hostName', 'ipAddress', 'iaGroup', 'status',
      'employeeName', 'adName', 'department', 'unit', 'serialNoMAC', 
      'modelName', 'motherboard', 'processor', 'processorSpeed', 
      'hdd', 'ssd', 'ram', 'graphicsCardModel', 'graphicsCardGB',
      'dateOfPurchase', 'buyDate', 'expiryDate', 'expiryLeadDays',
      'installedOS', 'licenseOS', 'serialNoOS', 
      'antivirusLicense', 'installedSoftware',
      'condition', 'storeLocation',
      'warrantyProvider', 'warrantyType', 'warrantyCost', 'isWarrantyActive',
      'assignedTo', 'assignedDate',
      'lastModifiedBy', 'createdAt', 'updatedAt', 'remarks'
    ];

    const csvRows = [headers.join(',')];
    
    assets.forEach(asset => {
      const row = headers.map(h => {
        const val = (asset as any)[h];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') 
          ? `"${str}"` 
          : str;
      });
      csvRows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assets_export.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/json', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assets = await Asset.find({});
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=assets_export.json');
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/activity', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/warranty', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);
    
    const [expiring, expired, valid] = await Promise.all([
      Asset.find({ expiryDate: { $gte: now, $lte: thirtyDays } }).sort({ expiryDate: 1 }),
      Asset.find({ expiryDate: { $lt: now } }).sort({ expiryDate: -1 }),
      Asset.find({ expiryDate: { $gt: thirtyDays } })
    ]);
    
    res.json({ expiring, expired, valid, summary: { expiring: expiring.length, expired: expired.length, valid: valid.length } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/hardware', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assets = await Asset.find({}).select('assetSL assetType department unit processor ram ssd hdd graphicsCardModel');
    const summary: any = {};
    
    assets.forEach(asset => {
      const dept = asset.department || 'Unassigned';
      if (!summary[dept]) {
        summary[dept] = { total: 0, processors: {}, rams: {}, ssds: {}, hdds: {} };
      }
      summary[dept].total++;
      
      const proc = asset.processor || 'Unknown';
      summary[dept].processors[proc] = (summary[dept].processors[proc] || 0) + 1;
      
      const ram = asset.ram || 'Unknown';
      summary[dept].rams[ram] = (summary[dept].rams[ram] || 0) + 1;
    });
    
    res.json({ assets, summary });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/assignment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [assigned, unassigned] = await Promise.all([
      Asset.find({ assignedTo: { $exists: true, $ne: '' } }).sort({ assignedDate: -1 }),
      Asset.find({ $or: [{ assignedTo: { $exists: false } }, { assignedTo: '' }] })
    ]);
    
    res.json({ assigned, unassigned, summary: { assigned: assigned.length, unassigned: unassigned.length } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [total, byType, byStatus, byDept, byFloor] = await Promise.all([
      Asset.countDocuments(),
      Asset.aggregate([{ $group: { _id: '$assetType', count: { $sum: 1 } } }]),
      Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Asset.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
      Asset.aggregate([{ $group: { _id: '$unit', count: { $sum: 1 } } }])
    ]);
    
    res.json({ total, byType, byStatus, byDept, byFloor });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
