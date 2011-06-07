Socket.IO-connect Connect WebSocket Middleware Wrapper Around Socket.IO-node
============================================================================
Leverage the power of [Connect](http://github.com/senchalabs/Connect) middleware from [Socket.IO-node](http://github.com/LearnBoost/Socket.IO-node).

## Installation
    npm install socket.io-connect

## How To Use
Method 1:

```javascript
var connect = require('connect')

  // Setup your server with middleware
  , server = connect.createServer(
      connect.cookieParser(),
      connect.session({ secret: "your secret", fingerprint: "" })
    )
  , io = require('socket.io-connect');

server.listen(8000); // Listen for requests

var socket = io.listen(server); // Wrap your connect server with Socket.IO

// socket.prefixWithMiddleware punts the client's request down
// the Connect middleware if there is a Socket.IO 'connection' event
socket.on('connection', socket.prefixWithMiddleware( function (client, req, res) {
  console.log(req.session); // Access to the session!!!!
}));

// If there's no 'connection' event, then the request gets passed to
// the regular middleware
```

Method 2:

```javascript
var connect = require('connect')
  , socketIOconnect = require("socket.io-connect").socketIOconnect;

// Setup your server with middleware
var server = connect.createServer(
      // socketIOconnect "middleware" does the same as Method 1 but more idiomatically
      // Always have socketIO middleware come first, so it can setup the socket.IO endpoint
      socketIOconnect( function () { return server; }, function (client, req, res) {
        client.send(req.session.toString()); // Send the client their session
      }),
      connect.cookieParser(),
      connect.session({ secret: "your secret", fingerprint: "" })
    );

server.listen(8000); // Listen for requests
```

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

---
### Author
Brian Noguchi

### With fixes from

- [kazuyukitanimura](https://github.com/kazuyukitanimura)

### MIT License
Copyright (c) 2011 by Brian Noguchi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
