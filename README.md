Socket.IO-connect Connect WebSocket Middleware Wrapper Around Socket.IO-node
============================================================================
Leverage the power of [Connect](http://github.com/senchalabs/Connect) middleware from [Socket.IO-node](http://github.com/LearnBoost/Socket.IO-node).

## Installation
    npm install socket.io-connect

## How To Use
Method 1:
    var connect = require('connect')
      , MemoryStore = require('connect/middleware/session/memory')

      // Setup your server with middleware
      , server = connect.createServer(
          connect.cookieDecoder(),
          connect.session({ store: new MemoryStore({ reapInterval: 60000 * 10}) })
        )
      , io = require('./path/to/socket.io');

    server.listen(8000); // Listen for requests

    var socket = io.listen(server); // Wrap your connect server with Socket.IO

    require('socket.io-connect');
    // socket.prefixWithMiddleware punts the client's request down
    // the Connect middleware if there is a Socket.IO 'connection' event
    socket.on('connection', socket.prefixWithMiddleware( function (client, req, res) {
      console.log(req.session); // Access to the session!!!!
    }));

    // If there's no 'connection' event, then the request gets passed to
    // the regular middleware

Method 2:
    var connect = require('connect')
      , MemoryStore = require('connect/middleware/session/memory')
      , socketIO = require("socket.io-connect").socketIO;

    // Setup your server with middleware
    var server = connect.createServer(
          // socketIO "middleware" does the same as Method 1 but more idiomatically
          // Always have socketIO middleware come first, so it can setup the socket.IO endpoint
          socketIO( function () { return server; }, function (client, req, res) {
            client.send(req.session.toString()); // Send the client their session
          }),
          connect.cookieDecoder(),
          connect.session({ store: new MemoryStore({ reapInterval: 60000 * 10}) })

        );

    server.listen(8000); // Listen for requests

## Example
I have re-implemented the example chat application from the Socket.IO-node github repo, using Connect and Socket.IO-connect.

To run this example using method 1:
	git clone http://github.com/bnoguchi/Socket.IO-connect.git --recursive
	cd Socket.IO-connect/example/
	node server1.js

To run this example using method 2:
	git clone http://github.com/bnoguchi/Socket.IO-connect.git --recursive
	cd Socket.IO-connect/example/
	node server2.js

and then point your browser to http://127.0.0.1:8080.
