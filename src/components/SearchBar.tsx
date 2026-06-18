import React from 'react';
import { Search, X } from 'lucide-react';

import { useLocale } from '../context/LocaleContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const { t } = useLocale();
  return (
    <div className="search-bar">
      <Search size={16} className="search-bar-icon" />
      <input
        type="search"
        className="search-bar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        aria-label="Search documents"
      />
      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
