var Vec2, Vec3;

Vec3 = (function() {
  function Vec3(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  Vec3.prototype.cross = function(v) {
    return new Vec3(this.y * v.z - this.z * v.y, this.x * v.z - this.z * v.x, this.x * v.y - this.y * v.x);
  };

  return Vec3;

})();

Vec2 = (function() {
  function Vec2(x, y) {
    this.x = x;
    this.y = y;
  }

  Vec2.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };

  Vec2.prototype.setPolar = function(r, theta) {
    this.x = r * Math.cos(theta);
    this.y = r * Math.sin(theta);
    return this;
  };

  Vec2.prototype.add = function(v) {
    return new Vec2(this.x + v.x, this.y + v.y);
  };

  Vec2.prototype.subtract = function(v) {
    return new Vec2(this.x - v.x, this.y - v.y);
  };

  Vec2.prototype.scale = function(v) {
    return new Vec2(this.x * v, this.y * v);
  };

  Vec2.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  Vec2.prototype.magnitudeSq = function() {
    return this.x * this.x + this.y * this.y;
  };

  Vec2.prototype.midpoint = function(v) {
    return this.add(v).scale(0.5);
  };

  Vec2.prototype.normalize = function() {
    var iMag;
    iMag = 1 / this.magnitude();
    return new Vec2(this.x * iMag, this.y * iMag);
  };

  Vec2.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
  };

  Vec2.prototype.crossMag = function(v) {
    return this.x * v.y - this.y * v.x;
  };

  Vec2.prototype.angle = function() {
    return Math.atan2(this.y, this.x);
  };

  Vec2.prototype.angleFrom = function(v) {
    return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
  };

  Vec2.prototype.copy = function(v) {
    return new Vec2(v.x, v.y);
  };

  Vec2.prototype.dist = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  Vec2.prototype.distSq = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return dx * dx + dy * dy;
  };

  Vec2.prototype.addSelf = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };

  Vec2.prototype.subtractSelf = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };

  Vec2.prototype.scaleSelf = function(k) {
    this.x *= k;
    this.y *= k;
    return this;
  };

  Vec2.prototype.zero = function() {
    this.x = 0;
    this.y = 0;
    return this;
  };

  Vec2.prototype.normalizeSelf = function() {
    var iMag;
    iMag = 1 / this.magnitude();
    this.x *= iMag;
    this.y *= iMag;
    return this;
  };

  return Vec2;

})();

Vec2.add = function(a, b) {
  return new Vec2(a.x + b.x, a.y + b.y);
};

Vec2.subtract = function(a, b) {
  return new Vec2(a.x - b.x, a.y - b.y);
};

Vec2.scale = function(a, k) {
  return new Vec2(k * a.x, k * a.y);
};

Vec2.normalize = function(a) {
  return new Vec2(k * a.x, k * a.y);
};