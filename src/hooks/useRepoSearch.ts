import { useEffect, useState } from 'react';
import { useGithub } from '../context/GithubContext';
import { formatGithubError } from '../utils/githubErrors';

export interface RepoSearchResult {
  path: string;
  name: string;
  snippet: string;
}

export function useRepoSearch(query: string, enabled: boolean) {
  const { octokit, owner, repo } = useGithub();
  const [results, setResults] = useState<RepoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !query.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await octokit!.search.code({
          q: `${query} repo:${owner}/${repo} extension:md`,
          per_page: 20,
          request: { signal: controller.signal },
        });

        const mapped = response.data.items.map((item) => ({
          path: item.path,
          name: item.name,
          snippet: item.text_matches?.[0]?.fragment?.replace(/\n/g, ' ').trim() || item.path,
        }));

        setResults(mapped);
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setResults([]);
        setError(formatGithubError(err));
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [octokit, owner, repo, query, enabled]);

  return { results, loading, error };
}
