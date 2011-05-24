// This module is shared between client and server because both instantiate
// GameLoop:
// - The server runs ONE game loop for each running game, and at each tick
//   sends out the information to the players
// - Each player runs ONE game loop as well, and at each tick processes the
//   user input and updates the world
// In this way, the game is syncronized among server and multiple clients

var sys     = require('sys')

var DT = 0.017 // duration of a game loop tick

/**
 *  The acutal game loop.
 *  @param {Number} tick The initial tick
 *  @param {function} on_tick The function to execute at every tick
 *  @return {undefined} Nothing
 */
function GameLoop(tick, on_tick) {
  sys.puts("GameLoop")
  this.on_tick = on_tick || function() {}
  this.on_done = function() {}
  this._pid    = null
  this._kill   = false
  this.tick    = tick || 0
}

// Starts the game loop, which invokes the 'on_done' function at every tick
// TODO: Improve this desc, explain the difference between on_tick and on_done
GameLoop.prototype.start = function() {
  sys.puts("GameLoop start")
  var self         = this
    , on_tick      = self.on_tick
    , on_done      = self.on_done
    , accumulator  = 0
    , dt           = DT
    , current_time = new Date().getTime()

  this._kill = false
  
  self._pid = setInterval(function() {
    // TODO: Refactor this function, useless calculations present
    var new_time = new Date().getTime()
    var delta = (new_time - current_time) / 1000
    current_time = new_time
    if (delta > 0.25) delta = 0.25
    accumulator += delta
    while (accumulator >= dt) {
      accumulator -= dt
      on_tick(self.tick, dt)
      self.tick += dt
    }
    on_done(self.tick, dt, accumulator / dt)
  }, 10)
}


// Stops the game loop
GameLoop.prototype.kill = function() {
  sys.puts("GameLoop stop")
  this._kill = true
  if (this._pid) clearInterval(this._pid)
}

// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.GameLoop = GameLoop
}