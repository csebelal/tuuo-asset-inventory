import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PeripheralType, PeripheralCondition } from '@/types/maintenance.types';
import { peripherals, maintenanceEvents, allFloors } from '@/data/mockMaintenance';

interface PeripheralTrackerProps {
  onChangePeripheral: (assetSL: string, type: PeripheralType) => void;
}

export function PeripheralTracker({ onChangePeripheral }: PeripheralTrackerProps) {
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  const getConditionBadge = (condition: PeripheralCondition) => {
    const styles: Record<string, string> = {
      good: 'bg-green-100 text-green-700',
      worn: 'bg-amber-100 text-amber-700',
      damaged: 'bg-red-100 text-red-700',
      missing: 'bg-slate-100 text-slate-500',
    };
    return styles[condition] || 'bg-slate-100 text-slate-600';
  };

  const getAssetPeripherals = (assetSL: string) => {
    return peripherals.filter(p => p.assetSL === assetSL);
  };

  const uniqueAssets = [...new Set(peripherals.map(p => p.assetSL))];

  const filteredAssets = uniqueAssets.filter(assetSL => {
    const assetPeripherals = getAssetPeripherals(assetSL);
    const matchingPeripheral = assetPeripherals.find(p => {
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterStatus === 'issues' && p.condition === 'good') return false;
      if (filterStatus === 'good' && p.condition !== 'good') return false;
      return true;
    });
    if (filterStatus === 'issues' && !matchingPeripheral) return false;
    if (filterStatus === 'good' && !matchingPeripheral) return false;
    if (search && !assetSL.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getAssetDepartment = (assetSL: string) => {
    const event = maintenanceEvents.find(e => e.assetSL === assetSL);
    return event?.department || '-';
  };

  const getAssetFloor = (assetSL: string) => {
    const event = maintenanceEvents.find(e => e.assetSL === assetSL);
    return event?.floor || '-';
  };

  const getMouse = (assetSL: string) => peripherals.find(p => p.assetSL === assetSL && p.type === 'mouse');
  const getKeyboard = (assetSL: string) => peripherals.find(p => p.assetSL === assetSL && p.type === 'keyboard');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
          <select
            value={filterFloor}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterFloor(e.target.value)}
            className="text-xs bg-slate-100 text-slate-600 px-2 py-1.5 rounded border-none outline-none"
          >
            <option value="all">All Floors</option>
            {allFloors.map((f: string) => <option key={f} value={f}>{f}</option>)}
          </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs bg-slate-100 text-slate-600 px-2 py-1.5 rounded border-none outline-none"
        >
          <option value="all">All Types</option>
          <option value="mouse">Mouse</option>
          <option value="keyboard">Keyboard</option>
          <option value="headset">Headset</option>
          <option value="monitor">Monitor</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-slate-100 text-slate-600 px-2 py-1.5 rounded border-none outline-none"
        >
          <option value="all">All Status</option>
          <option value="issues">With Issues</option>
          <option value="good">Good Only</option>
        </select>

        <Input
          placeholder="Search asset ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs h-8 w-40"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left p-2 font-medium text-slate-500">Asset</th>
                <th className="text-left p-2 font-medium text-slate-500">Dept</th>
                <th className="text-left p-2 font-medium text-slate-500">Floor</th>
                <th className="text-left p-2 font-medium text-slate-500">Mouse</th>
                <th className="text-left p-2 font-medium text-slate-500">Keyboard</th>
                <th className="text-left p-2 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(assetSL => {
                const mouse = getMouse(assetSL);
                const keyboard = getKeyboard(assetSL);
                const hasIssues = (mouse && mouse.condition !== 'good') || (keyboard && keyboard.condition !== 'good');
                
                return (
                  <>
                    <tr key={assetSL} className={`border-b hover:bg-slate-50 cursor-pointer ${hasIssues ? 'bg-red-50' : ''}`} onClick={() => setExpandedAsset(expandedAsset === assetSL ? null : assetSL)}>
                      <td className="p-2 font-medium">{assetSL}</td>
                      <td className="p-2 text-slate-500">{getAssetDepartment(assetSL)}</td>
                      <td className="p-2 text-slate-500">{getAssetFloor(assetSL)}</td>
                      <td className="p-2">
                        {mouse ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">{mouse.brand} {mouse.model}</span>
                            <span className={`text-[10px] px-1 rounded ${getConditionBadge(mouse.condition)}`}>{mouse.condition}</span>
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-2">
                        {keyboard ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">{keyboard.brand} {keyboard.model}</span>
                            <span className={`text-[10px] px-1 rounded ${getConditionBadge(keyboard.condition)}`}>{keyboard.condition}</span>
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); onChangePeripheral(assetSL, 'mouse'); }}>
                            🖱
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={(e) => { e.stopPropagation(); onChangePeripheral(assetSL, 'keyboard'); }}>
                            ⌨
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedAsset === assetSL && (
                      <tr className="bg-slate-100">
                        <td colSpan={6} className="p-3">
                          <div className="grid grid-cols-4 gap-2">
                            {peripherals.filter(p => p.assetSL === assetSL).map(p => (
                              <div key={p.id} className="p-2 bg-white rounded border">
                                <div className="text-[10px] font-medium text-slate-500 uppercase">{p.type}</div>
                                <div className="text-xs">{p.brand} {p.model}</div>
                                <div className="text-[10px] text-slate-500">{p.connectionType} · {p.condition}</div>
                                {p.lastChanged && <div className="text-[10px] text-slate-400">Changed: {p.lastChanged}</div>}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">No peripherals found</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
