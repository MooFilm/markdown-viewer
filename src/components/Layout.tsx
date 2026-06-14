import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { BookOpen, Settings, LogOut } from 'lucide-react';

const Layout: React.FC = () => {
  const { isConfigured, logout } = useGithub();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/settings');
  };

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <BookOpen size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          MD Viewer
        </Link>
        <div className="navbar-nav">
          {isConfigured ? (
            <>
              <Link to="/upload" className="btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>
                Upload
              </Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }} title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/settings" className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}>
              <Settings size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
              Settings
            </Link>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
