const { ipcMain } = require('electron');
const { Docker } = require('node-docker-api');


let docker
function getContainers() {
  docker = new Docker({ socketPath: '/var/run/docker.sock' });
  return docker.container.list({ all: true })
}

async function ListContainerDoker() {
  let containers = getContainers()
  return containers;
}

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

module.exports = ListContainerDoker;