const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const FileServer = require('./server');

let mainWindow;
let fileServer;
let serverInfo = {};

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();

  // Priority order: Ethernet, Wi-Fi, other
  const priorities = ['Ethernet', 'Wi-Fi', 'en0', 'eth0', 'wlan0'];

  for (const priority of priorities) {
    if (interfaces[priority]) {
      for (const iface of interfaces[priority]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  // Fallback: search all interfaces
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return '127.0.0.1';
}

async function startServer() {
  try {
    fileServer = new FileServer();
    const { server, port } = await fileServer.start(0); // Use random available port

    const localIP = getLocalIPAddress();

    serverInfo = {
      host: localIP,
      port: port,
      token: fileServer.sessionToken,
      url: `http://${localIP}:${port}`
    };

    console.log('Server started:', serverInfo);

    return serverInfo;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../build/icon.png'),
    frame: true,
    backgroundColor: '#1a1a2e',
    title: 'FastLane - Offline File Sharing'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Send server info to renderer when ready
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('server-info', serverInfo);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Start the file server first
    await startServer();

    // Then create the window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (fileServer) {
      fileServer.cleanup();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (fileServer) {
    fileServer.cleanup();
  }
});

// IPC Handlers
ipcMain.handle('get-server-info', async () => {
  return serverInfo;
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-app', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-app', () => {
  if (mainWindow) mainWindow.close();
});
