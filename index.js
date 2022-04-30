// Requires
const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');

// Database
const { Sequelize, sequelize} = require('./db');





// Sockets.io
require('./startup/sockets')(http);
// Use
app.use(cors());
//Routes
require('./startup/routes')(app);


// Start server
// синхронизация с бд, после успшной синхронизации запускаем сервер
sequelize.sync().then(()=>{
  http.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
  });
}).catch(err=>console.log(err));