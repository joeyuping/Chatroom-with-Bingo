const socket = io.connect();

$('#login').on('click', (e) => {
  e.preventDefault();
  const nickname = $('#nickname').val();
  socket.emit('login', { nickname });
  window.location.href = '/lobby.html';
});

const msg_store = {
  group: [],
};
// msg_store : {
//   group: [msg1, msg2, ...],
//   socket_id1+socket_id2: [msg1, msg2, ...],
// }

socket.on('receivemsg', (data) => {
  if (data.id !== id) {
    $('#msg_list').append(`<li>${data.msg}</li>`)
  }
});

$('#group-send').on('click', (e) => {
  e.preventDefault();
  const msg = $('#group-msg').val();
  $('#group-msg').val('');
  $('#group-msg-list').append(
    `<div class="receive">
    <div class="name">Me</div>
    <div class="receive-msg>${msg}</div>
    </div>
    `)
  socket.emit('group-sendmsg', { msg, id });
});




