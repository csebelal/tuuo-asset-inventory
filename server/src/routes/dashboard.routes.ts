import { Router, Response } from 'express';
import Asset from '../models/Asset';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalAssets,
      byType,
      byStatus,
      byAccess,
      byFloor,
      byDepartment,
      incompleteAssets,
      byOS
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.aggregate([
        { $group: { _id: '$assetType', count: { $sum: 1 } } }
      ]),
      Asset.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Asset.aggregate([
        { $group: { _id: '$iaGroup', count: { $sum: 1 } } }
      ]),
      Asset.aggregate([
        { $group: { _id: '$unit', count: { $sum: 1 } } }
      ]),
      Asset.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      Asset.countDocuments({
        $or: [
          { processor: '' },
          { ram: '' },
          { model: '' }
        ]
      }),
      Asset.aggregate([
        { $group: { _id: '$installedOS', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalAssets,
      byType: byType.reduce((acc: any, item: any) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      byStatus: byStatus.reduce((acc: any, item: any) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      byAccess: byAccess.reduce((acc: any, item: any) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      byFloor: byFloor.reduce((acc: any, item: any) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      byDepartment: byDepartment.reduce((acc: any, item: any) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      incompleteAssets,
      byOS: byOS.reduce((acc: any, item: any) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-type', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$assetType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-department', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-floor', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$unit', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-os', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$installedOS', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-access', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$iaGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-ram', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$ram', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-processor', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = await Asset.aggregate([
      { $group: { _id: '$processor', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/incomplete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assets = await Asset.find({
      $or: [
        { processor: '' },
        { ram: '' },
        { model: '' }
      ]
    });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/alerts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const upsNeeded = await Asset.find({
      remarks: { $regex: /UPS/i }
    }).select('assetSL hostName employeeName department remarks');
    
    res.json(upsNeeded);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
