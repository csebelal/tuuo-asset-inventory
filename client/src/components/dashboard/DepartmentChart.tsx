import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DepartmentChartProps {
  data: { _id: string; count: number }[] | undefined;
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  const departments = data?.filter(d => d._id && d._id !== '') || [];
  const maxCount = Math.max(...departments.map(d => d.count), 1);
  const sortedDepts = [...departments].sort((a, b) => b.count - a.count);

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
          <span>By department</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{departments.length} depts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {sortedDepts.slice(0, 9).map((dept) => (
          <div key={dept._id} className="flex items-center gap-2">
            <div className="text-[11px] text-slate-600 w-24 truncate flex-shrink-0">{dept._id}</div>
            <div className="flex-1 min-h-[14px] bg-[#f8f8f6] rounded-full overflow-hidden">
              <div 
                style={{ 
                  width: `${Math.max((dept.count / maxCount) * 100, 2)}%`,
                  background: '#3b82f6',
                  height: '14px',
                  borderRadius: '7px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div className="text-[11px] font-medium text-slate-900 w-5 text-right flex-shrink-0">{dept.count}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
