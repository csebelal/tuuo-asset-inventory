import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMaintenanceLogs } from '@/hooks/useAssets';
import { mockMaintenanceLog } from '@/data/mockDashboard';

const maintenanceTypes = ['All', 'Dust Clean', 'Peripheral Change', 'Hardware Fix', 'Software Update', 'Inspection'];

export function MaintenanceTimeline() {
  const [filter, setFilter] = useState('All');
  const { data: logs, isLoading } = useMaintenanceLogs(filter === 'All' ? undefined : filter);
  
  const events = logs && logs.length > 0 ? logs : mockMaintenanceLog;

  const getTagStyle = (tag: string) => {
    const styles: Record<string, string> = {
      'New Asset': 'bg-green-100 text-green-700',
      'Maintenance': 'bg-blue-100 text-blue-700',
      'Hardware Fix': 'bg-amber-100 text-amber-700',
      'Action needed': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700',
      'Dust Clean': 'bg-cyan-100 text-cyan-700',
      'Peripheral Change': 'bg-purple-100 text-purple-700',
      'Software Update': 'bg-indigo-100 text-indigo-700',
      'Inspection': 'bg-teal-100 text-teal-700',
    };
    return styles[tag] || 'bg-slate-100 text-slate-600';
  };

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      'Dust Clean': '#06b6d4',
      'Peripheral Change': '#a855f7',
      'Hardware Fix': '#eab308',
      'Software Update': '#6366f1',
      'Inspection': '#14b8a6',
    };
    return colors[type] || '#64748b';
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-3">
        <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
          <span>Maintenance history</span>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border-none outline-none cursor-pointer"
            >
              {maintenanceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{events.length} events</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="relative pl-5 max-h-[280px] overflow-y-auto">
            <div className="absolute left-[6px] top-1.5 bottom-1.5 w-0.5 bg-slate-200 rounded"></div>
            {events.length === 0 ? (
              <p className="text-xs text-slate-400">No maintenance records found</p>
            ) : (
              events.map((event: any, idx: number) => (
                <div key={idx} className="relative pb-4 last:pb-0">
                  <div 
                    className="absolute left-[-14px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: getColor(event.maintenanceType || event.tag) }}
                  ></div>
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    {formatDate(event.performedAt || event.date)}
                  </div>
                  <div className="text-xs font-medium text-slate-900">
                    {event.assetSL} — {event.maintenanceType || event.tag}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {event.description || event.meta}
                    {event.technician && ` · ${event.technician}`}
                  </div>
                  {(event.peripheralType || event.newPeripheral) && (
                    <div className="text-[10px] text-purple-600 mt-1">
                      {event.peripheralType}: {event.oldPeripheral} → {event.newPeripheral}
                    </div>
                  )}
                  <span className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${getTagStyle(event.maintenanceType || event.tag)}`}>
                    {event.maintenanceType || event.tag}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
