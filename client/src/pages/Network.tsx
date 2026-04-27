import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function NetworkPage() {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const targetUrl = 'https://192.168.0.150/public/mapshow.htm?id=2304&mapid=720E1CFC-F3F8-4FCA-8445-BB0D11D73512';
  const networkMapUrl = `/api/v1/network-map-proxy?url=${encodeURIComponent(targetUrl)}`;

  const handleRetry = () => {
    setIframeError(false);
    setIsLoading(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Network Map</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry}
          className="gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {iframeError ? (
            <div className="flex flex-col items-center justify-center h-[700px] bg-slate-50 text-slate-500">
              <p className="text-lg font-medium">Unable to load network map</p>
              <p className="text-sm">The network map is not accessible</p>
              <p className="text-xs mt-2 mb-4">URL: {targetUrl.replace('https://', '')}</p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="flex items-center justify-center h-[700px] bg-slate-50">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              )}
              <iframe
                width="1920"
                height="950"
                frameBorder="1"
                src={networkMapUrl}
                title="Network Map"
                className={isLoading ? 'hidden' : ''}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIframeError(true);
                  setIsLoading(false);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
