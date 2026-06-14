import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Octokit } from '@octokit/rest';

interface GithubContextType {
  octokit: Octokit | null;
  owner: string;
  repo: string;
  isConfigured: boolean;
  setCredentials: (token: string, owner: string, repo: string) => void;
  logout: () => void;
}

const GithubContext = createContext<GithubContextType | undefined>(undefined);

export const GithubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gh_token');
    const storedOwner = localStorage.getItem('gh_owner');
    const storedRepo = localStorage.getItem('gh_repo');

    if (token && storedOwner && storedRepo) {
      setOctokit(new Octokit({ auth: token }));
      setOwner(storedOwner);
      setRepo(storedRepo);
      setIsConfigured(true);
    }
  }, []);

  const setCredentials = (token: string, newOwner: string, newRepo: string) => {
    localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_owner', newOwner);
    localStorage.setItem('gh_repo', newRepo);
    
    setOctokit(new Octokit({ auth: token }));
    setOwner(newOwner);
    setRepo(newRepo);
    setIsConfigured(true);
  };

  const logout = () => {
    localStorage.removeItem('gh_token');
    localStorage.removeItem('gh_owner');
    localStorage.removeItem('gh_repo');
    
    setOctokit(null);
    setOwner('');
    setRepo('');
    setIsConfigured(false);
  };

  return (
    <GithubContext.Provider value={{ octokit, owner, repo, isConfigured, setCredentials, logout }}>
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
