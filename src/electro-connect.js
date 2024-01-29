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
          <ion-icon id=${folder.name} class="btn-open-code" data-path="${folder.path}" name="folder-open-outline" title="opem project"></ion-icon> 
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

ipcRenderer.send('project', { mensage: 'aaaa' })
getProjects()