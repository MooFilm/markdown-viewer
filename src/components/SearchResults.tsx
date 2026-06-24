import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2, Lock } from 'lucide-react';
import type { RepoSearchResult } from '../hooks/useRepoSearch';

interface SearchResultsProps {
  results: RepoSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  hasToken?: boolean;
  getFileLockedAncestor?: (path: string) => string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  query,
  hasToken = false,
  getFileLockedAncestor,
}) => {
  if (!query.trim()) return null;

  const visibleResults = results.filter((result) => {
    if (hasToken || !getFileLockedAncestor) return true;
    return !getFileLockedAncestor(result.path);
  });

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

      {!loading && !error && visibleResults.length === 0 && (
        <p className="search-results-empty">No documents found for "{query}"</p>
      )}

      {!loading && visibleResults.length > 0 && (
        <ul className="search-results-list">
          {visibleResults.map((result) => {
            const locked = !hasToken && getFileLockedAncestor?.(result.path);
            return (
              <li key={result.path}>
                {locked ? (
                  <div className="search-results-item search-results-item-locked">
                    <Lock size={16} />
                    <div>
                      <span className="search-results-name">{result.name.replace('.md', '')}</span>
                      <span className="search-results-path">{result.path}</span>
                    </div>
                  </div>
                ) : (
                  <Link to={`/view/${encodeURIComponent(result.path)}`} className="search-results-item">
                    <FileText size={16} />
                    <div>
                      <span className="search-results-name">{result.name.replace('.md', '')}</span>
                      <span className="search-results-path">{result.path}</span>
                      {result.snippet && <span className="search-results-snippet">{result.snippet}</span>}
                    </div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
