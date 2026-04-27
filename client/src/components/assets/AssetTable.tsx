import { useState } from 'react';
import { IAsset } from '@/types/asset.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Copy, Edit, Trash2, Eye } from 'lucide-react';

interface AssetTableProps {
  assets: IAsset[];
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  onPageChange: (page: number) => void;
  onView: (asset: IAsset) => void;
  onEdit?: (asset: IAsset) => void;
  onDelete?: (asset: IAsset) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}

const statusColors: Record<string, string> = {
  'With user': 'success',
  'Server Room': 'purple',
  'In Repair': 'warning',
  'Decommissioned': 'destructive',
};

const accessColors: Record<string, string> = {
  'Full Access': 'info',
  'Restricted': 'warning',
};

export function AssetTable({ assets, pagination, onPageChange, onView, onEdit, onDelete, limit = 20, onLimitChange }: AssetTableProps) {
  const [search, setSearch] = useState('');
  const canEdit = !!onEdit;
  const canDelete = !!onDelete;

  const copyIP = (ip: string) => {
    navigator.clipboard.writeText(ip);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search assets"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-medium text-slate-500">SL</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Type</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Host Name</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">IP Address</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Department</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Floor</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Employee</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Access</TableHead>
              <TableHead className="text-xs font-medium text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs font-medium text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                  No assets found
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset, index) => (
                <TableRow 
                  key={asset._id} 
                  className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <TableCell className="font-medium text-sm">{asset.assetSL}</TableCell>
                  <TableCell className="text-sm">{asset.assetType}</TableCell>
                  <TableCell className="text-sm">{asset.hostName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{asset.ipAddress}</span>
                      {asset.ipAddress && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyIP(asset.ipAddress)}
                          aria-label="Copy IP address"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{asset.department}</TableCell>
                  <TableCell className="text-sm">{asset.unit}</TableCell>
                  <TableCell className="text-sm">{asset.employeeName}</TableCell>
                  <TableCell>
                    <Badge variant={accessColors[asset.iaGroup] as any || 'outline'}>
                      {asset.iaGroup || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[asset.status] as any || 'outline'}>
                      {asset.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onView(asset)}
                        aria-label="View asset"
                        className="hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit!(asset)}
                          aria-label="Edit asset"
                          className="hover:bg-amber-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete!(asset)}
                          aria-label="Delete asset"
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onLimitChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Per page:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={(v) => onLimitChange(Number(v))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <p className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} assets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
