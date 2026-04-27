import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAssets, useDeleteAsset } from '@/hooks/useAssets';
import { AssetTable } from '@/components/assets/AssetTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AssetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin' };
  const canEdit = user.role === 'admin' || user.role === 'editor';
  
  const typeParam = searchParams.get('type') || '';
  const statusParam = searchParams.getAll('status');
  const warrantyParam = searchParams.get('warranty') || '';
  const incompleteParam = searchParams.get('incomplete') === 'true';
  const highendParam = searchParams.get('highend') === 'true';

  const [filters, setFilters] = useState({
    assetType: typeParam,
    department: '',
    unit: '',
    status: statusParam.length > 0 ? statusParam.join(',') : '',
    warranty: warrantyParam,
  });

  const { data, isLoading } = useAssets({ page, limit, ...filters });
  const deleteAsset = useDeleteAsset();

  const handleClearFilters = () => {
    setFilters({
      assetType: '',
      department: '',
      unit: '',
      status: '',
    });
    setSearchParams({});
    setPage(1);
  };

  const filteredAssets = useMemo(() => {
    if (!data?.assets) return [];
    
    let assets = [...data.assets];

    if (incompleteParam) {
      assets = assets.filter((asset: any) => {
        const hasMissing = !asset.cpu || !asset.ram || !asset.ssd || !asset.monitor || !asset.keyboard || !asset.mouse;
        return hasMissing;
      });
    }

    if (highendParam) {
      assets = assets.filter((asset: any) => {
        const gpu = asset.gpu?.toLowerCase() || '';
        return gpu.includes('rtx') || gpu.includes('rx ') || gpu.includes('radeon');
      });
    }

    return assets;
  }, [data?.assets, incompleteParam, highendParam]);

  const handleView = (asset: any) => {
    navigate(`/assets/${asset.assetSL}`);
  };

  const handleEdit = (asset: any) => {
    navigate(`/assets/${asset.assetSL}/edit`);
  };

  const handleDelete = async (asset: any) => {
    if (confirm(`Are you sure you want to delete ${asset.assetSL}?`)) {
      await deleteAsset.mutateAsync(asset.assetSL);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.assetType) params.append('type', filters.assetType);
      if (filters.department) params.append('department', filters.department);
      if (filters.unit) params.append('unit', filters.unit);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/v1/reports/csv?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assets_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const activeFilters = [];
  if (typeParam) activeFilters.push({ label: `Type: ${typeParam}`, key: 'type' });
  if (incompleteParam) activeFilters.push({ label: 'Incomplete', key: 'incomplete' });
  if (highendParam) activeFilters.push({ label: 'High-End Rigs', key: 'highend' });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.assetType}
            onValueChange={(v) => {
              const newValue = v === 'all' ? '' : v;
              setFilters({ ...filters, assetType: newValue });
              if (newValue) {
                setSearchParams({ ...Object.fromEntries(searchParams), type: newValue });
              } else {
                const params = Object.fromEntries(searchParams);
                delete params.type;
                setSearchParams(params);
              }
            }}
          >
            <SelectTrigger className="w-36 sm:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Desktop">Desktop</SelectItem>
              <SelectItem value="Laptop">Laptop</SelectItem>
              <SelectItem value="Network Switch">Network Switch</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.department}
            onValueChange={(v) => setFilters({ ...filters, department: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-36 sm:w-40">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Designer">Designer</SelectItem>
              <SelectItem value="QC">QC</SelectItem>
              <SelectItem value="3D">3D</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.unit}
            onValueChange={(v) => setFilters({ ...filters, unit: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-36 sm:w-40">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              <SelectItem value="10th Floor A">10th Floor A</SelectItem>
              <SelectItem value="10th Floor B">10th Floor B</SelectItem>
              <SelectItem value="6th Floor">6th Floor</SelectItem>
              <SelectItem value="1st Floor">1st Floor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {canEdit && (
            <Button onClick={() => navigate('/assets/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-500">Active filters:</span>
          {activeFilters.map((filter) => (
            <Button
              key={filter.key}
              variant="outline"
              size="sm"
              className="h-6 text-xs gap-1"
              onClick={() => {
                const params = Object.fromEntries(searchParams);
                delete params[filter.key];
                setSearchParams(params);
                if (filter.key === 'type') setFilters({ ...filters, assetType: '' });
              }}
            >
              {filter.label}
              <X className="w-3 h-3" />
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
            Clear all
          </Button>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <AssetTable
              assets={incompleteParam || highendParam ? filteredAssets : (data?.assets || [])}
              pagination={incompleteParam || highendParam ? null : (data?.pagination || null)}
              onPageChange={setPage}
              onView={handleView}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? handleDelete : undefined}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
