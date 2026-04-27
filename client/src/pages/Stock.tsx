import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { stockApi } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, Trash2, Edit2, 
  Package, Mouse, Keyboard, Battery, 
  Building2, Users, Warehouse,
  ArrowDownLeft, ArrowUpRight, X
} from 'lucide-react';

interface StockItem {
  _id: string;
  itemType: string;
  quantity: number;
  location: string;
  department: string;
  supplier: string;
  costPerUnit: number;
  boughtDate?: string;
  expiryDate?: string;
  expiryLeadDays: number;
  notes: string;
}

const itemTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  mouse: { label: 'Mouse', icon: <Mouse className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  keyboard: { label: 'Keyboard', icon: <Keyboard className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
  ups: { label: 'UPS', icon: <Battery className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
};

const departmentConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  Store: { label: 'Store', icon: <Warehouse className="w-4 h-4" />, color: 'text-slate-600', bg: 'bg-slate-100' },
  IT: { label: 'IT', icon: <Building2 className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-100' },
  Accounts: { label: 'Accounts', icon: <Users className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-100' },
};

export default function StockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin' };
  const canEdit = user.role === 'admin' || user.role === 'editor';
  
  const [formData, setFormData] = useState({
    itemType: 'mouse',
    quantity: 0,
    location: 'Store',
    department: '',
    supplier: '',
    costPerUnit: 0,
    boughtDate: '',
    expiryDate: '',
    expiryLeadDays: 30,
    notes: '',
  });

  const [distributeData, setDistributeData] = useState({
    stockId: '',
    department: 'IT',
    quantity: 1,
  });

  const [transferData, setTransferData] = useState({
    fromDepartment: 'Accounts',
    toDepartment: 'IT',
    itemType: 'mouse',
    quantity: 1,
  });

  useEffect(() => {
    fetchStocks();
    fetchSummary();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const dept = activeTab === 'all' || activeTab === 'Store' ? undefined : activeTab;
      await stockApi.getAll({ department: dept }).then(res => setStocks(res.data));
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await stockApi.getSummary();
      setSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [activeTab]);

  const filteredStocks = stocks.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'Store') return item.location === 'Store';
    return item.department === activeTab;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        location: 'Store',
        department: '',
      };
      if (editingItem) {
        await stockApi.update(editingItem._id, data);
      } else {
        await stockApi.create(data);
      }
      fetchStocks();
      fetchSummary();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributeData.stockId || distributeData.quantity < 1) {
      alert('Please select item and quantity');
      return;
    }
    try {
      await stockApi.distribute({
        stockId: distributeData.stockId,
        department: distributeData.department,
        quantity: distributeData.quantity
      });
      fetchStocks();
      fetchSummary();
      setShowDistributeModal(false);
      setDistributeData({ stockId: '', department: 'IT', quantity: 1 });
      alert('Stock distributed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to distribute');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.fromDepartment === transferData.toDepartment) {
      alert('Source and destination cannot be same');
      return;
    }
    if (transferData.quantity < 1) {
      alert('Please enter valid quantity');
      return;
    }
    try {
      await stockApi.transfer({
        fromDepartment: transferData.fromDepartment,
        toDepartment: transferData.toDepartment,
        itemType: transferData.itemType,
        quantity: transferData.quantity
      });
      fetchStocks();
      fetchSummary();
      setShowTransferModal(false);
      setTransferData({ fromDepartment: 'Accounts', toDepartment: 'IT', itemType: 'mouse', quantity: 1 });
      alert('Stock transferred successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to transfer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stock item?')) return;
    try {
      await stockApi.delete(id);
      fetchStocks();
      fetchSummary();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      itemType: item.itemType,
      quantity: item.quantity,
      location: item.location,
      department: item.department,
      supplier: item.supplier,
      costPerUnit: item.costPerUnit,
      boughtDate: item.boughtDate ? item.boughtDate.split('T')[0] : '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      expiryLeadDays: item.expiryLeadDays,
      notes: item.notes,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      itemType: 'mouse',
      quantity: 0,
      location: 'Store',
      department: '',
      supplier: '',
      costPerUnit: 0,
      boughtDate: '',
      expiryDate: '',
      expiryLeadDays: 30,
      notes: '',
    });
  };

  const storeStocks = stocks.filter(s => s.location === 'Store');

  const totalStock = Object.values(summary).reduce((sum, item) => sum + (item.Total || 0), 0);
  const itCount = (summary['mouse']?.IT || 0) + (summary['keyboard']?.IT || 0) + (summary['ups']?.IT || 0);
  const accountsCount = (summary['mouse']?.Accounts || 0) + (summary['keyboard']?.Accounts || 0) + (summary['ups']?.Accounts || 0);

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Stock Management</h1>
              <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Manage inventory across departments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Quick Stats */}
            <div className="flex gap-2">
              <div className="bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-base sm:text-lg font-bold text-slate-800">{totalStock}</p>
              </div>
              <div className="bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500">IT</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">{itCount}</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500">Accounts</p>
                <p className="text-lg font-bold text-green-600">{accountsCount}</p>
              </div>
            </div>
            {activeTab === 'all' && canEdit && (
              <>
                <Button onClick={() => setShowDistributeModal(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <ArrowDownLeft className="w-4 h-4 mr-1" /> Distribute
                </Button>
                <Button variant="outline" onClick={() => setShowTransferModal(true)} className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <ArrowUpRight className="w-4 h-4 mr-1" /> Transfer
                </Button>
              </>
            )}
            {canEdit && (
              <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                <Plus className="w-4 h-4 mr-1" /> Add Stock
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Stock', icon: <Package className="w-4 h-4" /> },
          { key: 'IT', label: 'IT', icon: <Building2 className="w-4 h-4" /> },
          { key: 'Accounts', label: 'Accounts', icon: <Users className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
              activeTab === tab.key 
                ? 'bg-slate-800 text-white shadow-lg' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards (All Tab) */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['mouse', 'keyboard', 'ups'].map(itemType => {
            const config = itemTypeLabels[itemType] || { label: itemType, icon: <Package />, color: 'bg-slate-100' };
            const depts = summary[itemType] || { Total: 0, IT: 0, Accounts: 0 };
            return (
              <Card key={itemType} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                      {config.icon}
                    </div>
                    <span className="text-2xl font-bold text-slate-800">{depts.Total || 0}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-3">{config.label}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['IT', 'Accounts'].map(dept => {
                      const deptConfig = departmentConfig[dept];
                      const qty = depts[dept] || 0;
                      return (
                        <div key={dept} className={`text-center p-2 rounded-lg ${deptConfig.bg}`}>
                          <p className={`text-xs ${deptConfig.color} mb-1`}>{dept}</p>
                          <p className={`font-bold ${qty > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{qty}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stock Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Package className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No stock items found</p>
              <p className="text-sm">Add stock to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-600">Item</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Quantity</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Location</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Department</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Cost</th>
                    {canEdit && <th className="text-left p-4 font-semibold text-slate-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((item, idx) => {
                    const config = itemTypeLabels[item.itemType] || { color: 'bg-slate-100' };
                    return (
                      <tr 
                        key={item._id} 
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                              {itemTypeLabels[item.itemType]?.icon || <Package className="w-5 h-5" />}
                            </div>
                            <span className="font-medium text-slate-800">
                              {itemTypeLabels[item.itemType]?.label || item.itemType}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-lg text-slate-800">{item.quantity}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600">{item.location}</span>
                        </td>
                        <td className="p-4">
                          {item.department ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${departmentConfig[item.department]?.bg || 'bg-slate-100'} ${departmentConfig[item.department]?.color || 'text-slate-600'}`}>
                              {departmentConfig[item.department]?.icon}
                              {item.department}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-slate-600">{item.costPerUnit} BDT</span>
                        </td>
                        {canEdit && (
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Stock Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {editingItem ? 'Edit Stock' : 'Add New Stock'}
                </h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Item Type</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-white"
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                >
                  {Object.entries(itemTypeLabels).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Quantity</label>
                  <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} min={0} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Cost per Unit (BDT)</label>
                  <Input type="number" value={formData.costPerUnit} onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })} className="h-11" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Supplier</label>
                <Input value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="h-11" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Buy Date</label>
                  <Input type="date" value={formData.boughtDate} onChange={(e) => setFormData({ ...formData, boughtDate: e.target.value })} className="h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Expiry Date</label>
                  <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="h-11" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 h-11">Cancel</Button>
                <Button type="submit" className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700">{editingItem ? 'Update' : 'Add'} Stock</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distribute Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[450px] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5" /> Distribute Stock
                </h3>
                <button onClick={() => setShowDistributeModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleDistribute} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Select Item from Store</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-white"
                  value={distributeData.stockId}
                  onChange={(e) => setDistributeData({ ...distributeData, stockId: e.target.value })}
                  required
                >
                  <option value="">Select item...</option>
                  {storeStocks.filter(s => s.quantity > 0).map(stock => (
                    <option key={stock._id} value={stock._id}>
                      {itemTypeLabels[stock.itemType]?.label || stock.itemType} (Available: {stock.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Department</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-white"
                  value={distributeData.department}
                  onChange={(e) => setDistributeData({ ...distributeData, department: e.target.value })}
                >
                  <option value="IT">IT Department</option>
                  <option value="Accounts">Accounts Department</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Quantity</label>
                <Input type="number" min={1} value={distributeData.quantity} onChange={(e) => setDistributeData({ ...distributeData, quantity: Number(e.target.value) })} className="h-11" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDistributeModal(false)} className="flex-1 h-11">Cancel</Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700">Distribute</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[450px] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" /> Transfer Stock
                </h3>
                <button onClick={() => setShowTransferModal(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleTransfer} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Item Type</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-white"
                  value={transferData.itemType}
                  onChange={(e) => setTransferData({ ...transferData, itemType: e.target.value })}
                >
                  {Object.entries(itemTypeLabels).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">From Department</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-white"
                  value={transferData.fromDepartment}
                  onChange={(e) => setTransferData({ ...transferData, fromDepartment: e.target.value })}
                >
                  <option value="IT">IT Department</option>
                  <option value="Accounts">Accounts Department</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">To Department</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm bg-white"
                  value={transferData.toDepartment}
                  onChange={(e) => setTransferData({ ...transferData, toDepartment: e.target.value })}
                >
                  <option value="IT">IT Department</option>
                  <option value="Accounts">Accounts Department</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Quantity</label>
                <Input type="number" min={1} value={transferData.quantity} onChange={(e) => setTransferData({ ...transferData, quantity: Number(e.target.value) })} className="h-11" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTransferModal(false)} className="flex-1 h-11">Cancel</Button>
                <Button type="submit" className="flex-1 h-11 bg-purple-600 hover:bg-purple-700">Transfer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}