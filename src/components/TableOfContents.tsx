import React, { useState } from 'react';
import { List, X } from 'lucide-react';
import type { TocHeading } from '../utils/markdown';

interface TableOfContentsProps {
  headings: TocHeading[];
  activeId: string | null;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, activeId }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  const list = (
    <ul className="toc-list">
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={`toc-item toc-level-${heading.level} ${activeId === heading.id ? 'toc-item-active' : ''}`}
        >
          <button type="button" className="toc-link" onClick={() => handleClick(heading.id)}>
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <aside className="toc-sidebar" aria-label="Table of contents">
        <p className="toc-title">On this page</p>
        {list}
      </aside>

      <button
        type="button"
        className="toc-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open table of contents"
      >
        <List size={18} />
        Contents
      </button>

      {mobileOpen && (
        <div className="toc-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="toc-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="toc-mobile-header">
              <p className="toc-title">On this page</p>
              <button type="button" className="toc-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {list}
          </div>
        </div>
      )}
    </>
  );
};

export default TableOfContents;
