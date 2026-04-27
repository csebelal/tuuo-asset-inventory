import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessControlProps {
  stats?: {
    byAccess: Record<string, number>;
    byOS: Record<string, number>;
  } | null;
}

export function AccessControlCard({ stats }: AccessControlProps) {
  const fullAccess = stats?.byAccess['Full Access'] || 16;
  const restricted = stats?.byAccess['Restricted'] || 79;
  const total = fullAccess + restricted || 1;
  const fullPct = (fullAccess / total) * 100;
  const restrictedPct = (restricted / total) * 100;

  const win11 = stats?.byOS['Windows 11 Pro'] || 57;
  const win10 = stats?.byOS['Windows 10 Pro'] || 35;
  const unknown = stats?.byOS['Unknown'] || 8;
  const osTotal = win11 + win10 + unknown || 1;
  const win11Pct = (win11 / osTotal) * 100;
  const win10Pct = (win10 / osTotal) * 100;
  const unknownPct = (unknown / osTotal) * 100;

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-slate-500">Access control</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex gap-2 mt-1">
          <div className="flex-1 bg-slate-100 rounded-lg p-2.5 text-center">
            <div className="text-xl font-medium text-blue-500">{fullAccess}</div>
            <div className="text-[10px] text-slate-500">Full Access</div>
          </div>
          <div className="flex-1 bg-slate-100 rounded-lg p-2.5 text-center">
            <div className="text-xl font-medium text-amber-500">{restricted}</div>
            <div className="text-[10px] text-slate-500">Restricted</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="h-2 rounded-full overflow-hidden flex bg-slate-100">
            <div className="h-full bg-blue-500" style={{ width: `${fullPct}%` }}></div>
            <div className="h-full bg-amber-500" style={{ width: `${restrictedPct}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span className="text-blue-500">{fullPct.toFixed(0)}% Full</span>
            <span className="text-amber-500">{restrictedPct.toFixed(0)}% Restricted</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-[10px] text-slate-400 mb-1.5">OS breakdown</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Windows 11 Pro</span>
                <span>{win11Pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${win11Pct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Windows 10 Pro</span>
                <span>{win10Pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${win10Pct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Unknown / blank</span>
                <span>{unknownPct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: `${unknownPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
