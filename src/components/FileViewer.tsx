import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { decodeBase64Utf8 } from '../utils/decode';
import { extractMarkdownTitle } from '../utils/markdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatGithubError } from '../utils/githubErrors';

const FileViewer: React.FC = () => {
  const { path } = useParams<{ path: string }>();
  const { octokit, owner, repo, isConfigured } = useGithub();
  const navigate = useNavigate();

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const contentReadyRef = useRef(false);

  const decodedPath = path ? decodeURIComponent(path) : '';
  const fileName = decodedPath.split('/').pop() || 'Document';
  const documentTitle = useMemo(
    () => (content ? extractMarkdownTitle(content, fileName) : fileName),
    [content, fileName]
  );
  useDocumentTitle(documentTitle);

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

  const updateProgressBar = () => {
    if (!contentReadyRef.current) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${Math.min(100, Math.max(0, scrollPercent * 100))}%`;
    }
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
        <Loader2 size={32} className="lucide-spin" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }} />
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

  return (
    <div>
      <div className="reading-progress-container">
        <div className="reading-progress-bar" ref={progressBarRef}></div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={parentDir ? `/?dir=${encodeURIComponent(parentDir)}` : '/'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>

      <div className="markdown-container">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            table: ({ node, ...props }) => (
              <div className="table-wrapper">
                <table {...props} />
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default FileViewer;
