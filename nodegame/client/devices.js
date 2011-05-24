
/**
 *  Represents a canvas ViewportDevice.
 *  @param {DOMElement} target The canvas element 
 *  @param {Number} width The width of the viewport
 *  @param {Number} height The height of the viewport
 */
function ViewportDevice(target, width, height) {
  this.target       = target;
  this.ctx          = target.getContext('2d');
  this.camera       = { pos: [0, 0], size: [0, 0], scale: 1};
  this.w            = width;
  this.h            = height;
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
