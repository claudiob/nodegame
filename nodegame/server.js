#!/usr/bin/env node

var SERVER_VERSION = '1.0'
// This is the entry point for the web application
// It creates a webserver and a gameserver

var sys           = require('sys')
  , fs            = require('fs')
  , parse_options = require('./server/options_parser').parse
  , WebServer     = require('./server/web_server').WebServer
  , SocketServer  = require('./server/socket_server').SocketServer

/**
 *  Entry point for server.
 *  @returns {undefined} Nothing.
 */
function main() {
  // Read the options from the command line, merged with the default values
  var options = parse_options()
  if (!options) return
  // Only clients whose CLIENT_VERSION matches SERVER_VERSION will be accepted
  options.server_version = SERVER_VERSION
  sys.puts('Starting server, version: ' + SERVER_VERSION)
  // The game server will update its state in the get_state function, so the
  // web server will be able to show it in the web page
  options.get_state = function() {}
  // Start the HTTP server (by default on http://127.0.0.1:8000)
  var webserver = WebServer(options)
  // Add to options, since the web socket needs to know what to connect to
  options.webserver = webserver
  // Add available games to options, since the web socket communicates them
  options.available_games = fs.readdirSync('server/games')
  // Opens a web socket on the same server
  var websocket = SocketServer(options)
}

main()
