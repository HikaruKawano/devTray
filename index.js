const { resolve, basename } = require('path');
const { app, Tray, Menu, dialog, MenuItem } = require('electron');
const Store = require('electron-store');
const { spawn } = require('child_process');
const { Docker } = require('node-docker-api');
const path = require('path');

const assetsDirectory = path.join(__dirname, 'assets');

const schema = {
  projects: {
    type: 'string',
  },

  dockers: {
    type: 'string',
  }
}




let mainTray = {};

async function render(tray = mainTray) {
  const store = new Store({ schema })
  const docker = new Docker({ socketPath: '/var/run/docker.sock' });

  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];


  const container = await docker.container.list({ all: true });



  const containers = container.map(container => ({
    label: container.data.Image,

    submenu: [{
      label: `${container.data.State == 'running' ? 'Stop container' : 'start container'}`,
      icon: path.join(
        assetsDirectory,
        `${container.data.State == 'running' ? 'online' : 'offline'}.png`
      ),
      async click() {
        if (container.data.State === 'running') {
          // console.log(`Stopped container ${container.data.Image}`);
          await container.stop();
          render();
        } else {
          // console.log(`Started container ${container.data.Image}`);
          await container.start();
          render()
        }
      }
    }]
  }))


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
      label: 'Projects',
      submenu: [
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

      ]
    },
    {
      label: 'Docker',
      submenu: [
        {
          type: 'separator'
        },
        ...containers,
        {
          type: 'separator'
        }
      ]
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