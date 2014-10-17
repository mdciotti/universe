var Entity, Star, Universe,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Entity = (function() {
  function Entity(x, y, vx, vy) {
    this.disableCollisions = __bind(this.disableCollisions, this);
    this.enableCollisions = __bind(this.enableCollisions, this);
    this.position = new Vec2(x, y);
    this.lastPosition = new Vec2(x - vx, y - vy);
    this.velocity = new Vec2(vx, vy);
    this.acceleration = new Vec2(0, 0);
    this.angle = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
    this.radius = 10;
    this.ignoreCollisions = false;
  }

  Entity.prototype.remove = function() {};

  Entity.prototype.inRegion = function(x, y, w, h) {
    var e_x, e_y, withinX, withinY, _ref, _ref1;
    e_x = this.position.x;
    e_y = this.position.y;
    _ref = [Math.min(x, w), Math.max(x, w)], x = _ref[0], w = _ref[1];
    _ref1 = [Math.min(y, h), Math.max(y, h)], y = _ref1[0], h = _ref1[1];
    withinX = x - this.radius < e_x && e_x < x + w + this.radius;
    withinY = y - this.radius < e_y && e_y < y + h + this.radius;
    return withinX && withinY;
  };

  Entity.prototype.enableCollisions = function() {
    this.ignoreCollisions = false;
    return this;
  };

  Entity.prototype.disableCollisions = function() {
    this.ignoreCollisions = true;
    return this;
  };

  return Entity;

})();

Star = (function(_super) {
  __extends(Star, _super);

  function Star(x, y, mass, vx, vy, fixed) {
    this.mass = mass;
    this.fixed = fixed != null ? fixed : false;
    this.explode = __bind(this.explode, this);
    Star.__super__.constructor.call(this, x, y, vx, vy);
    this.type = "star";
    this.trailX = [];
    this.trailY = [];
    this.restitution = 1;
    this.radius = Math.sqrt(this.mass);
    this.strength = 0;
  }

  Star.prototype.explode = function(velocity, n, spreadAngle, ent) {
    var d, i, imass, increment, iv, refAngle, s, t, vimag, _i;
    if (n == null) {
      n = 2;
    }
    imass = this.mass / n;
    vimag = velocity.magnitude();
    increment = spreadAngle / (n + 1);
    refAngle = velocity.angle() - spreadAngle / 2;
    d = Math.sqrt(imass) / Math.sin(increment / 2);
    t = 11 * d / vimag;
    for (i = _i = 1; 1 <= n ? _i <= n : _i >= n; i = 1 <= n ? ++_i : --_i) {
      iv = new Vec2().setPolar(vimag, refAngle + i * increment);
      s = new Star(this.position.x, this.position.y, imass, iv.x, iv.y, false).disableCollisions();
      ent.push(s);
      window.setTimeout(s.enableCollisions, t);
    }
    return ent.splice(ent.indexOf(this), 1);
  };

  return Star;

})(Entity);

