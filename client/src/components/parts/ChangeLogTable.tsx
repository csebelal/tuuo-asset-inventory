import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CHANGE_RECORDS, ALL_FLOORS, ALL_DEPARTMENTS } from '@/data/mockParts';
import { COMPONENT_OPTIONS, REASON_OPTIONS, formatBDT, getComponentLabel, TYPE_BADGE_STYLE, REASON_BADGE_STYLE } from '@/utils/partsUtils';
import type { ChangeRecord, ChangeReason } from '@/types/parts.types';

interface ChangeLogTableProps {
  records?: ChangeRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (record: ChangeRecord) => void;
  showFilters?: boolean;
  loading?: boolean;
}

export function ChangeLogTable({ 
  records: propRecords, 
  onDelete, 
  onEdit,
  showFilters = true,
  loading = false
}: ChangeLogTableProps) {
  const [search, setSearch] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterComponent, setFilterComponent] = useState('');
  const [filterReason, setFilterReason] = useState('');

  const records = propRecords || CHANGE_RECORDS;

  const getRecordId = (record: ChangeRecord) => record._id || record.id;

  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    
    // Format: DD.MM.YYYY
    const partsDot = dateStr.split('.');
    if (partsDot.length === 3) {
      const day = parseInt(partsDot[0]);
      const month = parseInt(partsDot[1]);
      const year = parseInt(partsDot[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day <= 31 && month <= 12) {
        return new Date(year, month - 1, day);
      }
    }
    
    // Format: MM.YYYY
    if (partsDot.length === 2) {
      const month = parseInt(partsDot[0]);
      const year = parseInt(partsDot[1]);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        return new Date(year, month - 1, 1);
      }
    }
    
    // Format: YYYY (just year)
    const yearOnly = parseInt(dateStr);
    if (!isNaN(yearOnly) && yearOnly > 1900 && yearOnly < 2100) {
      return new Date(yearOnly, 0, 1);
    }
    
    return new Date(0);
  };

  const filteredRecords = useMemo(() => {
    const filtered = records.filter(record => {
      const matchesSearch = !search || 
        record.assetSL.toLowerCase().includes(search.toLowerCase()) ||
        record.assetHostname.toLowerCase().includes(search.toLowerCase()) ||
        record.newBrand.toLowerCase().includes(search.toLowerCase()) ||
        record.newModel.toLowerCase().includes(search.toLowerCase());
      
      const matchesFloor = !filterFloor || record.floor === filterFloor;
      const matchesDept = !filterDepartment || record.department === filterDepartment;
      const matchesComponent = !filterComponent || record.componentType === filterComponent;
      const matchesReason = !filterReason || record.reason === filterReason;

      return matchesSearch && matchesFloor && matchesDept && matchesComponent && matchesReason;
    });

    return filtered.sort((a, b) => {
      const dateA = parseDate(a.changeDate);
      const dateB = parseDate(b.changeDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [records, search, filterFloor, filterDepartment, filterComponent, filterReason]);

  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  const getTypeStyle = (type: string) => {
    return TYPE_BADGE_STYLE[type] || TYPE_BADGE_STYLE.other;
  };

  const getReasonStyle = (reason: ChangeReason) => {
    return REASON_BADGE_STYLE[reason] || REASON_BADGE_STYLE.other;
  };

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 h-8 text-sm"
          />
          <select
            className="h-8 rounded-md border border-slate-300 px-2 text-sm"
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
          >
            <option value="">All Floors</option>
            {ALL_FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select
            className="h-8 rounded-md border border-slate-300 px-2 text-sm"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            className="h-8 rounded-md border border-slate-300 px-2 text-sm"
            value={filterComponent}
            onChange={(e) => setFilterComponent(e.target.value)}
          >
            <option value="">All Components</option>
            {COMPONENT_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select
            className="h-8 rounded-md border border-slate-300 px-2 text-sm"
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
          >
            <option value="">All Reasons</option>
            {REASON_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-2 border-b font-medium text-slate-600">Date</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Asset</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Component</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Old → New</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Reason</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">Cost</th>
              <th className="text-left p-2 border-b font-medium text-slate-600">By</th>
              {(onDelete || onEdit) && <th className="text-left p-2 border-b font-medium text-slate-600">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={onDelete || onEdit ? 8 : 7} className="p-4 text-center text-slate-500">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const typeStyle = getTypeStyle(record.componentType);
                const reasonStyle = getReasonStyle(record.reason);
                const recordId = getRecordId(record);
                
                return (
                  <tr key={recordId} className="hover:bg-slate-50">
                    <td className="p-2 border-b">{record.changeDate}</td>
                    <td className="p-2 border-b">
                      <div className="font-medium">{record.assetSL}</div>
                      <div className="text-xs text-slate-500">{record.assetHostname}</div>
                    </td>
                    <td className="p-2 border-b">
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
                      >
                        {getComponentLabel(record.componentType)}
                      </span>
                    </td>
                    <td className="p-2 border-b">
                      <div className="text-xs">
                        <span className="text-red-600 line-through">{record.oldBrand} {record.oldModel}</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-600 font-medium">{record.newBrand} {record.newModel}</span>
                      </div>
                    </td>
                    <td className="p-2 border-b">
                      <span 
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: reasonStyle.bg, color: reasonStyle.color }}
                      >
                        {REASON_OPTIONS.find(r => r.value === record.reason)?.label || record.reason}
                      </span>
                    </td>
                    <td className="p-2 border-b">{record.cost > 0 ? formatBDT(record.cost) : '-'}</td>
                    <td className="p-2 border-b text-xs text-slate-500">{record.changedBy}</td>
                    {(onDelete || onEdit) && (
                      <td className="p-2 border-b">
                        <div className="flex gap-1">
                          {onEdit && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => onEdit(record)}
                            >
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs text-red-600"
                              onClick={() => onDelete(recordId)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          {filteredRecords.length > 0 && (
            <tfoot className="bg-slate-50 font-medium">
              <tr>
                <td colSpan={5} className="p-2 border-b text-right">Total:</td>
                <td className="p-2 border-b">{formatBDT(totalCost)}</td>
                <td colSpan={2} className="p-2 border-b"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
