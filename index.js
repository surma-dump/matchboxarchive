var deployd = require('deployd');

var server = deployd({
  port: process.env.PORT || 5000,
  env: process.env.ENV || 'production',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 27017,
    name: process.env.DB_NAME || 'matchboxarchive',
    credentials: {
      username: process.env.DB_USER || '',
      password: process.env.DB_PASS || ''
    }
  }
});

server.listen();

server.on('listening', function() {
  console.log("Server is listening");
});

server.on('error', function(err) {
  console.error(err);
  process.nextTick(function() { 
    process.exit();
  });
});