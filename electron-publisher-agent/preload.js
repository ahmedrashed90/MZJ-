const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('mzjPublisherAgent', {
  chooseAgendaFolder: () => ipcRenderer.invoke('choose-agenda-folder'),
  scanAgendaFolder: (payload) => ipcRenderer.invoke('scan-agenda-folder', payload),
  savePublishingJobs: (payload) => ipcRenderer.invoke('save-publishing-jobs', payload)
});
