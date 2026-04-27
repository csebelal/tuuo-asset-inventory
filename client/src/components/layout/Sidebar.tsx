import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Monitor,
  Building2,
  BarChart3,
  Upload,
  Settings,
  LogOut,
  Wrench,
  Package,
  Boxes,
  Warehouse,
  Activity,
} from 'lucide-react';

const mainItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/parts', icon: Package, label: 'Parts & Components' },
  { to: '/stock', icon: Boxes, label: 'Stock' },
  { to: '/store-inventory', icon: Warehouse, label: 'Store Inventory' },
];

const viewItems = [
  { to: '/assets', icon: Monitor, label: 'All Assets' },
  { to: '/departments', icon: Building2, label: 'By Department' },
  { to: '/live-map', icon: Activity, label: 'Live Map' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const toolItems = [
  { to: '/import', icon: Upload, label: 'Import CSV' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'admin' };
  const userRole = user.role || 'admin';

  const filteredToolItems = userRole === 'admin' ? toolItems : [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside 
      className="w-[196px] bg-slate-900 text-white min-h-screen flex flex-col"
      aria-label="Main navigation"
    >
      <header className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Monitor className="w-6 h-6 text-blue-400" aria-hidden="true" />
          <span>TUUO Assets</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Inventory Management</p>
      </header>
      
      <nav className="flex-1 p-3 space-y-4" aria-label="Primary">
        <div role="group" aria-label="Main">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1.5" id="nav-main">Main</div>
          {mainItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  isActive
                    ? 'bg-[#1e40af] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
        
        <div role="group" aria-label="Views">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1.5" id="nav-views">Views</div>
          {viewItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  isActive
                    ? 'bg-[#1e40af] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
        
        <div role="group" aria-label="Tools">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1.5" id="nav-tools">Tools</div>
          {filteredToolItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  isActive
                    ? 'bg-[#1e40af] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Logout from the application"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
