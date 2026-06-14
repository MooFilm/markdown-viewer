import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';

const Settings: React.FC = () => {
  const { setCredentials, owner: initialOwner, repo: initialRepo } = useGithub();
  const navigate = useNavigate();
  
  // Try to load token from localStorage, or use empty string
  const savedToken = localStorage.getItem('gh_token') || '';
  const [token, setToken] = useState(savedToken);
  const [owner, setOwner] = useState(initialOwner || 'MooFilm');
  const [repo, setRepo] = useState(initialRepo || 'markdown-viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner && repo) {
      setCredentials(token, owner, repo);
      navigate('/');
    }
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
        
        <div style={{ marginBottom: '2rem' }}>
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
        
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default Settings;
