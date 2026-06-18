const READ_BOOKS_KEY = 'read-books';
export const READ_BOOKS_CHANGED_EVENT = 'read-books-changed';

export const READ_BOOK_GRADIENT = 'linear-gradient(135deg, #14532d, #16a34a, #4ade80)';

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_BOOKS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSet(paths: Set<string>): void {
  localStorage.setItem(READ_BOOKS_KEY, JSON.stringify([...paths]));
  window.dispatchEvent(new CustomEvent(READ_BOOKS_CHANGED_EVENT));
}

export function isBookMarkedRead(path: string): boolean {
  return readSet().has(path);
}

export function toggleBookRead(path: string): boolean {
  const paths = readSet();
  const next = !paths.has(path);
  if (next) paths.add(path);
  else paths.delete(path);
  writeSet(paths);
  return next;
}

export function markBookAsRead(path: string): void {
  const paths = readSet();
  if (!paths.has(path)) {
    paths.add(path);
    writeSet(paths);
  }
}

export function getReadBookPaths(): string[] {
  return [...readSet()];
}
