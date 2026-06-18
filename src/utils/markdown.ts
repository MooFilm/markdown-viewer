import GithubSlugger from 'github-slugger';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function extractMarkdownTitle(content: string, fallback: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return fallback.replace(/\.md$/i, '');
}

export function extractHeadings(content: string): TocHeading[] {
  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].replace(/\s+#+\s*$/, '').trim();
    if (!text) continue;

    headings.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return headings;
}
