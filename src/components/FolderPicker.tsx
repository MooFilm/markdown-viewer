import React, { useEffect, useState } from 'react';
import { Folder, ChevronRight, Loader2, X } from 'lucide-react';
import { useGithub } from '../context/GithubContext';
import { formatGithubError } from '../utils/githubErrors';

interface FolderPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  selectedPath?: string;
}

interface FolderNode {
  name: string;
  path: string;
}

const FolderPicker: React.FC<FolderPickerProps> = ({ open, onClose, onSelect, selectedPath = '' }) => {
  const { octokit, owner, repo } = useGithub();
  const [currentPath, setCurrentPath] = useState('');
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchFolders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await octokit!.repos.getContent({ owner, repo, path: currentPath });

        if (Array.isArray(response.data)) {
          const dirs = response.data
            .filter((item) => item.type === 'dir')
            .map((item) => ({ name: item.name, path: item.path }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setFolders(dirs);
        } else {
          setFolders([]);
        }
      } catch (err: unknown) {
        setError(formatGithubError(err));
        setFolders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [open, octokit, owner, repo, currentPath]);

  if (!open) return null;

  const segments = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog folder-picker" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Folder</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="folder-picker-breadcrumb">
          <button type="button" className="folder-picker-crumb" onClick={() => setCurrentPath('')}>
            Root
          </button>
          {segments.map((segment, index) => {
            const path = segments.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={path}>
                <ChevronRight size={14} />
                <button type="button" className="folder-picker-crumb" onClick={() => setCurrentPath(path)}>
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="folder-picker-body">
          {loading && (
            <div className="folder-picker-status">
              <Loader2 size={18} className="lucide-spin" />
              Loading folders...
            </div>
          )}
          {error && <p className="folder-picker-error">{error}</p>}
          {!loading && !error && folders.length === 0 && (
            <p className="folder-picker-empty">No subfolders here.</p>
          )}
          <ul className="folder-picker-list">
            {folders.map((folder) => (
              <li key={folder.path}>
                <button type="button" className="folder-picker-item" onClick={() => setCurrentPath(folder.path)}>
                  <Folder size={16} />
                  {folder.name}
                  <ChevronRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onSelect(currentPath);
              onClose();
            }}
          >
            Select {currentPath || 'root'}
          </button>
        </div>
        {selectedPath && <p className="folder-picker-selected">Current: {selectedPath || 'root'}</p>}
      </div>
    </div>
  );
};

export default FolderPicker;
