$(function () {
  $('#login').on('click', (e) => {
    e.preventDefault();
    const nickname = $('#nickname').val();
    sessionStorage.setItem('nickname', nickname);
    window.location.href = '/chat.html';
  });
});

