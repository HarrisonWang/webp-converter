const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  convertImages: (data) => ipcRenderer.send('convert-images', data),
  onConversionProgress: (callback) => ipcRenderer.on('conversion-progress', callback),
  onConversionComplete: (callback) => ipcRenderer.on('conversion-complete', callback),
  onConversionError: (callback) => ipcRenderer.on('conversion-error', callback),
});
