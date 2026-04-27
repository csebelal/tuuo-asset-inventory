import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAlerts } from '@/data/mockDashboard';

export function NeedsAttentionPanel() {
  const alerts = mockAlerts;

  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-orange-100 text-orange-700';
      case 'warning': return 'bg-red-100 text-red-700';
      case 'info': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getDotColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const getAlertType = (type: string) => {
    switch (type) {
      case 'ups': return 'UPS needed';
      case 'hardware': return 'HDMI issue';
      case 'software': return 'Software issue';
      case 'missing': return 'Missing info';
      default: return 'Attention needed';
    }
  };

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-3">
        <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
          <span>Needs attention</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{alerts.length} items</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${getDotColor(alert.severity)}`}></div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-900">{alert.id}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getBadgeStyle(alert.severity)}`}>
                  {getAlertType(alert.type)}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{alert.description} · {alert.department}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
