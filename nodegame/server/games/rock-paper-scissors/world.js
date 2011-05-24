
function World(server_mode) {
  // this.on_before_init();
  this.max_players = 0;
  this.no_players = 0;
  this.no_ready_players = 0;
  // this.entity_count = 1;
  // this.entities = {};
  // this.players = {};
  // this._entities = [];
  // this.server_mode = server_mode || false;
  // this.powerups = {};
  // this.powerup_count = 0;
  // this.powerup_next_spawn = 0;
  // this.powerup_id_incr = 0;
  // this.map_data = null;
  // this.map_name = '';
  // this.player_spawn_points = [];
  // this.powerup_spawn_points = [];
  // this.on_after_init();
}

// // Placeholder for on_before_init event
// World.prototype.on_before_init = function() {}
// 
// // Placeholder for the on_after_init event
// World.prototype.on_after_init = function() {}

// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.World = World
}