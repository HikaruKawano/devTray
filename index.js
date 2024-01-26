const { resolve } = require('path');
const { app, Tray, BrowserWindow } = require('electron');
const Store = require('electron-store');
const positioner = require('electron-traywindow-positioner');

const schema = {
  projects: {
    type: 'string',
  },
}

let tray;
let window;

const store = new Store({ schema })

const storedProjects = store.get('projects');
const projects = storedProjects ? JSON.parse(storedProjects) : [];

function createWindow() {
  // Remove the 'const' here to make it a gl obal variable
  window = new BrowserWindow({
    frame: false,
    width: 400,
    height: 500,
    show: false,
    resizable: false,
  });

  window.webContents.openDevTools()
  window.store = store
  window.loadFile('index.html');
  window.on('show', () => {
    Html();
  });
};

function Html() {
  projects.forEach(async ({ name }, index) => {

    window.webContents.executeJavaScript(`
      
      const child${index} = document.createElement('p');
      child${index}.innerHTML = '${name}';
      document.getElementById('projects').appendChild(child${index});
      `, true)
      .then(function (result) {
        console.log(result);
      })
      .catch(function (error) {
        console.error(error);
      });
  });

}



function createTray() {
  tray = new Tray(resolve(__dirname, 'assets', 'IconTemplate.png'));

  tray.on('click', () => {
    toggleWindow();
  });
}

function toggleWindow() {
  if (window.isVisible()) {
    window.hide();
  } else {
    const windowBounds = window.getBounds()
    const trayBounds = tray.getBounds()

    positioner.position(window, trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
    window.show();
  }
}

app.on('ready', () => {
  createWindow();
  createTray();
});