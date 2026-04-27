import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Activity, AlertTriangle } from 'lucide-react';

const PRTG_URL = 'https://182.160.111.174';
const MAP_ID = '720E1CFC-F3F8-4FCA-8445-BB0D11D73512';
const MAP_URL = `${PRTG_URL}/public/mapshow.htm?id=2304&mapid=${MAP_ID}`;

export default function LiveMapPage() {
  const [key, setKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  const handleRefresh = () => {
    setKey(k => k + 1);
    setIframeError(false);
  };
  
  const openFullScreen = () => window.open(MAP_URL, '_blank');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Warning Banner for Certificate */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Connection Warning</p>
              <p className="text-xs text-amber-700">
                This server uses a self-signed certificate. The map may not load in the iframe below.
              </p>
            </div>
          </div>
          <Button 
            onClick={openFullScreen}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            Open PRTG Map
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Live Network Map</h1>
              <p className="text-xs text-slate-500">PRTG Network Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 border-slate-300">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" onClick={openFullScreen} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Screen</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-2 md:p-4">
        <Card>
          <CardContent className="p-0">
            {iframeError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Map Could Not Load</h3>
                <p className="text-sm text-slate-600 mb-4 max-w-md">
                  The map cannot be displayed due to certificate issues. 
                  Click the button below to open in a new browser window.
                </p>
                <Button 
                  onClick={openFullScreen}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open PRTG Network Map
                </Button>
                <p className="text-xs text-slate-500 mt-4">
                  In the new tab, click "Proceed to 182.160.111.174 (unsafe)" to view the map
                </p>
              </div>
            ) : (
              <iframe
                key={key}
                src={MAP_URL}
                width="100%"
                style={{ height: 'calc(100vh - 200px)', minHeight: '400px', border: 'none' }}
                allowFullScreen
                title="Network Map"
                onError={() => setIframeError(true)}
                onLoad={() => setIframeError(false)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}