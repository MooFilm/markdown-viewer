import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock } from 'lucide-react';
import type { ReadingEntry } from '../hooks/useReadingHistory';

interface RecentDocumentsProps {
  entries: ReadingEntry[];
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  return (
    <section className="recent-documents">
      <div className="recent-documents-header">
        <BookOpen size={18} />
        <h3>Continue Reading</h3>
      </div>
      <ul className="recent-documents-list">
        {entries.slice(0, 5).map((entry) => (
          <li key={entry.path}>
            <Link to={`/view/${encodeURIComponent(entry.path)}`} className="recent-documents-item">
              <div className="recent-documents-info">
                <span className="recent-documents-title">{entry.title}</span>
                <span className="recent-documents-meta">
                  <Clock size={12} />
                  {new Date(entry.lastReadAt).toLocaleDateString()} · {entry.scrollPercent}% read
                </span>
              </div>
              <div className="recent-documents-progress">
                <div className="recent-documents-progress-bar" style={{ width: `${entry.scrollPercent}%` }} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentDocuments;
