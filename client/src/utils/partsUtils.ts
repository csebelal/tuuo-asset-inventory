import type { ComponentType, ChangeReason } from '../types/parts.types';

export const COMPONENT_OPTIONS: { value: ComponentType; label: string }[] = [
  { value: 'mouse', label: '🖱 Mouse' },
  { value: 'keyboard', label: '⌨ Keyboard' },
  { value: 'monitor', label: '🖥 Monitor' },
  { value: 'headset', label: '🎧 Headset' },
  { value: 'psu', label: '⚡ Power Supply (PSU)' },
  { value: 'ram', label: '💾 RAM' },
  { value: 'ssd', label: '💽 SSD' },
  { value: 'hdd', label: '🗄 HDD' },
  { value: 'motherboard', label: '🔲 Motherboard' },
  { value: 'gpu', label: '🎮 GPU / Graphics Card' },
  { value: 'cpu', label: '🧠 CPU / Processor' },
  { value: 'ups', label: '🔋 UPS' },
  { value: 'other', label: '📦 Other' },
];

export const PLACEHOLDERS: Record<string, { old: string; new: string }> = {
  mouse: { old: 'e.g., Logitech M185', new: 'e.g., Dell MS116' },
  keyboard: { old: 'e.g., A4Tech KRS-83', new: 'e.g., A4Tech KR-85' },
  monitor: { old: 'e.g., Samsung 24" FHD', new: 'e.g., Dell 27" QHD' },
  headset: { old: 'e.g., Generic headset', new: 'e.g., Logitech H390' },
  psu: { old: 'e.g., Generic 450W', new: 'e.g., Corsair CV550 550W' },
  ram: { old: 'e.g., 16GB DDR4 2666MHz', new: 'e.g., 32GB DDR4 3200MHz' },
  ssd: { old: 'e.g., 120GB Kingston', new: 'e.g., 256GB Samsung 870 EVO' },
  hdd: { old: 'e.g., 500GB Seagate', new: 'e.g., 1TB WD Blue' },
  motherboard: { old: 'e.g., H410M H', new: 'e.g., B760M D2H' },
  gpu: { old: 'e.g., GTX 1050 Ti', new: 'e.g., RTX 3050 8GB' },
  cpu: { old: 'e.g., i5-10400', new: 'e.g., i7-12700' },
  ups: { old: 'e.g., APC 600VA', new: 'e.g., APC 1500VA' },
  other: { old: 'Old part serial / model', new: 'New part serial / model' },
};

export const BRAND_SUGGESTIONS: Record<string, string[]> = {
  mouse: ['Logitech', 'A4Tech', 'HP', 'Dell', 'Asus'],
  keyboard: ['A4Tech', 'Logitech', 'HP', 'Dell', 'Asus'],
  monitor: ['Samsung', 'Dell', 'LG', 'HP', 'Asus'],
  psu: ['Corsair', 'Seasonic', 'EVGA', 'Antec', 'Generic'],
  ram: ['Corsair', 'Kingston', 'Samsung', 'G.Skill', 'Crucial'],
  ssd: ['Samsung', 'WD', 'Seagate', 'Kingston', 'Crucial'],
  hdd: ['Seagate', 'WD', 'Toshiba'],
  gpu: ['NVIDIA', 'MSI', 'Gigabyte', 'ASUS'],
  cpu: ['Intel', 'AMD'],
  motherboard: ['Gigabyte', 'MSI', 'ASUS', 'ASRock'],
  ups: ['APC', 'Eaton', 'CyberPower'],
};

export const REASON_OPTIONS: { value: ChangeReason; label: string }[] = [
  { value: 'broken', label: 'Broken / Damaged' },
  { value: 'worn_out', label: 'Worn Out' },
  { value: 'lost', label: 'Lost' },
  { value: 'upgrade', label: 'Upgrade' },
  { value: 'preventive', label: 'Preventive' },
  { value: 'other', label: 'Other' },
];

export const COMPONENT_ICON_BG: Record<ComponentType, string> = {
  mouse: '#f0fdf4', keyboard: '#eff6ff', monitor: '#faf5ff',
  headset: '#f0f9ff', psu: '#fffbeb', ram: '#f0fdf4',
  ssd: '#eff6ff', hdd: '#fff7ed', motherboard: '#f0f9ff',
  gpu: '#fdf4ff', cpu: '#fef2f2', cooling_fan: '#f1f5f9',
  ups: '#fefce8', other: '#f8f8f6',
};

export const COMPONENT_ICON_TX: Record<ComponentType, string> = {
  mouse: '#15803d', keyboard: '#1d4ed8', monitor: '#7e22ce',
  headset: '#0369a1', psu: '#92400e', ram: '#15803d',
  ssd: '#1d4ed8', hdd: '#c2410c', motherboard: '#0369a1',
  gpu: '#86198f', cpu: '#991b1b', cooling_fan: '#475569',
  ups: '#854d0e', other: '#5a5a55',
};

export const CONDITION_DOT_COLOR: Record<string, string> = {
  new: '#22c55e', good: '#22c55e', worn: '#f59e0b',
  damaged: '#ef4444', missing: '#9ca3af',
};

export const TYPE_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  psu: { bg: '#fffbeb', color: '#92400e' },
  ram: { bg: '#f0fdf4', color: '#15803d' },
  ssd: { bg: '#eff6ff', color: '#1d4ed8' },
  hdd: { bg: '#fff7ed', color: '#c2410c' },
  mouse: { bg: '#f0fdf4', color: '#15803d' },
  keyboard: { bg: '#eff6ff', color: '#1d4ed8' },
  gpu: { bg: '#fdf4ff', color: '#86198f' },
  monitor: { bg: '#faf5ff', color: '#7e22ce' },
  ups: { bg: '#fefce8', color: '#854d0e' },
  other: { bg: '#f8f8f6', color: '#5a5a55' },
};

export const REASON_BADGE_STYLE: Record<ChangeReason, { bg: string; color: string }> = {
  broken: { bg: '#fef2f2', color: '#991b1b' },
  worn_out: { bg: '#fffbeb', color: '#92400e' },
  upgrade: { bg: '#eff6ff', color: '#1d4ed8' },
  lost: { bg: '#f9fafb', color: '#6b7280' },
  preventive: { bg: '#f0fdf4', color: '#15803d' },
  other: { bg: '#f8f8f6', color: '#5a5a55' },
};

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount);
}

export function formatDateToDDMMYYYY(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

export function getComponentLabel(type: ComponentType): string {
  const option = COMPONENT_OPTIONS.find(o => o.value === type);
  return option ? option.label.split(' ')[1] : type;
}
