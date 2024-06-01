const socket = io.connect();
var users = {};
socket.on('connect', () => {
  console.log('Connected to server');
  const nickname = sessionStorage.getItem('nickname');
  socket.emit('login', { nickname });
  $('#nickname').text(nickname);
});
var mode = 'group';  // 'group' or socket ids for private chat
const msg_store = {
  group: [],
};

$(function () {

  $('#msg').on('keypress', (e) => {
    if (e.which == 13 && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  });

  $('#send').on('click', (e) => {
    e.preventDefault();
    sendMsg();
  });

  $('#group').on('click', (e) => {
    mode = 'group';
    $("#recipient").text("Group")
    $("#recipient-icon").attr("icon", "octicon:people-24")
    RenderMsgHistory(msg_store[mode]);
  });

  $('#private').on('click', (e) => {
    $("#recipient").text("")
    $("#recipient-icon").attr("icon", "octicon:person-24")
    $('#msg_history').empty();
    RenderMsg({ from: 'announcement', text: 'Select a user to chat with' });
  });

  updateNumUsers();

  // TODO: Implement private chat, render users list
});

socket.on('loginout', (data) => {
  users = data.users;
  AddToMsgStore(data.msg);
  RenderMsg(data.msg);
  updateUserCards();
  updateNumUsers();
});

socket.on('receivemsg', (msg) => {
  if (msg.from == 'announcement') {
    updateNumUsers();
  }
  AddToMsgStore(msg);
  RenderMsg(msg);
});

function RenderMsgHistory(msg_list) {
  $('#msg_history').empty();
  msg_list.map((msg) => {
    RenderMsg(msg);
  });
}

function RenderMsg(msg) {
  // replace line breaks with <br> tags
  const text = msg.text.replace(/\n\r?/g, '<br>');
  var type;
  switch (msg.from) {
    case 'announcement':
      type = 'announcement';
      break;
    case socket.id:
      type = 'send';
      break;
    default:
      type = 'receive';
  }
  if (type == 'announcement') {
    $('#msg_history').append(
      `<div class="${type}">
        <div class="${type}-msg">${text}</div>
      </div>
      `);
    return;
  }
  $('#msg_history').append(
    `<div class="${type}">
      <div class="name">${type == 'send' ? 'Me' : users[msg.from]}</div>
      <div class="${type}-msg">${text}</div>
      </div>
      `);
}

function AddToMsgStore(msg) {
  if (!msg.text) {
    return;
  }
  if (!msg_store[msg.mode]) {
    msg_store[msg.mode] = [];
  }
  msg_store[msg.mode].push(msg);
}

class Msg {
  constructor(mode = null, from, text) {
    this.mode = mode; // 'group' or combination of two socket ids for private chat
    this.from = from; // socket_id, or 'announcement'
    this.text = text; // message text
  }
}

function updateNumUsers() {
  $('#num_users').text(Object.keys(users).length);
}

function updateUserCards() {
  if (!users) {
    return;
  }
  $('#online_users').empty();
  Object.entries(users).forEach((user) => {
    $('#online_users').append(`
    <li class="user-card"><iconify-icon icon="carbon:user-avatar-filled-alt"></iconify-icon>${user[1]}</li>`)
  });
}

function sendMsg() {
  if (!$('#msg').val()) {
    return;
  }
  const msg = new Msg(mode, socket.id, $('#msg').val());
  $('#msg').val('');
  AddToMsgStore(msg);
  RenderMsg(msg);
  socket.emit('sendmsg', msg);
}