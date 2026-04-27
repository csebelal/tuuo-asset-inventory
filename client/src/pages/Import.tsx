import { useState } from 'react';
import { CSVImporter } from '@/components/import/CSVImporter';
import { useImportCSV } from '@/hooks/useAssets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImportPage() {
  const importCSV = useImportCSV();
  const [result, setResult] = useState<{ inserted: number; updated: number; total: number } | undefined>();

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await importCSV.mutateAsync(formData);
      setResult(response.data);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import Asset Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Upload a CSV file with your asset data. The system will automatically
            detect new assets and update existing ones based on the Asset SL.
          </p>
          <CSVImporter
            onImport={handleImport}
            isLoading={importCSV.isPending}
            result={result}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-slate-600 font-mono bg-slate-50 p-4 rounded-lg overflow-x-auto">
            <p>Assets SL,Asset Type,Host Name,IP Address,IA Group,Status,Employee Name,AD Name,Department,Unit,Serial No/MAC,Model,Processor,RAM (GB),Installed OS...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
