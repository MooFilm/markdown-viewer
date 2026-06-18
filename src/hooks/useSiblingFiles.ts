import { useEffect, useState } from 'react';
import { useGithub } from '../context/GithubContext';
import { shouldShowItem } from '../utils/fileFilters';
import { formatGithubError } from '../utils/githubErrors';

export interface SiblingFile {
  name: string;
  path: string;
}

interface SiblingFilesResult {
  prev: SiblingFile | null;
  next: SiblingFile | null;
  loading: boolean;
}

export function useSiblingFiles(currentPath: string): SiblingFilesResult {
  const { octokit, owner, repo } = useGithub();
  const [prev, setPrev] = useState<SiblingFile | null>(null);
  const [next, setNext] = useState<SiblingFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentPath) {
      setPrev(null);
      setNext(null);
      setLoading(false);
      return;
    }

    const parentDir = currentPath.includes('/')
      ? currentPath.substring(0, currentPath.lastIndexOf('/'))
      : '';

    const fetchSiblings = async () => {
      try {
        setLoading(true);
        const response = await octokit!.repos.getContent({
          owner,
          repo,
          path: parentDir,
        });

        if (!Array.isArray(response.data)) {
          setPrev(null);
          setNext(null);
          return;
        }

        const files = response.data
          .filter((item) => item.type === 'file' && item.name.endsWith('.md'))
          .map((item) => ({ name: item.name, path: item.path }))
          .filter((item) => shouldShowItem(item.name, 'file', false))
          .sort((a, b) => a.name.localeCompare(b.name));

        const index = files.findIndex((file) => file.path === currentPath);
        setPrev(index > 0 ? files[index - 1] : null);
        setNext(index >= 0 && index < files.length - 1 ? files[index + 1] : null);
      } catch (err: unknown) {
        console.error(formatGithubError(err));
        setPrev(null);
        setNext(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSiblings();
  }, [octokit, owner, repo, currentPath]);

  return { prev, next, loading };
}
