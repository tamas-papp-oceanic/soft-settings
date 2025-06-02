const { app } = require('electron')
if (window && window.process && process.versions['electron']) {
  const { BrowserWindow } = require('electron').remote;
} else {
	const { BrowserWindow } = require('electron')
}
const isDev = require('electron-is-dev');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    minWidth: 1200,
    minHeight: 720,
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

  // win.loadURL('http://localhost:5000/');

	if (isDev) {
    win.webContents.openDevTools();
  }

	win.once('ready-to-show', () => {
		win.show();
  });
}

app.whenReady().then(() => {
  createWindow()
})
