function TabProject() {
  $('.container-project').addClass('actve');
  $('.projects-tab').addClass('active-tab');
  $('.container-project').removeClass('desative');
  $('.container-docker').addClass('desative');
  $('.container-docker').removeClass('active');
  $('.docker-tab').removeClass('active-tab');
}

function TabDocker() {
  $('.container-docker').addClass('actve');
  $('.docker-tab').addClass('active-tab');
  $('.container-docker').removeClass('desative');
  $('.container-project').addClass('desative');
  $('.container-project').removeClass('active');
  $('.projects-tab').removeClass('active-tab');
}

function addNewContainer() {
  if ($('form').hasClass('disable')) {
    $('form').removeClass('disable')
  } else {
    $('form').addClass('disable')
  }
}

function showList() {
  $('.container-list').removeClass('disable');
}


$('.list').on('click', '.list-itens', (event) => {
  let image = $(event.currentTarget).data('image');
  console.log(image)

  $('.input-image').val(image)

  $('.container-list').addClass('disable');

});

$('.input-image').on('keyup', () => {
  let input = $('.input-image').val()
  let filter = input.toUpperCase();
  let li = $('.list-itens')
  for (let i = 0; i < li.length; i++) {
    let textValue = li[i].innerHTML || li[i].innerText;
    if (textValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }

})

$('.progress-icon-hide').on('click', () => {
  $('.progress').addClass('disable')
})
