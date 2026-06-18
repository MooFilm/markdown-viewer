import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import type { RepoSearchResult } from '../hooks/useRepoSearch';

interface SearchResultsProps {
  results: RepoSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, loading, error, query }) => {
  if (!query.trim()) return null;

  return (
    <div className="search-results">
      <p className="search-results-title">Search results in repository</p>

      {loading && (
        <div className="search-results-status">
          <Loader2 size={16} className="lucide-spin" />
          Searching...
        </div>
      )}

      {error && <p className="search-results-error">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="search-results-empty">No documents found for "{query}"</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="search-results-list">
          {results.map((result) => (
            <li key={result.path}>
              <Link to={`/view/${encodeURIComponent(result.path)}`} className="search-results-item">
                <FileText size={16} />
                <div>
                  <span className="search-results-name">{result.name.replace('.md', '')}</span>
                  <span className="search-results-path">{result.path}</span>
                  {result.snippet && <span className="search-results-snippet">{result.snippet}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
