import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Octokit } from '@octokit/rest';
import { useGithub } from '../context/GithubContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  getShowSystemFolders,
  setShowSystemFolders,
} from '../utils/fileFilters';
import { formatGithubError } from '../utils/githubErrors';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

const Settings: React.FC = () => {
  const { setCredentials, owner: initialOwner, repo: initialRepo } = useGithub();
  const navigate = useNavigate();
  useDocumentTitle('Settings');

  const savedToken = localStorage.getItem('gh_token') || '';
  const [token, setToken] = useState(savedToken);
  const [owner, setOwner] = useState(initialOwner || 'MooFilm');
  const [repo, setRepo] = useState(initialRepo || 'markdown-viewer');
  const [showSystemFolders, setShowSystemFoldersState] = useState(getShowSystemFolders);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner && repo) {
      setShowSystemFolders(showSystemFolders);
      setCredentials(token, owner, repo);
      navigate('/');
    }
  };

  const handleTestConnection = async () => {
    if (!owner.trim() || !repo.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter repository owner and name.');
      return;
    }

    setTestStatus('loading');
    setTestMessage('');

    try {
      const client = token.trim() ? new Octokit({ auth: token.trim() }) : new Octokit();
      const response = await client.repos.get({
        owner: owner.trim(),
        repo: repo.trim(),
      });
      setTestStatus('success');
      setTestMessage(`Connected to ${response.data.full_name} (${response.data.private ? 'private' : 'public'})`);
    } catch (err: unknown) {
      setTestStatus('error');
      setTestMessage(formatGithubError(err));
    }
  };

  const handleSystemFoldersChange = (checked: boolean) => {
    setShowSystemFoldersState(checked);
    setShowSystemFolders(checked);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Configuration</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
        You can browse public repositories without a token. To upload or edit files, you must provide a GitHub Personal Access Token.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GitHub Token (PAT) - Optional</label>
          <input
            type="password"
            className="input-field"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx (Leave empty for read-only mode)"
          />
          <small style={{ color: 'var(--text-muted)' }}>Requires 'repo' scope to upload files.</small>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Repository Owner</label>
          <input
            type="text"
            className="input-field"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g. MooFilm"
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Repository Name</label>
          <input
            type="text"
            className="input-field"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="e.g. markdown-viewer"
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            className="btn-secondary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            disabled={testStatus === 'loading'}
          >
            {testStatus === 'loading' && (
              <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} />
            )}
            Test Connection
          </button>
          {testStatus === 'success' && (
            <p className="settings-status settings-status-success">
              <CheckCircle2 size={16} />
              {testMessage}
            </p>
          )}
          {testStatus === 'error' && (
            <p className="settings-status settings-status-error">
              <XCircle size={16} />
              {testMessage}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={showSystemFolders}
              onChange={(e) => handleSystemFoldersChange(e.target.checked)}
            />
            Show system folders (.github, src, node_modules, etc.)
          </label>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default Settings;
