const { ipcRenderer } = require('electron');
const $ = require('jquery');
const { spawn } = require('child_process');


function openCode(path) {
  spawn('code', [path], { stdio: 'overlapped' })
}

function getProjects() {
  ipcRenderer.on('project-post', (event, args) => {
    $("#projects-container").empty()

    let project = args;

    $.map(project, (folder) => {
      $("#projects-container").append(`
      <div class='project-itens' >
          <p class='project-name'>${folder.name}</p>
          <div class='action'>
          <ion-icon id=${folder.name} class="btn-open-code" data-path="${folder.path}" name="folder-open-outline" title="open project"></ion-icon> 
          <ion-icon id=${folder.name} class="btn-remove-folder" data-path="${folder.path}" name="trash-outline" title="Remove project"></ion-icon>   
          </div>
      </div>
      `)
    })

  })

  $("#projects").on('click', '.btn-open-code', (event) => {
    let value = $(event.currentTarget).data('path');
    console.log('Opening project:', value);
    openCode(value);
  });

  $("#projects").on('click', '.btn-remove-folder', (event) => {
    let value = $(event.currentTarget).data('path');
    ipcRenderer.send('remove-project', value)
  });
}

function QuitApp() {
  ipcRenderer.send('quit-app');
}

$('.action-btnc').on('click', '.lose-first', (event) => {
  QuitApp()
})
function MiniApp() {
  ipcRenderer.send('mini-App');
}

function addNewProject() {
  ipcRenderer.send('add-new-project');
}

ipcRenderer.send('project')
getProjects()


//Docker
ipcRenderer.send('List-docker-container');

function createViewDocker(docker) {
  $.map(docker, (container) => {
    // console.log(container)
    const containerName = container.data.Names ? container.data.Names[0].substring(1) : '';
    const displayContainerName = containerName.length > 12
      ? containerName.substring(containerName.length - 12) + '...'
      : containerName;

    $("#docker-container").append(`
    <div class='docker-itens' >
        <p class='docker-name' title='${containerName}' >${displayContainerName}</p>
        <p class='docker-state state-${container.data.Image}'>${container.data.State == 'running' ? 'running' : 'stopped'} </p>
        <div class='action'>
        ${container.data.State == 'running' ? `<ion-icon class='stop-btn btn' title='stop' data-name='${container.data.Image}' data-value='${container.data.Id}' name="pause"></ion-icon>` : `<ion-icon title='start' class='start-btn btn' data-name='${container.data.Image}' data-value='${container.data.Id}' name="caret-forward"></ion-icon>`}
        <ion-icon id=${container.data.Id} class="btn-remove-container" data-container="${container.data.Id}" name="trash-outline" title="Remove Container"></ion-icon>   
          
        </div>
    </div>  
    `)
  })
}



ipcRenderer.on('list-container', (event, args) => {
  // console.log(args)
  $('#docker-container').empty();

  let docker = args;
  createViewDocker(docker);

})

$('#docker').on('click', '.start-btn', (event) => {
  let value = $(event.currentTarget).data('value');
  let name = $(event.currentTarget).data('name');
  $(`.state-${name}`).text('starting...')

  ipcRenderer.send('start-container', value);
});

$('#docker').on('click', '.stop-btn', (event) => {
  let value = $(event.currentTarget).data('value');
  let name = $(event.currentTarget).data('name');
  $(`.state-${name}`).text('stopping...')
  ipcRenderer.send('stop-container', value);
});

function createDocker() {
  let image = $('.input-image').val()
  let name = $('.input-name').val()
  $('.progress-title').text('Create progress:')
  ipcRenderer.send('create-container', { name: name, image: image })

  $('.input-image').val('')
  $('.input-name').val('')
  $('form').addClass('disable')
}

ipcRenderer.on('docker-status-create-image-container', (event, args) => {
  $('.progress').removeClass('disable')
  $(".state-create").val($(".state-create").val() + "\n" + args);
})

$('#docker').on('click', '.btn-remove-container', (event) => {
  $('.progress-title').text('Delete Progress')
  let id = $(event.currentTarget).data('container');
  ipcRenderer.send('docker-remove-container', id)
})

ipcRenderer.send('get-images')
ipcRenderer.on('getImages', (event, args) => {
  console.log('Images: ', args)
  const images = args;
  $('.list').empty()
  $.map(images, (imgs) => {
    // Split the string using ':' and take the first part
    const imageName = imgs.data.RepoTags ? imgs.data.RepoTags[0].split(':')[0] : '';

    $(".list").append(`
         <li class='list-itens' data-image='${imageName}'>${imageName}</li>
       `);
  })


})
