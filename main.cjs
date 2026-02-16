const {app, BrowserWindow, ipcMain, dialog} = require("electron")
const path = require("node:path");

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
    const {cancelled, filePaths} = await dialog.showOpenDialog();
    if (!cancelled) return filePaths[0];
})
ipcMain.handle("lint-file", async(event, filePath)=>{
    const {lintFile} = await import("./src/index.js")
    const lintRes = lintFile(filePath)
    return lintRes
})
app.whenReady().then(()=>{
    createWindow()
})