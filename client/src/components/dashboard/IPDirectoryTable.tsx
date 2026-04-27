import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockIPDirectory } from '@/data/mockDashboard';

export function IPDirectoryTable() {
  const [filter, setFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredData = filter
    ? mockIPDirectory.filter(r =>
        r.id.toLowerCase().includes(filter.toLowerCase()) ||
        r.host.toLowerCase().includes(filter.toLowerCase()) ||
        r.ip.includes(filter) ||
        r.dept.toLowerCase().includes(filter.toLowerCase()) ||
        r.floor.toLowerCase().includes(filter.toLowerCase())
      )
    : mockIPDirectory;

  const copyIP = (ip: string, id: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <Card className="print:break-inside-avoid">
      <CardHeader className="pb-3">
        <CardTitle className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
          <span>IP address directory</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by IP, host, dept..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-xs text-slate-900 outline-none w-[200px]"
            />
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {filteredData.length} entries
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 px-2 text-[10px] font-medium text-slate-400 bg-slate-100 border-b border-slate-200">Asset ID</th>
                <th className="text-left py-1 px-2 text-[10px] font-medium text-slate-400 bg-slate-100 border-b border-slate-200">Hostname</th>
                <th className="text-left py-1 px-2 text-[10px] font-medium text-slate-400 bg-slate-100 border-b border-slate-200">IP Address</th>
                <th className="text-left py-1 px-2 text-[10px] font-medium text-slate-400 bg-slate-100 border-b border-slate-200">Department</th>
                <th className="text-left py-1 px-2 text-[10px] font-medium text-slate-400 bg-slate-100 border-b border-slate-200">Floor</th>
                <th className="text-left py-1 px-2 text-[10px] font-medium text-slate-400 bg-slate-100 border-b border-slate-200">Status</th>
                <th className="py-1 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 border-b border-slate-100 font-medium text-slate-900">{row.id}</td>
                  <td className="py-1.5 px-2 border-b border-slate-100 text-slate-600">{row.host}</td>
                  <td className="py-1.5 px-2 border-b border-slate-100 font-mono text-slate-900">{row.ip}</td>
                  <td className="py-1.5 px-2 border-b border-slate-100 text-slate-600">{row.dept}</td>
                  <td className="py-1.5 px-2 border-b border-slate-100 text-slate-600">{row.floor}</td>
                  <td className="py-1.5 px-2 border-b border-slate-100">
                    <span className="inline-flex items-center">
                      <span 
                        className="w-1.5 h-1.5 rounded-full mr-1" 
                        style={{ background: row.status === 'active' ? '#22c55e' : '#f97316' }}
                      ></span>
                      {row.status === 'active' ? 'Active' : 'Warning'}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 border-b border-slate-100">
                    <button
                      onClick={() => copyIP(row.ip, row.id)}
                      className={`px-1.5 py-0.5 text-[10px] rounded border cursor-pointer transition-colors ${
                        copiedId === row.id
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400'
                      }`}
                    >
                      {copiedId === row.id ? 'Copied!' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
