import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PartsStatsBar } from '@/components/parts/PartsStatsBar';
import { PeripheralChangeModal } from '@/components/parts/PeripheralChangeModal';
import { AssetComponentCard } from '@/components/parts/AssetComponentCard';
import { ChangeLogTable } from '@/components/parts/ChangeLogTable';
import { ByComponentView } from '@/components/parts/ByComponentView';
import { partsApi, stockApi } from '@/api/client';
import type { ComponentType, ChangeRecord } from '@/types/parts.types';

type ViewType = 'asset' | 'changelog' | 'component';

export default function PartsChange() {
  const [currentView, setCurrentView] = useState<ViewType>('changelog');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin' };
  const canEdit = user.role === 'admin' || user.role === 'editor';

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await partsApi.getAll();
      setRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChangeModal = (_assetSL: string, _componentType: ComponentType) => {
    setIsModalOpen(true);
  };

  const handleSaveChange = async (record: Omit<ChangeRecord, 'id'>) => {
    try {
      await partsApi.create(record);
      
      // Only consume from IT stock if IT department has quantity > 0
      if (['mouse', 'keyboard', 'ups'].includes(record.componentType)) {
        try {
          const stockRes = await stockApi.getAll();
          const allStock = stockRes.data || [];
          
          // Only consume if IT department has quantity > 0
          let stockItem = allStock.find((s: any) => 
            s.itemType === record.componentType && 
            s.department === 'IT' && 
            s.quantity > 0
          );
          
          if (stockItem) {
            await stockApi.consume({
              stockId: stockItem._id,
              assetSL: record.assetSL,
              quantity: 1
            });
            console.log(`✅ Consumed 1 ${record.componentType} from IT stock`);
          } else {
            console.warn(`⚠️ IT stock is 0 or empty for ${record.componentType}. Record saved without consumption.`);
          }
        } catch (stockError) {
          console.error('Failed to consume stock:', stockError);
        }
      }
      
      fetchRecords();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save record:', error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await partsApi.delete(id);
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const assetsWithComponents = Array.from(new Set(records.map(r => r.assetSL)));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-900">Parts & Components</h1>
        {canEdit && (
          <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            + Record Change
          </Button>
        )}
      </div>

      <PartsStatsBar records={records} totalAssets={assetsWithComponents.length} />

      <div className="flex gap-2 mb-4 border-b">
        {(['changelog', 'asset', 'component'] as ViewType[]).map(view => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentView === view
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {view === 'changelog' && '📋 Change Log'}
            {view === 'asset' && '🖥 By Asset'}
            {view === 'component' && '🔧 By Component'}
          </button>
        ))}
      </div>

      {currentView === 'changelog' && (
        <ChangeLogTable 
          records={records} 
          onDelete={canEdit ? handleDeleteRecord : undefined}
          showFilters={true}
          loading={loading}
        />
      )}

      {currentView === 'asset' && (
        <div>
          <div className="mb-3 text-sm text-slate-600">
            Showing assets with recent component changes ({assetsWithComponents.length} assets)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetsWithComponents.map(assetSL => {
              const assetRecords = records.filter(r => r.assetSL === assetSL);
              const firstRecord = assetRecords[0];
              return (
                <AssetComponentCard
                  key={assetSL}
                  assetSL={assetSL}
                  assetHostname={firstRecord?.assetHostname || assetSL}
                  department={firstRecord?.department || ''}
                  floor={firstRecord?.floor || ''}
                  records={assetRecords}
                  onChangeClick={handleOpenChangeModal}
                  canEdit={canEdit}
                />
              );
            })}
          </div>
          {assetsWithComponents.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500">
              No assets with tracked components yet
            </div>
          )}
        </div>
      )}

      {currentView === 'component' && (
        <ByComponentView records={records} />
      )}

      <PeripheralChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChange}
      />
    </div>
  );
}
