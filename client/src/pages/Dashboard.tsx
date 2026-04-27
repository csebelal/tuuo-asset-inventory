import { useEffect, useState, useMemo } from 'react';
import { useDashboardStats } from '@/hooks/useAssets';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { assetsApi, stockApi, maintenanceApi } from '@/api/client';
import type { IAsset } from '@/types/asset.types';
import type { IMaintenanceLog } from '@/types/maintenance.types';
import { 
  Package, Monitor, Laptop, Wifi, Boxes, Plus,
  AlertCircle,
  ArrowRight, CheckCircle,
  Activity, Settings
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const [expiringWarranties, setExpiringWarranties] = useState<IAsset[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<IMaintenanceLog[]>([]);

  const warrantyStats = useMemo(() => {
    const byStatus = stats?.byStatus || {};
    const active = (byStatus['Active'] || 0) + (byStatus['With user'] || 0) + (byStatus['Server Room'] || 0) + (byStatus['With User'] || 0);
    const underRepair = (byStatus['In Repair'] || 0) + (byStatus['Under Repair'] || 0) + (byStatus['In Maintenance'] || 0);
    const inactive = (byStatus['Inactive'] || 0) + (byStatus['Decommissioned'] || 0);
    const warrantyExpiring = expiringWarranties.length;
    return { active, underRepair, inactive, warrantyExpiring };
  }, [stats?.byStatus, expiringWarranties]);

  const departmentData = useMemo(() => {
    const depts = stats?.byDepartment || {};
    const total = Object.values(depts).reduce((sum: number, v) => sum + (v as number), 0) || 1;
    return Object.entries(depts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([dept, count]) => ({
        name: dept || 'Unknown',
        count: count as number,
        pct: Math.round((count as number / total) * 100)
      }));
  }, [stats?.byDepartment]);

  const floorData = useMemo(() => {
    const floors = stats?.byFloor || {};
    const total = Object.values(floors).reduce((sum: number, v) => sum + (v as number), 0) || 1;
    return Object.entries(floors)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6)
      .map(([floor, count]) => ({
        name: floor || 'Unknown',
        count: count as number,
        pct: Math.round((count as number / total) * 100)
      }));
  }, [stats?.byFloor]);

  useEffect(() => {
    assetsApi.getExpiringWarranty(30).then(res => {
      console.log('Expiring warranties:', res.data);
      setExpiringWarranties(res.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    stockApi.getSummary().then(res => {
      const summary = res.data || {};
      const total = Object.values(summary).reduce((sum: number, item: any) => sum + (item.Total || 0), 0);
      setTotalStock(total);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    maintenanceApi.getUpcoming(30).then(res => {
      setUpcomingMaintenance(Array.isArray(res.data) ? res.data : []);
    }).catch((err) => {
      console.error('Failed to fetch maintenance:', err);
      setUpcomingMaintenance([]);
    });
  }, []);

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Assets', value: stats?.totalAssets || 0, color: 'blue', icon: Package, path: '/assets' },
    { label: 'Desktops', value: stats?.byType['Desktop'] || 0, color: 'blue', icon: Monitor, path: '/assets?type=Desktop' },
    { label: 'Laptops', value: stats?.byType['Laptop'] || 0, color: 'purple', icon: Laptop, path: '/assets?type=Laptop' },
    { label: 'Network', value: (stats?.byType['Network Switch'] || 0) + (stats?.byType['Asus Router WIFI'] || 0), color: 'orange', icon: Wifi, path: '/assets?type=Network%20Switch' },
    { label: 'Stock', value: totalStock, color: 'green', icon: Boxes, path: '/stock' },
  ];

  const statusCards = [
    { label: 'Active', value: warrantyStats.active, color: 'green', path: '/assets?status=With%20user&status=Server%20Room' },
    { label: 'Inactive', value: warrantyStats.inactive, color: 'slate', path: '/assets?status=Inactive&status=Decommissioned' },
    { label: 'Under Repair', value: warrantyStats.underRepair, color: 'orange', path: '/assets?status=In%20Repair' },
    { label: 'Warranty Expiring', value: warrantyStats.warrantyExpiring, color: 'red', path: '/assets?warranty=expiring' },
  ];

  const quickActions = [
    { icon: Plus, label: 'Add Asset', sub: 'Register new', color: 'blue', path: '/assets/new' },
    { icon: Package, label: 'All Assets', sub: 'Browse', color: 'blue', path: '/assets' },
    { icon: Activity, label: 'Maintenance', sub: 'Schedule', color: 'orange', path: '/maintenance' },
    { icon: Settings, label: 'Parts', sub: 'Components', color: 'green', path: '/parts' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-green-50 text-green-600 border-green-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-3 py-3 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Asset Inventory Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => navigate('/import')} className="gap-1.5 border-slate-300 flex-1 sm:flex-none justify-center">
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button size="sm" onClick={() => navigate('/assets/new')} className="bg-green-600 hover:bg-green-700 gap-1.5 flex-1 sm:flex-none justify-center">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Asset</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-3 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {statCards.map((item) => {
            const c = colorClasses[item.color];
            const Icon = item.icon;
            const hasData = item.value > 0;
            
            const borderColors: Record<string, string> = {
              blue: 'border-l-green-500',
              green: 'border-l-green-500',
              purple: 'border-l-purple-500',
              orange: 'border-l-orange-500',
              cyan: 'border-l-cyan-500',
            };
            
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm border-l-4 ${hasData ? borderColors[item.color] : 'border-l-slate-300'} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left flex flex-row items-center justify-between min-h-[100px] sm:min-h-[120px] ${hasData ? 'border border-slate-200' : 'border border-slate-100 opacity-60'}`}
              >
                <div>
                  <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${hasData ? 'text-slate-900' : 'text-slate-400'}`}>{item.value}</div>
                  <div className="text-sm sm:text-base font-medium text-slate-500 truncate mt-1">{item.label}</div>
                  {!hasData && <div className="text-xs text-slate-400 mt-1">No data</div>}
                </div>
                <div className={`p-3 sm:p-4 rounded-xl ${hasData ? c.split(' ')[0] : 'bg-slate-100'}`}>
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${hasData ? c.split(' ')[1] : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Asset Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusCards.map(item => {
            const borderColors: Record<string, string> = {
              green: 'border-l-green-500',
              slate: 'border-l-slate-500',
              orange: 'border-l-orange-500',
              red: 'border-l-red-500',
            };
            return (
              <button 
                key={item.label} 
                onClick={() => navigate(item.path)}
                className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${borderColors[item.color]} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left`}
              >
                <div className={`text-2xl font-bold ${
                  item.color === 'green' ? 'text-green-700' : 
                  item.color === 'slate' ? 'text-slate-700' : 
                  item.color === 'orange' ? 'text-orange-700' : 'text-red-700'
                }`}>{item.value}</div>
                <div className="text-sm text-slate-500">{item.label}</div>
              </button>
            );
          })}
        </div>

        {/* Department & Floor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-3 sm:p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Department Distribution</h2>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              {departmentData.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No department data</p>
              ) : (
                departmentData.map((dept: { name: string; count: number; pct: number }) => (
                  <div key={dept.name} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-slate-600 truncate">{dept.name}</div>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${dept.pct}%` }}></div>
                    </div>
                    <div className="w-10 text-xs font-bold text-slate-700 text-right">{dept.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Floor/Location */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-3 sm:p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Floor/Location</h2>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              {floorData.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No floor data</p>
              ) : (
                floorData.map((floor: { name: string; count: number; pct: number }) => (
                  <div key={floor.name} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-slate-600 truncate">{floor.name}</div>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${floor.pct}%` }}></div>
                    </div>
                    <div className="w-10 text-xs font-bold text-slate-700 text-right">{floor.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-3 sm:p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Quick Actions</h2>
            </div>
            <div className="p-2 sm:p-3 grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const c = colorClasses[action.color];
                return (
                  <button key={action.label} onClick={() => navigate(action.path)} className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg border ${c.split(' ')[2]} hover:bg-slate-50 transition-colors text-left`}>
                    <Icon className={`w-4 h-4 ${c.split(' ')[1]}`} />
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700">{action.label}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">{action.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Recent Alerts</h2>
              {expiringWarranties.length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">{expiringWarranties.length}</span>
              )}
            </div>
            <div className="p-2 sm:p-3 space-y-2">
              {expiringWarranties.length === 0 ? (
                <div className="flex items-center gap-2 p-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">All OK</span>
                </div>
              ) : (
                expiringWarranties.slice(0, 4).map((asset) => (
                  <div key={asset._id} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{asset.assetSL}</div>
                      <div className="text-xs text-red-600">{asset.expiryDate ? new Date(asset.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-3 sm:p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Upcoming Maintenance</h2>
            </div>
            <div className="p-2 sm:p-3">
              {upcomingMaintenance.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">No scheduled</p>
              ) : (
                <div className="space-y-1">
                  {upcomingMaintenance.slice(0, 4).map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700 font-medium truncate">{item.assetSL}</span>
                      <span className="text-orange-600 text-[10px]">
                        {item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
