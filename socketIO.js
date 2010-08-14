var url = require('url'),
		sys = require('sys'),
		options = require('./vendor/socket.io-node/lib/socket.io/utils').options,
		Client = require('./vendor/socket.io-node/lib/socket.io/client'),
		transports = {
			'flashsocket': require('./vendor/socket.io-node/lib/socket.io/transports/flashsocket'),
			'htmlfile': require('./vendor/socket.io-node/lib/socket.io/transports/htmlfile'),
			'websocket': require('./vendor/socket.io-node/lib/socket.io/transports/websocket'),
			'xhr-multipart': require('./vendor/socket.io-node/lib/socket.io/transports/xhr-multipart'),
			'xhr-polling': require('./vendor/socket.io-node/lib/socket.io/transports/xhr-polling')
		},

    Server = require("connect").Server;

exports.socketIO = function (options, connectionCallback) {
  var options, connectionCallback;
  if (arguments.length === 1) {
    if (typeof arguments[0] === "function") {
      connectionCallback = arguments[0];
      options = {};
    } else {
      options = arguments[0];
      connectionCallback = function () {};
    }
  } else if (arguments.length === 2){
    options = arguments[0];
    connectionCallback = arguments[1];
  } else {
    throw "Wrong number of arguments";
  }

  var listener;
  var handle = function (req, res, next) {
    if (req.upgrade) {
      var head = next;
      if (!listener.check(req, res, true, head)){
        socket.destroy();
      }
    } else {
      if (listener.check(req, res)) {
        return;
      } else {
        next();
      }
    }
  };
  // Hook called after Server.use(...)
  handle.accessServer = function (server) {
    listener = this._socketIOListener = new Listener(server, options);
    listener.on("connection", connectionCallback);
    server.addListener("upgrade", function (req, socket, head) {
      server.handle(req, socket, head);
    });
  };
  return handle;
};

var Listener = function (server, options) {
  process.EventEmitter.call(this);
  var self = this;
  this.server = server;
	this.options({
		origins: '*:*',
		resource: 'socket.io',
		transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling'],
		transportOptions: {
			'xhr-polling': {
				timeout: null, // no heartbeats for polling
				closeTimeout: 8000,
				duration: 20000
			}
		},
		log: function(message){
			require('sys').log(message);
		}
	}, options);
	this.clients = [];
	this.clientsIndex = {};
	
	for (var i in transports){
		if ('init' in transports[i]) transports[i].init(this);
	}
	
	this.options.log('socket.io ready - accepting connections');
};

sys.inherits(Listener, process.EventEmitter);
for (var i in options) Listener.prototype[i] = options[i];

Listener.prototype.broadcast = function(message, except){
	for (var i = 0, l = this.clients.length; i < l; i++){
		if (this.clients[i] && (!except || [].concat(except).indexOf(this.clients[i].sessionId) == -1)){
			this.clients[i].send(message);
		}
	}
	return this;
};

Listener.prototype.check = function(req, res, httpUpgrade, head){
	var path = url.parse(req.url).pathname, parts, cn;
	if (path.indexOf('/' + this.options.resource) === 0){	
		parts = path.substr(1).split('/');
		if (parts[2]){
			cn = this._lookupClient(parts[2]);
			if (cn){
				cn._onConnect(req, res);
			} else {
				req.connection.end();
				this.options.log('Couldnt find client with session id "' + parts[2] + '"');
			}
		} else {
			this._onConnection(parts[1], req, res, httpUpgrade, head);
		}
		return true;
	}
	return false;
};

Listener.prototype._lookupClient = function(sid){
	return this.clientsIndex[sid];
};

Listener.prototype._onClientConnect = function(client){
	if (!(client instanceof Client) || !client.sessionId){
		return this.options.log('Invalid client');
	}
	client.i = this.clients.length;
	this.clients.push(client);
	this.clientsIndex[client.sessionId] = client;
	this.options.log('Client '+ client.sessionId +' connected');
	this.emit('clientConnect', client);
	this.emit('connection', client);
};

Listener.prototype._onClientMessage = function(data, client){
	this.emit('clientMessage', data, client);
};

Listener.prototype._onClientDisconnect = function(client){
	this.clientsIndex[client.sessionId] = null;
	this.clients[client.i] = null;
	this.options.log('Client '+ client.sessionId +' disconnected');
	this.emit('clientDisconnect', client);
};

Listener.prototype._onConnection = function(transport, req, res, httpUpgrade, head){
	if (this.options.transports.indexOf(transport) === -1 || (httpUpgrade && !transports[transport].httpUpgrade)){
		httpUpgrade ? res.destroy() : req.connection.destroy();
		return this.options.log('Illegal transport "'+ transport +'"');
	}
	this.options.log('Initializing client with transport "'+ transport +'"');
	new transports[transport](this, req, res, this.options.transportOptions[transport], head);
};
