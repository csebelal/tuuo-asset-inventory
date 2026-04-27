import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllAssets } from '@/hooks/useAssets';
import { maintenanceApi } from '@/api/client';
import type { MaintenanceType } from '@/types/maintenance.types';
import { toDDMMYYYY } from '@/utils/dateUtils';

interface AssetForSearch {
  sl: string;
  hostname: string;
  department: string;
  floor: string;
  employeeName?: string;
}

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const maintenanceTypes: { value: MaintenanceType; label: string }[] = [
  { value: 'dust_clean', label: '🧹 Dust Clean' },
  { value: 'hardware_repair', label: '🔧 Hardware Repair' },
  { value: 'power_supply', label: '⚡ Power Supply' },
  { value: 'ups_install', label: '🔌 UPS Install' },
  { value: 'os_reinstall', label: '💿 OS Reinstall' },
  { value: 'other', label: '📋 Other' },
];

export function AddMaintenanceModal({ isOpen, onClose, onSave }: AddMaintenanceModalProps) {
  const { data: apiAssets, isLoading } = useAllAssets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [type, setType] = useState<MaintenanceType>('hardware_repair');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(toDDMMYYYY(new Date()));
  const [performedBy, setPerformedBy] = useState('IT Team');
  const [status, setStatus] = useState<'completed' | 'pending' | 'in_progress'>('completed');
  const [cost, setCost] = useState(0);
  const [nextDueDate, setNextDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const allAssets: AssetForSearch[] = useMemo(() => {
    if (!apiAssets) return [];
    return apiAssets.map((asset: any) => ({
      sl: asset.assetSL,
      hostname: asset.hostname || asset.assetSL,
      department: asset.department || '',
      floor: asset.floor || asset.unit || '',
      employeeName: asset.employeeName || '',
    }));
  }, [apiAssets]);

  const filteredAssets = useMemo(() => {
    if (!searchQuery) return allAssets.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return allAssets.filter(a => 
      a.sl.toLowerCase().includes(query) || 
      a.hostname?.toLowerCase().includes(query) ||
      a.employeeName?.toLowerCase().includes(query) ||
      a.department?.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [allAssets, searchQuery]);

  const selectedAssetData = allAssets.find(a => a.sl === selectedAsset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !title) return;

    setSaving(true);
    try {
      const payload = {
        assetSL: selectedAsset,
        maintenanceType: type,
        title,
        description,
        date,
        performedBy,
        status,
        cost: cost || undefined,
        nextDueDate: nextDueDate || undefined
      };

      await maintenanceApi.create(payload);
      
      if (onSave) {
        onSave(payload);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedAsset('');
    setType('hardware_repair');
    setTitle('');
    setDescription('');
    setDate(toDDMMYYYY(new Date()));
    setPerformedBy('IT Team');
    setStatus('completed');
    setCost(0);
    setNextDueDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 w-[600px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add Maintenance Event</h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Search Asset (SL, Hostname, Employee)</label>
            {isLoading ? (
              <div className="p-2 text-sm text-slate-500">Loading assets...</div>
            ) : (
              <>
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedAsset('');
                  }}
                  placeholder="Type to search..."
                  className="mb-2"
                />
                {searchQuery && !selectedAsset && (
                  <div className="border rounded-md max-h-48 overflow-y-auto bg-white">
                    {filteredAssets.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">No assets found</div>
                    ) : (
                      filteredAssets.map(asset => (
                        <div
                          key={asset.sl}
                          className="p-2 text-sm cursor-pointer hover:bg-slate-100"
                          onClick={() => {
                            setSelectedAsset(asset.sl);
                            setSearchQuery(`${asset.sl} - ${asset.hostname}`);
                          }}
                        >
                          <span className="font-medium">{asset.sl}</span> - {asset.hostname} ({asset.employeeName || asset.department || 'N/A'})
                        </div>
                      ))
                    )}
                  </div>
                )}
                {selectedAsset && selectedAssetData && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div><strong>SL:</strong> {selectedAssetData.sl}</div>
                    <div><strong>Hostname:</strong> {selectedAssetData.hostname}</div>
                    <div><strong>Department:</strong> {selectedAssetData.department || 'N/A'}</div>
                    <div><strong>Floor:</strong> {selectedAssetData.floor || 'N/A'}</div>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Maintenance Type</label>
            <select
              className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceType)}
            >
              {maintenanceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Description</label>
            <textarea
              className="w-full h-16 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Date</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD.MM.YYYY"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Performed By</label>
              <Input
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Status</label>
            <select
              className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Cost (BDT)</label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Next Due Date</label>
              <Input
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                placeholder="DD.MM.YYYY"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedAsset || !title || saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
