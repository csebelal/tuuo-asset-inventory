import { useDashboardByFloor } from '@/hooks/useAssets';
import { FloorChart } from '@/components/dashboard/FloorChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FloorsPage() {
  const { data } = useDashboardByFloor();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assets by Floor</CardTitle>
        </CardHeader>
        <CardContent>
          <FloorChart data={data} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {data?.map((item: { _id: string; count: number }) => (
          <Card key={item._id}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{item._id || 'Unknown'}</p>
              <p className="text-2xl font-bold">{item.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
