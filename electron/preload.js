const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Get server information
  getServerInfo: () => ipcRenderer.invoke('get-server-info'),

  // Listen for server info updates
  onServerInfo: (callback) => {
    ipcRenderer.on('server-info', (event, info) => callback(info));
  },

  // Remove listener
  removeServerInfoListener: () => {
    ipcRenderer.removeAllListeners('server-info');
  },

  // App control
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  closeApp: () => ipcRenderer.send('close-app'),

  // Get platform info
  platform: process.platform
});
