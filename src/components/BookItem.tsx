import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Check } from 'lucide-react';
import { getBookCoverGradient } from '../utils/bookCover';
import { READ_BOOK_GRADIENT } from '../utils/readBooks';
import { useLocale } from '../context/LocaleContext';
import FileActions from './FileActions';

interface BookItemProps {
  name: string;
  path: string;
  sha: string;
  isRead: boolean;
  listView: boolean;
  hasToken: boolean;
  onToggleRead: (path: string) => void;
  onChanged: () => void;
}

const BookItem: React.FC<BookItemProps> = ({
  name,
  path,
  sha,
  isRead,
  listView,
  hasToken,
  onToggleRead,
  onChanged,
}) => {
  const { t } = useLocale();
  const displayName = name.replace(/\.md$/i, '');

  const handleCoverClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleRead(path);
  };

  return (
    <div className={`book-card ${listView ? 'book-card-list' : ''}`}>
      <button
        type="button"
        className={`book-cover ${isRead ? 'book-cover-read' : ''}`}
        style={{ background: isRead ? READ_BOOK_GRADIENT : getBookCoverGradient(name) }}
        onClick={handleCoverClick}
        title={isRead ? t('markAsUnread') : t('markAsRead')}
        aria-label={isRead ? t('markAsUnread') : t('markAsRead')}
        aria-pressed={isRead}
      >
        <FileText size={listView ? 24 : 32} opacity={0.9} />
        {isRead && (
          <span className="book-cover-badge" aria-hidden>
            <Check size={14} />
          </span>
        )}
      </button>

      <Link
        to={`/view/${encodeURIComponent(path)}`}
        className="file-item-name book-title-link"
        title={displayName}
      >
        {displayName}
      </Link>

      {hasToken && (
        <div className="book-card-actions">
          <FileActions filePath={path} fileName={name} sha={sha} onChanged={onChanged} />
        </div>
      )}
    </div>
  );
};

export default BookItem;
