import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface CSVImporterProps {
  onImport: (file: File) => void;
  isLoading: boolean;
  result?: {
    inserted: number;
    updated: number;
    total: number;
  };
}

export function CSVImporter({ onImport, isLoading, result }: CSVImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-600 mb-2">
            Drag and drop your CSV file here, or click to browse
          </p>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            Browse Files
          </Button>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium flex-1">{selectedFile.name}</span>
            <span className="text-xs text-slate-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        {selectedFile && (
          <Button onClick={handleImport} disabled={isLoading} className="w-full">
            {isLoading ? 'Importing...' : 'Import Assets'}
          </Button>
        )}

        {result && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Import Complete</span>
            </div>
            <div className="text-sm text-green-600 space-y-1">
              <p>Total: {result.total} assets</p>
              <p>Inserted: {result.inserted}</p>
              <p>Updated: {result.updated}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
