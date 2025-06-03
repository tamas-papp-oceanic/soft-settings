const { app, BrowserWindow } = require('electron')

const isDev = require('electron-is-dev');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    Width: 1920,
    Height: 1080,
    frame: false,
    useContentSize: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(isDev ? process.cwd() : __dirname, 'preload.js'),
    },
    icon: path.join(isDev ? process.cwd() : __dirname, 'public/favicon.png'),
    show: false
  })

//   // win.loadURL('http://localhost:5000/');

// 	if (isDev) {
//     win.webContents.openDevTools();
//   }

// 	win.once('ready-to-show', () => {
// 		win.show();
//   });
}

app.whenReady().then(() => {
  createWindow()
})
