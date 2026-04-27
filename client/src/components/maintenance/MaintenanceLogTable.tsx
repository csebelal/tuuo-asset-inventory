import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { maintenanceApi } from '@/api/client';
import type { MaintenanceType } from '@/types/maintenance.types';

interface MaintenanceLog {
  _id: string;
  assetSL: string;
  maintenanceType: string;
  title?: string;
  description: string;
  technician?: string;
  performedAt: string;
  status: 'completed' | 'pending' | 'in_progress';
  cost?: number;
  nextDueDate?: string;
}

const maintenanceTypes: { value: MaintenanceType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'dust_clean', label: 'Dust Clean' },
  { value: 'hardware_repair', label: 'Hardware' },
  { value: 'ups_install', label: 'UPS' },
  { value: 'power_supply', label: 'Power Supply' },
  { value: 'os_reinstall', label: 'OS' },
  { value: 'other', label: 'Other' },
];

export function MaintenanceLogTable() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await maintenanceApi.getAll({ limit: 100 });
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      dust_clean: 'bg-blue-100 text-blue-700',
      hardware_repair: 'bg-orange-100 text-orange-700',
      power_supply: 'bg-orange-100 text-orange-700',
      ups_install: 'bg-red-100 text-red-700',
      os_reinstall: 'bg-teal-100 text-teal-700',
      other: 'bg-slate-100 text-slate-600',
    };
    return styles[type] || 'bg-slate-100 text-slate-600';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dust_clean: 'Dust Clean',
      hardware_repair: 'Hardware',
      power_supply: 'Power Supply',
      ups_install: 'UPS',
      os_reinstall: 'OS',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-red-100 text-red-700',
      in_progress: 'bg-amber-100 text-amber-700',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.maintenanceType !== filterType) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (search && !log.assetSL.toLowerCase().includes(search.toLowerCase()) && 
        !log.description?.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (startDate || endDate) {
      const logDate = log.performedAt ? new Date(log.performedAt) : null;
      if (!logDate) return false;
      
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
    }
    
    return true;
  });

  const pendingCount = logs.filter((e) => e.status === 'pending').length;
  const thisMonth = logs.filter((e) => {
    if (!e.performedAt) return false;
    const d = new Date(e.performedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs bg-slate-100 text-slate-600 px-2 py-1.5 rounded border-none outline-none"
        >
          {maintenanceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-slate-100 text-slate-600 px-2 py-1.5 rounded border-none outline-none"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
        </select>

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs h-8 w-40"
        />

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500">From:</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs h-8 w-32"
          />
          <span className="text-slate-500">To:</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs h-8 w-32"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex gap-1 ml-auto text-xs">
          <button className={`px-2 py-1 rounded ${filterStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>All</button>
          <button className={`px-2 py-1 rounded ${filterStatus === 'pending' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>Pending ({pendingCount})</button>
          <button className={`px-2 py-1 rounded ${filterStatus === 'thisMonth' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>This Month ({thisMonth})</button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-slate-400">Loading...</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-2 font-medium text-slate-500">Date</th>
                  <th className="text-left p-2 font-medium text-slate-500">Asset</th>
                  <th className="text-left p-2 font-medium text-slate-500">Type</th>
                  <th className="text-left p-2 font-medium text-slate-500">Description</th>
                  <th className="text-left p-2 font-medium text-slate-500">By</th>
                  <th className="text-left p-2 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id} className={`border-b hover:bg-slate-50 ${log.status === 'pending' ? 'bg-red-50' : ''}`}>
                    <td className="p-2 text-slate-600">{formatDate(log.performedAt)}</td>
                    <td className="p-2 font-medium">{log.assetSL}</td>
                    <td className="p-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getTypeBadge(log.maintenanceType)}`}>
                        {getTypeLabel(log.maintenanceType)}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600 max-w-[200px] truncate">{log.description || log.title || '-'}</td>
                    <td className="p-2 text-slate-500">{log.technician || '-'}</td>
                    <td className="p-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusBadge(log.status)}`}>
                        {log.status === 'completed' ? 'Done' : log.status === 'pending' ? 'Pending' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">No events found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
