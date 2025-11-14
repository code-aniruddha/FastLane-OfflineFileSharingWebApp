# ⚡ FastLane - Lightning-Fast Offline File Sharing

<div align="center">

![FastLane Banner](https://img.shields.io/badge/FastLane-File%20Sharing-E76F51?style=for-the-badge&logo=lightning&logoColor=white)

**Share files instantly across devices on your local network - No internet required!**

[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**FastLane** is a modern, high-performance desktop application built with Electron and React that enables **blazing-fast file sharing** across devices on your local network. Perfect for offices, homes, events, and anywhere you need to transfer files without internet connectivity.

### 🎯 Why FastLane?

- 🚀 **10GB per file** - Share large files without limits
- ⚡ **High-speed transfers** - Up to 125 MB/s on Gigabit networks
- 🔒 **Secure & Private** - Files never leave your local network
- 🔄 **Two-way sharing** - Both sender and receiver can exchange files
- 📱 **Cross-platform** - Works on any device with a browser
- 🎨 **Beautiful UI** - Modern design with stunning 3D particle effects
- 🌐 **No internet needed** - Pure offline functionality

---

## ✨ Features

### 🔥 Core Capabilities

#### **Desktop App (Sender)**
- 📤 **Drag & Drop Upload** - Intuitive file selection
- 📋 **File Management** - View, download, delete shared files
- � **QR Code Sharing** - Instant connection via QR scan
- 📊 **Real-time Monitoring** - Track connected devices and activity
- � **Activity Logs** - Complete history with clear option
- ⚙️ **Auto-refresh** - Updates every 5 seconds
- 🎮 **Auto-scroll Toggle** - Control log panel behavior

#### **Browser Interface (Receiver)**
- 📥 **Download Files** - Parallel chunked downloads for speed
- 📤 **Upload Files** - Send files back to sender
- 🎨 **Drag & Drop** - Easy file selection
- ⚡ **Progress Tracking** - Real-time upload/download status
- � **Permission System** - Request & approval workflow
- 📱 **Mobile Friendly** - Responsive design for all devices

### 🎨 User Experience

- **3D Particle Background** - Stunning Three.js animations
- **Glassmorphic Design** - Modern UI with blur effects
- **Smooth Animations** - Framer Motion transitions
- **Dark Theme** - Easy on the eyes
- **File Type Icons** - Visual file identification
- **Size Validation** - Warnings for large files (>10GB limit)

### 🔧 Technical Features

- **High-Speed Optimization** - 4MB buffer size for fast transfers
- **HTTP Range Support** - Resume capability for downloads
- **No Timeout** - Support for large file uploads
- **Keep-Alive Connections** - Persistent connections (65s)
- **File Persistence** - Files survive server restarts
- **MIME Type Detection** - Automatic file type recognition
- **Error Handling** - Robust error recovery

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/code-aniruddha/FastLane-OfflineFileSharingWebApp.git

# Navigate to project directory
cd FastLane-OfflineFileSharingWebApp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Build for all platforms
npm run build:all
```

---

## 💻 Usage

### Starting the Server

1. **Launch the Desktop App**
   ```bash
   npm run dev
   ```

2. **Server starts automatically** and displays:
   - Server URL: `http://your-ip:port`
   - Access Token
   - QR Code for easy connection

### Connecting Devices

#### Method 1: QR Code (Recommended)
1. Open the desktop app
2. Scan the QR code with your mobile device
3. Enter device name and request access
4. Wait for host approval

#### Method 2: Manual URL
1. Note the server URL from desktop app
2. Open browser on any device
3. Enter the URL: `http://server-ip:port`
4. Request access with device name

### Sharing Files

#### Upload (Desktop → Browser)
1. **Desktop App**: Drag & drop files or click "Browse"
2. Files appear instantly for all connected devices
3. **Browser**: Click download button to receive files

#### Upload (Browser → Desktop)
1. **Browser**: Drag & drop files in upload section
2. Monitor progress bar
3. **Desktop App**: Files appear in shared files list

### Managing Connections

- ✅ **Approve Devices**: Review and approve access requests
- 👀 **Monitor Devices**: See all connected devices in real-time
- 🔒 **Security**: Only approved devices can access files

---

## � Performance

### Transfer Speeds

| Network Type | Expected Speed | 10GB Transfer Time |
|--------------|----------------|-------------------|
| Gigabit Ethernet | 100-125 MB/s | ~1.5 minutes |
| Wi-Fi 6 (802.11ax) | 50-100 MB/s | ~2-4 minutes |
| Wi-Fi 5 (802.11ac) | 30-60 MB/s | ~3-6 minutes |
| Wi-Fi 4 (802.11n) | 10-30 MB/s | ~5-15 minutes |

### File Size Limits

- ✅ **Maximum per file**: 10GB
- ✅ **Concurrent uploads**: 50 files
- ✅ **Total storage**: Limited by disk space

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Vite** 5.0.8 - Build tool
- **Framer Motion** 10.16.16 - Animations
- **Three.js** 0.160.0 - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **Lenis** - Smooth scrolling

### Backend
- **Node.js** - Runtime
- **Express** 4.18.2 - Web framework
- **Multer** 1.4.5 - File upload handling
- **UUID** 9.0.1 - Unique identifiers
- **QRCode** 1.5.3 - QR code generation

### Desktop
- **Electron** 28.0.0 - Desktop framework
- **electron-builder** 24.9.1 - App packaging

---

## � Project Structure

```
FastLane/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script
│   └── server.js            # Express server
├── src/
│   ├── components/
│   │   ├── ConnectedDevices.jsx
│   │   ├── FileList.jsx
│   │   ├── FileUploader.jsx
│   │   ├── Home.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── LogPanel.jsx
│   │   ├── PendingRequests.jsx
│   │   ├── QRCodeDisplay.jsx
│   │   └── ThreeBackground.jsx
│   ├── hooks/
│   │   └── useLenis.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── index.html
│   └── receiver.html        # Browser interface
├── uploads/                 # Uploaded files storage
├── package.json
├── vite.config.js
└── README.md
```

---

## � Configuration

### Server Settings

Edit `electron/server.js` to configure:

```javascript
// File size limits
limits: {
  fileSize: 10 * 1024 * 1024 * 1024, // 10GB
  files: 50
}

// Buffer size for transfers
highWaterMark: 4 * 1024 * 1024 // 4MB
```

---

## 📡 API Endpoints

#### GET `/files`
Get list of all shared files

#### POST `/upload`
Upload files (multipart/form-data, max 10GB per file)

#### GET `/download/:id`
Download file by ID (supports HTTP Range for resume)

#### DELETE `/files/:id`
Delete file by ID

#### POST `/clear-all`
Clear all files

#### GET `/logs`
Get activity logs

#### POST `/clear-logs`
Clear activity logs

#### POST `/request-access`
Request device access

#### POST `/approve-access/:id`
Approve access request

#### POST `/reject-access/:id`
Reject access request

---

## 🔐 Security Features

- ✅ **Permission System** - Manual device approval required
- ✅ **Local Network Only** - No internet exposure
- ✅ **Session Tokens** - Unique session identifiers
- ✅ **Device Tracking** - Monitor all connections
- ✅ **Trust-based Model** - Simple, secure approach

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill existing processes (Windows)
taskkill /F /IM node.exe /T
taskkill /F /IM electron.exe /T
```

#### Files Not Appearing
- Check if server is running
- Verify network connection
- Refresh the page (F5)
- Check activity logs

#### Slow Transfer Speeds
- Use Ethernet instead of Wi-Fi
- Close bandwidth-heavy applications
- Check network router capabilities
- Reduce concurrent transfers

#### Upload Fails
- Check file size (must be ≤10GB)
- Verify available disk space
- Ensure stable network connection
- Check firewall settings

---

## 📚 Documentation

### Additional Guides

- [High-Speed Transfer Optimizations](HIGH_SPEED_TRANSFER_OPTIMIZATIONS.md)
- [Two-Way File Sharing Guide](TWO_WAY_FILE_SHARING.md)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## �️ Roadmap

### Planned Features

- [ ] File preview (images, PDFs)
- [ ] Folder upload support
- [ ] Batch download (zip multiple files)
- [ ] Transfer history/timeline
- [ ] Desktop notifications
- [ ] Transfer encryption
- [ ] Resume interrupted uploads
- [ ] Dark/Light theme toggle

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aniruddha**
- GitHub: [@code-aniruddha](https://github.com/code-aniruddha)
- Project: [FastLane](https://github.com/code-aniruddha/FastLane-OfflineFileSharingWebApp)

---

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **Electron** - Cross-platform desktop framework
- **React** - UI component library
- **Express** - Fast web framework
- **Multer** - File upload middleware
- **Framer Motion** - Animation library

---

## 📞 Support

Found a bug or have a feature request?

- 🐛 [Report Bug](https://github.com/code-aniruddha/FastLane-OfflineFileSharingWebApp/issues)
- 💡 [Request Feature](https://github.com/code-aniruddha/FastLane-OfflineFileSharingWebApp/issues)
- 💬 [Ask Question](https://github.com/code-aniruddha/FastLane-OfflineFileSharingWebApp/discussions)

---

<div align="center">

**Made with ❤️ and ⚡ by Aniruddha**

⭐ Star this repo if you find it useful!

[⬆ Back to Top](#-fastlane---lightning-fast-offline-file-sharing)

</div>
