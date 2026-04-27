import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DepartmentBarsProps {
  data: { _id: string; count: number }[] | undefined;
}

export function DepartmentBars({ data }: DepartmentBarsProps) {
  const departments = data?.filter(d => d._id) || [];
  const maxCount = Math.max(...departments.map(d => d.count), 1);

  const deptColors: Record<string, string> = {
    'Designer': '#3b82f6',
    '3D': '#8b5cf6',
    'QC': '#22c55e',
    'Team Leader': '#f97316',
    'Marketing': '#ec4899',
    'Customer Support': '#06b6d4',
    'Shift Incharge': '#f59e0b',
    'Accounts': '#14b8a6',
    'IT': '#6366f1',
    'Video Editor': '#a855f7',
  };

  const getColor = (dept: string) => deptColors[dept] || '#3b82f6';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
          <span>By department</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{departments.length} depts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {departments.slice(0, 8).map((dept) => (
          <div key={dept._id} className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-0">
            <div className="text-xs text-slate-600 w-20 truncate flex-shrink-0">{dept._id}</div>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ width: `${(dept.count / maxCount) * 100}%`, background: getColor(dept._id) }}
              ></div>
            </div>
            <div className="text-xs font-medium text-slate-900 w-6 text-right flex-shrink-0">{dept.count}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
