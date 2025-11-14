import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import './QRCodeDisplay.css';

function QRCodeDisplay({ serverInfo }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qrcode-display">
      <div className="qrcode-header">
        <h3>📱 Scan to Access</h3>
      </div>

      <div className="qrcode-container">
        <div className="qrcode-wrapper">
          <QRCode
            value={serverInfo.url}
            size={200}
            level="H"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>
      </div>

      <div className="connection-info">
        <div className="info-item">
          <label>🌐 Network Address:</label>
          <div className="info-value">
            <span>{serverInfo.url}</span>
            <button
              className="copy-btn-small"
              onClick={() => copyToClipboard(serverInfo.url)}
              title="Copy URL"
            >
              {copied ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div className="info-item">
          <label>🔑 Access Token:</label>
          <div className="info-value">
            <span className="token">{serverInfo.token}</span>
            <button
              className="copy-btn-small"
              onClick={() => copyToClipboard(serverInfo.token)}
              title="Copy Token"
            >
              {copied ? '✅' : '📋'}
            </button>
          </div>
        </div>
      </div>

      <div className="instructions">
        <h4>📖 How to Connect:</h4>
        <ol>
          <li>📶 Ensure your device is on the same network</li>
          <li>📸 Scan the QR code or enter the URL in your browser</li>
          <li>🎉 Start downloading files!</li>
        </ol>
      </div>
    </div>
  );
}

export default QRCodeDisplay;
