import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FloorGridProps {
  data: { _id: string; count: number }[] | undefined;
}

export function FloorGrid({ data }: FloorGridProps) {
  const floors = data?.filter(f => f._id) || [];
  const maxCount = Math.max(...floors.map(f => f.count), 1);

  const floorColors: Record<string, string> = {
    '10th Floor A': '#3b82f6',
    '10th Floor B': '#f97316',
    '6th Floor': '#8b5cf6',
    '1st Floor': '#22c55e',
    'Server Room': '#64748b',
  };

  const getColor = (floor: string) => floorColors[floor] || '#3b82f6';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
          <span>By floor / unit</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{floors.length} locations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {floors.map((floor) => (
            <div key={floor._id} className="bg-slate-50 rounded-lg p-2.5">
              <div className="text-[11px] text-slate-500 mb-1">{floor._id}</div>
              <div className="text-xl font-medium" style={{ color: getColor(floor._id) }}>{floor.count}</div>
              <div className="h-1 rounded mt-1.5" style={{ background: `linear-gradient(to right, ${getColor(floor._id)} ${(floor.count / maxCount) * 100}%, transparent 0)` }}></div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="text-[11px] text-slate-400 mb-2">Server room</div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-[11px] text-slate-500">NAS</div>
              <div className="text-base font-medium text-slate-900">1</div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-[11px] text-slate-500">Switches</div>
              <div className="text-base font-medium text-slate-900">5</div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-[11px] text-slate-500">Routers</div>
              <div className="text-base font-medium text-slate-900">2</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
