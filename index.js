var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash-node');

app.get('/', function (req, res){
  res.header('Access-Control-Allow-Origin', '*');
  res.send(io.sockets.adapter.rooms);
});

io.on('connection', function (socket) {
  socket.on('login', function (stream) {
    var viewers = Object.keys(io.in(stream).clients().connected).length;
    console.log(stream + ' with viewers: ' + viewers);

    if(viewers === 1) {
      socket.join(stream);
      socket.emit('messageReceived', { newStream: stream });
      console.log('created new stream ' + stream);
    } else {
      socket.join(stream);
      socket.emit('joined', stream);
      io.in(stream).emit('join', socket.id);
      console.log('join ' + socket.id);
    }
  });

  socket.on('sendMessage', function (user, message) {
    console.log('User: ' + user + ' - Message: ' + message);
    io.to(user)
      .emit('messageReceived', { user: socket.id, message: message });
  });

  socket.on('disconnect', function (stream) {
    socket.leave(stream);
  });
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});
