import { useState } from 'react';
import { useSearchAssets } from '@/hooks/useAssets';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IAsset } from '@/types/asset.types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchAssets(query);
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by SL, hostname, IP, employee, MAC..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {query.length >= 2 && !isLoading && (
        <div className="space-y-2">
          {results?.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No results found</p>
          ) : (
            results?.map((asset: IAsset) => (
              <Card
                key={asset._id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => navigate(`/assets/${asset.assetSL}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{asset.assetSL}</span>
                      <span className="text-slate-500 mx-2">-</span>
                      <span>{asset.hostName}</span>
                    </div>
                    <Badge variant="outline">{asset.assetType}</Badge>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {asset.ipAddress} • {asset.department} • {asset.employeeName}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {query.length < 2 && (
        <p className="text-center text-slate-500 py-8">
          Enter at least 2 characters to search
        </p>
      )}
    </div>
  );
}
