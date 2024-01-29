const { Docker } = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function ListContainerDoker() {
  const container = await docker.container.list({ all: true })


  return container;
}

module.exports = ListContainerDoker;