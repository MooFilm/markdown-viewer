import { useCallback, useEffect, useState } from 'react';
import { useGithub } from '../context/GithubContext';
import {
  fetchFolderPins,
  findLockedAncestor,
  FOLDER_PINS_CHANGED_EVENT,
  isFolderUnlocked,
  isPathUnderLockedFolder,
  unlockFolder,
} from '../utils/folderPins';

export function useFolderPins() {
  const { octokit, owner, repo } = useGithub();
  const [pins, setPins] = useState<Record<string, string>>({});
  const [pinsSha, setPinsSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [unlockRevision, setUnlockRevision] = useState(0);

  const refresh = useCallback(async () => {
    if (!octokit) return;
    try {
      setLoading(true);
      const data = await fetchFolderPins(octokit, owner, repo);
      setPins(data.pins);
      setPinsSha(data.sha);
    } catch {
      setPins({});
      setPinsSha(undefined);
    } finally {
      setLoading(false);
    }
  }, [octokit, owner, repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleChange = () => refresh();
    window.addEventListener(FOLDER_PINS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(FOLDER_PINS_CHANGED_EVENT, handleChange);
  }, [refresh]);

  const checkUnlocked = useCallback(
    (path: string) => {
      void unlockRevision;
      return isFolderUnlocked(path);
    },
    [unlockRevision]
  );

  const getLockedAncestor = useCallback(
    (folderPath: string) => findLockedAncestor(folderPath, pins, checkUnlocked),
    [pins, checkUnlocked]
  );

  const getFileLockedAncestor = useCallback(
    (filePath: string) => isPathUnderLockedFolder(filePath, pins, checkUnlocked),
    [pins, checkUnlocked]
  );

  const unlock = useCallback((path: string) => {
    unlockFolder(path);
    setUnlockRevision((n) => n + 1);
  }, []);

  const hasPin = useCallback((path: string) => !!pins[path], [pins]);

  return {
    pins,
    pinsSha,
    loading,
    refresh,
    getLockedAncestor,
    getFileLockedAncestor,
    isUnlocked: checkUnlocked,
    unlock,
    hasPin,
  };
}
