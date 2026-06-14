import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Octokit } from '@octokit/rest';

interface GithubContextType {
  octokit: Octokit | null;
  owner: string;
  repo: string;
  isConfigured: boolean;
  hasToken: boolean;
  setCredentials: (token: string, owner: string, repo: string) => void;
  logout: () => void;
}

const GithubContext = createContext<GithubContextType | undefined>(undefined);

export const GithubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [owner, setOwner] = useState('MooFilm');
  const [repo, setRepo] = useState('markdown-viewer');
  const [isConfigured] = useState(true); // Always true for read access
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gh_token');
    const storedOwner = localStorage.getItem('gh_owner') || 'MooFilm';
    const storedRepo = localStorage.getItem('gh_repo') || 'markdown-viewer';

    if (token) {
      setOctokit(new Octokit({ auth: token }));
      setHasToken(true);
    } else {
      setOctokit(new Octokit()); // Unauthenticated client for public repo
      setHasToken(false);
    }
    setOwner(storedOwner);
    setRepo(storedRepo);
  }, []);

  const setCredentials = (token: string, newOwner: string, newRepo: string) => {
    if (token) localStorage.setItem('gh_token', token);
    else localStorage.removeItem('gh_token');
    
    if (newOwner) localStorage.setItem('gh_owner', newOwner);
    if (newRepo) localStorage.setItem('gh_repo', newRepo);
    
    if (token) {
      setOctokit(new Octokit({ auth: token }));
      setHasToken(true);
    } else {
      setOctokit(new Octokit());
      setHasToken(false);
    }
    setOwner(newOwner || 'MooFilm');
    setRepo(newRepo || 'markdown-viewer');
  };

  const logout = () => {
    localStorage.removeItem('gh_token');
    // We intentionally keep owner and repo in localStorage to remember the bookshelf
    
    setOctokit(new Octokit());
    setHasToken(false);
  };

  return (
    <GithubContext.Provider value={{ octokit, owner, repo, isConfigured, hasToken, setCredentials, logout }}>
      {children}
    </GithubContext.Provider>
  );
};

export const useGithub = () => {
  const context = useContext(GithubContext);
  if (context === undefined) {
    throw new Error('useGithub must be used within a GithubProvider');
  }
  return context;
};
