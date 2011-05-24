// requires <script src="/socket.io/socket.io.js"></script>
// requires <script src="shared/signals.js"></script>
// requires <script src="game_client.js"></script>

// This module wraps around socket.io, so that if we decide to change the
// library for websockets, the external methods are not changed

function SocketClient() {
  this.iosocket          = null
  this.disconnect_reason = null
  this.pass_messages_to  = null
  this.afterConnect      = function() {}
  this.afterMessage      = function() {}
  this.afterDisconnect   = function() {}
  this.promptChoice      = function() {}
  this.afterChoice       = function() {}
  this.afterLog          = function() {}
  this.afterDraw         = function() {}
}

// All the socket communication is through JSON
io.Socket.prototype.post = function(data) {
  this.send(JSON.stringify(data))
}  

// Invoked by a client to open a connection to a socket
SocketClient.prototype.join = function(host, port) {
  var self = this
  // Initialize a socket.io connection to the server
  self.iosocket = new io.Socket(host, {port: port}) 

  // Actions to perform when the connection starts
  self.iosocket.on('connect', function(){
    console.log('on connect')
    this.post([S_ACK_CONNECT]) // Acknowledge the server
    self.afterConnect() // DOM actions to perform                 
  }) 

  // Actions to perform when the connection ends
  self.iosocket.on('disconnect', function(){
    console.log('on disconnect: ' + self.disconnect_reason)                        
    self.afterDisconnect(self.disconnect_reason) // DOM actions to perform                 
  }) 

  // Actions to perform when a message is received
  self.iosocket.on('message', function(data){
    console.log('on message: ' + data)
    var packet = JSON.parse(data)
    switch (packet[0]) {

      case S_REQ_DISCONNECT:
        self.log('S_REQ_DISCONNECT')
        // the server invites the client to disconnect
        // (e.g.: when the server has too many open connections)
        self.disconnect_reason = packet[1]
        this.disconnect()
        break

      case S_REQ_SELECT_GAME:
        // the server invites the client to select one of the available games
        self.promptChoice(S_SELECT_GAME, packet[1])
        break

      //
      // NOTE: From here one, the cases should be dealt by the game, not socket
      //
      
      case G_GAME_DATA:
        // The server sends all the data required to draw the world
        self.log('Game data received')
        // var world = new World(false)
        // world.build()
        // client.log('World data loaded...');
        // client.set_world(world);
        // client.set_state(CLIENT_CONNECTED);
        self.draw(packet[1])
        break

      case G_GAME_FULL:
        // The client sent G_REQ_JOIN_GAME but the game was full
        self.log('The game is full!')
        break

      
      case G_JOIN_GAME:
        // The server sends the current state of the world, so the player can join
        self.log('Game state received')
        client.world.set_state(state, players, powerups);
        client.set_player(client.world.players[my_id]);
        client.start_gameloop(client.world.tick);


        // client.log('World data loaded...');
        // client.set_world(world);
        // client.set_state(CLIENT_CONNECTED);

        self.draw(packet[1])
        break


      default:
        // The socket connection has been established
        // Now let the game server take control
        self.pass_messages_to.process_control_message([packet, self])
        break

      // case S_REQ_VERSION:
      //   console.log('Received S_REQ_VERSION')
      //   break
      // 
      // default:
      //   console.log('Unrecognized message: ' + packet)
      //   break
    }
    self.afterMessage(data) // DOM actions to perform
  }) 

  // Connect!
  self.iosocket.connect()
}

// Invoked by a client to return a choice selection
SocketClient.prototype.choose = function(signal, choice) {
  var self = this
  self.iosocket.post([signal, choice]) // Send to the server
  self.afterChoice()
}

SocketClient.prototype.draw = function(world) {
  var self = this
  self.afterDraw(world)
}

// Invoked by a client to return a choice selection
SocketClient.prototype.log = function(msg) {
  if (window.console) console.log(msg)
  this.afterLog(msg)
}
