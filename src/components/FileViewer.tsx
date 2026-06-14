import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const FileViewer: React.FC = () => {
  const { path } = useParams<{ path: string }>();
  const { octokit, owner, repo, isConfigured } = useGithub();
  const navigate = useNavigate();
  
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const contentReadyRef = useRef(false);

  useEffect(() => {
    if (!isConfigured) {
      navigate('/settings');
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        if (!path) throw new Error('File path is required');
        
        const response = await octokit!.repos.getContent({
          owner,
          repo,
          path: decodeURIComponent(path),
        });

        if ('content' in response.data) {
          const decodedContent = atob(response.data.content);
          const utf8Content = decodeURIComponent(escape(decodedContent));
          setContent(utf8Content);
        } else {
          throw new Error('Not a file');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [isConfigured, octokit, owner, repo, path, navigate]);

  // Restore scroll position once content is loaded
  useEffect(() => {
    if (!loading && !error && content && path) {
      const savedScroll = localStorage.getItem(`scroll-${path}`);
      
      // Delay slightly to let markdown render fully
      setTimeout(() => {
        contentReadyRef.current = true;
        if (savedScroll) {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'smooth' });
        }
        updateProgressBar();
      }, 100);
    }
  }, [loading, error, content, path]);

  // Handle scroll events directly to avoid state changes and flickering
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
      // Update the progress bar visually
      updateProgressBar();
      
      // Debounce saving to localStorage
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (path && contentReadyRef.current) {
          localStorage.setItem(`scroll-${path}`, window.scrollY.toString());
        }
      }, 300); // Save every 300ms of inactivity
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

  return (
    <div>
      <div className="reading-progress-container">
        <div className="reading-progress-bar" ref={progressBarRef}></div>
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>
      
      <div className="markdown-container">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
          components={{
            table: ({node, ...props}) => (
              <div className="table-wrapper">
                <table {...props} />
              </div>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default FileViewer;
