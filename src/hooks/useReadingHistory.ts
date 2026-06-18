import { markBookAsRead } from '../utils/readBooks';

export interface ReadingEntry {
  path: string;
  title: string;
  lastReadAt: number;
  scrollPercent: number;
}

const STORAGE_KEY = 'reading-history';
const MAX_ENTRIES = 10;

export function getReadingHistory(): ReadingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReadingEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReadingProgress(path: string, title: string, scrollPercent: number): void {
  const history = getReadingHistory().filter((entry) => entry.path !== path);
  const percent = Math.min(100, Math.max(0, Math.round(scrollPercent)));
  history.unshift({
    path,
    title,
    lastReadAt: Date.now(),
    scrollPercent: percent,
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));

  if (percent >= 90) {
    markBookAsRead(path);
  }
}

export function useReadingHistory() {
  return getReadingHistory();
}
