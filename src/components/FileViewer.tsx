import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useGithub } from '../context/GithubContext';
import { decodeBase64Utf8 } from '../utils/decode';
import { extractMarkdownTitle, extractHeadings } from '../utils/markdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatGithubError } from '../utils/githubErrors';
import { useActiveHeading } from '../hooks/useActiveHeading';
import { useSiblingFiles } from '../hooks/useSiblingFiles';
import { useReaderPreferences } from '../hooks/useReaderPreferences';
import { saveReadingProgress } from '../hooks/useReadingHistory';
import TableOfContents from './TableOfContents';
import ReaderControls from './ReaderControls';

const FileViewer: React.FC = () => {
  const { path } = useParams<{ path: string }>();
  const { octokit, owner, repo, isConfigured } = useGithub();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressLabelRef = useRef<HTMLSpanElement>(null);
  const contentReadyRef = useRef(false);
  const scrollPercentRef = useRef(0);

  const decodedPath = path ? decodeURIComponent(path) : '';
  const fileName = decodedPath.split('/').pop() || 'Document';
  const documentTitle = useMemo(
    () => (content ? extractMarkdownTitle(content, fileName) : fileName),
    [content, fileName]
  );
  const headings = useMemo(() => extractHeadings(content), [content]);
  const activeHeadingId = useActiveHeading(headings);
  const { prev, next } = useSiblingFiles(decodedPath);
  const {
    fontSize,
    lineHeight,
    increaseFontSize,
    decreaseFontSize,
    setLineHeight,
    resetPreferences,
  } = useReaderPreferences();

  useDocumentTitle(documentTitle);

  useEffect(() => {
    document.body.classList.add('reader-page');
    return () => document.body.classList.remove('reader-page');
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      navigate('/settings');
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!path) throw new Error('File path is required');

        const response = await octokit!.repos.getContent({
          owner,
          repo,
          path: decodeURIComponent(path),
        });

        if ('content' in response.data) {
          setContent(decodeBase64Utf8(response.data.content));
        } else {
          throw new Error('Not a file');
        }
      } catch (err: unknown) {
        setError(formatGithubError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [isConfigured, octokit, owner, repo, path, navigate]);

  useEffect(() => {
    if (!loading && !error && content && path) {
      const savedScroll = localStorage.getItem(`scroll-${path}`);

      setTimeout(() => {
        contentReadyRef.current = true;
        if (savedScroll) {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'smooth' });
        }
        updateProgressBar();
      }, 100);
    }
  }, [loading, error, content, path]);

  useEffect(() => {
    return () => {
      if (path && documentTitle) {
        saveReadingProgress(path, documentTitle, scrollPercentRef.current);
      }
    };
  }, [path, documentTitle]);

  const updateProgressBar = () => {
    if (!contentReadyRef.current) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const denominator = Math.max(docHeight - winHeight, 1);
    const percent = Math.min(100, Math.max(0, (scrollTop / denominator) * 100));

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${percent}%`;
    }
    if (progressLabelRef.current) {
      progressLabelRef.current.textContent = `${Math.round(percent)}%`;
    }
    scrollPercentRef.current = percent;
  };

  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      updateProgressBar();

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (path && contentReadyRef.current) {
          localStorage.setItem(`scroll-${path}`, window.scrollY.toString());
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(timeoutId);
      contentReadyRef.current = false;
    };
  }, [path]);

  if (loading) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="lucide-spin" />
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ color: 'var(--error-color)' }}>
        <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
        <p>Error: {error}</p>
        <Link to="/" className="btn-secondary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Go Back
        </Link>
      </div>
    );
  }

  const parentDir = decodedPath.includes('/')
    ? decodedPath.substring(0, decodedPath.lastIndexOf('/'))
    : '';

  const isExternalLink = (href?: string) => !!href && /^https?:\/\//i.test(href);

  return (
    <div className="reader-page-content">
      <div className="reading-progress-container">
        <div className="reading-progress-bar" ref={progressBarRef} />
        <span className="reading-progress-label" ref={progressLabelRef}>0%</span>
      </div>

      <div className="reader-layout">
        <TableOfContents headings={headings} activeId={activeHeadingId} />

        <div className="reader-main">
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to={parentDir ? `/?dir=${encodeURIComponent(parentDir)}` : '/'}
              className="reader-back-link"
            >
              <ArrowLeft size={16} />
              Back to documents
            </Link>
          </div>

          <div
            className="markdown-container"
            style={{ fontSize: `${fontSize}rem`, lineHeight }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeRaw, rehypeHighlight]}
              components={{
                table: ({ node, ...props }) => (
                  <div className="table-wrapper">
                    <table {...props} />
                  </div>
                ),
                a: ({ href, children, ...props }) => {
                  if (isExternalLink(href)) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                        <ExternalLink size={12} className="external-link-icon" aria-hidden />
                      </a>
                    );
                  }
                  return (
                    <a href={href} {...props}>
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {(prev || next) && (
            <nav className="document-nav" aria-label="Document navigation">
              {prev ? (
                <Link to={`/view/${encodeURIComponent(prev.path)}`} className="document-nav-link">
                  <ArrowLeft size={16} />
                  <span>
                    <small>Previous</small>
                    {prev.name.replace('.md', '')}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link to={`/view/${encodeURIComponent(next.path)}`} className="document-nav-link document-nav-next">
                  <span>
                    <small>Next</small>
                    {next.name.replace('.md', '')}
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </div>

      <ReaderControls
        fontSize={fontSize}
        lineHeight={lineHeight}
        onIncreaseFont={increaseFontSize}
        onDecreaseFont={decreaseFontSize}
        onLineHeightChange={setLineHeight}
        onReset={resetPreferences}
      />
    </div>
  );
};

export default FileViewer;
