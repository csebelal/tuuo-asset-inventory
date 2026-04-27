import { Router, Response } from 'express';
import multer from 'multer';
import Asset from '../models/Asset';
import ActivityLog from '../models/ActivityLog';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.middleware';
import { parseAssetCSV, validateCSVHeaders } from '../services/csv.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/csv', authenticate, authorize('admin', 'editor'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const headerValidation = validateCSVHeaders(req.file.buffer);
    if (!headerValidation.valid) {
      return res.status(400).json({ 
        message: 'Invalid CSV format', 
        missing: headerValidation.missing 
      });
    }

    const assets = parseAssetCSV(req.file.buffer);
    
    if (assets.length === 0) {
      return res.status(400).json({ message: 'No valid assets found in CSV' });
    }

    const ipMap = new Map<string, string[]>();
    assets.forEach(a => {
      if (a.ipAddress) {
        const existing = ipMap.get(a.ipAddress) || [];
        existing.push(a.assetSL!);
        ipMap.set(a.ipAddress, existing);
      }
    });

    const duplicateIPs = Array.from(ipMap.entries())
      .filter(([_, ids]) => ids.length > 1)
      .reduce((acc, [ip, ids]) => ({ ...acc, [ip]: ids }), {});

    let inserted = 0, updated = 0;
    
    for (const asset of assets) {
      const existing = await Asset.findOne({ assetSL: asset.assetSL });
      if (existing) {
        await Asset.updateOne({ assetSL: asset.assetSL }, asset);
        updated++;
      } else {
        await Asset.create(asset);
        inserted++;
      }
    }

    await ActivityLog.create({
      action: 'IMPORT',
      performedBy: req.user?.username || 'system',
      details: `Imported CSV: ${inserted} inserted, ${updated} updated`
    });

    res.json({
      message: 'Import completed',
      inserted,
      updated,
      total: assets.length,
      duplicateIPs: Object.keys(duplicateIPs).length > 0 ? duplicateIPs : undefined
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed' });
  }
});

router.get('/preview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assets = await Asset.find().limit(10);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
