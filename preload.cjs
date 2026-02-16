const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // This allows the React UI to send a file path to the Linter
  lintFile: (filePath) => ipcRenderer.invoke("lint-file", filePath),
  // This allows the React UI to open a "Select File" dialog
  openFile: () => ipcRenderer.invoke("dialog:openFile")
});