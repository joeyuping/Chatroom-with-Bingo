import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',    // because using different ports for socket.io and express, need to allow all origins
  }
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))

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
    socket.broadcast.emit('receivemsg', { msg: `${users[socket.id]} connected` });
    console.log(`${users[socket.id]} connected`);
  });
  socket.on('group-sendmsg', (data) => {
    io.emit('group-receivemsg', { msg: data.msg, id: data.id });
  });
});