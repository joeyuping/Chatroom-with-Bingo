import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e8
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const users = {};
io.on('connection', (socket) => {
  socket.emit('welcome', users);
  socket.on('login', ({ nickname }) => {
    users[socket.id] = nickname;
    const announcement = `${users[socket.id]} joined`
    io.emit('login',
      {
        msg: new Msg('group', 'group', announcement),
        id: socket.id,
        nickname: users[socket.id]
      });
    console.log(announcement);
  });
  socket.on('disconnect', (reason) => {
    console.log(reason)
    const announcement = `${users[socket.id]} left`;
    delete users[socket.id];
    io.emit('logout',
      {
        msg: new Msg('group', 'group', announcement),
        id: socket.id
      });
    console.log(announcement);
  });
  socket.on('sendmsg', (msg) => {
    if (msg.to === 'group') {
      socket.broadcast.emit('receivemsg', msg);
      return;
    }
    io.to(msg.to).emit('receivemsg', msg);
  });
  socket.on('initBingo', () => {
    const roomID = Math.random().toString(36).substring(7);
    socket.emit('okBingo', roomID);
  });
  socket.on('joinBingo', (roomID) => {
    socket.join(roomID);
    console.log(`User ${users[socket.id]} joined room ${roomID}`);
    if (io.sockets.adapter.rooms.get(roomID).size === 2) {
      io.to(roomID).emit('startBingo');
    }
  });

});

class Msg {
  constructor(to, from, body) {
    this.to = to; // 'group' or combination of two socket ids for private chat
    this.from = from; // socket_id, or 'announcement'
    this.body = body; // message body
  }
}