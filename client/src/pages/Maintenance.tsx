import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MaintenanceStats } from '@/components/maintenance/MaintenanceStats';
import { DustCleanSchedule } from '@/components/maintenance/DustCleanSchedule';
import { DustCleanModal } from '@/components/maintenance/DustCleanModal';
import { MaintenanceLogTable } from '@/components/maintenance/MaintenanceLogTable';
import { AddMaintenanceModal } from '@/components/maintenance/AddMaintenanceModal';
import { maintenanceStats, dustCleanSchedule } from '@/data/mockMaintenance';
import { FloorName } from '@/types/maintenance.types';

type TabType = 'dust' | 'log';

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('dust');
  const [showDustModal, setShowDustModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin' };
  const canEdit = user.role === 'admin' || user.role === 'editor';

  const handleDustCleanSave = (data: { date: string; floors: FloorName[]; cleanedBy: string; notes: string; assetsCleaned: number }) => {
    console.log('Dust clean saved:', data);
    setShowDustModal(false);
  };

  const handleAddEventSave = () => {
    setShowAddModal(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Maintenance</h2>
        {canEdit && (
          <div className="flex gap-2">
            <Button onClick={() => setShowAddModal(true)} size="sm">
              + Log Event
            </Button>
          </div>
        )}
      </div>

      <MaintenanceStats stats={maintenanceStats} lastCleanDate={dustCleanSchedule.lastCleanDate} />

      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('dust')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${activeTab === 'dust' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          🧹 Dust Clean
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${activeTab === 'log' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          📋 Maintenance Log
        </button>
      </div>

      {activeTab === 'dust' && (
        <DustCleanSchedule onMarkDone={() => setShowDustModal(true)} />
      )}

      {activeTab === 'log' && (
        <MaintenanceLogTable key={refreshKey} />
      )}

      {showDustModal && (
        <DustCleanModal
          isOpen={showDustModal}
          onClose={() => setShowDustModal(false)}
          onSave={handleDustCleanSave}
        />
      )}

      {showAddModal && (
        <AddMaintenanceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEventSave}
        />
      )}
    </div>
  );
}
