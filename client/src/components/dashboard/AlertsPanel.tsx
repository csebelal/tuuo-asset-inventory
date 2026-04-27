import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { IAsset } from '@/types/asset.types';

interface AlertsPanelProps {
  alerts: IAsset[] | undefined;
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const alertList = alerts || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          UPS Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertList.length === 0 ? (
          <p className="text-sm text-slate-500">No alerts</p>
        ) : (
          <div className="space-y-2">
            {alertList.map((asset) => (
              <div
                key={asset.assetSL}
                className="p-2 bg-amber-50 rounded-lg text-sm"
              >
                <span className="font-medium">{asset.assetSL}</span>
                <span className="text-slate-600"> - {asset.hostName}</span>
                {asset.employeeName && (
                  <span className="text-slate-500"> ({asset.employeeName})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
