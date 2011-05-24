var sys             = require('sys')
  , optparse        = require('../utils/optparse')
  , mixin           = require('../utils/mixin').mixin

const DEFAULT_SERVER_OPTIONS = { 
    debug:                true
  , name:                 'WPilot Server'
  , host:                 '127.0.0.1'
  , region:               'n/a'
  , admin_password:       null
  , map:                  null
  , pub_host:             null
  , http_port:            8000
  , ws_port:              6114
  , pub_ws_port:          null
  , max_connections:      4 //60
  , max_players:          8
  , max_rate:             5000
  , r_respawn_time:       400
  , r_reload_time:        15
  , r_shoot_cost:         300
  , r_shield_cost:        30
  , r_energy_recovery:    30
  , r_round_limit:        10
  , r_suicide_penelty:    1
  , r_kill_score:         1
  , r_powerup_max:        2
  , r_powerup_respawn:    600
  , r_powerup_spread_t:   700
  , r_powerup_rapid_t:    600
  , r_powerup_rico_t:     600
}

// Command line option parser switches
const SWITCHES = [
  ['-d', '--debug',               'Enables debug mode (Default: false)'],
  ['-H', '--help',                'Shows this help section'],
  ['--name NAME',                 'The name of the server.'],
  ['--host HOST',                 'The host adress (default: 127.0.0.1).'],
  ['--region REGION',             'Set region of this server. This info is displayed in the global server list (default: n/a).'],
  ['--admin_password PASSWORD',   'Admin password (default: "none").'],
  ['--map PATH',                  'Path to world map (default: built-in map).'],
  ['--pub_host HOST',             'Set if the public host differs from the local one'],
  ['--http_port PORT',            'Port number for the HTTP server. Disable with 0 (default: 8000)'],
  ['--ws_port PORT',              'Port number for the WebSocket server (default: 6114)'],
  ['--pub_ws_port PORT',          'Set if the public WebSocket port differs from the local one'],
  ['--max_rate NUMBER',           'The maximum rate per client and second (default: 1000)'],
  ['--max_connections NUMBER',    'Max connections, including players (default: 60)'],
  ['--max_players NUMBER',        'Max connected players allowed in server simultaneously (default: 8)'],
  ['--r_respawn_time NUMBER',     'Rule: Player respawn time after death. (Default: 500)'],
  ['--r_reload_time NUMBER',      'Rule: The reload time after fire. (Default: 15)'],
  ['--r_shoot_cost NUMBER',       'Rule: Energy cost of shooting a bullet. (Default: 800)'],
  ['--r_shield_cost NUMBER',      'Rule: Energy cost of using the shield. (Default: 70)'],
  ['--r_energy_recovery NUMBER',  'Rule: Energy recovery unit (Default: 40)'],
  ['--r_round_limit NUMBER',      'Rule: Round score limit (Default: 10)'],
  ['--r_suicide_penelty NUMBER',  'Rule: The cost for suicides (Default: 1)'],
  ['--r_kill_score NUMBER',       'Rule: The price of a kill (Default: 1)'],
  ['--r_powerup_max NUMBER',      'Rule: Max no of powerups to spawn (Default: 3)'],
  ['--r_powerup_respawn NUMBER',  'Rule: Time between powerup respawns (Default: 1200)'],
  ['--r_powerup_spread_t NUMBER', 'Rule: Time before the spread powerup decline (Default: 700)'],
  ['--r_powerup_rapid_t NUMBER',  'Rule: Time before the rapid fire powerup decline (Default: 600)'],
  ['--r_powerup_rico_t NUMBER',   'Rule: Time before the ricoshet powerup decline (Default: 800)']
];


/**
 *  Parses and returns server options from ARGV.
 *  @returns {Options} Server options.
 */
function parse_options() {
  var parser  = new optparse.OptionParser(SWITCHES),
      result = { rules: {}, maps: []};
  parser.banner = 'Usage: server.js [options]';

  parser.on('help', function() {
    sys.puts(parser.toString());
    parser.halt();
  });
  
  parser.on('map', function(prop, value) {
    result.maps.push(value);
  });
  
  parser.on('*', function(opt, value) {
    var match = opt.match(/^r_([a-z_]+)/);
    if (match) {
      result.rules[match[1]] = value;
    }
    result[opt] = value || true;
  });      
  
  parser.parse(process.ARGV);
  return parser._halt ? null : mixin(DEFAULT_SERVER_OPTIONS, result);
}


// Exporting for node.js (server)
if(typeof(exports) !== 'undefined' && exports !== null) {
  exports.parse = parse_options
}

