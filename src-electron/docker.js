const { ipcMain } = require('electron');
const { Docker } = require('node-docker-api');
const { spawn } = require('child_process');


let docker = new Docker({ socketPath: '/var/run/docker.sock' });
function getContainers() {

  return docker.container.list({ all: true })
}

async function ListContainerDoker() {
  let containers = getContainers()
  return containers;
}
function ListImagemDoker() {
  return docker.image.list({ all: true });
}

ipcMain.on('get-images', async (event, args) => {
  try {
    let images = await ListImagemDoker();
    event.reply('getImages', images);
  } catch (error) {
    event.reply('getImages', []);
  }
})

ipcMain.on('start-container', (event, args) => {
  let container = docker.container.get(args)
  container.start().then(async response => {
    let containers = await getContainers()
    event.reply('list-container', containers);
  });

})

ipcMain.on('stop-container', async (event, args) => {
  try {
    let container = docker.container.get(args);

    // Stop the container
    await container.stop();

    // Wait for the container to reach the 'exited' state
    await container.wait();

    // Fetch the updated container list
    let stopContainers = await getContainers();

    // Check if any container is still running
    const isAnyContainerRunning = stopContainers.some(item => item.data.State === 'running');

    // Reply with 'stop-container' if no container is running
    if (!isAnyContainerRunning) {
      event.reply('stop-container');
    }

    // Reply with the updated container list
    event.reply('list-container', stopContainers);
  } catch (error) {
    console.error('Error stopping container:', error.message);
  }
});

function createContainer(event, args) {
  docker.container.create({
    Image: `${args.image}`,
    name: `${args.name}`
  }).then(async () => {
    let container = await getContainers();
    event.reply('get-images')
    event.reply('docker-status-create-image-container', 'Docker container created!')
    event.reply('list-container', container)
  })
}

ipcMain.on('create-container', (event, args) => {
  // Check if the image exists
  checkIfImageExists(args.image)
    .then(() => {
      // Image exists, create container
      createContainer(event, args);
    })
    .catch(async () => {
      // Image doesn't exist, pull it
      console.log(`Image ${args.image} not found. Pulling...`);

      const pullProcess = spawn('docker', ['pull', `${args.image}:latest`]);

      pullProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        event.reply('docker-status-create-image-container', `stdout: ${data}`);
      });

      pullProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        event.reply('docker-status-create-image-container', { stderr: `stderr: ${data}` });
      });

      // Handle process exit
      pullProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('Docker image pulled successfully!');
          let images = await ListImagemDoker()
          event.reply('getImages', images)
          event.reply('docker-status-create-image-container', 'Docker image pulled successfully!');
          event.reply('docker-status-create-image-container', 'Creating docker container!');
          createContainer(event, args);
        } else {
          console.error(`Docker image pull process exited with code ${code}`);
        }
      });
    });
});

function checkIfImageExists(imageName) {
  return new Promise((resolve, reject) => {
    const inspectProcess = spawn('docker', ['inspect', imageName]);

    inspectProcess.on('close', (code) => {
      if (code === 0) {
        // Image exists
        resolve();
      } else {
        // Image not found
        reject(new Error(`Image ${imageName} not found`));
      }
    });
  });
}


ipcMain.on('docker-remove-container', (event, args) => {
  const deleteContainerProcess = spawn('docker', ['rm', `${args}`])

  deleteContainerProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    event.reply('docker-status-create-image-container', `stdout: ${data}`)
  })

  deleteContainerProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);

    event.reply('docker-status-create-image-container', `stderr: ${data}`)
  });

  deleteContainerProcess.on('close', async (code) => {
    if (code === 0) {
      let container = await getContainers();
      event.reply('docker-status-create-image-container', 'Docker container deleted!')
      event.reply('list-container', container)
    } else {
      event.reply(`docker-status-create-image-container', 'Error delete container code ${code}`)
    }
  })
})

module.exports = ListContainerDoker;