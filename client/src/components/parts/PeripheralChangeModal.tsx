import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAllAssets } from '@/hooks/useAssets';
import { COMPONENT_OPTIONS, REASON_OPTIONS, PLACEHOLDERS, BRAND_SUGGESTIONS } from '@/utils/partsUtils';
import type { ComponentType, ChangeReason, PartCondition, ChangeRecord } from '@/types/parts.types';

interface AssetForParts {
  sl: string;
  hostname: string;
  department: string;
  floor: string;
  ipAddress?: string;
  employeeName?: string;
  assetType?: string;
}

interface PeripheralChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<ChangeRecord, 'id'>) => void;
  editRecord?: ChangeRecord;
}

export function PeripheralChangeModal({ isOpen, onClose, onSave, editRecord }: PeripheralChangeModalProps) {
  const { data: apiAssets, isLoading } = useAllAssets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [componentType, setComponentType] = useState<ComponentType>('mouse');
  const [oldBrand, setOldBrand] = useState('');
  const [oldModel, setOldModel] = useState('');
  const [oldCondition, setOldCondition] = useState<PartCondition>('damaged');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [reason, setReason] = useState<ChangeReason>('broken');
  const [changeDate, setChangeDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [changedBy, setChangedBy] = useState('IT Team');
  const [cost, setCost] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [notes, setNotes] = useState('');

  const allAssets: AssetForParts[] = useMemo(() => {
    if (!apiAssets) return [];
    return apiAssets.map((asset: any) => ({
      sl: asset.assetSL,
      hostname: asset.hostname || asset.assetSL,
      department: asset.department || '',
      floor: asset.floor || asset.unit || '',
      ipAddress: asset.ipAddress || '',
      employeeName: asset.employeeName || '',
      assetType: asset.assetType || '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !newBrand || !newModel) return;

    const record: Omit<ChangeRecord, 'id'> = {
      assetSL: selectedAsset,
      assetHostname: selectedAssetData?.hostname || '',
      department: selectedAssetData?.department || '',
      floor: selectedAssetData?.floor || '',
      componentType,
      oldBrand,
      oldModel,
      oldCondition,
      newBrand,
      newModel,
      newSpec,
      reason,
      changeDate,
      changedBy,
      cost: parseFloat(cost) || 0,
      invoiceNo,
      notes,
    };

    onSave(record);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedAsset('');
    setComponentType('mouse');
    setOldBrand('');
    setOldModel('');
    setOldCondition('damaged');
    setNewBrand('');
    setNewModel('');
    setNewSpec('');
    setReason('broken');
    setChangeDate(new Date().toLocaleDateString('en-GB'));
    setChangedBy('IT Team');
    setCost('');
    setInvoiceNo('');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  const placeholders = PLACEHOLDERS[componentType] || PLACEHOLDERS.other;
  const brandSuggestions = BRAND_SUGGESTIONS[componentType] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 w-[700px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editRecord ? 'Edit Component Change' : 'Record Component Change'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-xs text-slate-500 block mb-1">Component Type</label>
            <select
              className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={componentType}
              onChange={(e) => setComponentType(e.target.value as ComponentType)}
            >
              {COMPONENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-3 bg-slate-50">
              <div className="text-sm font-medium mb-2 text-slate-600">Old Component</div>
              <div className="space-y-2">
                <div className="flex gap-1">
                  <select
                    className="flex-1 h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={oldBrand}
                    onChange={(e) => setOldBrand(e.target.value)}
                  >
                    <option value="">Select Brand</option>
                    {brandSuggestions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <Input
                    className="flex-1"
                    value={oldBrand && !brandSuggestions.includes(oldBrand) ? oldBrand : ''}
                    onChange={(e) => setOldBrand(e.target.value)}
                    placeholder="Or type..."
                  />
                </div>
                <Input
                  value={oldModel}
                  onChange={(e) => setOldModel(e.target.value)}
                  placeholder={placeholders.old}
                />
                <select
                  className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={oldCondition}
                  onChange={(e) => setOldCondition(e.target.value as PartCondition)}
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="worn">Worn</option>
                  <option value="damaged">Damaged</option>
                  <option value="missing">Missing</option>
                </select>
              </div>
            </div>

            <div className="border rounded-md p-3 bg-green-50">
              <div className="text-sm font-medium mb-2 text-green-700">New Component</div>
              <div className="space-y-2">
                <div className="flex gap-1">
                  <select
                    className="flex-1 h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                  >
                    <option value="">Select Brand</option>
                    {brandSuggestions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <Input
                    className="flex-1"
                    value={newBrand && !brandSuggestions.includes(newBrand) ? newBrand : ''}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Or type..."
                  />
                </div>
                <Input
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder={placeholders.new}
                />
                <Input
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  placeholder="Specification (optional)"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Reason</label>
              <select
                className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value as ChangeReason)}
              >
                {REASON_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Date Changed</label>
              <Input
                value={changeDate}
                onChange={(e) => setChangeDate(e.target.value)}
                placeholder="DD.MM.YYYY"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Changed By</label>
              <Input
                value={changedBy}
                onChange={(e) => setChangedBy(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Cost (BDT)</label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Invoice No.</label>
              <Input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Invoice #"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedAsset || !newBrand || !newModel}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Save Change
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
