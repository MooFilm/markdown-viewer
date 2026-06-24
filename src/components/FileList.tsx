import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, Folder, CornerUpLeft, LayoutGrid, List } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import RecentDocuments from './RecentDocuments';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getShowSystemFolders, shouldShowItem, SYSTEM_FOLDERS_CHANGED_EVENT } from '../utils/fileFilters';
import { formatGithubError } from '../utils/githubErrors';
import { getFileListView, setFileListView, matchesSearch, type FileListView } from '../utils/bookCover';
import { getReadingHistory } from '../hooks/useReadingHistory';
import { useRepoSearch } from '../hooks/useRepoSearch';
import { useGithub } from '../context/GithubContext';
import { useLocale } from '../context/LocaleContext';
import BookItem from './BookItem';
import FolderItem from './FolderItem';
import PinGate from './PinGate';
import FolderActions from './FolderActions';
import { isBookMarkedRead, toggleBookRead, READ_BOOKS_CHANGED_EVENT } from '../utils/readBooks';
import { useFolderPins } from '../hooks/useFolderPins';

interface FileItem {
  name: string;
  path: string;
  sha: string;
  type: 'file' | 'dir';
}

const FileList: React.FC = () => {
  const { octokit, owner, repo, isConfigured, hasToken } = useGithub();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDir = searchParams.get('dir') || '';

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSystemFolders, setShowSystemFolders] = useState(() => getShowSystemFolders());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<FileListView>(() => getFileListView());
  const [recentDocs, setRecentDocs] = useState(getReadingHistory);
  const [refreshKey, setRefreshKey] = useState(0);
  const [readRevision, setReadRevision] = useState(0);

  const {
    pins,
    pinsSha,
    loading: pinsLoading,
    refresh: refreshPins,
    getLockedAncestor,
    getFileLockedAncestor,
    unlock,
    hasPin,
  } = useFolderPins();

  const lockedAncestor = getLockedAncestor(currentDir);
  const isCurrentDirBlocked = !!lockedAncestor && !hasToken;

  const pageTitle = currentDir
    ? currentDir.split('/').pop() || t('yourDocuments')
    : t('yourDocuments');
  useDocumentTitle(pageTitle);

  const { results: repoResults, loading: repoSearchLoading, error: repoSearchError } = useRepoSearch(
    searchQuery,
    searchQuery.trim().length >= 2
  );

  const filteredFiles = useMemo(
    () => files.filter((file) => matchesSearch(file.name, searchQuery)),
    [files, searchQuery]
  );

  useEffect(() => {
    const handleChange = () => setShowSystemFolders(getShowSystemFolders());
    window.addEventListener(SYSTEM_FOLDERS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(SYSTEM_FOLDERS_CHANGED_EVENT, handleChange);
  }, []);

  useEffect(() => {
    setRecentDocs(getReadingHistory());
  }, [currentDir]);

  useEffect(() => {
    const handleReadChange = () => setReadRevision((n) => n + 1);
    window.addEventListener(READ_BOOKS_CHANGED_EVENT, handleReadChange);
    return () => window.removeEventListener(READ_BOOKS_CHANGED_EVENT, handleReadChange);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      navigate('/settings');
      return;
    }

    if (isCurrentDirBlocked) {
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await octokit!.repos.getContent({
          owner,
          repo,
          path: currentDir,
        });

        if (Array.isArray(response.data)) {
          const items = response.data
            .filter((item) => item.type === 'dir' || (item.type === 'file' && item.name.endsWith('.md')))
            .map((item) => ({
              name: item.name,
              path: item.path,
              sha: item.sha,
              type: item.type as 'file' | 'dir',
            }))
            .filter((item) => shouldShowItem(item.name, item.type, showSystemFolders));

          items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
          });

          setFiles(items);
        }
      } catch (err: unknown) {
        setError(formatGithubError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isConfigured, octokit, owner, repo, currentDir, navigate, showSystemFolders, refreshKey, isCurrentDirBlocked]);

  const handleGoBack = () => {
    if (!currentDir) return;
    const parts = currentDir.split('/');
    parts.pop();
    const parentDir = parts.join('/');
    if (parentDir) {
      setSearchParams({ dir: parentDir });
    } else {
      setSearchParams({});
    }
  };

  const handleViewModeChange = (mode: FileListView) => {
    setViewMode(mode);
    setFileListView(mode);
  };

  const handleToggleRead = (path: string) => {
    toggleBookRead(path);
    setReadRevision((n) => n + 1);
  };

  if (loading || pinsLoading) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="lucide-spin" />
        <p>{t('loadingFiles')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ color: 'var(--error-color)' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
        <p>Error: {error}</p>
        <button onClick={() => setRefreshKey((k) => k + 1)} className="btn-secondary" style={{ marginTop: '1rem' }}>
          {t('retry')}
        </button>
      </div>
    );
  }

  if (isCurrentDirBlocked && lockedAncestor && pins[lockedAncestor]) {
    const lockedName = lockedAncestor.split('/').pop() || lockedAncestor;
    return (
      <div>
        <div className="file-list-header">
          <div className="file-list-header-main">
            <Breadcrumb currentDir={currentDir} />
          </div>
        </div>
        <PinGate
          inline
          folderPath={lockedAncestor}
          folderName={lockedName}
          pinHash={pins[lockedAncestor]}
          onUnlock={() => {
            unlock(lockedAncestor);
            setRefreshKey((k) => k + 1);
          }}
          onCancel={() => {
            const parts = lockedAncestor.split('/');
            parts.pop();
            const parent = parts.join('/');
            if (parent) setSearchParams({ dir: parent });
            else setSearchParams({});
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="file-list-header">
        <div className="file-list-header-main">
          {currentDir && (
            <button onClick={handleGoBack} className="btn-secondary file-list-back" aria-label="Go back">
              <CornerUpLeft size={16} />
              {t('back')}
            </button>
          )}
          <div>
            <Breadcrumb currentDir={currentDir} />
            {!currentDir && <h2 className="file-list-title">{t('yourDocuments')}</h2>}
          </div>
        </div>
        <div className="file-list-header-actions">
          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              aria-label="List view"
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
          <span className="file-list-count">{filteredFiles.length} {t('items')}</span>
          {hasToken && (
            <>
              <FolderActions
                variant="button"
                folderPath={currentDir}
                folderName={currentDir ? currentDir.split('/').pop() || currentDir : t('yourDocuments')}
                hasPin={hasPin(currentDir)}
                pins={pins}
                pinsSha={pinsSha}
                onChanged={refreshPins}
              />
              {currentDir && (
                <Link to="/upload" state={{ targetFolder: currentDir }} className="btn-primary navbar-btn">
                  {t('uploadToFolder')}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="file-list-toolbar">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t('searchPlaceholder')} />
      </div>

      <SearchResults
        results={repoResults}
        loading={repoSearchLoading}
        error={repoSearchError}
        query={searchQuery}
        hasToken={hasToken}
        getFileLockedAncestor={getFileLockedAncestor}
      />

      {!currentDir && <RecentDocuments entries={recentDocs} />}

      {filteredFiles.length === 0 ? (
        <div className="empty-state">
          <Folder size={48} style={{ margin: '0 auto 1rem', color: 'var(--border-color)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>
            {searchQuery ? t('noMatching') : t('folderEmpty')}
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {searchQuery
              ? 'Try a different search term or clear the search.'
              : showSystemFolders
                ? 'Get started by uploading your first .md file here.'
                : 'No documents here. Try showing system folders in Settings or upload a new file.'}
          </p>
          {hasToken && !searchQuery && (
            <Link to="/upload" state={currentDir ? { targetFolder: currentDir } : undefined} className="btn-primary">
              {t('uploadFile')}
            </Link>
          )}
        </div>
      ) : (
        <div className="bookshelf-container">
          <p className="bookshelf-hint">{t('markAsRead')}</p>
          <ul className={`file-list ${viewMode === 'list' ? 'file-list-list' : ''}`}>
            {filteredFiles.map((file) => (
              <li key={`${file.sha}-${readRevision}`} className={`file-list-item ${viewMode === 'list' ? 'file-list-item-row' : ''}`}>
                {file.type === 'dir' ? (
                  <FolderItem
                    name={file.name}
                    path={file.path}
                    listView={viewMode === 'list'}
                    hasToken={hasToken}
                    hasPin={hasPin(file.path)}
                    lockedAncestor={getLockedAncestor(file.path)}
                    pinHash={
                      getLockedAncestor(file.path)
                        ? pins[getLockedAncestor(file.path)!]
                        : undefined
                    }
                    pins={pins}
                    pinsSha={pinsSha}
                    onPinsChanged={refreshPins}
                    onUnlock={unlock}
                  />
                ) : (
                  <BookItem
                    name={file.name}
                    path={file.path}
                    sha={file.sha}
                    isRead={isBookMarkedRead(file.path)}
                    listView={viewMode === 'list'}
                    hasToken={hasToken}
                    onToggleRead={handleToggleRead}
                    onChanged={() => setRefreshKey((k) => k + 1)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileList;
