module.exports = function(http){
  const io = require('socket.io')(http, {
    cors: {
      origins: [
        'http://localhost:8080',
        'http://192.168.1.136:8080',
        'http://10.35.77.106:8080',
        'http://192.168.1.162:8080'
      ]
    }
  });
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      
    });
    socket.on('request_new_order', (msg)=>{
      io.emit('response_new_order', token);
    });

    socket.on('request_agent_entry', (token)=>{
      io.emit('response_agent_entry', token);
    });
  });
}