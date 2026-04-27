import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePeripheralChange } from '@/hooks/useAssets';

export function QuickActions() {
  const navigate = useNavigate();
  const [showPeripheralModal, setShowPeripheralModal] = useState(false);
  const peripheralChange = usePeripheralChange();
  
  const [formData, setFormData] = useState({
    assetSL: '',
    peripheralType: 'Mouse',
    oldPeripheral: '',
    newPeripheral: '',
    description: '',
    cost: 0
  });

  const handlePrint = () => {
    window.print  };

  const handleSubmitPeripheral = async (e: React.FormEvent) => {
    e.preventDefault();
    await peripheralChange.mutateAsync(formData);
    setShowPeripheralModal(false);
    setFormData({
      assetSL: '',
      peripheralType: 'Mouse',
      oldPeripheral: '',
      newPeripheral: '',
      description: '',
      cost: 0
    });
  };

  const recentUpdates = [
    { icon: '#22c55e', label: 'TU-085 added', desc: 'AMD Ryzen 9 · 3D dept', date: '11 Jul' },
    { icon: '#3b82f6', label: 'TU-033 updated', desc: 'Power supply replaced', date: '6 May' },
    { icon: '#3b82f6', label: 'TU-042 updated', desc: 'Power supply replaced', date: '23 Oct' },
  ];

  return (
    <>
      <Card className="print:break-inside-avoid">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-slate-500">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-col gap-1.5 mb-3.5">
            <button
              onClick={() => navigate('/maintenance')}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-blue-50 text-xs cursor-pointer text-blue-700 flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              <span>🔧</span> Maintenance
            </button>
            <button
              onClick={() => navigate('/parts')}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-green-50 text-xs cursor-pointer text-green-700 flex items-center gap-1.5 hover:bg-green-100 transition-colors"
            >
              <span>🧩</span> Parts & Components
            </button>
            <button
              onClick={() => navigate('/import')}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs cursor-pointer text-slate-900 flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <span>⬆️</span> Import CSV data
            </button>
            <button
              onClick={() => navigate('/assets')}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs cursor-pointer text-slate-900 flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <span>🔍</span> View incomplete assets
            </button>
            <button
              onClick={handlePrint}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs cursor-pointer text-slate-900 flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <span>🖨️</span> Print / Export PDF
            </button>
          </div>
          <div className="text-xs font-medium text-slate-500 mb-2">Recent updates</div>
          <div className="space-y-0">
            {recentUpdates.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: item.icon }}></div>
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-slate-900">{item.label}</div>
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </div>
                <div className="text-[10px] text-slate-400">{item.date}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showPeripheralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Peripheral Change</h3>
            <form onSubmit={handleSubmitPeripheral} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500">Asset SL *</label>
                <Input
                  required
                  value={formData.assetSL}
                  onChange={(e) => setFormData({ ...formData, assetSL: e.target.value })}
                  placeholder="e.g., TU-001"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Peripheral Type</label>
                <select
                  className="w-full h-10 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={formData.peripheralType}
                  onChange={(e) => setFormData({ ...formData, peripheralType: e.target.value })}
                >
                  <option value="Mouse">Mouse</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Mouse + Keyboard">Mouse + Keyboard</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Old Peripheral (Serial/Model)</label>
                <Input
                  value={formData.oldPeripheral}
                  onChange={(e) => setFormData({ ...formData, oldPeripheral: e.target.value })}
                  placeholder="e.g., Logitech M185"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">New Peripheral (Serial/Model)</label>
                <Input
                  value={formData.newPeripheral}
                  onChange={(e) => setFormData({ ...formData, newPeripheral: e.target.value })}
                  placeholder="e.g., Dell MS116"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Reason for change"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Cost (Tk)</label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPeripheralModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={peripheralChange.isPending} className="flex-1">
                  {peripheralChange.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}