import { useState, useRef } from 'react';
import './FileUploader.css';

function FileUploader({ serverInfo, onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const xhr = new XMLHttpRequest();

      // Progress tracking with better granularity for large files
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);

          // Log progress for very large files (>100MB)
          if (e.total > 100 * 1024 * 1024 && percentComplete % 10 === 0) {
            console.log(`Upload progress: ${Math.round(percentComplete)}% (${formatBytes(e.loaded)} / ${formatBytes(e.total)})`);
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          console.log('Upload completed successfully');
          setSelectedFiles([]);
          setUploadProgress(0);
          if (onUploadComplete) onUploadComplete();
        } else {
          console.error('Upload failed with status:', xhr.status);
        }
        setUploading(false);
      });

      xhr.addEventListener('error', (e) => {
        console.error('Upload network error:', e);
        alert('Upload failed. Please check your connection and try again.');
        setUploading(false);
      });

      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout');
        alert('Upload timeout. The file may be too large or connection is slow.');
        setUploading(false);
      });

      xhr.addEventListener('abort', () => {
        console.log('Upload aborted');
        setUploading(false);
      });

      xhr.open('POST', `${serverInfo.url}/upload`);
      xhr.timeout = 0; // No timeout for large files
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error: ' + error.message);
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  const maxFileSize = 10 * 1024 * 1024 * 1024; // 10GB
  const hasOversizedFile = selectedFiles.some(file => file.size > maxFileSize);
  const isLargeUpload = totalSize > 1024 * 1024 * 1024; // 1GB or more

  return (
    <div className="file-uploader">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="drop-zone-content">
          <div className="upload-icon">📤</div>
          <h3>📂 Drag & Drop Files Here</h3>
          <p>or click to browse</p>
          {selectedFiles.length > 0 && (
            <div className="file-count">
              ✅ {selectedFiles.length} file(s) selected
            </div>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="selected-files-header">
            <h4>📋 Selected Files ({selectedFiles.length})</h4>
            <span className="total-size">💾 Total: {formatBytes(totalSize)}</span>
          </div>

          {hasOversizedFile && (
            <div className="warning-message" style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              ⚠️ Some files exceed 10GB limit and cannot be uploaded
            </div>
          )}

          {isLargeUpload && !hasOversizedFile && (
            <div className="info-message" style={{
              padding: '12px',
              background: 'rgba(233, 196, 106, 0.1)',
              border: '1px solid rgba(233, 196, 106, 0.3)',
              borderRadius: '8px',
              color: '#E9C46A',
              marginBottom: '12px',
              fontSize: '14px'
            }}>
              ⚡ Large transfer detected. This may take a few minutes depending on your network speed.
            </div>
          )}

          <div className="selected-files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="selected-file-item">
                <span className="file-icon">📄</span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatBytes(file.size)}</span>
                </div>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button
              className="btn btn-secondary"
              onClick={handleClearSelection}
              disabled={uploading}
            >
              🗑️ Clear
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={uploading || hasOversizedFile}
              title={hasOversizedFile ? 'Remove files larger than 10GB to continue' : ''}
            >
              {uploading ? '⏳ Uploading...' : '🚀 Upload Files'}
            </button>
          </div>

          {uploading && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              >
                {Math.round(uploadProgress)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUploader;
