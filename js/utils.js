// Generated by CoffeeScript 1.7.1
var constrain, wrapAround;

wrapAround = function(value, modulus) {
  if (value > 0) {
    return value % modulus;
  } else {
    return value + modulus;
  }
};

constrain = function(value, min, max) {
  return Math.min(max, Math.max(min, value));
};
