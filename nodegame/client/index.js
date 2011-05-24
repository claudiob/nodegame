
// Only clients whose CLIENT_VERSION matches SERVER_VERSION will be accepted
var CLIENT_VERSION = '1.0'

// Default client options.
// Can be changed from the console typing client.options[OPTION_NAME] = value
var DEFAULT_CLIENT_OPTIONS = { 
    name:              get_random_name()
}

/**
 *  Returns a random player name
 */
function get_random_name() {
  names = [ 'Mark'
          , 'John'
          , 'Brian'
          , 'Alex'
          , 'Dylan'
          , 'Victor'
          , 'Carl'
          , 'Ken'
          , 'Leo'
          , 'Tom'
          , 'Sam'
          , 'Stephan'
  ]
  return names[Math.floor(Math.random() * names.length)];
}
