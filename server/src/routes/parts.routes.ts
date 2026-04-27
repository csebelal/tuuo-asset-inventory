import { Router, Request, Response } from 'express';
import PartChange from '../models/PartChange';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { assetSL, componentType, department } = req.query;
    const filter: any = {};
    
    if (assetSL) filter.assetSL = assetSL;
    if (componentType) filter.componentType = componentType;
    if (department) filter.department = department;

    const records = await PartChange.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const record = await PartChange.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const record = new PartChange(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const record = await PartChange.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const record = await PartChange.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-asset/:assetSL', authenticate, async (req: Request, res: Response) => {
  try {
    const records = await PartChange.find({ assetSL: req.params.assetSL }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/by-component/:componentType', authenticate, async (req: Request, res: Response) => {
  try {
    const records = await PartChange.find({ componentType: req.params.componentType }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset', authenticate, async (req: Request, res: Response) => {
  try {
    await PartChange.deleteMany({});
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
    res.json({ message: 'Parts data reset successfully', count: defaultRecords.length });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/seed', async (req: Request, res: Response) => {
  try {
    const count = await PartChange.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Parts data already seeded', count });
    }

    const defaultRecords = [
      {
        assetSL: 'TU-033',
        assetHostname: 'TUD28',
        department: 'Team Leader',
        floor: '10th Floor A',
        componentType: 'psu',
        oldBrand: 'Unknown',
        oldModel: 'Generic 450W',
        oldCondition: 'damaged',
        newBrand: 'Corsair',
        newModel: 'CV550 550W',
        newSpec: '550W 80+ Bronze',
        reason: 'broken',
        changeDate: '06.05.2025',
        changedBy: 'IT Team',
        cost: 2500,
        invoiceNo: '',
        notes: 'Power supply replace 06.05.2025'
      },
      {
        assetSL: 'TU-019',
        assetHostname: 'TUD14',
        department: 'Team Leader',
        floor: '10th Floor A',
        componentType: 'psu',
        oldBrand: 'Unknown',
        oldModel: 'Generic 450W',
        oldCondition: 'damaged',
        newBrand: 'Corsair',
        newModel: 'CV550 550W',
        newSpec: '550W 80+ Bronze',
        reason: 'broken',
        changeDate: '05.05.2025',
        changedBy: 'IT Team',
        cost: 2500,
        invoiceNo: '',
        notes: 'Power Supply Change 05.05.2025'
      },
      {
        assetSL: 'TU-057',
        assetHostname: 'TUD54',
        department: 'Designer',
        floor: '6th Floor',
        componentType: 'psu',
        oldBrand: 'Unknown',
        oldModel: 'Generic 450W',
        oldCondition: 'damaged',
        newBrand: 'Corsair',
        newModel: 'CV550 550W',
        newSpec: '550W 80+ Bronze',
        reason: 'broken',
        changeDate: '07.08.2025',
        changedBy: 'IT Team',
        cost: 2500,
        invoiceNo: '',
        notes: 'Power supply change 07.08.2025'
      },
      {
        assetSL: 'TU-042',
        assetHostname: 'TUD37',
        department: 'Designer',
        floor: '10th Floor A',
        componentType: 'psu',
        oldBrand: 'Unknown',
        oldModel: 'Generic 400W',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: 'Replacement 500W',
        newSpec: '500W',
        reason: 'broken',
        changeDate: '23.10.2024',
        changedBy: 'IT Team',
        cost: 2000,
        invoiceNo: '',
        notes: 'Power supply change 23.10.24'
      },
      {
        assetSL: 'TU-045',
        assetHostname: 'TUD40',
        department: 'QC',
        floor: '10th Floor B',
        componentType: 'psu',
        oldBrand: 'Unknown',
        oldModel: 'Generic 400W',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: 'Replacement 500W',
        newSpec: '500W',
        reason: 'broken',
        changeDate: '23.10.2024',
        changedBy: 'IT Team',
        cost: 2000,
        invoiceNo: '',
        notes: 'Power supply change 23.10.24'
      },
      {
        assetSL: 'TU-068',
        assetHostname: 'TUD65',
        department: 'QC',
        floor: '6th Floor',
        componentType: 'ram',
        oldBrand: 'Unknown',
        oldModel: 'DDR4 32GB',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: 'DDR4 32GB',
        newSpec: '32GB DDR4',
        reason: 'broken',
        changeDate: '2025',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'RAM Issue solve — reseated'
      },
      {
        assetSL: 'TU-006',
        assetHostname: 'Arif',
        department: 'AGM',
        floor: '6th Floor',
        componentType: 'keyboard',
        oldBrand: 'A4Tech',
        oldModel: 'KRS-83',
        oldCondition: 'worn',
        newBrand: 'A4Tech',
        newModel: 'KR-85',
        newSpec: 'Wired USB Membrane',
        reason: 'worn_out',
        changeDate: '01.2026',
        changedBy: 'IT Team',
        cost: 500,
        invoiceNo: '',
        notes: 'Keys faded — replaced'
      },
      {
        assetSL: 'TU-016',
        assetHostname: 'TUD11',
        department: 'Team Leader',
        floor: '10th Floor A',
        componentType: 'mouse',
        oldBrand: 'Logitech',
        oldModel: 'M90',
        oldCondition: 'damaged',
        newBrand: 'Logitech',
        newModel: 'M100',
        newSpec: 'Wired USB Optical',
        reason: 'broken',
        changeDate: '11.2025',
        changedBy: 'IT Team',
        cost: 600,
        invoiceNo: '',
        notes: 'Scroll wheel broken'
      },
      {
        assetSL: 'TU-024',
        assetHostname: 'TU-024',
        department: '',
        floor: '',
        componentType: 'ssd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown SSD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '256GB SSD',
        newSpec: '256GB SSD',
        reason: 'upgrade',
        changeDate: '14.11.2024',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'SSD installed 14.11.2024'
      },
      {
        assetSL: 'TU-025',
        assetHostname: 'TU-025',
        department: '',
        floor: '',
        componentType: 'ssd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown SSD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '256GB SSD',
        newSpec: '256GB SSD',
        reason: 'broken',
        changeDate: '14.11.2024',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'SSD Dead — replaced 14.11.2024'
      },
      {
        assetSL: 'TU-028',
        assetHostname: 'TU-028',
        department: '',
        floor: '',
        componentType: 'ssd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown SSD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '256GB SSD',
        newSpec: '256GB SSD',
        reason: 'upgrade',
        changeDate: '14.11.2024',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'SSD installed 14.11.2024'
      },
      {
        assetSL: 'TU-030',
        assetHostname: 'TU-030',
        department: '',
        floor: '',
        componentType: 'ssd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown SSD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '256GB SSD',
        newSpec: '256GB SSD',
        reason: 'broken',
        changeDate: '14.11.2024',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'SSD Dead — replaced 14.11.2024'
      },
      {
        assetSL: 'TU-038',
        assetHostname: 'TU-038',
        department: '',
        floor: '',
        componentType: 'ssd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown SSD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '256GB SSD',
        newSpec: '256GB SSD',
        reason: 'upgrade',
        changeDate: '14.11.2024',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'SSD installed 14.11.2024'
      },
      {
        assetSL: 'TU-047',
        assetHostname: 'TU-047',
        department: '',
        floor: '',
        componentType: 'ssd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown SSD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '256GB SSD',
        newSpec: '256GB SSD',
        reason: 'upgrade',
        changeDate: '14.11.2024',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'SSD installed 14.11.2024'
      },
      {
        assetSL: 'TU-013',
        assetHostname: 'TU-013',
        department: '',
        floor: '',
        componentType: 'hdd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown HDD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '2TB HDD',
        newSpec: '2TB HDD',
        reason: 'upgrade',
        changeDate: '19.02.2025',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'HDD installed 19.02.2025'
      },
      {
        assetSL: 'TU-015',
        assetHostname: 'TU-015',
        department: '',
        floor: '',
        componentType: 'hdd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown HDD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '1TB HDD',
        newSpec: '1TB HDD',
        reason: 'upgrade',
        changeDate: '19.02.2025',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'HDD installed 19.02.2025'
      },
      {
        assetSL: 'TU-010',
        assetHostname: 'TU-010',
        department: '',
        floor: '',
        componentType: 'hdd',
        oldBrand: 'Unknown',
        oldModel: 'Unknown HDD',
        oldCondition: 'damaged',
        newBrand: 'Unknown',
        newModel: '1TB HDD',
        newSpec: '1TB HDD',
        reason: 'upgrade',
        changeDate: '05.05.2025',
        changedBy: 'IT Team',
        cost: 0,
        invoiceNo: '',
        notes: 'HDD installed 05.05.2025'
      },
      {
        assetSL: 'TU-071',
        assetHostname: 'TU-071',
        department: 'Server Room',
        floor: '10th Floor A',
        componentType: 'ups',
        oldBrand: 'Unknown',
        oldModel: 'Generic UPS',
        oldCondition: 'damaged',
        newBrand: 'APC',
        newModel: 'BR1500G',
        newSpec: '1500VA/900W',
        reason: 'broken',
        changeDate: '15.03.2025',
        changedBy: 'IT Team',
        cost: 8500,
        invoiceNo: '',
        notes: 'UPS battery replaced - Server Room'
      },
      {
        assetSL: 'TU-072',
        assetHostname: 'TU-072',
        department: 'Server Room',
        floor: '10th Floor A',
        componentType: 'ups',
        oldBrand: 'Unknown',
        oldModel: 'Generic UPS',
        oldCondition: 'damaged',
        newBrand: 'APC',
        newModel: 'BR1000G',
        newSpec: '1000VA/600W',
        reason: 'broken',
        changeDate: '20.03.2025',
        changedBy: 'IT Team',
        cost: 6500,
        invoiceNo: '',
        notes: 'UPS battery replaced - Server Room'
      }
    ];

    await PartChange.insertMany(defaultRecords);
    res.json({ message: 'Seeded default parts data', count: defaultRecords.length });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
