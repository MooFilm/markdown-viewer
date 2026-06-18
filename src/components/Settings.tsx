import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Octokit } from '@octokit/rest';
import { useGithub } from '../context/GithubContext';
import { useLocale } from '../context/LocaleContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useTheme } from '../hooks/useTheme';
import {
  getShowSystemFolders,
  setShowSystemFolders,
} from '../utils/fileFilters';
import { formatGithubError } from '../utils/githubErrors';
import type { Locale } from '../i18n/translations';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

const Settings: React.FC = () => {
  const { setCredentials, owner: initialOwner, repo: initialRepo } = useGithub();
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  useDocumentTitle(t('settings'));

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
      setTestMessage(t('error422'));
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
    <div className="settings-page">
      <h2>{t('configuration')}</h2>
      <p className="settings-desc">{t('configDesc')}</p>

      <form onSubmit={handleSubmit}>
        <div className="settings-field">
          <label>{t('language')}</label>
          <select
            className="input-field"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
        </div>

        <div className="settings-field">
          <label>{t('theme')}</label>
          <select
            className="input-field"
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
          >
            <option value="light">{t('themeLight')}</option>
            <option value="dark">{t('themeDark')}</option>
          </select>
        </div>

        <div className="settings-field">
          <label>{t('githubToken')}</label>
          <input
            type="password"
            className="input-field"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
          />
          <small>{t('tokenHint')}</small>
        </div>

        <div className="settings-field">
          <label>{t('repoOwner')}</label>
          <input
            type="text"
            className="input-field"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          />
        </div>

        <div className="settings-field">
          <label>{t('repoName')}</label>
          <input
            type="text"
            className="input-field"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            required
          />
        </div>

        <div className="settings-field">
          <button
            type="button"
            onClick={handleTestConnection}
            className="btn-secondary settings-test-btn"
            disabled={testStatus === 'loading'}
          >
            {testStatus === 'loading' && <Loader2 size={16} className="lucide-spin" />}
            {t('testConnection')}
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

        <div className="settings-field">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={showSystemFolders}
              onChange={(e) => handleSystemFoldersChange(e.target.checked)}
            />
            {t('showSystemFolders')}
          </label>
        </div>

        <button type="submit" className="btn-primary settings-save-btn">
          {t('saveConfiguration')}
        </button>
      </form>
    </div>
  );
};

export default Settings;
