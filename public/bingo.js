$(function () {
  $('#bingo').on('click', (e) => {
    if (mode == 'group') {
      alert('Please select a user to play Bingo with');
      return;
    }
    socket.emit('initBingo')
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

