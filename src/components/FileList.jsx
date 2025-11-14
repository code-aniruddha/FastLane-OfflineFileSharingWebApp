import { useState } from 'react';
import './FileList.css';

function FileList({ files, serverInfo, onDeleteFile, showHeader = true }) {
  const [sortBy, setSortBy] = useState('date'); // 'name', 'size', 'date'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📕';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    if (mimetype.includes('text')) return '📝';
    return '📄';
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'size':
        compareValue = a.size - b.size;
        break;
      case 'date':
        compareValue = new Date(a.uploadedAt) - new Date(b.uploadedAt);
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const handleDownload = (fileId, fileName) => {
    const downloadUrl = `${serverInfo.url}/download/${fileId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyDownloadLink = (fileId) => {
    const downloadUrl = `${serverInfo.url}/download/${fileId}`;
    navigator.clipboard.writeText(downloadUrl);

    // Show temporary notification
    alert('Download link copied to clipboard!');
  };

  if (files.length === 0) {
    return (
      <div className="file-list-empty">
        <div className="empty-icon">📭</div>
        <h3>No files uploaded yet</h3>
        <p>Upload files above to share them on your local network</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {showHeader && (
        <div className="file-list-header">
          <h3>Shared Files</h3>
          <span className="file-count">{files.length} file(s)</span>
        </div>
      )}

      <div className="table-container">
        <table className="file-table">
          <thead>
            <tr>
              <th>Type</th>
              <th
                className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className={`sortable ${sortBy === 'size' ? 'active' : ''}`}
                onClick={() => handleSort('size')}
              >
                Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className={`sortable ${sortBy === 'date' ? 'active' : ''}`}
                onClick={() => handleSort('date')}
              >
                Uploaded {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedFiles.map((file) => (
              <tr key={file.id}>
                <td className="file-icon-cell">
                  <span className="file-icon-large">
                    {getFileIcon(file.mimetype)}
                  </span>
                </td>
                <td className="file-name-cell">
                  <span className="file-name" title={file.name}>
                    {file.name}
                  </span>
                </td>
                <td>{formatBytes(file.size)}</td>
                <td>{formatDate(file.uploadedAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn download-btn"
                      onClick={() => handleDownload(file.id, file.name)}
                      title="Download"
                    >
                      ⬇️
                    </button>
                    <button
                      className="action-btn copy-btn"
                      onClick={() => copyDownloadLink(file.id)}
                      title="Copy Link"
                    >
                      🔗
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (window.confirm(`Delete ${file.name}?`)) {
                          onDeleteFile(file.id);
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FileList;
