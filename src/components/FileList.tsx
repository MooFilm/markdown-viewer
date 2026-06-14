import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  sha: string;
}

const FileList: React.FC = () => {
  const { octokit, owner, repo, isConfigured } = useGithub();
  const navigate = useNavigate();
  
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
        // Only fetch from root directory for simplicity
        const response = await octokit!.repos.getContent({
          owner,
          repo,
          path: '',
        });

        if (Array.isArray(response.data)) {
          const mdFiles = response.data
            .filter((item) => item.type === 'file' && item.name.endsWith('.md'))
            .map((item) => ({
              name: item.name,
              path: item.path,
              sha: item.sha,
            }));
          setFiles(mdFiles);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isConfigured, octokit, owner, repo, navigate]);

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

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} style={{ margin: '0 auto 1rem', color: 'var(--border-color)' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>No Markdown Files Found</h3>
        <p style={{ marginBottom: '1.5rem' }}>Get started by uploading your first .md file.</p>
        <Link to="/upload" className="btn-primary">Upload File</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Your Documents</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{files.length} files</span>
      </div>
      
      <ul className="file-list">
        {files.map((file) => (
          <li key={file.sha} className="file-list-item">
            <Link to={`/view/${encodeURIComponent(file.path)}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <div className="file-item-name">
                <FileText size={18} color="var(--text-muted)" />
                {file.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
