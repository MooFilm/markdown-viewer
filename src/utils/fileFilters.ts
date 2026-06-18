const HIDDEN_FOLDERS = new Set(['.github', '.git', 'node_modules', 'dist', 'src', 'public']);

export function isSystemFolder(name: string, type: 'file' | 'dir'): boolean {
  if (type !== 'dir') return false;
  return name.startsWith('.') || HIDDEN_FOLDERS.has(name);
}

export function shouldShowItem(
  name: string,
  type: 'file' | 'dir',
  showSystemFolders: boolean
): boolean {
  if (showSystemFolders) return true;
  return !isSystemFolder(name, type);
}

export const SHOW_SYSTEM_FOLDERS_KEY = 'show_system_folders';
export const SYSTEM_FOLDERS_CHANGED_EVENT = 'system-folders-changed';

export function getShowSystemFolders(): boolean {
  return localStorage.getItem(SHOW_SYSTEM_FOLDERS_KEY) === 'true';
}

export function setShowSystemFolders(value: boolean): void {
  localStorage.setItem(SHOW_SYSTEM_FOLDERS_KEY, String(value));
  window.dispatchEvent(new CustomEvent(SYSTEM_FOLDERS_CHANGED_EVENT));
}
