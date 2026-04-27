export function daysBetween(dateStr1: string, dateStr2: string): number {
  const parse = (s: string) => {
    if (!s) return new Date(0);
    const [d, m, y] = s.split('.').map(Number);
    return new Date(y, m - 1, d);
  };
  const diff = parse(dateStr2).getTime() - parse(dateStr1).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function addMonths(dateStr: string, months: number): string {
  if (!dateStr) return '';
  const [d, m, y] = dateStr.split('.').map(Number);
  const date = new Date(y, m - 1 + months, d);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

export function getDustCleanStatus(lastDate: string, intervalMonths: number) {
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
  
  if (!lastDate) {
    return {
      daysElapsed: 0,
      daysLeft: 0,
      pct: 100,
      status: 'overdue' as const,
      nextDueDate: todayStr,
    };
  }
  
  const daysElapsed = daysBetween(lastDate, todayStr);
  const totalDays = intervalMonths * 30;
  const daysLeft = totalDays - daysElapsed;
  const pct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  return {
    daysElapsed,
    daysLeft,
    pct,
    status: daysLeft <= 0 ? 'overdue' as const : daysLeft <= 14 ? 'due_soon' as const : 'upcoming' as const,
    nextDueDate: addMonths(lastDate, intervalMonths),
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [d, m, y] = dateStr.split('.');
  return `${d}/${m}/${y}`;
}

export function toDDMMYYYY(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

export function getDaysAgo(dateStr: string): number {
  const today = new Date();
  const todayStr = toDDMMYYYY(today);
  return daysBetween(dateStr, todayStr);
}
