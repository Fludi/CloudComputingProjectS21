const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  io.emit('chat message', 'A user has joined the chat');
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    io.emit('chat message', 'A user has left the chat');
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
