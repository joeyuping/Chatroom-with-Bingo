$(function () {
  $('#login').on('click', (e) => {
    e.preventDefault();
    if (!$('#nickname').val()) {
      alert('Please enter a nickname');
      return;
    }
    const nickname = $('#nickname').val();
    sessionStorage.setItem('nickname', nickname);
    window.location.href = '/chat.html';
  });

  // on "enter" key press click the login button
  $('#nickname').on("keyup", (e) => {
    if (e.which === 13) {
      $('#login').trigger("click");
    }
  });
});

