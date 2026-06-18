import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useGithub } from '../context/GithubContext';
import { useToast } from '../context/ToastContext';
import { formatGithubError } from '../utils/githubErrors';

interface FileActionsProps {
  filePath: string;
  fileName: string;
  sha: string;
  onChanged: () => void;
}

const FileActions: React.FC<FileActionsProps> = ({ filePath, fileName, sha, onChanged }) => {
  const { octokit, owner, repo } = useGithub();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(fileName);
  const [loading, setLoading] = useState(false);

  const parentDir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
  const baseName = fileName.replace(/\.md$/i, '');

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${fileName}" from GitHub?`)) return;

    try {
      setLoading(true);
      await octokit!.repos.deleteFile({
        owner,
        repo,
        path: filePath,
        message: `Delete ${fileName} via MD Viewer`,
        sha,
      });
      showToast({ type: 'success', message: `Deleted ${fileName}` });
      onChanged();
    } catch (err: unknown) {
      showToast({ type: 'error', message: formatGithubError(err) });
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    const filename = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`;
    if (filename === fileName) {
      setRenameOpen(false);
      return;
    }

    const newPath = parentDir ? `${parentDir}/${filename}` : filename;

    try {
      setLoading(true);
      const existing = await octokit!.repos.getContent({ owner, repo, path: filePath });
      if (!('content' in existing.data)) throw new Error('File not found');

      const oldSha = existing.data.sha;

      await octokit!.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: newPath,
        message: `Rename ${fileName} to ${filename} via MD Viewer`,
        content: existing.data.content,
      });

      await octokit!.repos.deleteFile({
        owner,
        repo,
        path: filePath,
        message: `Remove old file after rename via MD Viewer`,
        sha: oldSha,
      });

      showToast({ type: 'success', message: `Renamed to ${filename}` });
      setRenameOpen(false);
      onChanged();
    } catch (err: unknown) {
      showToast({ type: 'error', message: formatGithubError(err) });
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className="file-actions" onClick={(e) => e.preventDefault()}>
      <button
        type="button"
        className="file-actions-trigger"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
        disabled={loading}
        aria-label={`Actions for ${fileName}`}
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div className="file-actions-menu">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNewName(baseName);
              setRenameOpen(true);
              setMenuOpen(false);
            }}
          >
            <Pencil size={14} />
            Rename
          </button>
          <button type="button" className="danger" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {renameOpen && (
        <div className="modal-overlay" onClick={() => setRenameOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Rename file</h3>
            <form onSubmit={handleRename}>
              <input
                className="input-field"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setRenameOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileActions;
