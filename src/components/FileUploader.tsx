import React, { useState, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2, X, FolderOpen } from 'lucide-react';
import { useGithub } from '../context/GithubContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatGithubError } from '../utils/githubErrors';
import FolderPicker from './FolderPicker';

const FileUploader: React.FC = () => {
  const { octokit, owner, repo, hasToken } = useGithub();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [files, setFiles] = useState<File[]>([]);
  const [targetFolder, setTargetFolder] = useState(() => (location.state?.targetFolder as string) || '');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useDocumentTitle('Upload');

  if (!hasToken) {
    navigate('/settings');
    return null;
  }

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((file) => file.name.endsWith('.md') || file.type.includes('text'));
    if (list.length === 0) return;
    setFiles((current) => {
      const names = new Set(current.map((file) => file.name));
      const merged = [...current];
      list.forEach((file) => {
        if (!names.has(file.name)) merged.push(file);
      });
      return merged;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const normalizeBasePath = (folder: string) => {
    let basePath = folder.trim();
    if (basePath && !basePath.endsWith('/')) basePath += '/';
    if (basePath.startsWith('/')) basePath = basePath.substring(1);
    return basePath;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const basePath = normalizeBasePath(targetFolder);

      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        const filename = currentFile.name.endsWith('.md') ? currentFile.name : `${currentFile.name}.md`;
        setUploadProgress({ current: i + 1, total: files.length, fileName: filename });

        const finalPath = `${basePath}${filename}`;
        const base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(currentFile);
        });

        let sha: string | undefined;
        try {
          const existingFile = await octokit!.repos.getContent({ owner, repo, path: finalPath });
          if ('sha' in existingFile.data) sha = existingFile.data.sha;
        } catch (err: unknown) {
          if ((err as { status?: number }).status !== 404) throw err;
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

      const folderLink = targetFolder.trim() ? `/?dir=${encodeURIComponent(targetFolder.trim())}` : '/';
      showToast({
        type: 'success',
        message: `Uploaded ${files.length} file(s) successfully`,
        actionLabel: 'View folder',
        actionHref: folderLink,
      });
      navigate(folderLink);
    } catch (err: unknown) {
      setError(formatGithubError(err));
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="reader-back-link">
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>

      <div className="upload-page">
        <h2>Upload Documents</h2>

        <form onSubmit={handleUpload}>
          <div
            className={`upload-dropzone ${dragOver ? 'upload-dropzone-active' : ''} ${files.length > 0 ? 'upload-dropzone-filled' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <label className="upload-dropzone-label">
              <input type="file" accept=".md,text/markdown" multiple onChange={handleFileChange} hidden />
              <Upload size={32} />
              <p>Drag & drop Markdown files here, or click to browse</p>
              <p className="upload-hint">You can select multiple .md files</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="upload-file-list">
              <div className="upload-file-list-header">
                <span>{files.length} file(s) · {(totalSize / 1024).toFixed(1)} KB total</span>
              </div>
              <ul>
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="upload-file-item">
                    <span>{file.name}</span>
                    <span className="upload-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="upload-folder-field">
            <label htmlFor="target-folder">Save in Folder (Optional)</label>
            <div className="upload-folder-row">
              <input
                id="target-folder"
                type="text"
                className="input-field"
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                placeholder="e.g. Novels/Chapter1"
              />
              <button type="button" className="btn-secondary" onClick={() => setPickerOpen(true)}>
                <FolderOpen size={16} />
                Browse
              </button>
            </div>
            <p className="upload-hint">Leave blank to upload to the root directory.</p>
          </div>

          {error && <div className="upload-error">{error}</div>}

          <button type="submit" className="btn-primary upload-submit" disabled={files.length === 0 || loading}>
            {loading ? <Loader2 size={18} className="lucide-spin" /> : <Upload size={18} />}
            {loading && uploadProgress
              ? `Uploading ${uploadProgress.current}/${uploadProgress.total}: ${uploadProgress.fileName}`
              : 'Upload to GitHub'}
          </button>
        </form>
      </div>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setTargetFolder}
        selectedPath={targetFolder}
      />
    </div>
  );
};

export default FileUploader;
