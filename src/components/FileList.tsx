import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Loader2, AlertCircle, Folder, CornerUpLeft, LayoutGrid, List } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import RecentDocuments from './RecentDocuments';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getShowSystemFolders, shouldShowItem, SYSTEM_FOLDERS_CHANGED_EVENT } from '../utils/fileFilters';
import { formatGithubError } from '../utils/githubErrors';
import { getBookCoverGradient, getFileListView, setFileListView, matchesSearch, type FileListView } from '../utils/bookCover';
import { getReadingHistory } from '../hooks/useReadingHistory';
import { useRepoSearch } from '../hooks/useRepoSearch';
import { useGithub } from '../context/GithubContext';
import { useLocale } from '../context/LocaleContext';
import FileActions from './FileActions';

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
    if (!isConfigured) {
      navigate('/settings');
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
  }, [isConfigured, octokit, owner, repo, currentDir, navigate, showSystemFolders, refreshKey]);

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

  if (loading) {
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
          {hasToken && currentDir && (
            <Link to="/upload" state={{ targetFolder: currentDir }} className="btn-primary navbar-btn">
              {t('uploadToFolder')}
            </Link>
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
          <ul className={`file-list ${viewMode === 'list' ? 'file-list-list' : ''}`}>
            {filteredFiles.map((file) => (
              <li key={file.sha} className={`file-list-item ${viewMode === 'list' ? 'file-list-item-row' : ''}`}>
                {file.type === 'dir' ? (
                  <Link
                    to={`/?dir=${encodeURIComponent(file.path)}`}
                    className={`file-list-link ${viewMode === 'list' ? 'file-list-link-row' : ''}`}
                    title={file.name}
                  >
                    <div className="folder-cover">
                      <Folder size={viewMode === 'list' ? 24 : 32} />
                    </div>
                    <div className="file-item-name">{file.name}</div>
                  </Link>
                ) : (
                  <div className={`file-list-entry ${viewMode === 'list' ? 'file-list-entry-row' : ''}`}>
                    <Link
                      to={`/view/${encodeURIComponent(file.path)}`}
                      className={`file-list-link ${viewMode === 'list' ? 'file-list-link-row' : ''}`}
                      title={file.name}
                    >
                      <div
                        className="book-cover"
                        style={{ background: getBookCoverGradient(file.name) }}
                      >
                        <FileText size={viewMode === 'list' ? 24 : 32} opacity={0.9} />
                      </div>
                      <div className="file-item-name">{file.name.replace('.md', '')}</div>
                    </Link>
                    {hasToken && (
                      <FileActions
                        filePath={file.path}
                        fileName={file.name}
                        sha={file.sha}
                        onChanged={() => setRefreshKey((k) => k + 1)}
                      />
                    )}
                  </div>
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
