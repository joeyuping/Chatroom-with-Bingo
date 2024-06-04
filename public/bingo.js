var selected_numbers = [];
var bingo_positions = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], [5, 10, 15, 20, 25], [1, 7, 13, 19, 25], [5, 9, 13, 17, 21]];
var bingo_numbers = [];
var num_lines = 0;
var game_started = false;
var roomID_client = null;

$(function () {
  $('#startBingo').on('click', (e) => {
    if (mode == 'group') {
      alert('Please select a user to play Bingo with');
      return;
    }
    socket.emit('initBingo', mode)
  });

  $('#bingo-board').on('click', '.dice', function () {
    if (!game_started) {
      alert('Game not started yet! Please wait for the other player to join.');
      return;
    }
    $(this).addClass('selected');
    const selected = parseInt($(this).attr('id'))
    selected_numbers.push(selected);
    endTurn(selected);
  });
});

socket.on('okBingo', (roomID) => {
  const msg = new Msg(mode, socket.id, `<button id="${roomID}" name="bingo" onclick="joinBingo('${roomID}')"'>Lets play Bingo!\n>>>>>>>>>> GO!</button>`);
  sendMsg(msg);
});

function joinBingo(roomID) {
  roomID_client = roomID;
  socket.emit('joinBingo', roomID);
  $(`#${roomID}`).attr('disabled', true);
  setupGame();
}

function setupGame() {
  const num1to25 = Array.from({ length: 25 }, (v, i) => i + 1);
  num1to25.sort(() => Math.random() - 0.5);
  bingo_numbers = bingo_positions.map((bingo) => bingo.map((num) => num1to25[num - 1]));
  const shuffle_number = Math.floor(Math.random() * 25) + 1;
  var dices = num1to25.map((num) => {
    if (num == shuffle_number) {
      return `<button class="shuffle dice invisible cursor-not-allowed" id="${num}">${num}</button>`;
    } else {
      return `<button class="dice invisible cursor-not-allowed" id="${num}">${num}</button>`;
    }
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
  }, 25 * 50 + 800);
}

socket.on('startGame', (myturn) => {
  $('#cancel').attr('disabled', true).attr('style', 'color: gray;')
  game_started = true;
  if (myturn) {
    alert('Game started! You go first!');
    myTurn();
  } else {
    alert(`Game started! ${users[mode]}\'s turn!`);
    endTurn();
  }
});

socket.on('nextTurn', (num) => {
  myTurn(num)
});

function myTurn(num=null) {
  if (num) {
    selected_numbers.push(num);
    $(`#${num}`).addClass('selected animate-shake');
    setTimeout(() => {
      $(`#${num}`).removeClass('animate-shake');
    }, 800);
    checkBingo();
  }
  $('#game-info').text('Your turn!').attr('style', 'color: green;').addClass('animate-shake');
  setTimeout(() => {
    $('#game-info').removeClass('animate-shake');
  }, 800);
  $('.dice').not('.selected').attr('disabled', false).removeClass('cursor-not-allowed');
}

function shuffle() {
  setTimeout(() => {
    // shuffle the number positions
    const num1to25 = Array.from({ length: 25 }, (v, i) => i + 1);
    num1to25.sort(() => Math.random() - 0.5);
    bingo_numbers = bingo_positions.map((bingo) => bingo.map((num) => num1to25[num - 1]));
    const dices = num1to25.map((num) => {
      if (selected_numbers.includes(num)) {
        return `<button class="dice selected" id="${num}">${num}</button>`;
      } else {
        return `<button class="dice" id="${num}">${num}</button>`;
      }
    });
    $('#bingo-board').html(dices.join(''));
    checkBingo();
  }, 2000);
}

function endTurn(num = null) {
  if (num && $(`#${num}`).hasClass('shuffle')) {
    $('#shuffle').show();
    setTimeout(() => {
      $('#shuffle').hide();
    }, 2000);
    $(`#${num}`).removeClass('shuffle');
    shuffle();
  }

  $('#game-info').text(`${users[mode]}\'s turn ...`).attr('style', 'color: red;').addClass('animate-shake');
  setTimeout(() => {
    $('#game-info').removeClass('animate-shake');
  }, 800);
  $('.dice').attr('disabled', true).addClass('cursor-not-allowed');

  if (num && !checkBingo()) {
    socket.emit('nextTurn', { to: mode, num });
  }
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
    socket.emit('endGame', { to: mode, roomID: roomID_client });
    $('#win').show();
    return true;
  }
  return false;
}

socket.on('endGame', () => {
  $('#lose').show();
});

function cancelBingo() {
  socket.emit('exitBingo', { to: mode, roomID: roomID_client });
  sendMsg(new Msg(mode, socket.id, 'The Bingo game was canceled'));
  leaveBingo();
}

socket.on('exitBingo', (roomID) => {
  $(`#${roomID}`).attr('disabled', true);
  leaveBingo();
});

function exitBingo() {
  socket.emit('exitBingo', { to: mode, roomID: roomID_client });
  leaveBingo();
}

function leaveBingo() {
  $('#bingo').addClass('animate-fade-out')
  setTimeout(() => {
    resetBingo();
  }, 400);
}

function playAgain() {
  socket.emit('replayBingo', { to: mode, roomID: roomID_client });
  resetBingo(true);
  setupGame();
}

socket.on('replayBingo', () => {
  resetBingo(true);
  setupGame();
});

function resetBingo(replay = false) {
  selected_numbers = [];
  num_lines = 0;
  game_started = false;
  $('#num-lines').text(num_lines);
  $('#game-info').html('Waiting ... <br>for other player').attr('style', 'color: black;')
  $('#win').hide();
  $('#lose').hide();
  $('#cancel').attr('disabled', false).attr('style', 'color: black;')
  $('#bingo-board').html('');
  if (!replay) {
    roomID_client = null;
    $('#bingo').hide();
    $('#bingo').removeClass('animate-fade-out');
  }
}