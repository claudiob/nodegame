// This module will inherit from a generic game module with default methods
// to provide rules, commands, world description...

var sys      = require('sys')
  , signals  = require('../../../shared/signals')
  , match    = require('../../../utils/match').Match
  , _        = match.incl
  , GameLoop = require('../../../shared/game_loop').GameLoop
  // , World    = require('world').World

function RockPaperScissors() {
  // NOTE: Is the following line necessary?
  if((this instanceof RockPaperScissors) === false) return new RockPaperScissors()
  this.players     = []
  this.game_loop   = null
  // this.world       = null
  this.max_players = 2
  sys.puts('Client ' + this.client + ' joined RockPaperScissors')

  // Create the world instance
  // this.world = new World(true)
  // this.world.max_players = 2

  return this
}

// Make sure that a game loop for this game is running
RockPaperScissors.prototype._start_game_loop_if_stopped = function() {
  var self = this
  if (!self.game_loop) {
    sys.puts('Starting game loop for RockPaperScissors')

    // world.build() // Reset game world (put walls, blocks etc)

    self.game_loop = new GameLoop(0, function() {
      // List of actions the server will execute at each game tick
      // E.g.:
      // sys.puts('Running RockPaperScissors')
      // world.update(t, dt);
      // check_rules(t, dt);
      // post_update();
      // flush_queues();
    })
    self.game_loop.start()
  }
}

//  Processes control message recieved from server.
RockPaperScissors.prototype.process_control_message = function(message) {
  var self = this
  return match (

    [signals.G_REQ_GAME_DATA, _], function(player) {
      // A client wants to play this game, so make sure the gameloop is running
      self._start_game_loop_if_stopped()
      // Then check whether all the tables are full or assign a free table
      // NOTE: For now, let's just assume ONE table
      if(self.players.length >= self.max_players) {
        player.post([signals.G_GAME_FULL])
      } else {
        // NOTE: For now add player here, but it should go in the join function
        self.players.push(player)
        player.post([signals.G_GAME_DATA, "The objective is to select a gesture which defeats that of the opponent."])
      }
    },
  
    [signals.G_REQ_JOIN_GAME, _], function(player) {
      // Check whether all the tables are full or assign a free table
      // NOTE: For now, let's just assume ONE table
      if(self.players.length >= self.max_players) {
        player.post([signals.G_GAME_FULL])
      } else {
        self.players.push(player)
        player.post([signals.G_JOIN_GAME, "Current score: 0-0"])
      }
    },
  
    function(msg) {
      sys.puts('Unrecognized message: ' + msg)
    }
  )(message)
}

// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.GameServer = RockPaperScissors
}
