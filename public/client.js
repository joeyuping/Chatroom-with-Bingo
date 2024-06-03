const socket = io.connect();
var users = {};
socket.on('connect', () => {
  console.log('Connected to server with id:', socket.id);
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
    $('#group').removeClass('dot');
    $("#recipient").text("Group")
    $("#recipient-icon").attr("icon", "octicon:people-24")
    RenderMsgHistory(msg_store[mode]);
  });

  $('#private').on('click', (e) => {
    $("#recipient").text("")
    $("#recipient-icon").attr("icon", "octicon:person-24")
    $('#msg_history').empty();
    RenderMsg({ text: 'Select a user to chat with' }, 'announcement');
  });

  $('#logout').on('click', (e) => {
    socket.close();
    sessionStorage.removeItem('nickname');
    window.location.href = '/';
  });

  $('#online_users').on('click', '.user-card', (e) => {
    mode = e.target.id;
    $(`#${mode}`).removeClass('dot');
    $("#recipient").text(users[mode])
    $("#recipient-icon").attr("icon", "octicon:person-24")
    RenderMsgHistory(msg_store[mode]);
  });

  $(this).on('click', (e) => {
    if (!$(e.target).closest('#emoji').length) {
      $('#emoji-picker').hide();
    }
  });

  $('#emoji').on('click', (e) => {
    $('#emoji-picker').toggle();
  });

  // fill emoji container
  for (let i = 128512; i <= 128591; i++) {
    $('#emoji-container').append(`<span class="text-2xl cursor-pointer" onclick="addEmoji('&#${i};')">&#${i};</span>`);
  }

  $('#image').on('change', (e) => {
    const files = e.target.files;
    Object.keys(files).forEach((i) => {
      const file = files[i];
      // if (file.size > 5e5) {
      //   alert('File size must be less than 500KB');
      //   return;
      // }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        // log size of e.target.result
        console.log('Size of image:', e.target.result.length);
        const msg = new Msg(mode, socket.id, `<img src="${e.target.result}" alt="image" class="w-64">`);
        sendMsg(msg);
      };
      reader.readAsDataURL(file);
    });
  });
});

socket.on('welcome', (server_users) => {
  users = server_users;
  Object.keys(users).forEach((id) => {
    msg_store[id] = [];
  });
  updateUserCards();
  updateNumUsers();
});

socket.on('login', ({ msg, id, nickname }) => {
  users[id] = nickname;
  if (!msg_store[id]) {
    msg_store[id] = [];
  }
  msg_store['group'].push({ msg, type: 'announcement' });
  msg_store[id].push({ msg, type: 'announcement' });
  if (mode == 'group' || mode == id) {
    RenderMsg(msg, 'announcement');
  }
  updateUserCards();
  updateNumUsers();
});

socket.on('logout', ({ msg, id }) => {
  delete users[id];
  msg_store['group'].push({ msg, type: 'announcement' });
  msg_store[id].push({ msg, type: 'announcement' });
  if (mode == 'group' || mode == id) {
    RenderMsg(msg, 'announcement');
  }
  updateUserCards();
  updateNumUsers();
});

socket.on('receivemsg', (msg) => {
  const store_id = msg.to == 'group' ? 'group' : msg.from;
  msg_store[store_id].push({ msg, type: 'receive' });
  if (mode == store_id) {
    RenderMsg(msg, 'receive');
    return;
  }
  $(`#${store_id}`).addClass('dot');
});

function RenderMsgHistory(msg_list) {
  $('#msg_history').empty();
  if (!msg_list) return;
  msg_list.map(({ msg, type }) => {
    RenderMsg(msg, type);
  });
}

function RenderMsg(msg, type) {
  if (!msg) return;
  // replace line breaks with <br> tags
  const text = msg.body.replace(/\n\r?/g, '<br>');
  const msg_history = $('#msg_history');
  if (type == 'announcement') {
    msg_history.append(
      `<div class="${type}">
        <div>${text}</div>
      </div>`);
    return;
  }
  msg_history.append(
    `<div class="${type}">
      <div class="name">${type == 'send' ? 'Me' : users[msg.from]}</div>
      <div class="${type}-msg">${text}</div>
    </div>`);
  msg_history.scrollTop(msg_history[0].scrollHeight);
}

function updateNumUsers() {
  $('#num_users').text(Object.keys(users).length);
}

function updateUserCards() {
  if (!users) return;
  $('#online_users').empty();

  for (const user_id in users) {
    if (user_id == socket.id) continue;

    $('#online_users').append(`
    <li class="user-card flex items-center relative" id="${user_id}"><iconify-icon class="mr-2" icon="carbon:user-avatar-filled-alt" width="28"></iconify-icon>${users[user_id]}</li>`)
  }
}

function sendMsg(msg = null) {
  if (!msg) {
    if (!$('#msg').val()) return;
    const msg = new Msg(mode, socket.id, $('#msg').val());
    $('#msg').val('');
  }
  msg_store[mode].push({ msg, type: 'send' });
  RenderMsg(msg, 'send');
  socket.emit('sendmsg', msg);
}

function addEmoji(emoji) {
  $('#msg').val($('#msg').val() + emoji);
}

class Msg {
  constructor(to, from, body) {
    this.to = to; // 'group' or combination of two socket ids for private chat
    this.from = from; // socket_id, or 'announcement'
    this.body = body; // message body
  }
}