Universe = (function() {
  var _container,
    _this = this;

  _container = null;

  Universe.prototype.entities = [];

  Universe.prototype.selectedEntities = [];

  Universe.prototype.clock = new Clock();

  Universe.prototype.gui = new Gui(_container);

  Universe.prototype.tools = {
    "select": {
      cursor: "default"
    },
    "create": {
      cursor: "crosshair"
    },
    "move": {
      cursor: "grab",
      activeCursor: "grabbing"
    },
    "zoom": {
      cursor: "zoom-in",
      altCursor: "zoom-in"
    }
  };

  Universe.prototype.input = {
    mouse: {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      dragStartX: 0,
      dragStartY: 0,
      isDown: false,
      tool: null,
      lastTool: "create"
    }
  };

  Universe.prototype.events = {
    contextmenu: function(e) {
      e.preventDefault();
      return false;
    },
    resize: function() {
      this.ctx.canvas.width = window.innerWidth - this.gui.width;
      return this.ctx.canvas.height = window.innerHeight;
    },
    mousedown: function(e) {
      this.input.mouse.isDown = true;
      this.input.mouse.dragStartX = e.layerX;
      this.input.mouse.dragStartY = e.layerY;
      this.input.mouse.dx = 0;
      return this.input.mouse.dy = 0;
    },
    mousemove: function(e) {
      this.input.mouse.dx = e.layerX - this.input.mouse.dragStartX;
      this.input.mouse.dy = e.layerY - this.input.mouse.dragStartY;
      this.input.mouse.x = e.layerX;
      return this.input.mouse.y = e.layerY;
    },
    mouseup: function(e) {
      this.input.mouse.isDown = false;
      this.input.mouse.dx = e.layerX - this.input.mouse.dragStartX;
      this.input.mouse.dy = e.layerY - this.input.mouse.dragStartY;
      switch (this.input.mouse.tool) {
        case "create":
          return this.entities.push(new Star(this.input.mouse.dragStartX, this.input.mouse.dragStartY, 100, this.input.mouse.dx / 50, this.input.mouse.dy / 50));
        case "select":
          return this.selectRegion(this.input.mouse.dragStartX, this.input.mouse.dragStartY, this.input.mouse.dx, this.input.mouse.dy);
      }
    }
  };

  function Universe(settings) {
    var infoBin, _ref, _ref1, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    this.ctx = settings.context;
    _container = settings.container;
    _container.appendChild(this.ctx.canvas);
    this.events.resize.bind(this)();
    this.integrator = (_ref = settings.integrator) != null ? _ref : "verlet";
    this.collisions = (_ref1 = settings.collisions) != null ? _ref1 : "none";
    this.G = 6.67e-2;
    this.totalKineticEnergy = 0;
    this.options = {
      trail: (_ref2 = settings.trail) != null ? _ref2 : false,
      trailLength: (_ref3 = settings.trailLength) != null ? _ref3 : 30,
      trailFade: (_ref4 = settings.trailFade) != null ? _ref4 : true,
      collisions: (_ref5 = settings.collisions) != null ? _ref5 : "none",
      integrator: (_ref6 = settings.integrator) != null ? _ref6 : "verlet",
      map: (_ref7 = settings.map) != null ? _ref7 : "",
      bounded: (_ref8 = settings.bounded) != null ? _ref8 : false,
      friction: (_ref9 = settings.friction) != null ? _ref9 : 0,
      gravity: (_ref10 = settings.gravity) != null ? _ref10 : false,
      motionBlur: (_ref11 = settings.motionBlur) != null ? _ref11 : false,
      inspector: true
    };
    this.animator = null;
    this.setTool("create");
    window.addEventListener("resize", this.events.resize.bind(this), false);
    document.body.addEventListener("contextmenu", this.events.contextmenu.bind(this), false);
    this.ctx.canvas.addEventListener("mousedown", this.events.mousedown.bind(this), false);
    this.ctx.canvas.addEventListener("mousemove", this.events.mousemove.bind(this), false);
    this.ctx.canvas.addEventListener("mouseup", this.events.mouseup.bind(this), false);
    infoBin = new Bin("Information");
    infoBin.addControl;
    this.gui.addBin(infoBin);
    this.setup = (_ref12 = settings.setup) != null ? _ref12 : function() {
      return this;
    };
    this.setup();
  }

  Universe.prototype.reset = function() {
    this.entities.length = 0;
    this.setup();
    return this;
  };

  Universe.prototype.start = function() {
    this.clock.register(this.calculate, this);
    this.clock.register(this.render, this);
    this.loop();
    return this;
  };

  Universe.prototype.stop = function() {
    cancelAnimationFrame(this.animator);
    return this;
  };

  Universe.prototype.loop = function() {
    this.animator = requestAnimationFrame(this.loop.bind(this));
    return this.clock.tick();
  };

  Universe.prototype.begin = function() {
    console.log("BEGIN SIMULATION");
    this.start();
    return this.processMap(this.options.map);
  };

  Universe.prototype.selectRegion = function(x, y, w, h) {
    var e, e_x, e_y, i, idx, withinX, withinY, _i, _len, _ref, _ref1, _ref2;
    this.selectedEntities.length = 0;
    _ref = [Math.min(x, w), Math.max(x, w)], x = _ref[0], w = _ref[1];
    _ref1 = [Math.min(y, h), Math.max(y, h)], y = _ref1[0], h = _ref1[1];
    _ref2 = this.entities;
    for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
      e = _ref2[i];
      e_x = e.position.x;
      e_y = e.position.y;
      withinX = x - e.radius < e_x && e_x < x + w + e.radius;
      withinY = y - e.radius < e_y && e_y < y + h + e.radius;
      if (withinX && withinY) {
        this.selectedEntities.push(e);
      } else {
        idx = this.selectedEntities.indexOf(e);
        if (idx > 0) {
          this.selectedEntities.splice(idx, 1);
        }
      }
    }
    return this;
  };

  Universe.prototype.setTool = function(tool) {
    if (tool !== this.input.mouse.tool) {
      this.input.mouse.lastTool = this.input.mouse.tool;
      this.input.mouse.tool = tool;
      this.ctx.canvas.style.cursor = this.tools[tool].cursor;
    }
    return this;
  };

  Universe.prototype.toggleTool = function() {
    this.setTool(this.input.mouse.lastTool);
    return this;
  };

  Universe.prototype.processMap = function(mapURI, callback) {
    var img,
      _this = this;
    if (typeof callback !== "function") {
      callback = this.populate;
    }
    img = new Image();
    img.width = 500;
    img.height = 500;
    img.src = mapURI;
    img.addEventListener("load", function() {
      var average, col, cols, dataRow, i, imgData, j, mapData, row, rows, ss, _i, _j, _k, _l;
      _this.ctx.drawImage(img, 0, 0);
      imgData = _this.ctx.getImageData(0, 0, _this.ctx.canvas.width, _this.ctx.canvas.height);
      ss = 25;
      mapData = [];
      rows = Math.floor(img.height / ss);
      cols = Math.floor(img.width / ss);
      for (row = _i = 0; 0 <= rows ? _i < rows : _i > rows; row = 0 <= rows ? ++_i : --_i) {
        dataRow = [];
        for (col = _j = 0; 0 <= cols ? _j < cols : _j > cols; col = 0 <= cols ? ++_j : --_j) {
          average = 0;
          for (i = _k = 0; 0 <= ss ? _k < ss : _k > ss; i = 0 <= ss ? ++_k : --_k) {
            for (j = _l = 0; 0 <= ss ? _l < ss : _l > ss; j = 0 <= ss ? ++_l : --_l) {
              average += imgData.data[4 * ((row * ss + i) * img.width + (col * ss + j))];
            }
          }
          dataRow.push(average / (ss * ss * 255));
        }
        mapData.push(dataRow);
      }
      return callback.call(_this, mapData);
    }, false);
    return this;
  };

  Universe.prototype.create = function() {};

  Universe.prototype.populate = function(mapData) {
    var MAX_MASS, cols, i, j, offset, pos_x, pos_y, rows, sampleSize, _i, _j;
    rows = mapData.length;
    cols = mapData[0].length;
    sampleSize = 25;
    MAX_MASS = 1;
    offset = sampleSize / 2;
    for (i = _i = 0; 0 <= rows ? _i < rows : _i > rows; i = 0 <= rows ? ++_i : --_i) {
      for (j = _j = 0; 0 <= cols ? _j < cols : _j > cols; j = 0 <= cols ? ++_j : --_j) {
        pos_x = j * sampleSize + offset;
        pos_y = i * sampleSize + offset;
        this.entities.push(new Star(pos_x, pos_y, MAX_MASS * mapData[i][j], 0, 0, false));
      }
    }
    return this;
  };

  Universe.prototype.calculate = function() {
    var A, B, d, dist, dist2, e, iA, iB, next, temp, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    this.totalPotentialEnergy = 0;
    if (this.options.gravity) {
      _ref = this.entities;
      for (iA = _i = 0, _len = _ref.length; _i < _len; iA = ++_i) {
        A = _ref[iA];
        if (!A.hasOwnProperty("mass")) {
          continue;
        }
        _ref1 = this.entities.slice(iA + 1);
        for (iB = _j = 0, _len1 = _ref1.length; _j < _len1; iB = ++_j) {
          B = _ref1[iB];
          if (!B.hasOwnProperty("mass")) {
            continue;
          }
          d = B.position.subtract(A.position);
          dist2 = A.position.distSq(B.position);
          dist = A.position.dist(B.position);
          temp = this.G / (dist2 * dist);
          if (!A.fixed) {
            A.acceleration.addSelf(d.scale(temp * B.mass));
          }
          if (!B.fixed) {
            B.acceleration.addSelf(d.scale(-temp * A.mass));
          }
          this.totalPotentialEnergy -= this.G * A.mass * B.mass / dist;
        }
      }
    }
    _ref2 = this.entities;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      e = _ref2[_k];
      switch (this.integrator) {
        case "euler":
          e.velocity.addSelf(e.acceleration.scale(this.clock.dt));
          e.lastPosition = e.position;
          e.position.addSelf(e.velocity.scale(this.clock.dt));
          e.acceleration.zero();
          break;
        case "verlet":
          e.velocity = e.position.subtract(e.lastPosition);
          next = e.position.add(e.velocity).addSelf(e.acceleration.scale(this.clock.dt * this.clock.dt));
          e.lastPosition = e.position;
          e.position = next;
          e.velocity = next.subtract(e.lastPosition);
          e.acceleration.zero();
          break;
        case "RK4":
          break;
        default:
          this.stop();
      }
      if (e instanceof Star) {
        while (e.trailX.length > this.options.trailLength) {
          e.trailX.shift();
        }
        while (e.trailY.length > this.options.trailLength) {
          e.trailY.shift();
        }
        e.trailX.push(e.position.x);
        e.trailY.push(e.position.y);
      }
      if (e.hasOwnProperty("mass")) {
        this.totalKineticEnergy += e.mass * e.velocity.magnitudeSq();
      }
    }
    this.totalKineticEnergy *= 0.5;
    this.collider();
    return this;
  };

  Universe.prototype.collider = function() {
    var _this = this;
    this.entities.forEach(function(A, iA) {
      if (A.ignoreCollisions) {
        return;
      }
      if (_this.options.bounded) {
        if (A.position.x - A.radius < 0 || A.position.x + A.radius > _this.ctx.canvas.width) {
          A.velocity.x *= -1;
        }
        if (A.position.y - A.radius < 0 || A.position.y + A.radius > _this.ctx.canvas.height) {
          A.velocity.y *= -1;
        }
      }
      _this.entities.slice(iA + 1).forEach(function(B, iB) {
        var A_momentum, Av, Avn, B_momentum, Bv, Bvn, C_momentum, C_velocity, F, M, M_inverse, R, absorbtionRate, dist, overlap, s, temp, un, ut;
        if (B.ignoreCollisions) {
          return;
        }
        dist = A.position.dist(B.position);
        overlap = A.radius + B.radius - dist;
        absorbtionRate = overlap / 10;
        if (overlap > 0) {
          M = A.mass + B.mass;
          M_inverse = 1 / M;
          switch (_this.options.collisions) {
            case "merge":
              A_momentum = A.velocity.scale(A.mass);
              B_momentum = B.velocity.scale(B.mass);
              C_momentum = A_momentum.add(B_momentum);
              C_velocity = C_momentum.scale(M_inverse);
              R = A.position.scale(A.mass).add(B.position.scale(B.mass)).scale(M_inverse);
              _this.entities.push(new Star(R.x, R.y, M, C_velocity.x, C_velocity.y, false));
              _this.entities.splice(iA, 1);
              _this.entities.splice(iB, 1);
              break;
            case "absorb":
              if (A.mass > B.mass) {
                B.mass -= absorbtionRate;
                A.mass += absorbtionRate;
              } else {
                A.mass -= absorbtionRate;
                B.mass += absorbtionRate;
              }
              break;
            case "elastic":
              un = A.position.subtract(B.position).normalizeSelf();
              ut = new Vec2(-un.y, un.x);
              Avn = A.velocity.dot(un);
              Bvn = B.velocity.dot(un);
              temp = M_inverse * (Avn * (A.mass - B.mass) + 2 * B.mass * Bvn);
              Bvn = M_inverse * (Bvn * (B.mass - A.mass) + 2 * A.mass * Avn);
              Avn = temp;
              A.velocity = un.scale(Avn).addSelf(ut.scale(A.velocity.dot(ut)));
              B.velocity = un.scale(Bvn).addSelf(ut.scale(B.velocity.dot(ut)));
              break;
            case "shatter":
              un = A.position.subtract(B.position).normalizeSelf();
              ut = new Vec2(-un.y, un.x);
              Avn = A.velocity.dot(un);
              Bvn = B.velocity.dot(un);
              temp = M_inverse * (Avn * (A.mass - B.mass) + 2 * B.mass * Bvn);
              Bvn = M_inverse * (Bvn * (B.mass - A.mass) + 2 * A.mass * Avn);
              Avn = temp;
              Av = un.scale(Avn).addSelf(ut.scale(A.velocity.dot(ut)));
              Bv = un.scale(Bvn).addSelf(ut.scale(B.velocity.dot(ut)));
              F = A.velocity.subtract(Av).magnitude() * A.mass;
              if (F > A.strength) {
                A.explode(Av, 3, Math.PI, _this.entities);
              } else {
                A.velocity = Av;
              }
              if (F > B.strength) {
                B.explode(Bv, 3, Math.PI / 2, _this.entities);
              } else {
                A.velocity = Av;
              }
              break;
            case "explode":
              A_momentum = A.velocity.scale(A.mass);
              B_momentum = B.velocity.scale(B.mass);
              C_momentum = A_momentum.add(B_momentum);
              C_velocity = C_momentum.scale(M_inverse);
              R = A.position.scale(A.mass).add(B.position.scale(B.mass)).scale(M_inverse);
              s = new Star(R.x, R.y, M, C_velocity.x, C_velocity.y, false);
              _this.entities.push(s);
              s.explode(C_velocity, 5, 2 * Math.PI, _this.entities);
              _this.entities.splice(_this.entities.indexOf(A), 1);
              _this.entities.splice(_this.entities.indexOf(B), 1);
          }
        }
      });
    });
    return this;
  };

  Universe.prototype.render = function() {
    var KE, PE, TE, Xend, Yend, e, ei, i, m, p1, p2, unv, uv, v, willSelect, x, y, _i, _j, _len, _ref, _ref1;
    if (this.options.motionBlur) {
      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
    } else {
      this.ctx.fillStyle = "black";
    }
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "rgba(255,255,255,0.5)";
    _ref = this.entities;
    for (ei = _i = 0, _len = _ref.length; _i < _len; ei = ++_i) {
      e = _ref[ei];
      x = e.position.x;
      y = e.position.y;
      this.ctx.beginPath();
      this.ctx.arc(x, y, e.radius, 0, 2 * Math.PI, false);
      this.ctx.closePath();
      if (this.input.mouse.tool === "select") {
        m = new Vec2(this.input.mouse.x, this.input.mouse.y);
        willSelect = this.input.mouse.isDown && e.inRegion(this.input.mouse.dragStartX, this.input.mouse.dragStartY, this.input.mouse.dx, this.input.mouse.dy);
        if (m.dist(e.position) < e.radius || willSelect || this.selectedEntities.indexOf(e) >= 0) {
          this.ctx.strokeStyle = "#ffffff";
          this.ctx.strokeWidth = 2;
          this.ctx.stroke();
        }
        if (this.selectedEntities.indexOf(e) >= 0) {
          this.ctx.fillStyle = "#00aced";
        }
      }
      this.ctx.fill();
      if (this.options.trail && e instanceof Star) {
        this.ctx.strokeWidth = 1;
        this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
        this.ctx.save();
        for (i = _j = 1, _ref1 = this.options.trailLength; 1 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
          this.ctx.beginPath();
          if (this.options.trailFade) {
            this.ctx.globalAlpha = i / e.trailX.length;
          }
          this.ctx.moveTo(e.trailX[i - 1], e.trailY[i - 1]);
          this.ctx.lineTo(e.trailX[i], e.trailY[i]);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }
      if (this.options.inspector) {
        this.ctx.strokeStyle = "rgba(255,0,255,1)";
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 1000 * e.position.ax, y + 1000 * e.position.ay);
        this.ctx.stroke();
        this.ctx.strokeStyle = "rgba(0,255,0,1)";
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 10 * e.position.vx, y + 10 * e.position.vy);
        this.ctx.stroke();
      }
    }
    if (this.input.mouse.isDown) {
      switch (this.input.mouse.tool) {
        case "select":
          this.ctx.lineDashOffset = (this.ctx.lineDashOffset + 0.5) % 10;
          this.ctx.save();
          this.ctx.strokeStyle = "#00aced";
          this.ctx.fillStyle = "#00aced";
          this.ctx.lineWidth = 2;
          this.ctx.setLineDash([5]);
          this.ctx.strokeRect(this.input.mouse.dragStartX, this.input.mouse.dragStartY, this.input.mouse.dx, this.input.mouse.dy);
          this.ctx.globalAlpha = 0.5;
          this.ctx.fillRect(this.input.mouse.dragStartX, this.input.mouse.dragStartY, this.input.mouse.dx, this.input.mouse.dy);
          this.ctx.restore();
          break;
        case "create":
          v = new Vec2(this.input.mouse.dx, this.input.mouse.dy);
          uv = v.normalize();
          unv = new Vec2(-uv.y, uv.x);
          p1 = v.subtract(uv.subtract(unv).scale(10));
          p2 = p1.subtract(unv.scale(20));
          Xend = this.input.mouse.dragStartX + this.input.mouse.dx;
          Yend = this.input.mouse.dragStartY + this.input.mouse.dy;
          this.ctx.strokeStyle = "rgba(255,0,0,1)";
          this.ctx.beginPath();
          this.ctx.moveTo(this.input.mouse.dragStartX, this.input.mouse.dragStartY);
          this.ctx.lineTo(Xend, Yend);
          this.ctx.lineTo(this.input.mouse.dragStartX + p1.x, this.input.mouse.dragStartY + p1.y);
          this.ctx.moveTo(this.input.mouse.dragStartX + p2.x, this.input.mouse.dragStartY + p2.y);
          this.ctx.lineTo(Xend, Yend);
          this.ctx.stroke();
      }
    }
    if (this.options.inspector) {
      this.ctx.fillStyle = "rgba(255,255,255,0.75)";
      this.ctx.font = "12pt Courier New";
      KE = this.totalKineticEnergy.toFixed(2);
      PE = this.totalPotentialEnergy.toFixed(2);
      TE = (this.totalKineticEnergy + this.totalPotentialEnergy).toFixed(2);
      this.ctx.fillText("Kinetic Energy: " + KE, 0, 16);
      this.ctx.fillText("Potential Energy: " + PE, 0, 32);
      this.ctx.fillText("Total Energy: " + TE, 0, 48);
    }
    return this;
  };

  return Universe;

}).call(this);
