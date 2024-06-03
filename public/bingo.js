var selected_numbers = [];
var bingo_positions = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], [5, 10, 15, 20, 25], [1, 7, 13, 19, 25], [5, 9, 13, 17, 21]];
var bingo_numbers = [];
var num_lines = 0;
var game_started = false;
var roomID_client = null;

socket.on('okBingo', (roomID) => {
  const msg = new Msg(mode, socket.id, `<button id="${roomID}" onclick="joinBingo('${roomID}')"'>Lets play Bingo!\n>>>>>>>>>> GO!</button>`);
  sendMsg(msg);
});

function joinBingo(roomID) {
  roomID_client = roomID;
  $(`#${roomID}`).attr('disabled', true);
  const num1to25 = Array.from({ length: 25 }, (v, i) => i + 1);
  num1to25.sort(() => Math.random() - 0.5);
  bingo_numbers = bingo_positions.map((bingo) => bingo.map((num) => num1to25[num-1]));
  var dices = num1to25.map((num) => {
    return `<button class="dice invisible cursor-not-allowed" id="${num}">${num}</button>`;
  });
  dices = dices.join('');
  $('#bingo-board').html(dices);
  $('#bingo').show();
  for (let i = 0; i < 25; i ++) {
    const dice = $(`#${i + 1}`);
    setTimeout(() => {
      dice.removeClass('invisible');
      dice.addClass('animate-fade-down');
    }, i * 50);
  }
  setTimeout(() => {
    $('#bingo').find('.dice').removeClass('animate-fade-down');
  }, 25 * 50);
  socket.emit('joinBingo', roomID);
}

socket.on('startGame', (myturn) => {
  $('#exit').attr('disabled', true).attr('style', 'color: gray;')
  game_started = true;
  myturn? myTurn() : endTurn();
});

socket.on('nextTurn', (num) => {
  myTurn(num)
});

socket.on('endGame', (winner) => {
  winner == socket.id ? $('#win').show() : $('#lose').show();
});

socket.on('exitBingo', (roomID) => {
  console.log('exitBingo');
  $(`#${roomID}`).attr('disabled', true);
  exitBingo();
});

function endTurn(num=null) {
  if (checkBingo()) return;
  $('#game-info').text('Others turn ...').attr('style', 'color: red;').addClass('animate-shake');
  setTimeout(() => {
    $('#game-info').removeClass('animate-shake');
  }, 800);
  $('.dice').attr('disabled', true).addClass('cursor-not-allowed');

  if (num) {
    socket.emit('endTurn', { roomID: roomID_client, num });
  }
}

function myTurn(num=null) {
  if (num) {
    selected_numbers.push(num);
    $(`#${num}`).addClass('selected animate-shake');
    setTimeout(() => {
      $(`#${num}`).removeClass('animate-shake');
    }, 800);
  }
  $('#game-info').text('Your turn!').attr('style', 'color: green;').addClass('animate-shake');
  setTimeout(() => {
    $('#game-info').removeClass('animate-shake');
  }, 800);
  $('.dice').attr('disabled', false).removeClass('cursor-not-allowed');
}

function checkBingo() {
  num_lines = 0;
  for (let i = 0; i < bingo_numbers.length; i++) {
    const bingo = bingo_numbers[i];
    if (bingo.every((num) => selected_numbers.includes(num))) {
      num_lines++;
      $('#num-lines').text(num_lines);
    }
  }
  if (num_lines >= 5) {
    socket.emit('endGame', roomID_client);
    return true;
  }
  return false;
}

function cancelBingo() {
  // TODO: cancel not working
  socket.emit('exitBingo', roomID_client);
  sendMsg(new Msg(mode, socket.id, 'The Bingo game was canceled'));
}

function exitBingo() {
  $('#bingo').addClass('animate-fade-out')
  setTimeout(() => {
    selected_numbers = [];
    num_lines = 0;
    roomID_client = null;
    game_started = false;
    $('#num-lines').text(num_lines);
    $('#game-info').text('Waiting ... <br>for other player');
    $('#win').hide();
    $('#bingo-board').html('');
    $('#bingo').hide();
    $('#bingo').removeClass('animate-fade-out');
  }, 400);
}