import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi, dashboardApi, importApi, reportsApi, maintenanceApi } from '@/api/client';
import { IAsset, AssetsResponse, DashboardStats } from '@/types/asset.types';

export const useAssets = (params?: Record<string, any>) => {
  return useQuery<AssetsResponse>({
    queryKey: ['assets', params],
    queryFn: () => assetsApi.getAll(params).then(res => res.data),
  });
};

export const useAsset = (id: string) => {
  return useQuery<IAsset>({
    queryKey: ['asset', id],
    queryFn: () => assetsApi.getOne(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<IAsset>) => assetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IAsset> }) =>
      assetsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useSearchAssets = (q: string) => {
  return useQuery({
    queryKey: ['assets', 'search', q],
    queryFn: () => assetsApi.search(q).then(res => res.data.assets),
    enabled: q.length >= 2,
  });
};

export const useAllAssets = () => {
  return useQuery({
    queryKey: ['assets', 'all'],
    queryFn: () => assetsApi.getAll({ limit: 1000 }).then(res => res.data.assets),
  });
};

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then(res => res.data),
  });
};

export const useDashboardByType = () => {
  return useQuery({
    queryKey: ['dashboard', 'byType'],
    queryFn: () => dashboardApi.getByType().then(res => res.data),
  });
};

export const useDashboardByDepartment = () => {
  return useQuery({
    queryKey: ['dashboard', 'byDepartment'],
    queryFn: () => dashboardApi.getByDepartment().then(res => res.data),
  });
};

export const useDashboardByFloor = () => {
  return useQuery({
    queryKey: ['dashboard', 'byFloor'],
    queryFn: () => dashboardApi.getByFloor().then(res => res.data),
  });
};

export const useDashboardByOS = () => {
  return useQuery({
    queryKey: ['dashboard', 'byOS'],
    queryFn: () => dashboardApi.getByOS().then(res => res.data),
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.getAlerts().then(res => res.data),
  });
};

export const useIncompleteAssets = () => {
  return useQuery({
    queryKey: ['dashboard', 'incomplete'],
    queryFn: () => dashboardApi.getIncomplete().then(res => res.data),
  });
};

export const useImportCSV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: FormData) => importApi.uploadCSV(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useExportCSV = () => {
  return useMutation({
    mutationFn: () => reportsApi.exportCSV(),
  });
};

export const useActivityLog = () => {
  return useQuery({
    queryKey: ['activity'],
    queryFn: () => reportsApi.getActivity().then(res => res.data),
  });
};

export const useMaintenanceLogs = (type?: string) => {
  return useQuery({
    queryKey: ['maintenance', type],
    queryFn: () => maintenanceApi.getAll({ type }).then(res => res.data),
  });
};

export const useMaintenanceSchedule = () => {
  return useQuery({
    queryKey: ['maintenance', 'schedule'],
    queryFn: () => maintenanceApi.getSchedule().then(res => res.data),
  });
};

export const useDustClean = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { assetSL?: string; floor?: string }) => maintenanceApi.dustClean(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const usePeripheralChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      assetSL: string;
      peripheralType: string;
      oldPeripheral: string;
      newPeripheral: string;
      description: string;
      cost?: number;
    }) => maintenanceApi.peripheral(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
};
