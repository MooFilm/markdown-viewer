import React, { useEffect, useState } from 'react';
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
          // GitHub API returns base64 encoded content
          const decodedContent = atob(response.data.content);
          // Handle utf-8 properly
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
