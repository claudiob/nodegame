/**
 *  Represents a keyboard device. 
 *  @param {DOMElement} target The element to read input from.
 *  @param {Object} options Options with .bindings
 */
function KeyboardDevice(target, options) {
  var self = this;
  var key_states = this.key_states = {};
  this.target = target;
  this.bindings = options.bindings;
  this.onkeypress = null;
  
  for (var i=0; i < 255; i++) {
    key_states[i] = 0;
  }
  
  key_states['shift'] = 0;
  key_states['ctrl'] = 0;
  key_states['alt'] = 0;
  key_states['meta'] = 0;

  target.onkeypress = function(e) {
    if (self.onkeypress) {
      self.onkeypress(e.keyCode || e.which);
      e.preventDefault();
    }
  };
  
  target.onkeydown = function(e) {
    if(key_states[e.keyCode] == 0) key_states[e.keyCode] = 1;
    if (!self.onkeypress) {
      e.preventDefault();
    }
  };

  target.onkeyup = function(e) {
    if(key_states[e.keyCode] > 0) key_states[e.keyCode] = 0;
    if (!self.onkeypress) {
      e.preventDefault();
    }
  };
}

KeyboardDevice.prototype.destroy = function() {
  this.target.onkeypress = null;
  this.target.onkeydown = null;
  this.target.onkeyup = null;
}

/**
 *  Returns current state of a defined key
 *  @param {String} name Name of defined key
 *  @return {NUmber} 1 if down else 0.
 */
KeyboardDevice.prototype.on = function(name) {
  var key = this.bindings[name];
  return this.key_states[key];
}

/**
 *  Returns current state of a defined key. The key is reseted/toggled if state
 *  is on.
 *  @param {String} name Name of defined key
 *  @return {NUmber} 1 if down else 0.
 */
KeyboardDevice.prototype.toggle = function(name) {
  var key = this.bindings[name];
  if (this.key_states[key] == 1) {
    this.key_states[key] = 2;
    return 1;
  }
  return 0;
}

/**
 *  Represents a canvas ViewportDevice.
 *  @param {DOMElement} target The canvas element 
 *  @param {Number} width The width of the viewport
 *  @param {Number} height The height of the viewport
 */
function ViewportDevice(target, width, height, options) {
  this.target       = target;
  this.ctx          = target.getContext('2d');
  this.camera       = { pos: [0, 0], size: [0, 0], scale: 1};
  this.w            = width;
  this.h            = height;
  this.options      = options;
  this.factor       = null;
  this.autorefresh  = false;
  this.frame_skip   = 1;
  this.frame_count  = 0;
  this.frame_time   = 0;
  this.current_fps  = 0;
  this.average_fps  = 0;

  // Event callbacks
  this.ondraw       = function(ctx) {};
  
  // Set canvas width and height
  target.width        = width;
  target.height       = height;
  
  // Start to draw things
  this.set_autorefresh(true);
}

ViewportDevice.prototype.destroy = function() {
  this.set_autorefresh = false;
  this.ctx.clearRect(0, 0, this.w, this.h);
}

/**
 *  Moves the camera focus to the specified point. 
 *  @param {x, y} A point representing the position of the camera
 *  @returns {undefined} Nothing
 */
ViewportDevice.prototype.set_autorefresh = function(autorefresh) {
  var self  = this;
  if (autorefresh != self.autorefresh) {
    self.autorefresh = autorefresh;
    self.frame_time = get_time();
    if (autorefresh) {
      function loop() {
        self.refresh(0);
        if (self.autorefresh) setTimeout(loop, 1);
      }
      loop();
    } 
  }
}

/**
 *  Moves the camera focus to the specified point. 
 *  @param {Vector} A vector representing the position of the camera
 *  @returns {undefined} Nothing
 */
ViewportDevice.prototype.set_camera_pos = function(vector) {
  this.camera.midpoint = vector;
  this.camera.pos = [vector[0] - (this.w / 2), vector[1] - (this.h / 2)];
  this.camera.size = [this.w, this.h];
  this.camera.scale = 1;
}

ViewportDevice.prototype.get_camera_box = function() {
  return {
    x: this.camera.pos[0],
    y: this.camera.pos[1],
    w: this.camera.size[0],
    h: this.camera.size[1]
  }
}
  
/**
 *  Translate a point into a camera pos.
 *  @param {Vector} The point that should be translated into camera pos
 *  @return The translated Point
 */
ViewportDevice.prototype.translate = function(vector) {
  return vector_sub(vector, this.camera.pos);
}

/**
 *  If necessary, refreshes the view.
 *
 *  FIXME: Need a better solution for frame skipping (if possible in JS).. 
 *         frame_skip +- 0 isnt good enough
 *  @param {Number} alpha A alpha number that can be used for interpolation
 *  @return {undefined} Nothing
 */
