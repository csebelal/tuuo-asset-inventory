import { useLocation } from 'react-router-dom';
import { Search, Printer, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAssets } from '@/hooks/useAssets';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/assets': 'All Assets',
  '/search': 'Search',
  '/departments': 'By Department',
  '/floors': 'By Floor',
  '/live-map': 'Live Map',
  '/reports': 'Reports',
  '/import': 'Import CSV',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || 'TUUO Assets';
  
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data } = useAssets({ limit: 100, search: search.length >= 2 ? search : undefined });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { username: 'Admin', role: 'admin' };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setTimeout(() => setShowResults(false), 200);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const results = data?.assets?.slice(0, 6) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b flex items-center justify-between px-3 sm:px-5 gap-2 sm:gap-3">
      <h2 className="text-sm sm:text-base font-medium text-slate-900 whitespace-nowrap">{title}</h2>
      
      <div className="flex-1 max-w-[200px] sm:max-w-[340px] relative" ref={wrapperRef}>
        <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
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
                  <span className="text-slate-500 ml-2 hidden sm:inline">
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

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-slate-400">Synced: just now</span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 opacity-80" />
          Print / PDF
        </button>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
              {user.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-xs font-medium text-slate-700">{user.username}</span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-900">{user.username}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
