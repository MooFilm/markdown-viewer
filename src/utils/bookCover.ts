const COVER_PALETTES: [string, string][] = [
  ['#2c3e50', '#3498db'],
  ['#134e4a', '#14b8a6'],
  ['#4a1942', '#c026d3'],
  ['#7c2d12', '#ea580c'],
  ['#1e3a5f', '#6366f1'],
  ['#365314', '#84cc16'],
  ['#713f12', '#d97706'],
  ['#3f3f46', '#71717a'],
];

export function getBookCoverGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = COVER_PALETTES[hash % COVER_PALETTES.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

export const FILE_LIST_VIEW_KEY = 'file-list-view';

export type FileListView = 'grid' | 'list';

export function getFileListView(): FileListView {
  return localStorage.getItem(FILE_LIST_VIEW_KEY) === 'list' ? 'list' : 'grid';
}

export function setFileListView(view: FileListView): void {
  localStorage.setItem(FILE_LIST_VIEW_KEY, view);
}

export function normalizeSearchText(text: string): string {
  return text.normalize('NFC').toLowerCase().trim();
}

export function matchesSearch(name: string, query: string): boolean {
  if (!query) return true;
  return normalizeSearchText(name).includes(normalizeSearchText(query));
}
