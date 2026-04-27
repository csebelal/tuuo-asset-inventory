import { useState, useMemo } from 'react';
import { COMPONENT_OPTIONS, formatBDT, getComponentLabel, TYPE_BADGE_STYLE, REASON_BADGE_STYLE } from '@/utils/partsUtils';
import type { ChangeRecord, ComponentType, ChangeReason } from '@/types/parts.types';
import { REASON_OPTIONS } from '@/utils/partsUtils';

interface ByComponentViewProps {
  records: ChangeRecord[];
}

export function ByComponentView({ records }: ByComponentViewProps) {
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | ''>('');

  const filteredRecords = useMemo(() => {
    if (!selectedComponent) return records;
    return records.filter(r => r.componentType === selectedComponent);
  }, [records, selectedComponent]);

  const componentStats = useMemo(() => {
    const stats: Record<string, { count: number; cost: number }> = {};
    records.forEach(record => {
      if (!stats[record.componentType]) {
        stats[record.componentType] = { count: 0, cost: 0 };
      }
      stats[record.componentType].count++;
      stats[record.componentType].cost += record.cost || 0;
    });
    return stats;
  }, [records]);

  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  const getTypeStyle = (type: string) => {
    return TYPE_BADGE_STYLE[type] || TYPE_BADGE_STYLE.other;
  };

  const getReasonStyle = (reason: ChangeReason) => {
    return REASON_BADGE_STYLE[reason] || REASON_BADGE_STYLE.other;
  };

  const getRecordId = (record: ChangeRecord) => record._id || record.id;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedComponent('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedComponent === ''
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({records.length})
        </button>
        {COMPONENT_OPTIONS.filter(c => componentStats[c.value]).map(option => {
          const stats = componentStats[option.value];
          const style = getTypeStyle(option.value);
          return (
            <button
              key={option.value}
              onClick={() => setSelectedComponent(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedComponent === option.value
                  ? 'ring-2 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ 
                backgroundColor: style.bg, 
                color: style.color,
                '--tw-ring-color': selectedComponent === option.value ? style.color : 'transparent',
              } as React.CSSProperties}
            >
              {option.label} ({stats.count})
            </button>
          );
        })}
      </div>

      {selectedComponent && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">{getComponentLabel(selectedComponent)}</span> -{' '}
            <span>{componentStats[selectedComponent]?.count || 0} changes</span>
            <span className="mx-2">|</span>
            <span>Total cost: {formatBDT(componentStats[selectedComponent]?.cost || 0)}</span>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b font-medium text-slate-600">Date</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Asset</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Location</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Old → New</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Reason</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Cost</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const reasonStyle = getReasonStyle(record.reason);
                const recordId = getRecordId(record);
                
                return (
                  <tr key={recordId} className="hover:bg-slate-50">
                    <td className="p-2 border-b">{record.changeDate}</td>
                    <td className="p-2 border-b">
                      <div className="font-medium">{record.assetSL}</div>
                      <div className="text-xs text-slate-500">{record.assetHostname}</div>
                    </td>
                    <td className="p-2 border-b text-xs">
                      <div>{record.department}</div>
                      <div className="text-slate-500">{record.floor}</div>
                    </td>
                    <td className="p-2 border-b">
                      <div className="text-xs">
                        <span className="text-red-600 line-through">{record.oldBrand} {record.oldModel}</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-600 font-medium">{record.newBrand} {record.newModel}</span>
                        {record.newSpec && <div className="text-slate-500">{record.newSpec}</div>}
                      </div>
                    </td>
                    <td className="p-2 border-b">
                      <span 
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: reasonStyle.bg, color: reasonStyle.color }}
                      >
                        {REASON_OPTIONS.find(r => r.value === record.reason)?.label || record.reason}
                      </span>
                    </td>
                    <td className="p-2 border-b">{record.cost > 0 ? formatBDT(record.cost) : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredRecords.length > 0 && (
            <tfoot className="bg-slate-50 font-medium">
              <tr>
                <td colSpan={5} className="p-2 border-b text-right">Total:</td>
                <td className="p-2 border-b">{formatBDT(totalCost)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
