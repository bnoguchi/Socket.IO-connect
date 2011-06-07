var io = exports = module.exports = require('socket.io');

io.Listener.prototype.prefixWithMiddleware = function (fn) {
  var self = this;
  return function (client) {
    var dummyRes = { writeHead: null, setHeader: function () {} };
    // Throw the request down the Connect middleware stack
    // so we can use Connect middleware for free.
    self.server.handle(client.request, dummyRes, function () {
      fn(client, client.request, client.request.res);
    });
  };
};

exports.socketIOconnect = function (serverLambda, options, connectionCallback) {
  var options, connectionCallback;
  if (arguments.length === 2) {
    if (typeof arguments[1] === "function") {
      connectionCallback = arguments[1];
      options = {};
    } else {
      options = arguments[1];
      connectionCallback = function () {};
    }
  } else if (arguments.length === 3){
    options = arguments[1];
    connectionCallback = arguments[2];
  } else {
    throw new Error("Wrong number of arguments");
  }

  var listener;
  return function (req, res, next) {
    if (!listener) {
      listener = io.listen(serverLambda(), options);
      listener.on('connection', listener.prefixWithMiddleware(connectionCallback));
    }
    next();
  };
};
