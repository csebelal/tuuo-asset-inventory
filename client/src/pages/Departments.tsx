import { useDashboardByDepartment } from '@/hooks/useAssets';
import { DepartmentChart } from '@/components/dashboard/DepartmentChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DepartmentsPage() {
  const { data } = useDashboardByDepartment();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assets by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentChart data={data} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
