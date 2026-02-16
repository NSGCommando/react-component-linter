const {app, BrowserWindow, ipcMain, dialog, Menu} = require("electron")
const { pathToFileURL } = require('url');
const path = require("node:path");
let lintFile;

// create the app's window
const createWindow=()=>{
    const myWindow = new BrowserWindow({
        width:800, height:600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true, // Security best practice
            nodeIntegration: false  // keep frontend and backend separate
        },
    })
    if(!app.isPackaged){
        myWindow.loadURL("http://localhost:5173")
    }
    else{myWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));}
}

ipcMain.handle("dialog:openFile", async()=>{
    const {cancelled, filePaths} = await dialog.showOpenDialog({
  properties: ['openFile'],
  filters: [
    { name: 'React Files', extensions: ['jsx', 'js'] }, // show only .jsx or .js
    { name: 'All Files', extensions: ['*'] }           // fallback selection for user control
  ]
});
    if (!cancelled) return filePaths[0];
})
ipcMain.handle("lint-file", async(event, filePath)=>{ //DO NOT REMOVE that "event". ipcMain.handle takes POSITIONAL arguments
    try{
        const modulePath = path.join(app.getAppPath(),"src","index.js"); // get the internal absolute filepath of the executable's app
        const moduleFileURL = pathToFileURL(modulePath).href; // convert the module path into a File URL like "D//:folder/file.js" for windows
        const {lintFile} = await import(moduleFileURL);
        const lintRes = lintFile(filePath)
        return lintRes
    }
    catch(err){
        console.error("Linter failed to load:", err);
        return { error: "Failed to load linter module." };
    }
    
})
app.whenReady().then(()=>{
    const template = [
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { type: 'separator' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' }
        ]
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    createWindow()
})