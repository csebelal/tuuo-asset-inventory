import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { assetsApi } from '@/api/client';
import { 
  Monitor, Server, Wifi, AlertTriangle, CheckCircle, Wrench, 
  Computer, Plus, RefreshCw, HardDrive, Cpu, Box, Trash2,
  Package, Search, Warehouse
} from 'lucide-react';

interface Asset {
  _id: string;
  assetSL: string;
  assetType: string;
  hostName: string;
  modelName: string;
  condition?: string;
  storeLocation?: string;
  status?: string;
}

interface AssetOption {
  _id: string;
  assetSL: string;
  assetType: string;
  hostName: string;
}

const storeItems = ['Monitor', 'UPS', 'Desktop', 'RAM', 'HDD', 'Motherboard', 'Desktop Casing'];

const conditionConfig: Record<string, { label: string; class: string; icon: any; bg: string }> = {
  good: { label: 'Good', class: 'text-green-700', icon: CheckCircle, bg: 'bg-green-50 border-green-200' },
  fair: { label: 'Fair', class: 'text-yellow-700', icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200' },
  poor: { label: 'Poor', class: 'text-orange-700', icon: AlertTriangle, bg: 'bg-orange-50 border-orange-200' },
  needs_repair: { label: 'Needs Repair', class: 'text-red-700', icon: Wrench, bg: 'bg-red-50 border-red-200' },
  dispose: { label: 'Dispose', class: 'text-slate-700', icon: AlertTriangle, bg: 'bg-slate-50 border-slate-200' },
  damaged: { label: 'Damaged', class: 'text-red-700', icon: AlertTriangle, bg: 'bg-red-50 border-red-200' },
};

const assetTypeIcons: Record<string, any> = {
  Desktop: Computer,
  Laptop: Computer,
  Monitor: Monitor,
  UPS: Server,
  'Network Switch': Wifi,
  Router: Wifi,
  Server: Server,
  RAM: HardDrive,
  HDD: HardDrive,
  Motherboard: Cpu,
  'Desktop Casing': Box,
};

const storeLocations = ['Store Room F 10th', 'Store Room F 06th'];
const conditions = ['good', 'fair', 'poor', 'needs_repair', 'dispose', 'damaged'];

export default function StoreInventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allAssets, setAllAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterAssetType, setFilterAssetType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('good');
  const [selectedLocation, setSelectedLocation] = useState<string>('Store Room F 10th');
  const [saving, setSaving] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [entryMode, setEntryMode] = useState<'select' | 'manual'>('select');
  const [manualAsset, setManualAsset] = useState({
    assetSL: '',
    assetType: 'Desktop',
    hostName: '',
    modelName: '',
    condition: 'good',
    storeLocation: 'Store Room F 10th'
  });
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin' };
  const canEdit = user.role === 'admin' || user.role === 'editor';

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchAssets();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await assetsApi.getAll({ limit: 500 });
      
      let assetList: any[] = [];
      if (Array.isArray(res.data)) {
        assetList = res.data;
      } else if (res.data.assets) {
        assetList = res.data.assets;
      }
      
      setAllAssets(assetList);
      
      const inStore = assetList.filter((a: any) => 
        (a.storeLocation && a.storeLocation.trim() !== '') || 
        (a.status && a.status.toString().startsWith('In Store'))
      );
      setAssets(inStore);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (filterLocation !== 'all' && asset.storeLocation !== filterLocation) return false;
    if (filterCondition !== 'all' && asset.condition !== filterCondition) return false;
    if (filterAssetType !== 'all' && asset.assetType !== filterAssetType) return false;
    if (search && !asset.assetSL.toLowerCase().includes(search.toLowerCase()) &&
        !asset.hostName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const availableAssets = allAssets.filter(a => {
    const alreadyInStore = assets.some(s => s.assetSL === a.assetSL);
    if (alreadyInStore) return false;
    if (!assetSearch) return true;
    return a.assetSL.toLowerCase().includes(assetSearch.toLowerCase()) ||
           a.hostName?.toLowerCase().includes(assetSearch.toLowerCase());
  });

  const storeLocationsList = [...new Set(assets.map(a => a.storeLocation).filter(Boolean))];

  const summary = {
    good: assets.filter(a => a.condition === 'good').length,
    damaged: assets.filter(a => a.condition === 'damaged').length,
    total: assets.length,
  };

  const itemSummary = storeItems.reduce((acc, item) => {
    const itemAssets = assets.filter(a => a.assetType === item);
    acc[item] = {
      total: itemAssets.length,
      good: itemAssets.filter(a => a.condition === 'good').length,
      damaged: itemAssets.filter(a => a.condition === 'damaged').length,
    };
    return acc;
  }, {} as Record<string, { total: number; good: number; damaged: number }>);

  const handleAddToStore = async () => {
    if (entryMode === 'select') {
      if (!selectedAsset) return;
      
      setSaving(true);
      try {
        const assetSL = allAssets.find(a => a._id === selectedAsset)?.assetSL || selectedAsset;
        await assetsApi.update(assetSL, {
          storeLocation: selectedLocation,
          condition: selectedCondition,
          status: selectedCondition === 'good' || selectedCondition === 'fair' ? 'In Store - Good' : 'In Store - Bad'
        });
        
        fetchAssets();
        setShowModal(false);
        setSelectedAsset('');
        setAssetSearch('');
        setEntryMode('select');
      } catch (error) {
        console.error('Failed to add to store:', error);
        alert('Failed to add to store. Please try again.');
      } finally {
        setSaving(false);
      }
    } else {
      if (!manualAsset.assetSL || !manualAsset.assetType) {
        alert('Please fill in required fields (Asset SL and Type)');
        return;
      }
      
      setSaving(true);
      try {
        await assetsApi.create({
          ...manualAsset,
          status: manualAsset.condition === 'good' || manualAsset.condition === 'fair' ? 'In Store - Good' : 'In Store - Bad'
        });
        
        fetchAssets();
        setShowModal(false);
        setManualAsset({
          assetSL: '',
          assetType: 'Desktop',
          hostName: '',
          modelName: '',
          condition: 'good',
          storeLocation: 'Store Room F 10th'
        });
        setEntryMode('select');
      } catch (error) {
        console.error('Failed to create asset:', error);
        alert('Failed to create asset. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRemoveFromStore = async (assetSL: string) => {
    if (!confirm('Remove this item from store?')) return;
    try {
      await assetsApi.update(assetSL, {
        storeLocation: '',
        status: 'Available'
      });
      fetchAssets();
    } catch (error) {
      console.error('Failed to remove from store:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Add to Store Modal - MUST be inside root div */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Add Asset to Store</h3>
                    <p className="text-sm text-slate-500">Add new or existing assets</p>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setEntryMode('select'); }} className="p-2 hover:bg-slate-100 rounded-lg">
                  <span className="text-2xl text-slate-400">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
                <button type="button" onClick={() => setEntryMode('select')} className={`flex-1 py-2.5 text-sm font-medium rounded-md ${entryMode === 'select' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Select Existing</button>
                <button type="button" onClick={() => setEntryMode('manual')} className={`flex-1 py-2.5 text-sm font-medium rounded-md ${entryMode === 'manual' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Manual</button>
              </div>
              {entryMode === 'select' ? (
                <div className="space-y-4">
                  <Input placeholder="Search by SL or Hostname..." value={assetSearch} onChange={(e) => { setAssetSearch(e.target.value); setSelectedAsset(''); }} className="mb-3" />
                  {assetSearch && !selectedAsset && (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {availableAssets.map(asset => (
                        <div key={asset._id} className="p-3 text-sm cursor-pointer hover:bg-green-50 border-b" onClick={() => { setSelectedAsset(asset._id); setAssetSearch(`${asset.assetSL} - ${asset.hostName}`); }}>
                          <span className="font-medium">{asset.assetSL}</span> - {asset.hostName}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedAsset && <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">Selected</div>}
                  <div className="grid grid-cols-2 gap-4">
                    <select className="h-10 rounded-lg border px-3 text-sm" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                      {storeLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <select className="h-10 rounded-lg border px-3 text-sm" value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Asset SL" value={manualAsset.assetSL} onChange={(e) => setManualAsset({...manualAsset, assetSL: e.target.value})} />
                    <select className="h-10 rounded-lg border px-3 text-sm" value={manualAsset.assetType} onChange={(e) => setManualAsset({...manualAsset, assetType: e.target.value})}>
                      {storeItems.map(item => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Hostname" value={manualAsset.hostName} onChange={(e) => setManualAsset({...manualAsset, hostName: e.target.value})} />
                    <Input placeholder="Model" value={manualAsset.modelName} onChange={(e) => setManualAsset({...manualAsset, modelName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="h-10 rounded-lg border px-3 text-sm" value={manualAsset.storeLocation} onChange={(e) => setManualAsset({...manualAsset, storeLocation: e.target.value})}>
                      {storeLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <select className="h-10 rounded-lg border px-3 text-sm" value={manualAsset.condition} onChange={(e) => setManualAsset({...manualAsset, condition: e.target.value})}>
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-slate-50 rounded-b-xl">
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setShowModal(false); setEntryMode('select'); }} className="flex-1">Cancel</Button>
                <Button onClick={handleAddToStore} disabled={entryMode === 'select' ? !selectedAsset : !manualAsset.assetSL || !manualAsset.assetType || saving} className="flex-1 bg-green-600">{saving ? 'Saving...' : 'Add to Store'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Warehouse className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Store Inventory</h1>
            <p className="text-sm text-slate-500">Manage items in store rooms</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 gap-2">
              <Plus className="w-4 h-4" /> Add to Store
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={fetchAssets} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Items</p>
                <p className="text-3xl font-bold text-slate-900">{summary.total}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Good Condition</p>
                <p className="text-2xl font-bold text-emerald-600">{summary.good}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Damaged Condition</p>
                <p className="text-2xl font-bold text-red-600">{summary.damaged}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Type Summary */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold text-slate-900">Items by Type</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {storeItems.map(item => {
              const Icon = assetTypeIcons[item] || Computer;
              const data = itemSummary[item];
              return (
                <div 
                  key={item} 
                  className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                    data.total > 0 ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'
                  }`}
                  onClick={() => setFilterAssetType(filterAssetType === item ? 'all' : item)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${data.total > 0 ? 'text-green-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-medium text-slate-700 truncate">{item}</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{data.total}</div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {data.good > 0 && (
                      <span className="text-green-600 font-medium">{data.good} good</span>
                    )}
                    {data.damaged > 0 && (
                      <span className="text-red-600 font-medium">{data.damaged} damaged</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by SL or Hostname..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterAssetType}
                onChange={(e) => setFilterAssetType(e.target.value)}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm bg-white"
              >
                <option value="all">All Types</option>
                {storeItems.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm bg-white"
              >
                <option value="all">All Locations</option>
                {storeLocationsList.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm bg-white"
              >
                <option value="all">All Conditions</option>
                {Object.entries(conditionConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                <p className="text-slate-500">Loading assets...</p>
              </div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No items found</h3>
              <p className="text-slate-500 mb-4">No assets in store. Click "Add to Store" to add assets.</p>
              {canEdit && (
                <Button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus className="w-4 h-4" /> Add to Store
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-4 font-medium text-slate-600">Asset SL</th>
                    <th className="text-left p-4 font-medium text-slate-600">Type</th>
                    <th className="text-left p-4 font-medium text-slate-600">Hostname</th>
                    <th className="text-left p-4 font-medium text-slate-600">Model</th>
                    <th className="text-left p-4 font-medium text-slate-600">Location</th>
                    <th className="text-left p-4 font-medium text-slate-600">Condition</th>
                    {canEdit && <th className="text-left p-4 font-medium text-slate-600">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset, idx) => {
                    const Icon = assetTypeIcons[asset.assetType] || Computer;
                    const cond = conditionConfig[asset.condition || 'good'];
                    const displayLocation = asset.storeLocation || asset.status || '-';
                    return (
                      <tr 
                        key={asset._id} 
                        className={`border-b hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        <td className="p-4 font-medium text-slate-900">{asset.assetSL}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-slate-100 rounded">
                              <Icon className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-slate-700">{asset.assetType}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">{asset.hostName || '-'}</td>
                        <td className="p-4 text-slate-600">{asset.modelName || '-'}</td>
                        <td className="p-4 text-slate-600">{displayLocation}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border ${cond.class} ${cond.bg}`}>
                            <cond.icon className="w-3.5 h-3.5" />
                            {cond.label}
                          </span>
                        </td>
                        {canEdit && (
                          <td className="p-4">
                            <button 
                              onClick={() => handleRemoveFromStore(asset.assetSL)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Remove from store"
                            >
                              <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                            </button>
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

      {/* Footer Spacer */}
      <div className="h-8" />
    </div>
);
}