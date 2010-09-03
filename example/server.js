var connect = require('connect'), 
		sys = require('sys'),
    url = require('url'),
    socketIO = require("../socketIO").socketIO,
    
    buffer = [];
	
var server = connect.createServer(
  connect.staticProvider(__dirname),
  socketIO( function (client) {
    client.send(JSON.stringify({ buffer: buffer }));
    client.broadcast(JSON.stringify({ announcement: client.sessionId + ' connected' }));

    client.on('message', function(message){
      var msg = { message: [client.sessionId, message] };
      buffer.push(msg);
      if (buffer.length > 15) buffer.shift();
      client.broadcast(JSON.stringify(msg));
    });

    client.on('disconnect', function(){
      client.broadcast(JSON.stringify({ announcement: client.sessionId + ' disconnected' }));
    });
  }),
  function (req, res) {
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path){
      case '/':
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
        res.end();
        break;
    }
  }
);
server.listen(8080);
