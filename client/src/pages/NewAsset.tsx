import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateAsset } from '@/hooks/useAssets';
import { IAsset } from '@/types/asset.types';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const assetTypes = ['Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Router', 'Switch', 'NAS Server', 'RAM', 'HDD', 'Motherboard', 'Desktop Casing'];
const statuses = ['With user', 'Server Room', 'In Repair', 'Inactive', 'Decommissioned', 'In Store - Good', 'In Store - Bad'];
const iaGroups = ['Full Access', 'Restricted', 'N/A'];
const floors = ['10th Floor A', '10th Floor B', '6th Floor', '1st Floor', 'Server Room'];
const departments = ['Designer', 'QC', 'Team Leader', '3D', 'Customer Support', 'Shift Incharge', 'AGM', 'Marketing', 'Accounts', 'IT', 'Video Editor'];
const conditions = ['good', 'fair', 'poor', 'needs_repair', 'dispose', 'damaged'];
const storeLocations = ['Store Room F 10th', 'Store Room F 06th'];
const warrantyTypes = ['basic', 'extended', 'manufacturer', 'third_party'];

const emptyAsset: Partial<IAsset> = {
  assetSL: '',
  assetType: 'Desktop',
  hostName: '',
  ipAddress: '',
  iaGroup: 'Full Access',
  status: 'With user',
  employeeName: '',
  adName: '',
  department: '',
  unit: '',
  serialNoMAC: '',
  modelName: '',
  motherboard: '',
  processor: '',
  processorSpeed: '',
  hdd: '',
  ssd: '',
  ram: '',
  graphicsCardModel: '',
  graphicsCardGB: '',
  installedOS: '',
  licenseOS: '',
  serialNoOS: '',
  antivirusLicense: '',
  installedSoftware: '',
  remarks: '',
  condition: 'good',
  storeLocation: '',
  warrantyProvider: '',
  warrantyType: 'basic',
  warrantyCost: 0,
  isWarrantyActive: true,
  assignedTo: '',
};

