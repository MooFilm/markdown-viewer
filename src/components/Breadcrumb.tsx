import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  currentDir: string;
  rootLabel?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentDir, rootLabel = 'Your Documents' }) => {
  const segments = currentDir ? currentDir.split('/').filter(Boolean) : [];

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          {segments.length === 0 ? (
            <span className="breadcrumb-current">{rootLabel}</span>
          ) : (
            <Link to="/" className="breadcrumb-link">
              {rootLabel}
            </Link>
          )}
        </li>
        {segments.map((segment, index) => {
          const path = segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          return (
            <li key={path} className="breadcrumb-item">
              <ChevronRight size={14} className="breadcrumb-separator" aria-hidden />
              {isLast ? (
                <span className="breadcrumb-current">{segment}</span>
              ) : (
                <Link to={`/?dir=${encodeURIComponent(path)}`} className="breadcrumb-link">
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
