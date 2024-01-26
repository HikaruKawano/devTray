const { resolve } = require('path');
const { app, Tray, BrowserWindow } = require('electron');



const path = require('path');
const positioner = require('electron-traywindow-positioner');





function createWindos() {
  window = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    focusable: true,
    resizable: false,
    frame: false,
    fullscreenable: false,
    transparent: true,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  })

  window.webContents.openDevTools();
  // and load the index.html of the app.
  window.loadFile('index.html');
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })

  let tray = new Tray(resolve(__dirname, 'assets', 'IconTemplate.png'));

  const showWindow = () => {
    positioner.position(window, tray.getBounds() - 50);
    window.show();
  };

  const toggleWindow = () => {
    if (window.isVisible()) return window.hide();
    return showWindow();
  };


  tray.on('click', () => {
    toggleWindow();
  });
  tray.setToolTip('this is my app');
  tray.setContextMenu();
}

app.on('ready', () => {
  createWindos()
});