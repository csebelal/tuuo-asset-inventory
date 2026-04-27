import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Printer, User } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';

export function Topbar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data } = useAssets({ limit: 100, search: search.length >= 2 ? search : undefined });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setTimeout(() => setShowResults(false), 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = data?.assets?.slice(0, 6) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border-b border-slate-200 px-5 h-[52px] flex items-center justify-between gap-3 flex-shrink-0">
      <h1 className="text-base font-medium text-slate-900 whitespace-nowrap">Dashboard</h1>

      <div className="flex-1 max-w-[340px] relative" ref={wrapperRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search asset ID, hostname, IP, employee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
        />
        {showResults && search.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[220px] overflow-y-auto">
            {results.length > 0 ? (
              results.map((asset) => (
                <div
                  key={asset._id}
                  className="px-3 py-2 text-xs cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  onClick={() => {
                    navigate(`/assets/${asset.assetSL}`);
                    setShowResults(false);
                    setSearch('');
                  }}
                >
                  <span className="font-medium text-slate-900">{asset.assetSL}</span>
                  <span className="text-slate-500 ml-2">
                    {asset.hostName} · {asset.ipAddress} — {asset.department} · {asset.unit}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400">No results</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-slate-400">Synced: just now</span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 opacity-80" />
          Print / PDF
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
          <User className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-medium text-slate-700">Admin</span>
        </div>
      </div>
    </div>
  );
}
