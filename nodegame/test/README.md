What should I test
==================

webserver.js
------------

* Requesting '/' should return 200 OK
* Requesting '/state' should return application/json

socket_server.js
----------------

* Opening a websocket to the server should work
* Opening more than max_connections should disconnect the last one with the message 'Too many connections'
* Opening max_connections, closing one and opening a new one should work

game_server.js
--------------

* Joining a game that's not running also starts the game (and game loop)
* When the first 2 players join tic-tac-toe, everything works
* When the third player joins tic-tac-toe, alert that 'The game is full'

