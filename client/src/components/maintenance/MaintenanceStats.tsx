import { Card, CardContent } from '@/components/ui/card';
import { MaintenanceStats as MaintenanceStatsType } from '@/types/maintenance.types';
import { getDustCleanStatus } from '@/utils/dateUtils';

interface MaintenanceStatsProps {
  stats: MaintenanceStatsType;
  lastCleanDate: string;
}

export function MaintenanceStats({ stats, lastCleanDate }: MaintenanceStatsProps) {
  const cleanStatus = getDustCleanStatus(lastCleanDate, 3);

  const getDaysAgo = (dateStr: string) => {
    if (!dateStr) return 0;
    const [d, m, y] = dateStr.split('.').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysSinceClean = lastCleanDate ? getDaysAgo(lastCleanDate) : 0;

  const getAccentColor = (status: string) => {
    if (status === 'overdue') return 'text-red-600';
    if (status === 'due_soon') return 'text-amber-600';
    return 'text-blue-600';
  };

  const getBgColor = (status: string) => {
    if (status === 'overdue') return 'bg-red-50 border-red-200';
    if (status === 'due_soon') return 'bg-amber-50 border-amber-200';
    return 'bg-slate-50 border-slate-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
      <Card className={`border ${getBgColor(cleanStatus.status)}`}>
        <CardContent className="p-3">
          <div className="text-[10px] text-slate-500 mb-1">🧹 Next Dust Clean</div>
          <div className={`text-lg font-semibold ${getAccentColor(cleanStatus.status)}`}>
            {stats.nextDustClean}
          </div>
          <div className={`text-[10px] ${cleanStatus.daysLeft <= 0 ? 'text-red-500' : cleanStatus.daysLeft <= 14 ? 'text-amber-500' : 'text-slate-500'}`}>
            {cleanStatus.daysLeft <= 0 ? `${Math.abs(cleanStatus.daysLeft)} days overdue` : `${cleanStatus.daysLeft} days away`}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-slate-500 mb-1">✓ Last Cleaned</div>
          <div className="text-lg font-semibold text-slate-900">{lastCleanDate || 'Never'}</div>
          <div className="text-[10px] text-slate-500">{daysSinceClean} days ago</div>
        </CardContent>
      </Card>

      <Card className={`border ${stats.pendingActions > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <CardContent className="p-3">
          <div className="text-[10px] text-slate-500 mb-1">⚠ Pending Actions</div>
          <div className={`text-lg font-semibold ${stats.pendingActions > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {stats.pendingActions}
          </div>
          <div className="text-[10px] text-slate-500">UPS: 2, Hardware: 1</div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-orange-600 mb-1">🖱 Peripheral Issues</div>
          <div className="text-lg font-semibold text-orange-700">{stats.assetsWithPeripheralIssues} assets</div>
          <div className="text-[10px] text-orange-600">1 damaged, 2 worn</div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="text-[10px] text-blue-600 mb-1">📋 Total Events</div>
          <div className="text-lg font-semibold text-blue-700">{stats.totalEvents}</div>
          <div className="text-[10px] text-blue-600">{stats.hardwareRepairs} repairs · {stats.dustCleans} clean</div>
        </CardContent>
      </Card>
    </div>
  );
}
