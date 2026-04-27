import { getComponentLabel, COMPONENT_ICON_BG, COMPONENT_ICON_TX, CONDITION_DOT_COLOR } from '@/utils/partsUtils';
import type { ComponentType, ChangeRecord } from '@/types/parts.types';

interface AssetComponentCardProps {
  assetSL: string;
  assetHostname: string;
  department: string;
  floor: string;
  records: ChangeRecord[];
  onChangeClick: (assetSL: string, componentType: ComponentType) => void;
  canEdit?: boolean;
}

const COMPONENT_TYPES: ComponentType[] = ['mouse', 'keyboard', 'ram', 'ssd', 'psu', 'gpu', 'hdd', 'monitor', 'headset', 'motherboard', 'cpu', 'cooling_fan', 'ups', 'other'];

export function AssetComponentCard({ assetSL, assetHostname, department, floor, records, onChangeClick, canEdit = true }: AssetComponentCardProps) {
  const assetRecords = records.filter(r => r.assetSL === assetSL);

  const getLatestRecord = (type: ComponentType): ChangeRecord | undefined => {
    return assetRecords.find(r => r.componentType === type);
  };

  const getConditionFromRecord = (record?: ChangeRecord): string => {
    if (!record) return 'missing';
    if (record.oldCondition === 'damaged') return 'damaged';
    if (record.oldCondition === 'worn') return 'worn';
    if (record.oldCondition === 'good') return 'good';
    return 'new';
  };

  return (
    <div className="border rounded-lg bg-white p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-slate-900">{assetSL}</div>
          <div className="text-sm text-slate-500">{assetHostname}</div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>{department}</div>
          <div>{floor}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {COMPONENT_TYPES.map(type => {
          const latestRecord = getLatestRecord(type);
          const bgColor = latestRecord ? COMPONENT_ICON_BG[type] || COMPONENT_ICON_BG.other : 'transparent';
          const textColor = latestRecord ? COMPONENT_ICON_TX[type] || COMPONENT_ICON_TX.other : '#9ca3af';
          const condition = getConditionFromRecord(latestRecord);

          return (
            <div
              key={type}
              className={`relative border rounded p-2 text-xs group transition-colors ${canEdit ? 'hover:border-blue-400 cursor-pointer' : ''}`}
              style={{ backgroundColor: latestRecord ? bgColor : 'transparent' }}
              onClick={() => canEdit && onChangeClick(assetSL, type)}
            >
              <div className="flex items-center gap-1 mb-1">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: latestRecord ? (CONDITION_DOT_COLOR[condition] || '#22c55e') : '#ccc' }}
                />
                <span className="font-medium" style={{ color: textColor }}>
                  {getComponentLabel(type)}
                </span>
              </div>
              
              {latestRecord ? (
                <div className="text-slate-700">
                  <div className="font-medium truncate">{latestRecord.newBrand} {latestRecord.newModel}</div>
                  {latestRecord.newSpec && <div className="text-[10px] text-slate-500 truncate">{latestRecord.newSpec}</div>}
                </div>
              ) : (
                <div className="text-slate-400 italic text-[10px]">Not tracked</div>
              )}

              <div className="absolute inset-0 bg-blue-500/90 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                + Record Change
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
