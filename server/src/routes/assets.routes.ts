import { Router, Response } from 'express';
import Asset from '../models/Asset';
import ActivityLog from '../models/ActivityLog';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      assetType,
      department,
      unit,
      status,
      iaGroup,
      search,
      warranty,
      sortBy = 'assetSL',
      sortOrder = 'asc'
    } = req.query;

    const query: any = {};

    if (assetType) query.assetType = assetType;
    if (department) query.department = department;
    if (unit) query.unit = unit;
    if (status) {
      const statusArr = status.toString().split(',');
      query.status = { $in: statusArr };
    }
    if (iaGroup) query.iaGroup = iaGroup;
    if (warranty === 'expiring') {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);
      query.expiryDate = { $gte: now, $lte: futureDate };
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [assets, total] = await Promise.all([
      Asset.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Asset.countDocuments(query)
    ]);

    res.json({
      assets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const asset = await Asset.findOne({ assetSL: req.params.id });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, authorize('admin', 'editor'), async (req: AuthRequest, res: Response) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();

    await ActivityLog.create({
      action: 'CREATE',
      assetSL: asset.assetSL,
      performedBy: req.user?.username || 'system',
      details: `Created asset ${asset.assetSL}`
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, authorize('admin', 'editor'), async (req: AuthRequest, res: Response) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { assetSL: req.params.id },
      { ...req.body, lastModifiedBy: req.user?.username },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await ActivityLog.create({
      action: 'UPDATE',
      assetSL: asset.assetSL,
      performedBy: req.user?.username || 'system',
      details: `Updated asset ${asset.assetSL}`
    });

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const asset = await Asset.findOneAndDelete({ assetSL: req.params.id });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await ActivityLog.create({
      action: 'DELETE',
      assetSL: req.params.id,
      performedBy: req.user?.username || 'system',
      details: `Deleted asset ${req.params.id}`
    });

    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ assets: [] });
    }

    const assets = await Asset.find({
      $or: [
        { assetSL: { $regex: q, $options: 'i' } },
        { hostName: { $regex: q, $options: 'i' } },
        { employeeName: { $regex: q, $options: 'i' } },
        { ipAddress: { $regex: q, $options: 'i' } },
        { serialNoMAC: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json({ assets });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/assign', authenticate, authorize('admin', 'editor'), async (req: AuthRequest, res: Response) => {
  try {
    const { assignedTo, notes } = req.body;
    const asset = await Asset.findOne({ assetSL: req.params.id });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const previousAssignee = asset.assignedTo;
    const now = new Date();

    asset.assignedTo = assignedTo;
    asset.assignedDate = now;
    asset.status = 'With user';

    if (!asset.assignmentHistory) {
      asset.assignmentHistory = [];
    }

    if (previousAssignee && previousAssignee !== assignedTo) {
      asset.assignmentHistory.push({
        assignedTo: previousAssignee,
        assignedDate: asset.assignedDate || now,
        returnedDate: now,
        notes: 'Transferred to new user'
      });
    }

    asset.assignmentHistory.push({
      assignedTo,
      assignedDate: now,
      notes: notes || ''
    });

    asset.lastModifiedBy = req.user?.username || 'system';
    await asset.save();

    await ActivityLog.create({
      action: 'ASSIGN',
      assetSL: asset.assetSL,
      performedBy: req.user?.username || 'system',
      details: `Assigned asset to ${assignedTo}`
    });

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/unassign', authenticate, authorize('admin', 'editor'), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const asset = await Asset.findOne({ assetSL: req.params.id });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const previousAssignee = asset.assignedTo;
    
    if (previousAssignee && asset.assignedDate) {
      if (!asset.assignmentHistory) {
        asset.assignmentHistory = [];
      }
      asset.assignmentHistory.push({
        assignedTo: previousAssignee,
        assignedDate: asset.assignedDate,
        returnedDate: new Date(),
        notes: reason || 'Returned'
      });
    }

    asset.assignedTo = '';
    asset.assignedDate = undefined;
    asset.status = 'In Store';
    asset.lastModifiedBy = req.user?.username || 'system';
    await asset.save();

    await ActivityLog.create({
      action: 'UNASSIGN',
      assetSL: asset.assetSL,
      performedBy: req.user?.username || 'system',
      details: `Unassigned asset from ${previousAssignee}`
    });

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/warranty/expiring', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + Number(days));

    console.log('Searching for warranty expiring:', { now, futureDate, days });

    const assets = await Asset.find({
      expiryDate: {
        $gte: now,
        $lte: futureDate
      }
    }).sort({ expiryDate: 1 });

    console.log('Found expiring warranty assets:', assets.length);

    res.json(assets);
  } catch (error) {
    console.error('Warranty expiring error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
