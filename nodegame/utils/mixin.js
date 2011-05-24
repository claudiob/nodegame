
/**
 *  Quick'n'dirty mixin replacement
 */
exports.mixin = function(a, b) {
  var result = {}

  for (var prop in a) {
    result[prop] = a[prop];
  }
  
  for (var prop in b) {
    result[prop] = b[prop];
  }
  
  return result;
}

