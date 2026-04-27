import { Router, Response } from 'express';
import Asset from '../models/Asset';
import MaintenanceLog from '../models/MaintenanceLog';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, limit = 20 } = req.query;
    const query: any = {};
    
    if (type && type !== 'all') {
      query.maintenanceType = type;
    }

    const logs = await MaintenanceLog.find(query)
      .sort({ performedAt: -1 })
      .limit(Number(limit));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { assetSL, maintenanceType, title, description, date, performedBy, status, cost, nextDueDate } = req.body;
    
    const technician = performedBy || req.user?.username || 'IT Team';
    
    const log = await MaintenanceLog.create({
      assetSL,
      maintenanceType,
      title,
      description,
      technician,
      performedAt: date ? new Date(date.split('.').reverse().join('-')) : new Date(),
      status: status || 'completed',
      cost: cost || 0,
      nextDueDate: nextDueDate ? new Date(nextDueDate.split('.').reverse().join('-')) : undefined
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Maintenance create error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/dust-clean', authenticate, authorize('admin', 'editor'), async (req: AuthRequest, res: Response) => {
  try {
    const { assetSL, floor } = req.body;
    const technician = req.user?.username || 'system';
    
    let assetsUpdated = 0;

    if (assetSL) {
      const asset = await Asset.findOneAndUpdate(
        { assetSL },
        { 
          lastCleaned: new Date(),
          lastModifiedBy: technician
        },
        { new: true }
      );
      if (asset) {
        await MaintenanceLog.create({
          assetSL,
          maintenanceType: 'Dust Clean',
          description: `Dust cleaning performed on ${asset.hostName || assetSL}`,
          technician,
          performedAt: new Date(),
          nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        assetsUpdated = 1;
      }
    } else if (floor) {
      const assets = await Asset.find({ unit: floor });
      for (const asset of assets) {
        asset.lastCleaned = new Date();
        asset.lastModifiedBy = technician;
        await asset.save();
        
        await MaintenanceLog.create({
          assetSL: asset.assetSL,
          maintenanceType: 'Dust Clean',
          description: `Dust cleaning performed on ${asset.hostName || assetSL} (floor: ${floor})`,
          technician,
          performedAt: new Date(),
          nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        assetsUpdated++;
      }
    }

    res.json({ message: `Updated ${assetsUpdated} assets`, count: assetsUpdated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/peripheral', authenticate, authorize('admin', 'editor'), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      assetSL, 
      peripheralType, 
      oldPeripheral, 
      newPeripheral, 
      description,
      cost 
    } = req.body;
    
    const technician = req.user?.username || 'system';

    const asset = await Asset.findOne({ assetSL });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const log = await MaintenanceLog.create({
      assetSL,
      maintenanceType: 'Peripheral Change',
      peripheralType,
      oldPeripheral,
      newPeripheral,
      description,
      technician,
      performedAt: new Date(),
      cost: cost || 0
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/schedule', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const assetsByFloor = await Asset.aggregate([
      {
        $match: {
          unit: { $in: ['10th Floor A', '10th Floor B', '6th Floor', '1st Floor', 'Server Room'] }
        }
      },
      {
        $group: {
          _id: '$unit',
          lastCleaned: { $max: '$lastCleaned' },
          totalAssets: { $sum: 1 },
          cleanedCount: {
            $sum: { $cond: [{ $gte: ['$lastCleaned', threeMonthsAgo] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const overdueFloors = assetsByFloor.filter((floor: any) => {
      return floor.lastCleaned === null || new Date(floor.lastCleaned) < threeMonthsAgo;
    });

    res.json({
      floors: assetsByFloor,
      overdueFloors,
      overdueCount: overdueFloors.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-asset/:assetSL', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await MaintenanceLog.find({ assetSL: req.params.assetSL })
      .sort({ performedAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/upcoming', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Number(days));

    const upcoming = await MaintenanceLog.find({
      nextDueDate: {
        $gte: new Date(),
        $lte: futureDate
      }
    })
    .sort({ nextDueDate: 1 })
    .limit(20)
    .lean();

    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
