$(function () {
  $('#bingo').on('click', (e) => {
    if (mode == 'group') {
      alert('Please select a user to play Bingo with');
      return;
    }
    socket.emit('initBingo')
  });

  $('#bingo-board').on('click', '.dice', function () {
    if (!game_started) {
      alert('Game not started yet! Please wait for the other player to join.');
    }
    $(this).addClass('selected');
    const selected = parseInt($(this).attr('id'))
    selected_numbers.push(selected);
    endTurn(selected);
  });
})

socket.on('okBingo', (roomID) => {
  const msg = new Msg(mode, socket.id, `<button onclick="joinBingo(${roomID})">Lets play Bingo!\n>>>>>>>>>> GO!</button>`);
  sendMsg(msg);
});

function joinBingo(roomID) {
  socket.emit('joinBingo', roomID);
  // TODO: open bingo, show waiting for other player
}

socket.on('startBingo', () => {
  // TODO: start bingo
});


var selected_numbers = [];
var bingo_positions = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], [5, 10, 15, 20, 25], [1, 7, 13, 19, 25], [5, 9, 13, 17, 21]];
var bingo_numbers = [];
var num_lines = 0;
var game_started = false;

function startBingo() {
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
}

socket.on('startGame', (myturn) => {
  $('#exit').attr('disabled', true).attr('style', 'color: gray;')
  game_started = true;
  // TODO: server assign myturn
  myturn? myTurn() : endTurn();
});

function endTurn(num=null) {
  if (checkBingo()) return;
  $('#game-info').text('Others turn ...').attr('style', 'color: red;').addClass('animate-shake');
  setTimeout(() => {
    $('#game-info').removeClass('animate-shake');
  }, 800);
  $('.dice').attr('disabled', true).addClass('cursor-not-allowed');

  // TODO： send selected_numbers to opponent
  if (num) {
    
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
    $('#won').show();

    // TODO: send win message to opponent

    return true;
  }
}

function exitBingo() {
  $('#bingo').addClass('animate-fade-out')
  setTimeout(() => {
    selected_numbers = [];
    num_lines = 0;
    $('#num-lines').text(num_lines);
    $('#game-info').text('Waiting ... <br>for other player');
    $('#won').hide();
    $('#bingo-board').html('');
    $('#bingo').hide();
    $('#bingo').removeClass('animate-fade-out');
  }, 400);
  
  // TODO: send exit message to opponent
}