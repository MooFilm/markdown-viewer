import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { Upload, FilePlus, ArrowLeft, Loader2 } from 'lucide-react';

const FileUploader: React.FC = () => {
  const { octokit, owner, repo, isConfigured } = useGithub();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConfigured) {
    navigate('/settings');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!filename) {
        setFilename(selectedFile.name);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !filename) return;

    try {
      setLoading(true);
      setError(null);
      
      // Ensure filename ends with .md
      const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          // Encode content in base64 without using unescape/encodeURIComponent for unicode support in btoa
          // Better way to encode UTF-8 to base64
          const utf8Bytes = new TextEncoder().encode(content);
          const base64Content = btoa(String.fromCharCode(...Array.from(utf8Bytes)));

          // Check if file exists to get SHA (needed for updating)
          let sha = undefined;
          try {
            const existingFile = await octokit!.repos.getContent({
              owner,
              repo,
              path: finalFilename,
            });
            if ('sha' in existingFile.data) {
              sha = existingFile.data.sha;
            }
          } catch (e: any) {
            // 404 means file doesn't exist, which is fine for new upload
            if (e.status !== 404) throw e;
          }

          await octokit!.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: finalFilename,
            message: `Upload ${finalFilename} via MD Viewer`,
            content: base64Content,
            sha,
          });

          navigate('/');
        } catch (err: any) {
          setError(err.message || 'Failed to upload file');
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Upload Document</h2>
        
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              style={{ 
                display: 'block', 
                border: '2px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--spacing-xl)', 
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: file ? '#f0f9ff' : 'transparent',
                borderColor: file ? 'var(--accent-color)' : 'var(--border-color)',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="file" 
                accept=".md,text/markdown" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              {file ? (
                <>
                  <FilePlus size={32} color="var(--accent-color)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 500 }}>{file.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <p>Click to select a Markdown file</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>.md files only</p>
                </>
              )}
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Save As</label>
            <input 
              type="text" 
              className="input-field" 
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="filename.md"
              disabled={!file}
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--error-color)', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            disabled={!file || !filename || loading}
          >
            {loading ? <Loader2 size={18} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} /> : <Upload size={18} />}
            {loading ? 'Uploading...' : 'Upload to GitHub'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUploader;
