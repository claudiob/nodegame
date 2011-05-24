// This module should not know anything about games.
// It's just the socket layer, that keeps the connection
// open and then passes the message to the game server

var sys     = require('sys')
  , assert  = require('assert')
  , io      = require('socket.io')
  , signals = require('../shared/signals')


function SocketServer(options) {
  // Check for valid HTTP and available games
  assert.notEqual(typeof options.webserver, 'undefined')
  assert.notEqual(typeof options.available_games, 'undefined')

  var connections    = {}
  var no_connections = 0
  var connection_id  = 0
  var socket         = io.listen(options.webserver)
  var games          = {}

  // Update the state of the server
  options.get_state = function() { return {
      socket_host : options.host
    , socket_port : options.http_port
  }}
  // The socket listen to 3 events: 'connection', 'message', 'disconnect' 
  socket.on('connection', function(client){

    // All the socket communication is through JSON
    client.post = function(data) {
      client.send(JSON.stringify(data))
    }
    
    // Returns a String representation of a client
    client.toString = function() {
      return 'Client ' + this.id
    }
    
    // Check for valid max_connections
    sys.puts('on connection: ' + no_connections)
    assert.notEqual(typeof options.max_connections, 'undefined')
    // Close if there are too many open connections on the socket
    if (no_connections >= options.max_connections) { 
      client.post([signals.S_REQ_DISCONNECT, 'Too many connections'])
      return
    }
    // Otherwise add to the list of connections
    while (connections[++connection_id]);
    client.id = connection_id
    connections[client.id] = client
    no_connections++
    sys.puts(no_connections + ' open connections')
    
    client.on('message', function(data){
      var packet = JSON.parse(data)
      switch (packet[0]) {

        case signals.S_ACK_CONNECT:
          // The socket connection has been established
          // Now let the client pick one of the available games
          // TODO: Here I should not just send the filenames, but the name of
          // each game together with the number of available tables/seats
          // optionally filtering out from selection games with no free seats
          client.post([signals.S_REQ_SELECT_GAME, options.available_games])
          break

        case signals.S_SELECT_GAME:
          module_name = packet[1]
          // The game has been chosen, now all the communications go there
          sys.puts('Game chosen! ' + module_name)
          // Check if this game is already running, otherwise add to the list
          if(!(module_name in games))
            games[module_name] = new require('./games/' + module_name).GameServer()
          games[module_name].process_control_message([signals.G_REQ_GAME_DATA, client])
          break

        default:
          // Let the game server take control of the communcation
          module_name = packet[1]
          assert.notEqual(typeof games[module_name], 'undefined')
          games[module_name].process_control_message(packet)
          break
      }
    }) 

    client.on('disconnect', function(){
      sys.puts('on disconnect')
      if (client.id && connections[client.id]) {
        delete connections[client.id]
        no_connections--
        sys.puts(client + ' disconnected (Reason: closed by client)')
      }

    }) 
  })
  return this
}
  

// Make sure that the game module is loaded or add it to the list
SocketServer.prototype._start_game_if_stopped = function(module_name, client) {
  var self = this
  if(!(module_name in self.games))
    self.games[module_name] = new require('./games/' + module_name).GameServer(client)
  return self.games[module_name]
}

  
// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.SocketServer = SocketServer
}

