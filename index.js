const { resolve, basename, join } = require('path');
const { app, Tray, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const Store = require('electron-store');
const ListContainerDoker = require('./src-electron/docker')

const schema = {
  projects: {
    type: 'string',
  },
};

let mainTray = {};

function createMainWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    show: false,
    resizable: false,
    roundedCorners: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });



  win.loadFile('./src/index.html');

  win.on('blur', () => {
    win.hide();
  });



  return win;
}

function handleTrayClick(win) {
  mainTray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}

const store = new Store({ schema });
function reload() {
  const data = store.get('projects');
  const json = data ? JSON.parse(data) : [];
  return json
}



function render() {

  const win = createMainWindow();
  let projects = [];



  ipcMain.on('remove-project', (event, args) => {
    projects = reload();
    const pathToRemove = args;

    // Find the index of the project with the specified path
    const projectIndex = projects.findIndex(project => project.path === pathToRemove);

    if (projectIndex !== -1) {
      // If the project is found, remove it from the array
      projects.splice(projectIndex, 1);

      // Update the store with the modified projects array
      store.set('projects', JSON.stringify(projects));

      // Send updated projects to the renderer process
      event.reply('project-post', projects);
    }
  })

  ipcMain.on('add-new-project', (event, args) => {
    dialog.showOpenDialog({ properties: ['openDirectory'] })
      .then(result => {
        const [path] = result.filePaths;
        projects = reload()
        store.set('projects', JSON.stringify([...projects, {
          path,
          name: basename(path),
        }]));

        projects = reload()
        console.log(projects)

        event.reply('project-post', projects)
      })
      .catch(err => {
        console.error(err);
      });

  })


  handleTrayClick(win);

  ipcMain.on('project', (event, args) => {
    projects = reload()
    event.reply('project-post', projects);
  });

  ipcMain.on('quit-app', (event, arg) => {
    app.quit()
  })

  ipcMain.on('mini-App', (event, arg) => {
    win.hide()
  })


  //Docker events
  ipcMain.on('List-docker-container', async (event, args) => {
    let listContainer = await ListContainerDoker();
    console.log(listContainer)
    event.reply('list-container', listContainer);
  })

}

app.on('ready', () => {
  mainTray = new Tray(resolve(__dirname, 'assets', 'IconTemplate.png'));

  render();
});
