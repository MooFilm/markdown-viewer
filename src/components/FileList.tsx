import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { FileText, Loader2, AlertCircle, Folder, CornerUpLeft } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  sha: string;
  type: 'file' | 'dir';
}

const FileList: React.FC = () => {
  const { octokit, owner, repo, isConfigured } = useGithub();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDir = searchParams.get('dir') || '';
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      navigate('/settings');
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
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
            }));
            
          // Sort: Directories first, then files alphabetically
          items.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
          });
            
          setFiles(items);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isConfigured, octokit, owner, repo, currentDir, navigate]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentDir && (
            <button onClick={handleGoBack} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem' }}>
              <CornerUpLeft size={16} />
              Back
            </button>
          )}
          <h2>{currentDir ? `/${currentDir}` : 'Your Documents'}</h2>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{files.length} items</span>
      </div>
      
      {files.length === 0 ? (
        <div className="empty-state">
          <Folder size={48} style={{ margin: '0 auto 1rem', color: 'var(--border-color)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Folder is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>Get started by uploading your first .md file here.</p>
          <Link to="/upload" className="btn-primary">Upload File</Link>
        </div>
      ) : (
        <div className="bookshelf-container">
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.sha} className="file-list-item">
                {file.type === 'dir' ? (
                  <Link 
                    to={`/?dir=${encodeURIComponent(file.path)}`} 
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                  >
                    <div className="folder-cover">
                      <Folder size={32} />
                    </div>
                    <div className="file-item-name">
                      {file.name}
                    </div>
                  </Link>
                ) : (
                  <Link 
                    to={`/view/${encodeURIComponent(file.path)}`} 
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                  >
                    <div className="book-cover">
                      <FileText size={32} opacity={0.8} />
                    </div>
                    <div className="file-item-name">
                      {file.name.replace('.md', '')}
                    </div>
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
