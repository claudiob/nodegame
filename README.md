ViewPort
========

ViewPort is independent from the game, when it's created it has its own 
setTimeout that redraws all the elements inside the camera box.

On the other hand, the gameloop (in the ontick, so every game tick) runs 
world.update which only changes the values of pos, vel, angle... so when
viewport redraws them, they have changed.

So first there is world, with its entities. The gameloop changes their values,
while the viewport uses their values to display polygons on the canvas.

The code however is written so that viewport is independent, with an ondraw
method that the client then overrides making it update the world.

ViewPort is tied to HTML Canvas because of the way it's spawned, however this
relationship can be abstracted, providing a layer of common methods. Some are
already abstract (`draw_triangle`, `draw_label`), others need to be (fillRect, 
beginPath)

World entities
==============

How do entities come into play?

* Ship: `world.set_state` (initializing) or `world.spawn_player` (after death)
* Bullet: `world.fire_player_cannon`
* Wall: World.prototype.build
* Block: World.prototype.build
* Powerup: `world.set_state` (initializing) or `world.spawn_powerup` (after use)

How do entities disappear from play?

* Ship: `world.remove_player` (when a player disconnects), `world.kill_player`, `world.set_round_state(ROUND_STARTING)`, `world.set_round_state(ROUND_FINISHED)`, or in `world.remove_destroyed_entities` after [Ship, Bullet], [Ship, Wall], [Ship, Block] or [Ship, Ship] collide
* Bullet: as a consequence of `world.remove_player`, or in `world.remove_destroyed_entities` after (this.lifetime <= t) or [Bullet, Wall] or [Bullet, Block] collide
* Wall: (never)
* Block: (never)
* Powerup: `world.set_round_state(ROUND_WARMUP)`, `world.kill_powerup`, or in `world.remove_destroyed_entities` after [Ship, Powerup] collide


For instance, a bullet comes into play when the client processes the input and
finds the right key pressed, hence sets player.action to SHOOT. Then in the
gameplay, world.update is called, which calls world.update_state, which calls
`world.fire_player_cannon`, which calls add_entity, which pushes the bullet to
the world entities. Then 

WPilot
------
Welcome to WPilot server. A proof-of-concept remake of the old classic game XPilot (http://www.xpilot.org/), this time in your web browser. The game uses
new fancy HTML5 features such as WebSocket and Canvas to make it possible.

Please visit project homepage for more details. http://jfd.github.com/wpilot/


Server requirements
-------------------
You need Node.js in order to run the server. Download (or clone) Node.js at http://nodejs.org/

Quick start
-----------
You can start the game- and client server by typing:

	./wpilots.js
		
For more more switched, start the server with the '-H' 

Special thanks to
-----------------
Emanuel Dahlberg (http://github.com/EmanueI)
Linus Larsson (http://github.com/lahjnus)


License
-------
See LICENSE for more info


Copyright
---------
Copyright (c) 2010 Johan Dahlberg