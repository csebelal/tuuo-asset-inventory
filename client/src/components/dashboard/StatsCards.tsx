import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Monitor, Laptop, GitBranch, Boxes } from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    totalAssets: number;
    byType: Record<string, number>;
    incompleteAssets: number;
  } | null;
  totalStock?: number;
  stockByType?: Record<string, number>;
}

const itemTypeLabels: Record<string, string> = {
  mouse: '🖱 Mouse',
  keyboard: '⌨ Keyboard',
  ups: '🔋 UPS',
};

export function StatsCards({ stats, totalStock = 0, stockByType = {} }: StatsCardsProps) {
  const navigate = useNavigate();
  const totalDesktops = stats?.byType['Desktop'] || 0;
  const totalLaptops = stats?.byType['Laptop'] || 0;
  const totalSwitches = (stats?.byType['Network Switch'] || 0) + (stats?.byType['Asus Router WIFI'] || 0);
  const totalAssets = stats?.totalAssets || 0;

  const handleClick = (filterType: string) => {
    switch (filterType) {
      case 'desktop':
        navigate('/assets?type=Desktop');
        break;
      case 'laptop':
        navigate('/assets?type=Laptop');
        break;
      case 'network':
        navigate('/assets?type=Network%20Switch');
        break;
      case 'stock':
        navigate('/stock');
        break;
      default:
        navigate('/assets');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, filterType: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(filterType);
    }
  };

  const cards = [
    {
      title: 'TOTAL ASSETS',
      value: totalAssets,
      sub: '+5 this month',
      icon: Package,
      iconBg: 'bg-blue-50',
      accent: 'bg-blue-500',
      filter: 'all',
      ariaLabel: `${totalAssets} total assets`,
    },
    {
      title: 'DESKTOPS',
      value: totalDesktops,
      sub: '86% of fleet',
      icon: Monitor,
      iconBg: 'bg-green-50',
      accent: 'bg-green-500',
      filter: 'desktop',
      ariaLabel: `${totalDesktops} desktops`,
    },
    {
      title: 'LAPTOPS',
      value: totalLaptops,
      sub: '1st Floor',
      icon: Laptop,
      iconBg: 'bg-purple-50',
      accent: 'bg-purple-500',
      filter: 'laptop',
      ariaLabel: `${totalLaptops} laptops`,
    },
    {
      title: 'NETWORK DEVICES',
      value: totalSwitches,
      sub: '5 switches · 2 routers',
      icon: GitBranch,
      iconBg: 'bg-orange-50',
      accent: 'bg-orange-500',
      filter: 'network',
      ariaLabel: `${totalSwitches} network devices`,
    },
    {
      title: 'TOTAL STOCK',
      value: totalStock,
      sub: Object.entries(stockByType).map(([type, qty]) => `${itemTypeLabels[type] || type}: ${qty}`).join(' · ') || 'No stock',
      icon: Boxes,
      iconBg: 'bg-emerald-50',
      accent: 'bg-emerald-500',
      filter: 'stock',
      ariaLabel: `${totalStock} total stock items`,
    },
  ];

  const getIconEmoji = (title: string) => {
    const emojis: Record<string, string> = {
      'TOTAL ASSETS': '📦',
      'DESKTOPS': '🖥️',
      'LAPTOPS': '💻',
      'NETWORK DEVICES': '🔀',
      'TOTAL STOCK': '📦',
    };
    return emojis[title] || '📦';
  };

  return (
    <section aria-label="Asset statistics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 mb-4">
      {cards.map((card) => (
        <Card 
          key={card.title}
          className="cursor-pointer hover:shadow-md transition-shadow print:break-inside-avoid focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => handleClick(card.filter)}
          onKeyDown={(e) => handleKeyDown(e, card.filter)}
          tabIndex={0}
          role="button"
          aria-label={card.ariaLabel}
        >
          <CardContent className="p-3 pb-2.5 relative overflow-hidden">
            <div className="text-[10px] font-medium text-slate-400 tracking-wide mb-1">{card.title}</div>
            <div className="text-[22px] font-medium leading-none text-slate-900" aria-hidden="true">{card.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{card.sub}</div>
            <div className={`absolute top-[11px] right-[11px] w-7 h-7 rounded-[7px] flex items-center justify-center text-sm ${card.iconBg}`} aria-hidden="true">
              {getIconEmoji(card.title)}
            </div>
            <div className={`absolute bottom-0 left-0 h-[3px] rounded-b-lg ${card.accent}`} style={{ width: '100%' }}></div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}