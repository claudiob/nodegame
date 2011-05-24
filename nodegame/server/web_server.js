// This module starts an HTTP server on the host and port indicated in
// the options parsed by server.js. The server uses 'express' and serves
// all the files in the client/ folder as they are. The only exception is
// the /state requests which returns the state of the game server (in JSON)

var sys     = require('sys')
  , assert  = require('assert')
  , express = require('express')

function WebServer(options) {
  // Check for valid port (host is optional)
  assert.notEqual(typeof options.http_port, 'undefined')
  assert.notEqual(options.http_port, 0)
  // Create a webserver with express
  var app = express.createServer()
  // By default, use files in client/ to respond to requests
  app.use('/', express.static(__dirname + '/../client'));
  // Also serve the scripts shared with the server
  app.use('/shared', express.static(__dirname + '/../shared'));
  // A special case is /state: respond with the game server state
  app.get('/state', function(req, res) {
    res.contentType('application/json')
    res.send(JSON.stringify(options.get_state()))
  })
  app.listen(options.http_port, options.host)
  sys.puts('HTTP server at http://' + options.host + ':' + options.http_port)
  return app
}

// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.WebServer = WebServer
}
