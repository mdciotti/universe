var Plot,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Plot = (function() {
  var fillColor, height, mapRange, scroll, series, width;

  mapRange = function(val, min, max, newMin, newMax) {
    return (val - min) / (max - min) * (newMax - newMin) + newMin;
  };

  series = [];

  scroll = 0;

  width = 300;

  height = 100;

  fillColor = "#000000";

  function Plot() {
    this.render = __bind(this.render, this);
    var canvas;
    canvas = document.createElement("CANVAS");
    this.ctx = canvas.getContext("2d");
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
    this.ctx.canvas.style.position = "absolute";
    this.ctx.canvas.style.bottom = 0;
    this.ctx.canvas.style.left = 0;
    document.body.appendChild(canvas);
    this.render();
    this.ctx.scale(1, -1);
    this.ctx.translate(0, -height / 2);
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(0, -height / 2, width, height);
  }

  Plot.prototype.addSeries = function(desc, color, max, getter) {
    series.push({
      description: desc,
      color: color,
      update: getter,
      maxValue: max
    });
    return this;
  };

  Plot.prototype.render = function() {
    var imageData, x,
      _this = this;
    window.setTimeout(this.render, 100);
    imageData = this.ctx.getImageData(0, 0, width, height);
    this.ctx.putImageData(imageData, -1, 0);
    x = width - 1;
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, -height / 2, 1, height);
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(x, 0, 1, 1);
    return series.forEach(function(s) {
      var val;
      val = mapRange(s.update(), 0, s.maxValue, 0, height / 2);
      _this.ctx.fillStyle = s.color;
      return _this.ctx.fillRect(x, val, 1, 1);
    });
  };

  return Plot;

})();
