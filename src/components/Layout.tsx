import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { useLocale } from '../context/LocaleContext';
import { BookOpen, Settings, LogOut, Upload } from 'lucide-react';

const Layout: React.FC = () => {
  const { hasToken, logout } = useGithub();
  const { t } = useLocale();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <nav className="navbar no-print">
        <Link to="/" className="navbar-brand">
          <BookOpen size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          {t('appName')}
        </Link>
        <div className="navbar-nav">
          {hasToken && (
            <Link to="/upload" className="btn-primary navbar-btn">
              <Upload size={16} />
              {t('upload')}
            </Link>
          )}
          <Link to="/settings" className="btn-secondary navbar-btn">
            <Settings size={16} />
            {t('settings')}
          </Link>
          {hasToken && (
            <button onClick={handleLogout} className="btn-secondary navbar-btn" title={t('logout')}>
              <LogOut size={16} />
              {t('logout')}
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
