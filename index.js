const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
 // socket.on("hello", (arg) => {
 //   io.emit('hello', arg);
 // });
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('join', msg => {
    socket.name = msg
    io.emit('join', socket.name + " has joined the chat");

    //has do be reworked!
    io.emit('hello', socket.name);
  });

  socket.on('disconnect', () => {
    io.emit('join', socket.name + " has left the chat");
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
