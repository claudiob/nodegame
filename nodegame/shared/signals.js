// This module is shared between client and server because it provides the
// signals with which they communicate with each other


// socket related (S_)
var S_ACK_CONNECT     = 1
var S_REQ_DISCONNECT  = 2
var S_REQ_SELECT_GAME = 3
var S_SELECT_GAME     = 4
//var S_REQ_VERSION   = 5

// Game related (G_)
var G_REQ_GAME_DATA = 11
var G_GAME_DATA     = 12
var G_REQ_JOIN_GAME = 13
var G_JOIN_GAME     = 14
var G_GAME_FULL     = 15



// Common functions
function get_time() {return new Date().getTime()}

// Packet types
// var GAME_PACKET     = 2
// var PING_PACKET     = 1

// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.S_ACK_CONNECT     = S_ACK_CONNECT
  exports.S_REQ_DISCONNECT  = S_REQ_DISCONNECT
  exports.S_REQ_SELECT_GAME = S_REQ_SELECT_GAME
  exports.S_SELECT_GAME     = S_SELECT_GAME
  //exports.S_REQ_VERSION   = S_REQ_VERSION
  
  exports.G_REQ_GAME_DATA = G_REQ_GAME_DATA
  exports.G_GAME_FULL     = G_GAME_FULL
  exports.G_GAME_DATA     = G_GAME_DATA
  exports.G_REQ_JOIN_GAME = G_REQ_JOIN_GAME
  exports.G_JOIN_GAME     = G_JOIN_GAME
  
  exports.get_time = get_time
  
  //exports.GAME_PACKET = GAME_PACKET
  //exports.PING_PACKET = PING_PACKET
}
