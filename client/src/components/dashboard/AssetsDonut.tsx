import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssetsDonutProps {
  data: { _id: string; count: number }[] | undefined;
  total: number;
}

export function AssetsDonut({ data, total }: AssetsDonutProps) {
  const desktop = data?.find(d => d._id === 'Desktop')?.count || 0;
  const network = data?.find(d => d._id === 'Network Switch')?.count || 0;
  const laptop = data?.find(d => d._id === 'Laptop')?.count || 0;
  const other = data?.filter(d => d._id !== 'Desktop' && d._id !== 'Network Switch' && d._id !== 'Laptop').reduce((acc, d) => acc + d.count, 0) || 0;

  const totalVal = total || 1;
  const circumference = 2 * Math.PI * 28;
  
  const desktopPct = (desktop / totalVal) * 100;
  const networkPct = (network / totalVal) * 100;
  const laptopPct = (laptop / totalVal) * 100;
  const otherPct = (other / totalVal) * 100;

  const desktopDash = (desktopPct / 100) * circumference;
  const networkDash = (networkPct / 100) * circumference;
  const laptopDash = (laptopPct / 100) * circumference;
  const otherDash = (otherPct / 100) * circumference;

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-0">
        <CardTitle className="text-[13px] font-medium text-slate-500 flex items-center justify-between">
          <span>Assets by type</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{total} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4">
          <svg width="240" height="240" viewBox="0 0 100 100" aria-label="Assets donut chart" role="img">
            <circle cx="50" cy="50" r="28" fill="none" stroke="#f1f5f9" strokeWidth="12"/>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray={`${desktopDash} ${circumference}`} strokeDashoffset="0" transform="rotate(-90 50 50)"/>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray={`${networkDash} ${circumference}`} strokeDashoffset={`-${desktopDash}`} transform="rotate(-90 50 50)"/>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray={`${laptopDash} ${circumference}`} strokeDashoffset={`-${desktopDash + networkDash}`} transform="rotate(-90 50 50)"/>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#a855f7" strokeWidth="12" strokeDasharray={`${otherDash} ${circumference}`} strokeDashoffset={`-${desktopDash + networkDash + laptopDash}`} transform="rotate(-90 50 50)"/>
            <text x="50" y="46" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1a1a18">{total}</text>
            <text x="50" y="60" textAnchor="middle" fontSize="7" fill="#5a5a55">assets</text>
          </svg>
          
          <div className="flex flex-col gap-1" aria-label="Asset type legend">
            <div className="flex items-center gap-2 text-[13px]">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#3b82f6' }}></div>
              <span className="text-slate-700">Desktop</span>
              <span className="font-semibold text-slate-900">{desktop}</span>
              <span className="text-slate-400">({desktopPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#22c55e' }}></div>
              <span className="text-slate-700">Network</span>
              <span className="font-semibold text-slate-900">{network}</span>
              <span className="text-slate-400">({networkPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#f97316' }}></div>
              <span className="text-slate-700">Laptop</span>
              <span className="font-semibold text-slate-900">{laptop}</span>
              <span className="text-slate-400">({laptopPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <div className="w-2 h-2 rounded-sm" style={{ background: '#a855f7' }}></div>
              <span className="text-slate-700">NAS/Router</span>
              <span className="font-semibold text-slate-900">{other}</span>
              <span className="text-slate-400">({otherPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}