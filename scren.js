const { resolve, basename } = require('path');
const { app, Tray, Menu, dialog, MenuItem } = require('electron');
const Store = require('electron-store');
const { spawn } = require('child_process');


const schema = {
  projects: {
    type: 'string',
  },
}




let mainTray = {};

function render(tray = mainTray) {
  const store = new Store({ schema })

  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];

  console.log(store.get('projects'))

  const items = projects.map(({ name, path }) => ({
    label: name,
    submenu: [
      {
        label: 'open',

        click: () => {
          spawn('code', [path], { stdio: 'overlapped' })
        }
      },
      {
        label: 'remove',

        click: () => {
          store.set('projects', JSON.stringify(projects.filter(item => item.path !== path)));
          render();
        }
      }
    ],
  }));

  const contextMenu = Menu.buildFromTemplate([

    {
      type: 'separator',
    },
    ...items,
    {
      type: 'separator',
    },
    {
      label: 'Add project', type: 'radio', click: () => {
        dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => {
          const [path] = result.filePaths;
          store.set('projects', JSON.stringify([...projects, {
            path,
            name: basename(path),
          }]))
          render()
        }).then(err => {
          console.log(err);
        })
      }
    },
    {
      type: 'normal',
      role: 'quit',
      enabled: true,
    },

  ])

  // contextMenu.insert(0, new MenuItem({

  // }));

  tray.setToolTip('this is my app');
  tray.setContextMenu(contextMenu);
}


app.on('ready', () => {
  mainTray = new Tray(resolve(__dirname, 'assets', 'IconTemplate.png'));
  render(mainTray);
})