ViewportDevice.prototype.refresh = function(alpha) {

  this.draw();
  this.frame_count++;

  var time = get_time();
  var diff = time - this.frame_time;
  
  if (diff > 100) {
    this.current_fps = this.current_fps * 0.9 + (diff / 10) * this.frame_count * 0.1;
        
    this.frame_time = time;
    this.frame_count = 0;
    this.average_fps = this.current_fps;
  }  
}

/**
 *  Draws the scene.
 *  @return {undefined} Nothing
 */
ViewportDevice.prototype.draw = function() {
  var ctx = this.ctx;
  ctx.clearRect(0, 0, this.w, this.h);
  ctx.save();
  ctx.translate(0, 0);
  this.ondraw(ctx);
  ctx.restore();
}


/**
 *  Represents a keyboard device. 
 *  @param {DOMElement} target The element to read input from.
 *  @param {Object} options Options with .bindings
 */
function SoundDevice(options){
  this.BG_SOUND = '_bgsound';

  this.sounds = {};
  this.destroyed = false;
  
  this.bg_sound_enabled = options.bg_sound_enabled;
  this.sfx_sound_enabled = options.sfx_sound_enabled;
  
  try{
    this.supported = (new Audio()) !== undefined;
  }catch(e){
    this.supported = false;
  }
  
  this.m4a = false;
  
  if (this.supported && 
      /AppleWebKit/.test(navigator.userAgent) &&
      !(/Chrome/.test(navigator.userAgent))) {
    this.use_m4a = true;
  }
}

SoundDevice.prototype.destroy = function() {
  this.destroyed = true;
  for (var name in this.sounds) {
    var sound = this.sounds[name];
    var index = sound.buffers.length;
    while (index--) {
      sound.buffers[index].pause();
      delete sound.buffers[index];
    }
    sound.free_count = 0;
  } 
}

SoundDevice.prototype.init_sfx = function(sources) {
  if (!this.supported || !this.sfx_sound_enabled) {
    return false;
  }
  
  for (var name in sources) {
    var source = sources[name],
        size = source[0],
        urls = source[1],
        sound = { name: name, buffers: [], free_count: size};
        
    while (size--) {
      var url = urls[Math.floor(Math.random() * urls.length)];
      var src = this.use_m4a ? url + '.m4a' :
      'http://github.com/downloads/jfd/wpilot/' + /sound\/(.+)/(url)[1] + '.ogg';
      var audio = new Audio(src);
      audio.autobuffer = true;
      audio.is_free = true;
      sound.buffers.push(audio);
    }
    
    this.sounds[name] = sound;
  }
  
  return true;
}

SoundDevice.prototype.init_bg = function(source) {
  if (!this.supported || !this.bg_sound_enabled) {
    return false;
  }
  
  var sound = { name: this.BG_SOUND, buffers: [], free_count: 2};
    
  for (var i = 0; i < 2; i++) {
    var src = this.use_m4a ? source + '.m4a' :
    'http://github.com/downloads/jfd/wpilot/' + /sound\/(.+)/(source)[1] + '.ogg';
    var audio = new Audio(src);
    audio.autobuffer = true;
    audio.is_free = true;
    sound.buffers.push(audio);
  }

  this.sounds[this.BG_SOUND] = sound;
  
  return true;
} 
 
SoundDevice.prototype.play = function(name, volume) {
  if (this.destroyed || !this.supported || !this.sfx_sound_enabled) {
    return;
  }

  var sound_volume = volume === undefined ? 1 : volume;
  
  if (sound_volume <= 0 || sound_volume > 1) {
    return;
  }

  var self = this;
  var buffer = self.get_buffer(name);
  
  if (buffer) {
    
    function free() {
      self.free_buffer(name, buffer, free);
    }
    
    buffer.addEventListener('ended', free, true);
    buffer.volume = sound_volume;
    buffer.play();
  }
}

SoundDevice.prototype.playbg = function(volume) {
  if (this.destroyed || !this.supported || !this.bg_sound_enabled) {
    return;
  }
  
  var self = this;
  var buffer = this.get_buffer(this.BG_SOUND);
  
  function free() {
    self.playbg(volume);
    self.free_buffer(self.BG_SOUND, buffer, free);
  }

  if (buffer) {
    buffer.volume = volume;
    buffer.addEventListener('ended', free, true);
    buffer.play();
  }
  
}

SoundDevice.prototype.get_buffer = function(name) {
  var sound = this.sounds[name],
      buffers = sound.buffers;

  if (sound.free_count) {
    var buffer = null,
        index = buffers.length;

    while ((buffer = buffers[--index]) && !buffer.is_free);

    if (buffer) {
      buffer.is_free = false;
      sound.free_count--;
      return buffer;
    }
  }
  
  return;
}

SoundDevice.prototype.free_buffer = function(name, buffer, handle) {
  var sound = this.sounds[name];
  sound.free_count++;

  buffer.removeEventListener('ended', handle, true);
  buffer.is_free = true;
}