import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { BookOpen, Settings, LogOut, Upload } from 'lucide-react';

const Layout: React.FC = () => {
  const { hasToken, logout } = useGithub();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <BookOpen size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          MD Viewer
        </Link>
        <div className="navbar-nav">
          {hasToken && (
            <Link to="/upload" className="btn-primary navbar-btn">
              <Upload size={16} />
              Upload
            </Link>
          )}
          <Link to="/settings" className="btn-secondary navbar-btn">
            <Settings size={16} />
            Settings
          </Link>
          {hasToken && (
            <button onClick={handleLogout} className="btn-secondary navbar-btn" title="Remove token and switch to read-only mode">
              <LogOut size={16} />
              Logout
            </button>
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
