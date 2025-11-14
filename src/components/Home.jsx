import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FileUploader from './FileUploader';
import FileList from './FileList';
import QRCodeDisplay from './QRCodeDisplay';
import LogPanel from './LogPanel';
import ConnectedDevices from './ConnectedDevices';
import PendingRequests from './PendingRequests';
import ThreeBackground from './ThreeBackground';
import './Home.css';

function Home({ serverInfo }) {
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFiles();
    fetchLogs();
    fetchDevices();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchFiles();
      fetchLogs();
      fetchDevices();
    }, 5000);

    return () => clearInterval(interval);
  }, [serverInfo]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${serverInfo.url}/files`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${serverInfo.url}/logs`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${serverInfo.url}/devices`);
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const handleUploadComplete = () => {
    fetchFiles();
    fetchLogs();
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`${serverInfo.url}/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchFiles();
        fetchLogs();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all files?')) {
      return;
    }

    try {
      const response = await fetch(`${serverInfo.url}/clear-all`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchFiles();
        fetchLogs();
      }
    } catch (error) {
      console.error('Failed to clear files:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFiles();
    await fetchLogs();
    await fetchDevices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all activity logs?')) {
      return;
    }

    try {
      const response = await fetch(`${serverInfo.url}/clear-logs`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchLogs();
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const metrics = [
    { label: 'Files Ready', value: files.length, icon: '' },
    { label: 'Total Size', value: formatBytes(totalSize), icon: '' },
    { label: 'Devices Linked', value: devices.length, icon: '' },
    { label: 'Session Token', value: serverInfo.token || '', icon: '' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ThreeBackground />
      <div className="home-container">
        <motion.div
          className="header-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-left">
            <div className="brand-logo">
              <div className="logo-icon">⚡</div>
              <div className="brand-info">
                <h1>FastLane</h1>
                <span className="tagline">Two-way file sharing • Send & Receive</span>
              </div>
            </div>
            <div className="status-badge">
              <span className="status-dot"></span>
              <span className="status-text">Server Online</span>
            </div>
          </div>

          <div className="header-right">
            <div className="server-details">
              <div className="detail-item">
                <span className="detail-icon">🌐</span>
                <div className="detail-content">
                  <span className="detail-label">Network</span>
                  <span className="detail-value">{serverInfo.host}:{serverInfo.port}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🔑</span>
                <div className="detail-content">
                  <span className="detail-label">Token</span>
                  <span className="detail-value">{serverInfo.token}</span>
                </div>
              </div>
            </div>
            <motion.button
              className="refresh-button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className={isRefreshing ? 'rotating' : ''}>🔄</span>
              Refresh
            </motion.button>
          </div>
        </motion.div>

        <div className="stats-grid">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <span className="stat-icon">{metric.icon}</span>
              <div className="stat-info">
                <span className="stat-label">{metric.label}</span>
                <span className="stat-value">{metric.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="content-grid">
          <motion.div
            className="main-column"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FileUploader
              serverInfo={serverInfo}
              onUploadComplete={handleUploadComplete}
            />

            <div className="files-section">
              <div className="section-header">
                <h2>📁 Shared Files</h2>
                {files.length > 0 && (
                  <motion.button
                    className="clear-all-button"
                    onClick={handleClearAll}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑️ Clear All
                  </motion.button>
                )}
              </div>
              <FileList
                files={files}
                serverInfo={serverInfo}
                onDeleteFile={handleDeleteFile}
              />
            </div>

            <LogPanel logs={logs} onClearLogs={handleClearLogs} />
          </motion.div>

          <motion.div
            className="sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <QRCodeDisplay serverInfo={serverInfo} />
            <ConnectedDevices devices={devices} />
          </motion.div>
        </div>
      </div>

      <PendingRequests serverInfo={serverInfo} />
    </motion.div>
  );
}

export default Home;
