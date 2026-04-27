import { Router, Request, Response } from 'express';
import Stock from '../models/Stock';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const DEPARTMENTS = ['IT', 'Accounts'];

// List all stock
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { department, itemType } = req.query;
    const filter: any = {};
    if (department) filter.department = department;
    if (itemType) filter.itemType = itemType;
    const stocks = await Stock.find(filter).sort({ createdAt: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total stock by itemType (Store only)
router.get('/totals', authenticate, async (req: Request, res: Response) => {
  try {
    const stocks = await Stock.find({ location: 'Store', department: '' });
    const totals = stocks.reduce((acc, item) => {
      acc[item.itemType] = (acc[item.itemType] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);
    res.json(totals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department stock summary
router.get('/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const allStocks = await Stock.find({});
    const summary: Record<string, Record<string, number>> = {};
    
    allStocks.forEach(stock => {
      // Default to Accounts if no department
      const dept = stock.department || 'Accounts';
      
      if (!summary[stock.itemType]) {
        summary[stock.itemType] = { Total: 0, IT: 0, Accounts: 0 };
      }
      
      // Add to the specific department
      if (dept === 'IT' || dept === 'Accounts') {
        summary[stock.itemType][dept] = (summary[stock.itemType][dept] || 0) + stock.quantity;
      }
    });
    
    // Calculate Total (IT + Accounts) for each item
    Object.keys(summary).forEach(itemType => {
      summary[itemType].Total = (summary[itemType]['IT'] || 0) + (summary[itemType]['Accounts'] || 0);
    });
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create stock
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete stock
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Distribute stock from Store to department
router.post('/distribute', authenticate, async (req: Request, res: Response) => {
  try {
    const { stockId, department, quantity } = req.body;
    
    const storeStock = await Stock.findById(stockId);
    if (!storeStock) return res.status(404).json({ message: 'Stock not found in Store' });
    if (storeStock.location !== 'Store') return res.status(400).json({ message: 'Can only distribute from Store' });
    
    const qty = Number(quantity);
    if (qty <= 0 || qty > storeStock.quantity) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Reduce from store
    storeStock.quantity -= qty;
    await storeStock.save();
    
    // Check if department already has this item type
    let deptStock = await Stock.findOne({ 
      itemType: storeStock.itemType, 
      department: department,
      location: department 
    });
    
    if (deptStock) {
      deptStock.quantity += qty;
      await deptStock.save();
    } else {
      // Create new stock for department
      deptStock = new Stock({
        itemType: storeStock.itemType,
        quantity: qty,
        location: department,
        department: department,
        supplier: storeStock.supplier,
        costPerUnit: storeStock.costPerUnit,
        sourceStockId: storeStock._id,
        notes: `Distributed from Store`
      });
      await deptStock.save();
    }
    
    res.json({ 
      message: `Distributed ${qty} items to ${department}`,
      storeStock,
      deptStock
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer stock between departments
router.post('/transfer', authenticate, async (req: Request, res: Response) => {
  try {
    const { fromDepartment, toDepartment, itemType, quantity } = req.body;
    
    if (fromDepartment === toDepartment) {
      return res.status(400).json({ message: 'Source and destination cannot be same' });
    }
    
    // Find source stock
    const sourceStock = await Stock.findOne({ 
      itemType, 
      department: fromDepartment,
      location: fromDepartment
    });
    
    if (!sourceStock) {
      return res.status(404).json({ message: `No ${itemType} in ${fromDepartment}` });
    }
    
    const qty = Number(quantity);
    if (qty <= 0 || qty > sourceStock.quantity) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Reduce from source
    sourceStock.quantity -= qty;
    await sourceStock.save();
    
    // Find or create destination stock
    let destStock = await Stock.findOne({ 
      itemType, 
      department: toDepartment,
      location: toDepartment
    });
    
    if (destStock) {
      destStock.quantity += qty;
      await destStock.save();
    } else {
      destStock = new Stock({
        itemType,
        quantity: qty,
        location: toDepartment,
        department: toDepartment,
        notes: `Transferred from ${fromDepartment}`
      });
      await destStock.save();
    }
    
    res.json({ 
      message: `Transferred ${qty} ${itemType} from ${fromDepartment} to ${toDepartment}`,
      sourceStock,
      destStock
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Consume stock (allocation to asset)
router.post('/consume', authenticate, async (req: Request, res: Response) => {
  try {
    const { stockId, assetSL, quantity } = req.body;
    const stock = await Stock.findById(stockId);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    const qty = Number(quantity) || 0;
    if (stock.quantity < qty) return res.status(400).json({ message: 'Insufficient stock' });
    stock.quantity -= qty;
    await stock.save();
    res.json({ stock, allocatedTo: assetSL, allocatedQty: qty });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
