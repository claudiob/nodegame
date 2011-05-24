// This module will inherit from a generic game module with default methods
// to provide rules, commands, world description...

var sys     = require('sys')
  , signals = require('../../../shared/signals')
  , match   = require('../../../utils/match').Match
  , _       = match.incl
  , GameLoop = require('../../../shared/game_loop').GameLoop

function TicTacToe(client) {
  if((this instanceof TicTacToe) === false) return new TicTacToe(client)
  this.client = client
  this.game_loop = null
  sys.puts('Client ' + this.client + ' joined TicTacToe')
  return this
}

//  Processes control message recieved from server.
TicTacToe.prototype.process_control_message = function(message) {
  var self = this
  return match (

    [signals.G_REQ_GAME_DATA], 
    function() {
      sys.puts('loop: ' + self.game_loop)
      // A client wants to play this game, so make sure the gameloop is running
      if (!self.game_loop) {
        sys.puts('Starting game loop for TicTacToe')
        self.game_loop = new GameLoop()
        self.game_loop.start()
      }
      // Then check whether all the tables are full or assign a free table
      // NOTE: For now, let's just assume ONE table
      
      sys.puts('Sending rules')
      self.client.post([signals.G_GAME_DATA, "The player who succeeds in placing three respective marks in a horizontal, vertical, or diagonal row wins the game."])
    },
  
    function(msg) {
      sys.puts('Unrecognized message: ' + msg)
    }
  )(message)
}

// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.GameServer = TicTacToe
}
