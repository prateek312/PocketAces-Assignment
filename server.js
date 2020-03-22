'use strict';
/** @module server */


/** Module import */
var config = require('./config');

var server = require('./app.js');

/** Global Vars */
var HOST = config.ENV.HOST;
var PORT = config.ENV.PORT;

// default value.
var listener;

listener = server.listen(PORT, HOST);

console.log('[server] server started');
console.log('[server] Started ' + config.ENV.ENV_NAME + ' server...');
console.log('[server] Listening at http://' + HOST + ':' + PORT);
server.emit('started');