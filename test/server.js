import { express } from "express";
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');

/*----- 建立http服務 -----*/
const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.static(__dirname + '/public'));     //提供靜態資源 public資料夾底下的檔案都能被瀏覽器訪問

/*----- 設定回應的網頁(index.html) -----*/
app.get('/',(req, res) => {
    res.sendFile(join(__dirname,'/public/html/index.html'));
});

/*----- 設定server監聽的port number(3000) -----*/
server.listen(3000,() =>{
    console.log('server running at http://localhost:3000');
});

/*----- 當server收到connection代表有人透過瀏覽器訪問 -----*/
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('sendmsg', (data) => {
        //socket.on接收client端傳送過來的資料
        //第一個參數代表這筆資料是什麼名稱
        //第二個參數是call back function, 用來處理接收到的資料
        io.emit('receivemsg', {msg: data.msg, id: data.id});  //向所有client端發送"receivemsg"這筆資料
    });
});