export default function NewAssetPage() {
  const navigate = useNavigate();
  const createAsset = useCreateAsset();
  const [formData, setFormData] = useState<Partial<IAsset>>(emptyAsset);

  const handleChange = (field: keyof IAsset, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.assetSL) {
      alert('Asset SL is required');
      return;
    }
    
    // Auto-set status based on store location
    let assetData = { ...formData };
    if (formData.storeLocation && formData.storeLocation.trim() !== '') {
      assetData.status = (formData.condition === 'good' || formData.condition === 'fair' || !formData.condition) 
        ? 'In Store - Good' 
        : 'In Store - Bad';
    }
    
    await createAsset.mutateAsync(assetData);
    navigate('/assets');
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg sm:text-xl font-semibold">Add New Asset</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Asset SL *</label>
              <Input 
                placeholder="TU-001" 
                value={formData.assetSL || ''} 
                onChange={e => handleChange('assetSL', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Asset Type</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.assetType || ''}
                onChange={e => handleChange('assetType', e.target.value)}
              >
                {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Host Name</label>
              <Input 
                placeholder="TUD01" 
                value={formData.hostName || ''} 
                onChange={e => handleChange('hostName', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Model</label>
              <Input 
                placeholder="Dell OptiPlex 7090" 
                value={formData.modelName || ''} 
                onChange={e => handleChange('modelName', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.status || ''}
                onChange={e => handleChange('status', e.target.value)}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Condition</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.condition || 'good'}
                onChange={e => handleChange('condition', e.target.value)}
              >
                {conditions.map(c => (
                  <option key={c} value={c}>
                    {c === 'good' ? '✅ Good' : c === 'fair' ? '⚠️ Fair' : c === 'poor' ? '❌ Poor' : c === 'needs_repair' ? '🔧 Needs Repair' : c === 'damaged' ? '💔 Damaged' : '🗑️ Dispose'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Store Location</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.storeLocation || ''}
                onChange={e => handleChange('storeLocation', e.target.value)}
              >
                <option value="">Not in Store</option>
                {storeLocations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">IP Address</label>
              <Input 
                placeholder="192.168.0.1" 
                value={formData.ipAddress || ''} 
                onChange={e => handleChange('ipAddress', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">MAC/Serial No</label>
              <Input 
                placeholder="00:1A:2B:3C:4D:5E" 
                value={formData.serialNoMAC || ''} 
                onChange={e => handleChange('serialNoMAC', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">IA Group</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.iaGroup || ''}
                onChange={e => handleChange('iaGroup', e.target.value)}
              >
                {iaGroups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Employee Name</label>
              <Input 
                placeholder="John Doe" 
                value={formData.employeeName || ''} 
                onChange={e => handleChange('employeeName', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">AD Name</label>
              <Input 
                placeholder="john.doe" 
                value={formData.adName || ''} 
                onChange={e => handleChange('adName', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Department</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.department || ''}
                onChange={e => handleChange('department', e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Floor/Unit</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                value={formData.unit || ''}
                onChange={e => handleChange('unit', e.target.value)}
              >
                <option value="">Select Floor</option>
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hardware</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Processor</label>
              <Input 
                placeholder="Intel i5-12400" 
                value={formData.processor || ''} 
                onChange={e => handleChange('processor', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">RAM (GB)</label>
              <Input 
                placeholder="16" 
                value={formData.ram || ''} 
                onChange={e => handleChange('ram', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">SSD (GB)</label>
              <Input 
                placeholder="512" 
                value={formData.ssd || ''} 
                onChange={e => handleChange('ssd', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">HDD (GB)</label>
              <Input 
                placeholder="1000" 
                value={formData.hdd || ''} 
                onChange={e => handleChange('hdd', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Graphics Card</label>
              <Input 
                placeholder="NVIDIA RTX 3060" 
                value={formData.graphicsCardModel || ''} 
                onChange={e => handleChange('graphicsCardModel', e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Software</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Installed OS</label>
              <Input 
                placeholder="Windows 11 Pro" 
                value={formData.installedOS || ''} 
                onChange={e => handleChange('installedOS', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">OS License</label>
              <Input 
                placeholder="XXXXX-XXXXX-XXXXX" 
                value={formData.licenseOS || ''} 
                onChange={e => handleChange('licenseOS', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Antivirus License</label>
              <Input 
                placeholder="Kaspersky/ESET" 
                value={formData.antivirusLicense || ''} 
                onChange={e => handleChange('antivirusLicense', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Installed Software</label>
              <Input 
                placeholder="Office, Photoshop, etc." 
                value={formData.installedSoftware || ''} 
                onChange={e => handleChange('installedSoftware', e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Warranty Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Warranty Provider</label>
              <Input 
                placeholder="Manufacturer/Third Party" 
                value={formData.warrantyProvider || ''} 
                onChange={e => handleChange('warrantyProvider', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Warranty Type</label>
              <select
                className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                value={formData.warrantyType || ''}
                onChange={e => handleChange('warrantyType', e.target.value)}
              >
                <option value="">Select Type</option>
                {warrantyTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Warranty Cost (BDT)</label>
              <Input 
                type="number"
                placeholder="0" 
                value={formData.warrantyCost || ''} 
                onChange={e => handleChange('warrantyCost', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Expiry Date</label>
              <Input 
                type="date"
                value={formData.expiryDate || ''} 
                onChange={e => handleChange('expiryDate', e.target.value)} 
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="isWarrantyActive"
                checked={formData.isWarrantyActive ?? true}
                onChange={e => handleChange('isWarrantyActive', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4"
              />
              <label htmlFor="isWarrantyActive" className="text-sm">Warranty Active</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Add any notes..."
              value={formData.remarks || ''}
              onChange={e => handleChange('remarks', e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/assets')}>Cancel</Button>
        <Button onClick={handleSave} disabled={createAsset.isPending}>
          {createAsset.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Create Asset
        </Button>
      </div>
    </div>
  );
}
