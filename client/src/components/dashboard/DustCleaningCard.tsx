import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMaintenanceSchedule, useDustClean } from '@/hooks/useAssets';

const floorOrder = ['10th Floor A', '10th Floor B', '6th Floor', '1st Floor', 'Server Room'];

export function DustCleaningCard() {
  const { data: schedule, isLoading, refetch } = useMaintenanceSchedule();
  const dustClean = useDustClean();

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isOverdue = (date: string | null) => {
    if (!date) return true;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return new Date(date) < threeMonthsAgo;
  };

  const handleCleanFloor = async (floor: string) => {
    await dustClean.mutateAsync({ floor });
    refetch();
  };

  const floors = schedule?.floors?.sort((a: any, b: any) => {
    return floorOrder.indexOf(a._id) - floorOrder.indexOf(b._id);
  }) || [];

  const overdueCount = schedule?.overdueCount || 0;

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-3">
        <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
          <span>Dust Cleaning Schedule</span>
          {overdueCount > 0 && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
              {overdueCount} overdue
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {floors.map((floor: any) => {
              const overdue = isOverdue(floor.lastCleaned);
              return (
                <div 
                  key={floor._id} 
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    overdue ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium text-slate-900">{floor._id}</div>
                    <div className="text-[10px] text-slate-500">
                      Last: {formatDate(floor.lastCleaned)} · {floor.cleanedCount}/{floor.totalAssets} cleaned
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={overdue ? "destructive" : "outline"}
                    className="text-[10px] h-7"
                    onClick={() => handleCleanFloor(floor._id)}
                    disabled={dustClean.isPending}
                  >
                    {dustClean.isPending ? 'Cleaning...' : overdue ? 'Clean Now' : 'Cleaned'}
                  </Button>
                </div>
              );
            })}
            {floors.length === 0 && (
              <p className="text-xs text-slate-400">No floor data available</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
