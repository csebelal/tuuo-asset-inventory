import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FloorName } from '@/types/maintenance.types';
import { dustCleanHistory, dustCleanSchedule, floorAssetCounts, allFloors } from '@/data/mockMaintenance';
import { getDustCleanStatus, getDaysAgo } from '@/utils/dateUtils';

interface DustCleanScheduleProps {
  onMarkDone: () => void;
}

export function DustCleanSchedule({ onMarkDone }: DustCleanScheduleProps) {
  const lastClean = dustCleanHistory[0];
  const schedule = dustCleanSchedule;
  const status = getDustCleanStatus(schedule.lastCleanDate, schedule.intervalMonths);
  const daysSinceClean = schedule.lastCleanDate ? getDaysAgo(schedule.lastCleanDate) : 0;

  const getDotColor = (itemStatus: string) => {
    if (itemStatus === 'overdue') return 'bg-red-500';
    if (itemStatus === 'due_soon') return 'bg-amber-500';
    if (itemStatus === 'upcoming') return 'bg-blue-500';
    return 'bg-slate-400';
  };

  const getBadgeColor = (itemStatus: string) => {
    if (itemStatus === 'overdue') return 'bg-red-100 text-red-700';
    if (itemStatus === 'due_soon') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getFloorLastClean = (floor: FloorName): { date: string | null; daysAgo: number } => {
    const lastCleanSession = dustCleanHistory.find(s => s.floors.includes(floor));
    if (!lastCleanSession) return { date: null, daysAgo: -1 };
    return { date: lastCleanSession.date, daysAgo: getDaysAgo(lastCleanSession.date) };
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Schedule Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schedule.nextScheduled.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getDotColor(item.status)}`}></div>
                    {idx < schedule.nextScheduled.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1"></div>}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{item.dueDate}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getBadgeColor(item.status)}`}>
                        {item.daysUntilDue <= 0 ? `${Math.abs(item.daysUntilDue)} days overdue` : item.daysUntilDue <= 14 ? 'Due soon' : `${item.daysUntilDue} days`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.floors.map((floor, fIdx) => (
                        <span key={fIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{floor}</span>
                      ))}
                    </div>
                    {idx === 0 && (
                      <Button size="sm" variant="outline" className="mt-2 text-[10px] h-6" onClick={onMarkDone}>
                        Mark as Done →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">Last Clean Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">Date</div>
                <div className="text-sm font-medium">{lastClean.date}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Floors Cleaned</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {lastClean.floors.map((floor, idx) => (
                    <span key={idx} className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{floor}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Assets Cleaned</div>
                <div className="text-sm font-medium">{lastClean.assetsCleaned} assets</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Cleaned By</div>
                <div className="text-sm font-medium">{lastClean.cleanedBy}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Time Since Last Clean</div>
                <div className="text-sm font-medium">{daysSinceClean} days ago</div>
                <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${status.pct >= 80 ? 'bg-red-500' : status.pct >= 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${status.pct}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{status.pct}% of 90 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-slate-500">Floor Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {allFloors.map((floor) => {
              const floorData = getFloorLastClean(floor);
              const assetCount = floorAssetCounts[floor];
              const isClean = floorData.date !== null && floorData.daysAgo < 90;
              const isDueSoon = floorData.date !== null && floorData.daysAgo >= 60 && floorData.daysAgo < 90;
              
              return (
                <div 
                  key={floor} 
                  className={`p-2 rounded-lg border ${isClean ? 'border-green-200 bg-green-50' : isDueSoon ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-900">{floor}</span>
                    {isClean ? <span className="text-green-600 text-xs">✓</span> : <span className="text-red-500 text-xs">✗</span>}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {floorData.date || 'Never cleaned'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {assetCount} assets
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
