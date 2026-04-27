import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IAsset } from '@/types/asset.types';

interface NeedsAttentionProps {
  alerts: IAsset[] | undefined;
}

export function NeedsAttention({ alerts }: NeedsAttentionProps) {
  const alertList = alerts?.slice(0, 5) || [];

  const getAlertType = (remarks: string) => {
    if (remarks?.toLowerCase().includes('ups')) return { type: 'UPS needed', color: 'orange', dotColor: 'bg-red-500' };
    if (remarks?.toLowerCase().includes('hdmi') || remarks?.toLowerCase().includes('display')) return { type: 'HDMI issue', color: 'red', dotColor: 'bg-orange-500' };
    if (remarks?.toLowerCase().includes('ram') || remarks?.toLowerCase().includes('memory')) return { type: 'RAM issue', color: 'amber', dotColor: 'bg-yellow-500' };
    return { type: 'Attention needed', color: 'gray', dotColor: 'bg-slate-400' };
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
      amber: 'bg-amber-100 text-amber-700',
      gray: 'bg-slate-100 text-slate-600',
    };
    return colors[color] || colors.gray;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
          <span>Needs attention</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{alertList.length} items</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertList.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No alerts</p>
        ) : (
          alertList.map((asset) => {
            const alert = getAlertType(asset.remarks || '');
            return (
              <div key={asset._id} className="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${alert.dotColor}`}></div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-900">{asset.assetSL}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getBadgeColor(alert.color)}`}>{alert.type}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{asset.hostName} · {asset.unit} · {asset.department}</div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
