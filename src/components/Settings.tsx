import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';

const Settings: React.FC = () => {
  const { setCredentials, owner: initialOwner, repo: initialRepo } = useGithub();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState(initialOwner || '');
  const [repo, setRepo] = useState(initialRepo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token && owner && repo) {
      setCredentials(token, owner, repo);
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Configuration</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
        Enter your GitHub Personal Access Token and target repository to store and read Markdown files.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GitHub Token (PAT)</label>
          <input 
            type="password" 
            className="input-field" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            required
          />
          <small style={{ color: 'var(--text-muted)' }}>Requires 'repo' scope.</small>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Repository Owner</label>
          <input 
            type="text" 
            className="input-field" 
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g. torvalds"
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
            placeholder="e.g. linux"
            required
          />
        </div>
        
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          Connect to GitHub
        </button>
      </form>
    </div>
  );
};

export default Settings;
