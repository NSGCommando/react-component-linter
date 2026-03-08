// preload.cjs
// --------------------------------------------------
// This preload script remains CommonJS (.cjs) because:
// 1. The preload runs in a sandboxed Chromium context with contextIsolation: true.
// 2. Sandboxed preload scripts cannot use Node-style ES6 imports.
// 3. We need Node access to 'electron' (ipcRenderer, contextBridge) to safely expose APIs to the renderer.
// 4. Using CommonJS 'require' here ensures secure and compatible access to Electron APIs.
//
// The main process and renderer are ES6 modules, but this bridge must stay CJS for security and sandbox compatibility.
// --------------------------------------------------
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // This allows the React UI to send a file path to the Linter
  lintFile: (filePath) => ipcRenderer.invoke("lint-file", filePath),
  // This allows the React UI to open a "Select File" dialog
  openFile: () => ipcRenderer.invoke("dialog:openFile")
});