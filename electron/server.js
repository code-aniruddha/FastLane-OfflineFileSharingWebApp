const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const os = require('os');

class FileServer {
  constructor() {
    this.app = express();
    this.files = new Map(); // Store file metadata
    // Use user's home directory for uploads (works in packaged app)
    this.uploadsDir = path.join(os.homedir(), '.fastlane', 'uploads');
    this.sessionToken = this.generateToken();
    this.logs = [];
    this.connectedDevices = new Map(); // Store connected devices
    this.pendingRequests = new Map(); // Store pending access requests
    this.approvedDevices = new Set(); // Store approved device IPs

    this.initializeServer();
  }

  generateToken() {
    return uuidv4().split('-')[0]; // Short token
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message };
    this.logs.push(logEntry);
    console.log(`[${timestamp}] ${message}`);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  loadExistingFiles() {
    try {
      const files = fs.readdirSync(this.uploadsDir);
      files.forEach(filename => {
        const filePath = path.join(this.uploadsDir, filename);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          // Extract original filename from the format: uuid-originalname
          const originalName = filename.substring(filename.indexOf('-') + 1);
          const fileId = uuidv4();

          // Get mime type based on extension
          const ext = path.extname(originalName).toLowerCase();
          let mimetype = 'application/octet-stream';
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) mimetype = 'image/' + ext.substring(1);
          else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) mimetype = 'video/' + ext.substring(1);
          else if (['.mp3', '.wav', '.ogg'].includes(ext)) mimetype = 'audio/' + ext.substring(1);
          else if (ext === '.pdf') mimetype = 'application/pdf';
          else if (['.zip', '.rar', '.7z'].includes(ext)) mimetype = 'application/zip';
          else if (ext === '.txt') mimetype = 'text/plain';

          const fileInfo = {
            id: fileId,
            name: originalName,
            filename: filename,
            size: stats.size,
            mimetype: mimetype,
            uploadedAt: stats.birthtime.toISOString(),
            path: filePath
          };

          this.files.set(fileId, fileInfo);
        }
      });

      if (this.files.size > 0) {
        this.log(`Loaded ${this.files.size} existing file(s) from uploads directory`);
      }
    } catch (error) {
      console.error('Error loading existing files:', error);
    }
  }

  initializeServer() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Load existing files from uploads directory
    this.loadExistingFiles();

    // Middleware with optimized settings for high-speed transfers
    this.app.use(cors());
    this.app.use(express.json({ limit: '10gb' })); // Support large JSON payloads
    this.app.use(express.urlencoded({ extended: true, limit: '10gb' })); // Support large form data
    this.app.use(express.static(this.uploadsDir));

    // Disable X-Powered-By header for security
    this.app.disable('x-powered-by');

    // Enable trust proxy for proper IP detection
    this.app.set('trust proxy', true);

    // Track connected devices
    this.app.use((req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const cleanIp = ip.replace('::ffff:', '');
      const userAgent = req.headers['user-agent'] || 'Unknown';

      if (cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== '::1') {
        const deviceId = cleanIp;
        const existingDevice = this.connectedDevices.get(deviceId);

        if (!existingDevice) {
          const deviceInfo = {
            id: deviceId,
            ip: cleanIp,
            userAgent: userAgent,
            deviceName: this.getDeviceName(userAgent),
            connectedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            requests: 1
          };
          this.connectedDevices.set(deviceId, deviceInfo);
          this.log(`New device connected: ${deviceInfo.deviceName} (${cleanIp})`);
        } else {
          existingDevice.lastSeen = new Date().toISOString();
          existingDevice.requests++;
        }
      }

      next();
    });

    // Clean up stale devices (not seen in 5 minutes)
    setInterval(() => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      this.connectedDevices.forEach((device, id) => {
        if (new Date(device.lastSeen).getTime() < fiveMinutesAgo) {
          this.connectedDevices.delete(id);
          this.log(`Device disconnected: ${device.deviceName} (${device.ip})`);
        }
      });
    }, 60000); // Check every minute

    // Configure Multer for file uploads with optimized settings for high-speed transfers
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
      }
    });

    this.upload = multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit per file
        files: 50, // Allow up to 50 files at once
        fieldSize: 10 * 1024 * 1024, // 10MB for field data
        fieldNameSize: 1024, // 1KB for field name
        fields: 100 // Number of non-file fields
      }
    });

    this.setupRoutes();
  }

  getDeviceName(userAgent) {
    if (!userAgent) return 'Unknown Device';

    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) {
      if (userAgent.includes('Mobile')) return 'Android Phone';
      return 'Android Tablet';
    }
    if (userAgent.includes('Mac OS X')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux PC';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';

    return 'Unknown Device';
  }

  setupRoutes() {
    // Request access - receiver submits device name
    this.app.post('/request-access', (req, res) => {
      const ip = req.ip || req.connection.remoteAddress;
      const cleanIp = ip.replace('::ffff:', '');
      const { deviceName } = req.body;

      if (!deviceName || deviceName.trim() === '') {
        return res.status(400).json({ error: 'Device name is required' });
      }

      const requestId = uuidv4();
      const request = {
        id: requestId,
        ip: cleanIp,
        deviceName: deviceName.trim(),
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      this.pendingRequests.set(requestId, request);
      this.log(`Access request from: ${deviceName} (${cleanIp})`);

      res.json({
        success: true,
        requestId,
        message: 'Access request sent. Waiting for approval...'
      });
    });

    // Check access status
    this.app.get('/check-access/:requestId', (req, res) => {
      const { requestId } = req.params;
      const request = this.pendingRequests.get(requestId);

      if (!request) {
        return res.json({ status: 'unknown' });
      }

      res.json({ status: request.status });
    });

    // Get pending requests (for sender)
    this.app.get('/pending-requests', (req, res) => {
      const requests = Array.from(this.pendingRequests.values())
        .filter(req => req.status === 'pending')
        .map(req => ({
          requestId: req.id,
          ip: req.ip,
          deviceName: req.deviceName,
          timestamp: req.requestedAt
        }));

      res.json({ requests });
    });

    // Approve access request
    this.app.post('/approve-access/:requestId', (req, res) => {
      const { requestId } = req.params;
      const request = this.pendingRequests.get(requestId);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      request.status = 'approved';
      this.approvedDevices.add(request.ip);
      this.log(`Access approved for: ${request.deviceName} (${request.ip})`);

      res.json({ success: true, message: 'Access approved' });
    });

    // Reject access request
    this.app.post('/reject-access/:requestId', (req, res) => {
      const { requestId } = req.params;
      const request = this.pendingRequests.get(requestId);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      request.status = 'rejected';
      this.log(`Access rejected for: ${request.deviceName} (${request.ip})`);

      // Remove from pending after 5 seconds
      setTimeout(() => {
        this.pendingRequests.delete(requestId);
      }, 5000);

      res.json({ success: true, message: 'Access rejected' });
    });

    // Get connected devices
    this.app.get('/devices', (req, res) => {
      const devices = Array.from(this.connectedDevices.values()).map(device => ({
        id: device.id,
        ip: device.ip,
        deviceName: device.deviceName,
        connectedAt: device.connectedAt,
        lastSeen: device.lastSeen,
        requests: device.requests
      }));

      res.json({ devices });
    });

    // Serve the public HTML page for browser access
    this.app.get('/', (req, res) => {
      const publicHtml = path.join(__dirname, '..', 'public', 'index.html');
      if (fs.existsSync(publicHtml)) {
        res.sendFile(publicHtml);
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>File Sharing</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>📁 Offline File Sharing</h1>
            <p>Server is running! Use the desktop app to manage files.</p>
          </body>
          </html>
        `);
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', token: this.sessionToken });
    });

    // Get server info
    this.app.get('/info', (req, res) => {
      res.json({
        token: this.sessionToken,
        filesCount: this.files.size
      });
    });

    // Get logs
    this.app.get('/logs', (req, res) => {
      res.json({ logs: this.logs });
    });

    // Clear logs
    this.app.post('/clear-logs', (req, res) => {
      this.logs = [];
      this.log('Activity logs cleared');
      res.json({ success: true, message: 'Logs cleared successfully' });
    });

    // Upload file(s) - optimized for large files up to 10GB
    this.app.post('/upload', this.upload.array('files', 50), (req, res) => {
      try {
        const uploadedFiles = req.files.map(file => {
          const fileId = uuidv4();
          const fileInfo = {
            id: fileId,
            name: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: new Date().toISOString(),
            path: file.path
          };

          this.files.set(fileId, fileInfo);
          this.log(`File uploaded: ${file.originalname} (${this.formatBytes(file.size)})`);

          return fileInfo;
        });

        res.json({
          success: true,
          files: uploadedFiles,
          message: `${uploadedFiles.length} file(s) uploaded successfully`
        });
      } catch (error) {
        this.log(`Upload error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get all files
    this.app.get('/files', (req, res) => {
      const fileList = Array.from(this.files.values()).map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: file.uploadedAt
      }));

      res.json({ files: fileList });
    });

    // Download file with optimized streaming
    this.app.get('/download/:id', (req, res) => {
      const fileId = req.params.id;
      const file = this.files.get(fileId);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const filePath = file.path;

      if (!fs.existsSync(filePath)) {
        this.files.delete(fileId);
        return res.status(404).json({ error: 'File not found on disk' });
      }

      this.log(`File downloaded: ${file.name}`);

      // Optimized for faster transfers with HTTP Range support
      const stat = fs.statSync(filePath);
      const total = stat.size;
      const range = req.headers.range;

      // Common headers
      res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Accept-Ranges', 'bytes');

      // If client requested a range, serve partial content (206)
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

        // Validate range
        if (isNaN(start) || isNaN(end) || start > end || end > total - 1) {
          res.status(416).setHeader('Content-Range', `bytes */${total}`);
          return res.end();
        }

        const chunkSize = (end - start) + 1;
        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
        res.setHeader('Content-Length', chunkSize);

        // Use larger buffer for improved throughput on local networks (4MB)
        const fileStream = fs.createReadStream(filePath, { start, end, highWaterMark: 4 * 1024 * 1024 });
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
          this.log(`Download error (range): ${error.message}`);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        });
      } else {
        // Full file response
        res.setHeader('Content-Length', total);

        // Use larger buffer for improved throughput on local networks (4MB)
        const fileStream = fs.createReadStream(filePath, { highWaterMark: 4 * 1024 * 1024 });
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
          this.log(`Download error: ${error.message}`);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Download failed' });
          }
        });
      }
    });

    // Delete file
    this.app.delete('/files/:id', (req, res) => {
      const fileId = req.params.id;
      const file = this.files.get(fileId);

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        this.files.delete(fileId);
        this.log(`File deleted: ${file.name}`);

        res.json({ success: true, message: 'File deleted successfully' });
      } catch (error) {
        this.log(`Delete error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Clear all files
    this.app.post('/clear-all', (req, res) => {
      try {
        this.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });

        this.files.clear();
        this.log('All files cleared');

        res.json({ success: true, message: 'All files cleared' });
      } catch (error) {
        this.log(`Clear error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Generate QR code
    this.app.get('/qrcode', async (req, res) => {
      const url = req.query.url;

      if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
      }

      try {
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        res.json({ qrCode: qrCodeDataUrl });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  start(port = 0) {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(port, () => {
        const actualPort = server.address().port;

        // Optimize server for high-speed transfers
        server.timeout = 0; // Disable timeout for large file uploads (default 2 minutes)
        server.keepAliveTimeout = 65000; // Keep connections alive (65 seconds)
        server.headersTimeout = 66000; // Headers timeout (66 seconds, slightly more than keepAlive)
        server.maxHeadersCount = 2000; // Increase max headers

        this.log(`Server started on port ${actualPort}`);
        this.log(`Optimized for high-speed transfers - Max file size: 10GB`);
        resolve({ server, port: actualPort });
      }).on('error', reject);
    });
  }

  cleanup() {
    this.log('Cleaning up...');

    // Optional: Delete all uploaded files
    this.files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
      }
    });

    this.files.clear();
  }
}

module.exports = FileServer;
