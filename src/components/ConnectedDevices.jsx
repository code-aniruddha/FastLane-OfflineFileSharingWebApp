import { motion } from 'framer-motion';
import './ConnectedDevices.css';

function ConnectedDevices({ devices }) {
  const getDeviceIcon = (deviceName) => {
    if (deviceName.includes('iPhone') || deviceName.includes('Android Phone')) return '📱';
    if (deviceName.includes('iPad') || deviceName.includes('Tablet')) return '📲';
    if (deviceName.includes('Mac')) return '💻';
    if (deviceName.includes('Windows') || deviceName.includes('Linux')) return '🖥️';
    if (deviceName.includes('Browser')) return '🌐';
    return '📟';
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getConnectionStatus = (lastSeen) => {
    const now = new Date();
    const then = new Date(lastSeen);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 30) return 'active';
    if (seconds < 120) return 'idle';
    return 'inactive';
  };

  return (
    <motion.div
      className="connected-devices"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="devices-header">
        <div className="header-title">
          <span className="devices-icon">🔗</span>
          <h3>Connected Devices</h3>
        </div>
        <div className="devices-count">
          <span className="count-badge">{devices.length}</span>
        </div>
      </div>

      <div className="devices-list">
        {devices.length === 0 ? (
          <motion.div
            className="no-devices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="no-devices-icon">👀</span>
            <p>No devices connected yet</p>
            <small>Devices will appear here when they access the network</small>
          </motion.div>
        ) : (
          devices.map((device, index) => (
            <motion.div
              key={device.id}
              className={`device-item ${getConnectionStatus(device.lastSeen)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <div className="device-icon-wrapper">
                <span className="device-icon">{getDeviceIcon(device.deviceName)}</span>
                <span className={`status-indicator ${getConnectionStatus(device.lastSeen)}`}></span>
              </div>

              <div className="device-info">
                <div className="device-name">{device.deviceName}</div>
                <div className="device-details">
                  <span className="device-ip">📍 {device.ip}</span>
                  <span className="device-time">🕐 {getTimeSince(device.connectedAt)}</span>
                </div>
              </div>

              <div className="device-stats">
                <div className="stat-item">
                  <span className="stat-label">Requests</span>
                  <span className="stat-value">{device.requests}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {devices.length > 0 && (
        <motion.div
          className="devices-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <small>
            🔒 Devices are tracked while connected to your network
          </small>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ConnectedDevices;
