Socket.IO-connect Connect WebSocket Middleware Wrapper Around Socket.IO-node
============================================================================
Leverage the power of [Socket.IO-node](http://github.com/LearnBoost/Socket.IO-node) from a node.js [Connect](http://github.com/senchalabs/Connect) app.

Currently, this only works with a minimally modified patched version of Connect that has additions for the wrapper to work. You can find that patched fork [here](http://github.com/bnoguchi/Connect/tree/serverAccessFromHandle).

## Example
I have re-implemented the example chat application from the Socket.IO-node github repo, using Connect and Socket.IO-connect. To run this example:

  git clone http://github.com/bnoguchi/Socket.IO-connect --recursive
  cd Socket.IO-connect/example
  node server.js

and then point your browser to http://127.0.0.1:8080.
