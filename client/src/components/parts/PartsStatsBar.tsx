import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatBDT, getComponentLabel } from '@/utils/partsUtils';
import type { ChangeRecord } from '@/types/parts.types';

interface PartsStatsBarProps {
  records: ChangeRecord[];
  totalAssets?: number;
}

export function PartsStatsBar({ records, totalAssets = 0 }: PartsStatsBarProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthRecords = useMemo(() => {
    return records.filter(record => {
      const dateStr = record.changeDate;
      if (!dateStr) return false;
      
      const parts = dateStr.split('.');
      let month: number, year: number;
      
      console.log('Filtering date:', dateStr, 'parts:', parts);
      
      if (parts.length === 3) {
        const [, m, y] = parts;
        month = parseInt(m);
        year = parseInt(y);
      } else if (parts.length === 2) {
        const [m, y] = parts;
        month = parseInt(m);
        year = parseInt(y);
      } else if (parts.length === 1) {
        year = parseInt(parts[0]);
        month = 0;
      } else {
        return false;
      }
      
      const matches = month === currentMonth + 1 && year === currentYear;
      console.log('Date:', dateStr, '-> month:', month, 'year:', year, 'matches:', matches, 'expected:', currentMonth + 1, currentYear);
      
      return matches;
    });
  }, [records, currentMonth, currentYear]);

  const componentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(record => {
      counts[record.componentType] = (counts[record.componentType] || 0) + 1;
    });
    return counts;
  }, [records]);

  const topComponent = useMemo(() => {
    const sorted = Object.entries(componentCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  }, [componentCounts]);

  const totalCost = useMemo(() => {
    return records.reduce((sum, r) => sum + (r.cost || 0), 0);
  }, [records]);

  const assetsWithComponents = useMemo(() => {
    return new Set(records.map(r => r.assetSL)).size;
  }, [records]);

  return (
    <section aria-label="Parts and components statistics" className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-slate-500 mb-1" aria-hidden="true">📋 Total Changes</div>
          <div className="text-lg font-semibold text-slate-900">{records.length}</div>
          <div className="text-[10px] text-slate-500">All time</div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-blue-600 mb-1" aria-hidden="true">📅 This Month</div>
          <div className="text-lg font-semibold text-blue-700">{thisMonthRecords.length}</div>
          <div className="text-[10px] text-blue-600">{currentMonth + 1}/{currentYear}</div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-purple-600 mb-1" aria-hidden="true">🔧 Top Part</div>
          <div className="text-lg font-semibold text-purple-700">
            {topComponent ? getComponentLabel(topComponent[0] as any) : 'N/A'}
          </div>
          <div className="text-[10px] text-purple-600">{topComponent ? `${topComponent[1]} changes` : 'No data'}</div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-green-600 mb-1" aria-hidden="true">💰 Total Cost</div>
          <div className="text-lg font-semibold text-green-700">{formatBDT(totalCost)}</div>
          <div className="text-[10px] text-green-600">{records.filter(r => r.cost > 0).length} paid</div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-orange-600 mb-1" aria-hidden="true">🖥 Assets Tracked</div>
          <div className="text-lg font-semibold text-orange-700">{assetsWithComponents}</div>
          <div className="text-[10px] text-orange-600">{totalAssets} total assets</div>
        </CardContent>
      </Card>
    </section>
  );
}
