import React, { useState, useEffect } from 'react';
import './PendingRequests.css';

const PendingRequests = ({ serverInfo }) => {
  const [requests, setRequests] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!serverInfo) return;

    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [serverInfo]);

  const fetchRequests = async () => {
    if (!serverInfo) return;

    try {
      const response = await fetch(`${serverInfo.url}/pending-requests`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const handleApprove = async (requestId) => {
    if (!serverInfo) return;

    try {
      const response = await fetch(`${serverInfo.url}/approve-access/${requestId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (requestId) => {
    if (!serverInfo) return;

    try {
      const response = await fetch(`${serverInfo.url}/reject-access/${requestId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  };

  if (requests.length === 0) {
    return null; // Don't show component if no pending requests
  }

  return (
    <div className={`pending-requests-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <span className="panel-icon">🔔</span>
          <h3>Pending Requests</h3>
          <span className="badge">{requests.length}</span>
        </div>
        <span className="expand-icon">{isExpanded ? '▼' : '▲'}</span>
      </div>

      {isExpanded && (
        <div className="panel-body">
          {requests.map((req) => (
            <div key={req.requestId} className="request-card">
              <div className="request-header">
                <div className="device-info">
                  <span className="device-icon">📱</span>
                  <div>
                    <div className="device-name">{req.deviceName}</div>
                    <div className="device-ip">📍 {req.ip}</div>
                  </div>
                </div>
                <div className="request-time">⏱️ {formatTime(req.timestamp)}</div>
              </div>
              <div className="request-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(req.requestId)}
                >
                  ✅ Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(req.requestId)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
