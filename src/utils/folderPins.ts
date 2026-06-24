import type { Octokit } from '@octokit/rest';

export const PINS_FILE_PATH = '.mdviewer/folder-pins.json';
export const FOLDER_PINS_CHANGED_EVENT = 'folder-pins-changed';
const UNLOCK_STORAGE_KEY = 'folder-unlock-paths';

export interface FolderPinsData {
  pins: Record<string, string>;
  sha?: string;
}

function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return sha256(`${salt}:${pin}`);
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const colon = stored.indexOf(':');
  if (colon === -1) return false;
  const salt = stored.slice(0, colon);
  const hash = stored.slice(colon + 1);
  const computed = await hashPin(pin, salt);
  return computed === hash;
}

export async function createPinHash(pin: string): Promise<string> {
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  return `${salt}:${hash}`;
}

export function getAncestorPaths(folderPath: string): string[] {
  if (!folderPath) return [];
  const parts = folderPath.split('/').filter(Boolean);
  const ancestors: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    ancestors.push(parts.slice(0, i + 1).join('/'));
  }
  return ancestors;
}

export function findLockedAncestor(
  folderPath: string,
  pins: Record<string, string>,
  isUnlockedFn: (path: string) => boolean
): string | null {
  for (const ancestor of getAncestorPaths(folderPath)) {
    if (pins[ancestor] && !isUnlockedFn(ancestor)) {
      return ancestor;
    }
  }
  return null;
}

export function isPathUnderLockedFolder(
  filePath: string,
  pins: Record<string, string>,
  isUnlockedFn: (path: string) => boolean
): string | null {
  const parts = filePath.split('/').filter(Boolean);
  if (parts.length <= 1) {
    return findLockedAncestor('', pins, isUnlockedFn);
  }
  const parentPath = parts.slice(0, -1).join('/');
  return findLockedAncestor(parentPath, pins, isUnlockedFn);
}

export function isFolderUnlocked(path: string): boolean {
  try {
    const raw = sessionStorage.getItem(UNLOCK_STORAGE_KEY);
    if (!raw) return false;
    const paths: string[] = JSON.parse(raw);
    return paths.includes(path);
  } catch {
    return false;
  }
}

export function unlockFolder(path: string): void {
  const raw = sessionStorage.getItem(UNLOCK_STORAGE_KEY);
  const paths: string[] = raw ? JSON.parse(raw) : [];
  if (!paths.includes(path)) {
    paths.push(path);
    sessionStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(paths));
  }
}

export async function fetchFolderPins(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<FolderPinsData> {
  try {
    const response = await octokit.repos.getContent({ owner, repo, path: PINS_FILE_PATH });
    if ('content' in response.data) {
      const binary = atob(response.data.content.replace(/\n/g, ''));
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      const pins = JSON.parse(decoded) as Record<string, string>;
      return { pins, sha: response.data.sha };
    }
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) {
      return { pins: {} };
    }
    throw err;
  }
  return { pins: {} };
}

export async function saveFolderPins(
  octokit: Octokit,
  owner: string,
  repo: string,
  pins: Record<string, string>,
  sha?: string
): Promise<void> {
  const content = encodeBase64Utf8(JSON.stringify(pins, null, 2));
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: PINS_FILE_PATH,
    message: 'Update folder PINs via MD Viewer',
    content,
    sha,
  });
  window.dispatchEvent(new CustomEvent(FOLDER_PINS_CHANGED_EVENT));
}
