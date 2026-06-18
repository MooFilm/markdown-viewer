interface CachedContent {
  sha: string;
  content: string;
  cachedAt: number;
}

const PREFIX = 'md-content-cache:';

function getKey(path: string): string {
  return `${PREFIX}${path}`;
}

export function getCachedContent(path: string, sha: string): string | null {
  try {
    const raw = sessionStorage.getItem(getKey(path));
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedContent;
    if (cached.sha !== sha) return null;
    return cached.content;
  } catch {
    return null;
  }
}

export function setCachedContent(path: string, sha: string, content: string): void {
  const entry: CachedContent = { sha, content, cachedAt: Date.now() };
  sessionStorage.setItem(getKey(path), JSON.stringify(entry));
}
