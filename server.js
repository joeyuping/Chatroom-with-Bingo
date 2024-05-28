import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
    // because using different ports for socket.io and express, need to allow all origins
  }
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
  socket.on('login', (data) => {
    users[socket.id] = data.nickname;
    socket.join('group');
    io.to('group').emit('loginout',
      {
        msg: new Msg('group', 'announcement', `${users[socket.id]} joined the chat`),
        users
      });
    console.log(`${users[socket.id]} connected`);
  });
  // remove user from users object when they disconnect
  socket.on('disconnect', () => {
    console.log(`${users[socket.id]} disconnected`);
    io.to('group').emit('loginout',
      {
        msg: new Msg('group', 'announcement', `${users[socket.id]} left the chat`),
        users
      });
    delete users[socket.id];
  });
  socket.on('sendmsg', (msg) => {
    if (msg.mode === 'group') {
      socket.broadcast.emit('receivemsg', msg);
    } else {
      io.to(msg.mode).emit('receivemsg', msg);
    }
  });
});

class Msg {
  constructor(mode = null, from, text) {
    this.mode = mode; // 'group' or combination of two socket ids for private chat
    this.from = from; // from_socket_id, or 'announcement'
    this.text = text; // message text
  }
}