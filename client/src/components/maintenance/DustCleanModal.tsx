import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FloorName } from '@/types/maintenance.types';
import { floorAssetCounts, allFloors } from '@/data/mockMaintenance';
import { toDDMMYYYY } from '@/utils/dateUtils';

interface DustCleanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { date: string; floors: FloorName[]; cleanedBy: string; notes: string; assetsCleaned: number }) => void;
}

export function DustCleanModal({ isOpen, onClose, onSave }: DustCleanModalProps) {
  const [date, setDate] = useState(toDDMMYYYY(new Date()));
  const [selectedFloors, setSelectedFloors] = useState<FloorName[]>(allFloors);
  const [cleanedBy, setCleanedBy] = useState('IT Team');
  const [notes, setNotes] = useState('');

  const toggleFloor = (floor: FloorName) => {
    setSelectedFloors(prev => 
      prev.includes(floor) 
        ? prev.filter(f => f !== floor)
        : [...prev, floor]
    );
  };

  const totalAssets = selectedFloors.reduce((sum, floor) => sum + (floorAssetCounts[floor] || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      floors: selectedFloors,
      cleanedBy,
      notes,
      assetsCleaned: totalAssets
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 w-[500px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Mark Dust Clean Done</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Date</label>
            <Input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD.MM.YYYY"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-2">Select Floors</label>
            <div className="space-y-2">
              {allFloors.map((floor) => (
                <label key={floor} className="flex items-center gap-2 p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={selectedFloors.includes(floor)}
                    onChange={() => toggleFloor(floor)}
                    className="rounded"
                  />
                  <span className="text-sm flex-1">{floor}</span>
                  <span className="text-xs text-slate-500">({floorAssetCounts[floor]} assets)</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600">Total Assets to Clean</div>
            <div className="text-xl font-bold text-blue-700">{totalAssets}</div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Cleaned By</label>
            <Input
              value={cleanedBy}
              onChange={(e) => setCleanedBy(e.target.value)}
              placeholder="IT Team"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Notes</label>
            <textarea
              className="w-full h-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={selectedFloors.length === 0} className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
