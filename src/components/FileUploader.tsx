import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGithub } from '../context/GithubContext';
import { Upload, ArrowLeft, Loader2, Files } from 'lucide-react';

const FileUploader: React.FC = () => {
  const { octokit, owner, repo, hasToken } = useGithub();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [files, setFiles] = useState<File[]>([]);
  const [targetFolder, setTargetFolder] = useState(() => {
    return (location.state?.targetFolder as string) || '';
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!hasToken) {
    navigate('/settings');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      setUploadProgress({ current: 0, total: files.length });
      
      // Clean up target folder path
      let basePath = targetFolder.trim();
      if (basePath && !basePath.endsWith('/')) {
        basePath += '/';
      }
      if (basePath.startsWith('/')) {
        basePath = basePath.substring(1);
      }

      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        // Ensure filename has extension
        const filename = currentFile.name.includes('.') ? currentFile.name : `${currentFile.name}.md`;
        const finalPath = `${basePath}${filename}`;

        const base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            // result is in format "data:text/markdown;base64,...."
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(currentFile);
        });

        let sha = undefined;
        try {
          const existingFile = await octokit!.repos.getContent({
            owner,
            repo,
            path: finalPath,
          });
          if ('sha' in existingFile.data) {
            sha = existingFile.data.sha;
          }
        } catch (e: any) {
          // 404 means file doesn't exist, which is fine
          if (e.status !== 404) throw e;
        }

        await octokit!.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: finalPath,
          message: `Upload ${filename} via MD Viewer`,
          content: base64Content,
          sha,
        });
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to upload files');
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Upload Documents</h2>
        
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
                backgroundColor: files.length > 0 ? '#f0f9ff' : 'transparent',
                borderColor: files.length > 0 ? 'var(--accent-color)' : 'var(--border-color)',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="file" 
                accept=".md,text/markdown,image/*" 
                multiple
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              {files.length > 0 ? (
                <>
                  <Files size={32} color="var(--accent-color)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 500 }}>{files.length} file(s) selected</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Total size: {(totalSize / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <p>Click to select Markdown or Image files</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You can select multiple .md and image files</p>
                </>
              )}
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Save in Folder (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              placeholder="e.g. Novels/Chapter1"
              disabled={files.length === 0}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Leave blank to upload to the root directory.
            </p>
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
            disabled={files.length === 0 || loading}
          >
            {loading ? <Loader2 size={18} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} /> : <Upload size={18} />}
            {loading && uploadProgress ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...` : 'Upload to GitHub'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUploader;
