import { useEffect, useRef, useState } from 'react';
import './LogPanel.css';

function LogPanel({ logs, showHeader = true, onClearLogs }) {
  const logEndRef = useRef(null);
  const logListRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive (only if enabled)
    if (autoScroll && logListRef.current) {
      // Scroll only within the log-list container, not the entire page
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getLogIcon = (message) => {
    if (message.includes('uploaded')) return '⬆️';
    if (message.includes('downloaded')) return '⬇️';
    if (message.includes('deleted')) return '🗑️';
    if (message.includes('cleared')) return '🧹';
    if (message.includes('started')) return '🚀';
    if (message.includes('error')) return '❌';
    return '📝';
  };

  const isEmpty = logs.length === 0;

  return (
    <div className={`log-panel ${isEmpty ? 'empty' : ''}`}>
      {showHeader && (
        <div className="log-panel-header">
          <div className="log-panel-header-left">
            <h3>📋 Activity Logs</h3>
            <span className="log-count">{logs.length} entries</span>
          </div>
          <div className="log-panel-header-right">
            <button
              className="auto-scroll-btn"
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
            >
              {autoScroll ? '🔽' : '⏸️'}
            </button>
            {logs.length > 0 && onClearLogs && (
              <button
                className="clear-logs-btn"
                onClick={onClearLogs}
                title="Clear all logs"
              >
                🧹 Clear
              </button>
            )}
          </div>
        </div>
      )}

      {isEmpty ? (
        <div className="log-panel-empty">
          <div className="empty-icon">📋</div>
          <h3>No activity logs yet</h3>
          <p>Server activity will appear here</p>
        </div>
      ) : (
        <div className="log-list" ref={logListRef}>
          {logs.map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-icon">{getLogIcon(log.message)}</span>
              <span className="log-time">{formatTime(log.timestamp)}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}

export default LogPanel;
