var socket = io(); //建立socket連向server
const id = generateRandomNumber();

/*--------------socket事件--------------*/
socket.on('receivemsg', (data) => {
    //socket.on接收server端傳送過來的資料
    //第一個參數代表這筆資料是什麼名稱
    //第二個參數是call back function, 用來處理接收到的資料
    if(data.id != id){
        document.getElementById('receivemsg').innerText = data.msg;  //顯示收到的訊息
    }
});

function sendMsg(){
    let msg = document.getElementById('msg').value;
    document.getElementById('sendmsg').innerText = msg;
    socket.emit('sendmsg', {msg: msg, id: id});     //socket.emit(資料名稱, 資料)傳送訊息給server端
}
function generateRandomNumber() {
    var min = Math.pow(10, 9);
    var max = Math.pow(10, 10) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}