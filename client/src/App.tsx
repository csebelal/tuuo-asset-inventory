import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import AssetsPage from '@/pages/Assets';
import AssetDetailPage from '@/pages/AssetDetail';
import NewAssetPage from '@/pages/NewAsset';
import MaintenancePage from '@/pages/Maintenance';
import PartsChangePage from '@/pages/PartsChange';
import StockPage from '@/pages/Stock';
import StoreInventoryPage from '@/pages/StoreInventory';
import DepartmentsPage from '@/pages/Departments';
import FloorsPage from '@/pages/Floors';
import ReportsPage from '@/pages/Reports';
import ImportPage from '@/pages/Import';
import SettingsPage from '@/pages/Settings';
import LiveMapPage from '@/pages/LiveMap';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="parts" element={<PartsChangePage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="store-inventory" element={<StoreInventoryPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/new" element={<NewAssetPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="assets/:id/edit" element={<AssetDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="floors" element={<FloorsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="live-map" element={<LiveMapPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
