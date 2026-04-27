import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet, FileJson, 
  Shield, Cpu, Users, BarChart3, Filter, X
} from 'lucide-react';

const departments = ['Designer', 'QC', 'Team Leader', '3D', 'Customer Support', 'Shift Incharge', 'AGM', 'Marketing', 'Accounts', 'IT', 'Video Editor'];
const statuses = ['With user', 'Server Room', 'In Repair', 'Inactive', 'Decommissioned', 'In Store - Good', 'In Store - Bad'];
const assetTypes = ['Desktop', 'Laptop', 'Server', 'Monitor', 'UPS', 'Router', 'Switch', 'NAS Server', 'RAM', 'HDD', 'Motherboard'];

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    type: '',
    warranty: ''
  });
  const [summary, setSummary] = useState<any>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/v1/reports/summary', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.warranty) params.append('warranty', filters.warranty);
    return params.toString();
  };

  const handleExport = (type: 'csv' | 'json') => {
    const query = buildQueryString();
    window.open(`/api/v1/reports/${type}?${query}`, '_blank');
  };

  const handleSpecialReport = async (report: string) => {
    setActiveReport(report);
    setReportLoading(true);
    try {
      const res = await fetch(`/api/v1/reports/${report}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const renderReportData = () => {
    if (!reportData) return null;
    
    switch (activeReport) {
      case 'warranty':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-amber-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-700">{reportData.summary?.expiring || 0}</div>
                  <div className="text-sm text-amber-600">Expiring Soon</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-700">{reportData.summary?.expired || 0}</div>
                  <div className="text-sm text-red-600">Expired</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">{reportData.summary?.valid || 0}</div>
                  <div className="text-sm text-green-600">Valid</div>
                </CardContent>
              </Card>
            </div>
            
            {reportData.expiring?.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-700 mb-2">Expiring Soon</h4>
                <div className="space-y-2">
                  {reportData.expiring.slice(0, 10).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 bg-amber-50 rounded-lg text-sm">
                      <span className="font-medium">{item.assetSL}</span>
                      <span className="text-amber-600">{item.expiryDate?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {reportData.expired?.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">Expired</h4>
                <div className="space-y-2">
                  {reportData.expired.slice(0, 10).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 bg-red-50 rounded-lg text-sm">
                      <span className="font-medium">{item.assetSL}</span>
                      <span className="text-red-600">{item.expiryDate?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'hardware':
        return (
          <div className="space-y-4">
            {Object.entries(reportData.summary || {}).map(([dept, data]: [string, any]) => (
              <div key={dept} className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium mb-2">{dept} ({data.total})</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Processors:</span>
                    <div className="space-y-1">
                      {Object.entries(data.processors || {}).slice(0, 3).map(([proc, count]: [string, any]) => (
                        <div key={proc} className="flex justify-between">
                          <span className="truncate">{proc}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">RAM:</span>
                    <div className="space-y-1">
                      {Object.entries(data.rams || {}).slice(0, 3).map(([ram, count]: [string, any]) => (
                        <div key={ram} className="flex justify-between">
                          <span>{ram}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">SSD:</span>
                    <div className="space-y-1">
                      {Object.entries(data.ssds || {}).slice(0, 3).map(([ssd, count]: [string, any]) => (
                        <div key={ssd} className="flex justify-between">
                          <span>{ssd}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'assignment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-green-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">{reportData.summary?.assigned || 0}</div>
                  <div className="text-sm text-green-600">Assigned</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-slate-700">{reportData.summary?.unassigned || 0}</div>
                  <div className="text-sm text-slate-600">Available</div>
                </CardContent>
              </Card>
            </div>
            
            {reportData.assigned?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Currently Assigned</h4>
                <div className="space-y-2">
                  {reportData.assigned.slice(0, 15).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 bg-green-50 rounded-lg text-sm">
                      <div>
                        <span className="font-medium">{item.assetSL}</span>
                        <span className="text-slate-500 ml-2">→ {item.assignedTo}</span>
                      </div>
                      <span className="text-green-600 text-xs">{item.assignedDate?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'activity':
        return (
          <div className="space-y-2">
            {(reportData as any[])?.slice(0, 30).map((log: any, idx: number) => (
              <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium">{log.action || 'Action'}</span>
                  <span className="text-slate-500 ml-2">{log.details}</span>
                </div>
                <span className="text-slate-500 text-xs">{log.timestamp?.split('T')[0]}</span>
              </div>
            ))}
          </div>
        );
        
      default:
        return <div className="text-slate-500">No data available</div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-blue-700">{summary.total}</div>
              <div className="text-xs text-blue-600">Total Assets</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-green-700">
                {summary.byType?.find((t: any) => t._id === 'Desktop')?.count || 0}
              </div>
              <div className="text-xs text-green-600">Desktops</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-purple-700">
                {summary.byType?.find((t: any) => t._id === 'Laptop')?.count || 0}
              </div>
              <div className="text-xs text-purple-600">Laptops</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-orange-700">
                {summary.byStatus?.find((s: any) => s._id === 'With user')?.count || 0}
              </div>
              <div className="text-xs text-orange-600">Assigned</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-slate-700">
                {summary.byDept?.filter((d: any) => d._id)?.length || 0}
              </div>
              <div className="text-xs text-slate-600">Departments</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              {assetTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.warranty}
              onChange={(e) => setFilters({ ...filters, warranty: e.target.value })}
            >
              <option value="">All Warranty</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <FileJson className="w-4 h-4 mr-1" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Special Reports */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className={`h-auto py-4 justify-start ${activeReport === 'warranty' ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => handleSpecialReport('warranty')}>
          <div className="flex items-center gap-3 w-full">
            <Shield className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Warranty Report</div>
              <div className="text-xs text-slate-500">Expiring & Expired</div>
            </div>
          </div>
        </Button>

        <Button variant="outline" className={`h-auto py-4 justify-start ${activeReport === 'hardware' ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => handleSpecialReport('hardware')}>
          <div className="flex items-center gap-3 w-full">
            <Cpu className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Hardware Summary</div>
              <div className="text-xs text-slate-500">Specs by Dept</div>
            </div>
          </div>
        </Button>

        <Button variant="outline" className={`h-auto py-4 justify-start ${activeReport === 'assignment' ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => handleSpecialReport('assignment')}>
          <div className="flex items-center gap-3 w-full">
            <Users className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Assignment Report</div>
              <div className="text-xs text-slate-500">Assigned vs Available</div>
            </div>
          </div>
        </Button>

        <Button variant="outline" className={`h-auto py-4 justify-start ${activeReport === 'activity' ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => handleSpecialReport('activity')}>
          <div className="flex items-center gap-3 w-full">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-sm">Activity Log</div>
              <div className="text-xs text-slate-500">Recent Changes</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Report Data Display */}
      {activeReport && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base capitalize">{activeReport.replace('-', ' ')} Report</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveReport(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : renderReportData()}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">By Type</div>
              <div className="space-y-1">
                {summary?.byType?.slice(0, 5).map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate">{item._id || 'N/A'}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">By Status</div>
              <div className="space-y-1">
                {summary?.byStatus?.slice(0, 5).map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate">{item._id || 'N/A'}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">By Department</div>
              <div className="space-y-1">
                {summary?.byDept?.slice(0, 5).map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate">{item._id || 'N/A'}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">By Floor</div>
              <div className="space-y-1">
                {summary?.byFloor?.slice(0, 5).map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate">{item._id || 'N/A'}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}