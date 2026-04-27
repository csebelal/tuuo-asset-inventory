import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAsset, useUpdateAsset } from '@/hooks/useAssets';
import { IAsset } from '@/types/asset.types';
import { assetsApi } from '@/api/client';
import { ArrowLeft, Save, Loader2, UserPlus, UserMinus } from 'lucide-react';

const assetTypes = ['Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Router', 'Switch', 'NAS Server', 'RAM', 'HDD', 'Motherboard', 'Desktop Casing'];
const statuses = ['With user', 'Server Room', 'In Repair', 'Inactive', 'Decommissioned', 'In Store - Good', 'In Store - Bad'];
const iaGroups = ['Full Access', 'Restricted', 'N/A'];
const floors = ['10th Floor A', '10th Floor B', '6th Floor', '1st Floor', 'Server Room'];
const departments = ['Designer', 'QC', 'Team Leader', '3D', 'Customer Support', 'Shift Incharge', 'AGM', 'Marketing', 'Accounts', 'IT', 'Video Editor'];
const conditions = ['good', 'fair', 'poor', 'needs_repair', 'dispose', 'damaged'];
const storeLocations = ['Store Room F 10th', 'Store Room F 06th'];
const warrantyTypes = ['basic', 'extended', 'manufacturer', 'third_party'];

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: asset, isLoading, refetch } = useAsset(id || '');
  const updateAsset = useUpdateAsset();
  const [isEditing, setIsEditing] = useState(location.pathname.includes('/edit'));
  const [formData, setFormData] = useState<Partial<IAsset>>({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    }
  }, [asset]);

  const handleSave = async () => {
    if (!id) return;
    await updateAsset.mutateAsync({ id, data: formData });
    setIsEditing(false);
  };

  const handleAssign = async () => {
    if (!id || !assignTo.trim()) return;
    setAssigning(true);
    try {
      await assetsApi.assign(id, { assignedTo: assignTo, notes: assignNotes });
      setShowAssignModal(false);
      setAssignTo('');
      setAssignNotes('');
      refetch();
    } catch (error) {
      console.error('Failed to assign asset:', error);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!id || !confirm('Return this asset to store?')) return;
    try {
      await assetsApi.unassign(id, { reason: 'Returned via asset detail' });
      refetch();
    } catch (error) {
      console.error('Failed to unassign asset:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Asset not found</p>
        <Button variant="link" onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{asset.assetSL}</h2>
            <p className="text-slate-500">{asset.hostName} - {asset.assetType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateAsset.isPending}>
                {updateAsset.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setShowAssignModal(true)} variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign
              </Button>
              {asset.assignedTo && (
                <Button onClick={handleUnassign} variant="outline" className="text-red-600">
                  <UserMinus className="w-4 h-4 mr-2" />
                  Return
                </Button>
              )}
              <Button onClick={() => setIsEditing(true)}>Edit Asset</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-slate-500">Asset SL</label>
                  <Input value={formData.assetSL || ''} onChange={e => setFormData({...formData, assetSL: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Asset Type</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.assetType || ''}
                    onChange={e => setFormData({...formData, assetType: e.target.value})}
                  >
                    {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Host Name</label>
                  <Input value={formData.hostName || ''} onChange={e => setFormData({...formData, hostName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Status</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.status || ''}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Condition</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.condition || 'good'}
                    onChange={e => setFormData({...formData, condition: e.target.value as any})}
                  >
                    {conditions.map(c => (
                      <option key={c} value={c}>
                        {c === 'good' ? 'Good' : c === 'fair' ? 'Fair' : c === 'poor' ? 'Poor' : c === 'needs_repair' ? 'Needs Repair' : c === 'damaged' ? 'Damaged' : 'Dispose'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Store Location</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.storeLocation || ''}
                    onChange={e => setFormData({...formData, storeLocation: e.target.value})}
                  >
                    <option value="">Not in Store</option>
                    {storeLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Asset SL</span>
                  <span className="font-medium">{asset.assetSL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span>{asset.assetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host Name</span>
                  <span>{asset.hostName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <Badge variant={asset.status === 'With user' ? 'success' : asset.status === 'Server Room' ? 'purple' : 'outline'}>
                    {asset.status}
                  </Badge>
                </div>
                {asset.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned To</span>
                    <span className="font-medium">{asset.assignedTo}</span>
                  </div>
                )}
                {asset.assignedDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Date</span>
                    <span>{new Date(asset.assignedDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Condition</span>
                  <Badge variant={asset.condition === 'good' ? 'success' : asset.condition === 'poor' || asset.condition === 'damaged' ? 'destructive' : 'warning'}>
                    {asset.condition ? asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1).replace('_', ' ') : '-'}
                  </Badge>
                </div>
                {asset.storeLocation && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Store Location</span>
                    <span>{asset.storeLocation}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Network</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-slate-500">IP Address</label>
                  <Input value={formData.ipAddress || ''} onChange={e => setFormData({...formData, ipAddress: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">MAC/Serial</label>
                  <Input value={formData.serialNoMAC || ''} onChange={e => setFormData({...formData, serialNoMAC: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">IA Group</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.iaGroup || ''}
                    onChange={e => setFormData({...formData, iaGroup: e.target.value})}
                  >
                    {iaGroups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address</span>
                  <span className="font-mono">{asset.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MAC/Serial</span>
                  <span className="font-mono text-sm">{asset.serialNoMAC}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Access</span>
                  <Badge variant={asset.iaGroup === 'Full Access' ? 'info' : asset.iaGroup === 'Restricted' ? 'warning' : 'outline'}>
                    {asset.iaGroup || 'N/A'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-slate-500">Employee Name</label>
                  <Input value={formData.employeeName || ''} onChange={e => setFormData({...formData, employeeName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">AD Name</label>
                  <Input value={formData.adName || ''} onChange={e => setFormData({...formData, adName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Department</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.department || ''}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Floor/Unit</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.unit || ''}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    {floors.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee</span>
                  <span>{asset.employeeName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AD Name</span>
                  <span>{asset.adName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department</span>
                  <span>{asset.department || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Floor</span>
                  <span>{asset.unit || '-'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hardware</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-slate-500">Model</label>
                  <Input value={formData.modelName || ''} onChange={e => setFormData({...formData, modelName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Motherboard</label>
                  <Input value={formData.motherboard || ''} onChange={e => setFormData({...formData, motherboard: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Processor</label>
                  <Input value={formData.processor || ''} onChange={e => setFormData({...formData, processor: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Processor Speed</label>
                  <Input value={formData.processorSpeed || ''} onChange={e => setFormData({...formData, processorSpeed: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">RAM (GB)</label>
                  <Input value={formData.ram || ''} onChange={e => setFormData({...formData, ram: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">SSD (GB)</label>
                  <Input value={formData.ssd || ''} onChange={e => setFormData({...formData, ssd: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">HDD (GB)</label>
                  <Input value={formData.hdd || ''} onChange={e => setFormData({...formData, hdd: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Graphics Card Model</label>
                  <Input value={formData.graphicsCardModel || ''} onChange={e => setFormData({...formData, graphicsCardModel: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Graphics Card GB</label>
                  <Input value={formData.graphicsCardGB || ''} onChange={e => setFormData({...formData, graphicsCardGB: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model</span>
                  <span className="text-right">{asset.modelName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Processor</span>
                  <span className="text-right">{asset.processor || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">RAM</span>
                  <span>{asset.ram ? `${asset.ram} GB` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SSD</span>
                  <span>{asset.ssd ? `${asset.ssd} GB` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">HDD</span>
                  <span>{asset.hdd ? `${asset.hdd} GB` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Motherboard</span>
                  <span className="text-right text-sm">{asset.motherboard || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Processor Speed</span>
                  <span className="text-right text-sm">{asset.processorSpeed || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Graphics</span>
                  <span className="text-right text-sm">{asset.graphicsCardModel || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Graphics Card</span>
                  <span>{asset.graphicsCardGB ? `${asset.graphicsCardGB} GB` : '-'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Software</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-slate-500">OS</label>
                  <Input value={formData.installedOS || ''} onChange={e => setFormData({...formData, installedOS: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">OS License</label>
                  <Input value={formData.licenseOS || ''} onChange={e => setFormData({...formData, licenseOS: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Antivirus</label>
                  <Input value={formData.antivirusLicense || ''} onChange={e => setFormData({...formData, antivirusLicense: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">OS</span>
                  <span>{asset.installedOS || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OS License</span>
                  <span>{asset.licenseOS || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Antivirus</span>
                  <span>{asset.antivirusLicense || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Installed Software</span>
                  <span className="text-right text-sm">{asset.installedSoftware || '-'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.remarks || ''}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{asset.remarks || 'No remarks'}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Warranty Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs text-slate-500">Warranty Provider</label>
                  <Input value={formData.warrantyProvider || ''} onChange={e => setFormData({...formData, warrantyProvider: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Warranty Type</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={formData.warrantyType || ''}
                    onChange={e => setFormData({...formData, warrantyType: e.target.value as any})}
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
                    value={formData.warrantyCost || ''} 
                    onChange={e => setFormData({...formData, warrantyCost: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Expiry Date</label>
                  <Input 
                    type="date"
                    value={formData.expiryDate ? formData.expiryDate.toString().split('T')[0] : ''} 
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="isWarrantyActiveEdit"
                    checked={formData.isWarrantyActive ?? true}
                    onChange={e => setFormData({...formData, isWarrantyActive: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isWarrantyActiveEdit" className="text-sm">Warranty Active</label>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider</span>
                  <span>{asset.warrantyProvider || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span>{asset.warrantyType ? asset.warrantyType.charAt(0).toUpperCase() + asset.warrantyType.slice(1) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cost</span>
                  <span>{asset.warrantyCost ? `৳${asset.warrantyCost.toLocaleString()}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expiry Date</span>
                  <span>{asset.expiryDate ? new Date(asset.expiryDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <Badge variant={asset.isWarrantyActive ? 'success' : 'destructive'}>
                    {asset.isWarrantyActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Assign Asset</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500">Assign To (Employee Name)</label>
                <Input 
                  placeholder="Enter employee name"
                  value={assignTo}
                  onChange={e => setAssignTo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Notes</label>
                <textarea
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional notes..."
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAssignModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={assigning || !assignTo.trim()} className="flex-1">
                  {assigning ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
