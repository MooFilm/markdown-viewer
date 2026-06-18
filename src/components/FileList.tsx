import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { FileText, Loader2, AlertCircle, Folder, CornerUpLeft } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getShowSystemFolders, shouldShowItem, SYSTEM_FOLDERS_CHANGED_EVENT } from '../utils/fileFilters';
import { formatGithubError } from '../utils/githubErrors';

interface FileItem {
  name: string;
  path: string;
  sha: string;
  type: 'file' | 'dir';
}

const FileList: React.FC = () => {
  const { octokit, owner, repo, isConfigured, hasToken } = useGithub();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDir = searchParams.get('dir') || '';

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSystemFolders, setShowSystemFolders] = useState(() => getShowSystemFolders());

  const pageTitle = currentDir
    ? currentDir.split('/').pop() || 'Your Documents'
    : 'Your Documents';
  useDocumentTitle(pageTitle);

  useEffect(() => {
    const handleChange = () => setShowSystemFolders(getShowSystemFolders());
    window.addEventListener(SYSTEM_FOLDERS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(SYSTEM_FOLDERS_CHANGED_EVENT, handleChange);
  }, []);

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
  }, [isConfigured, octokit, owner, repo, currentDir, navigate, showSystemFolders]);

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

  if (loading) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="lucide-spin" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }} />
        <p>Loading files from GitHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ color: 'var(--error-color)' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: '1rem' }}>
          Retry
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
              Back
            </button>
          )}
          <div>
            <Breadcrumb currentDir={currentDir} />
            {!currentDir && <h2 className="file-list-title">Your Documents</h2>}
          </div>
        </div>
        <div className="file-list-header-actions">
          <span className="file-list-count">{files.length} items</span>
          {hasToken && currentDir && (
            <Link to="/upload" state={{ targetFolder: currentDir }} className="btn-primary navbar-btn">
              Upload to this folder
            </Link>
          )}
        </div>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <Folder size={48} style={{ margin: '0 auto 1rem', color: 'var(--border-color)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Folder is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {showSystemFolders
              ? 'Get started by uploading your first .md file here.'
              : 'No documents here. Try showing system folders in Settings or upload a new file.'}
          </p>
          {hasToken && (
            <Link to="/upload" state={currentDir ? { targetFolder: currentDir } : undefined} className="btn-primary">
              Upload File
            </Link>
          )}
        </div>
      ) : (
        <div className="bookshelf-container">
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.sha} className="file-list-item">
                {file.type === 'dir' ? (
                  <Link
                    to={`/?dir=${encodeURIComponent(file.path)}`}
                    className="file-list-link"
                    title={file.name}
                  >
                    <div className="folder-cover">
                      <Folder size={32} />
                    </div>
                    <div className="file-item-name">{file.name}</div>
                  </Link>
                ) : (
                  <Link
                    to={`/view/${encodeURIComponent(file.path)}`}
                    className="file-list-link"
                    title={file.name}
                  >
                    <div className="book-cover">
                      <FileText size={32} opacity={0.8} />
                    </div>
                    <div className="file-item-name">{file.name.replace('.md', '')}</div>
                  </Link>
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
