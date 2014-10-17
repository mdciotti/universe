var Bin, Controller, Gui, InfoController, TextController,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Bin = (function() {
  var container;

  function Bin(title, type) {
    var container, titlebar;
    this.title = title;
    this.type = type;
    this.node = document.createElement("DETAILS");
    this.node.classList.add("bin");
    titlebar = document.createElement("SUMMARY");
    titlebar.classList.add("bin-title-bar");
    titlebar.innerText = this.title;
    this.node.appendChild(titlebar);
    container = document.createElement("DIV");
    container.classList.add("bin-container");
    container.classList.add("bin-" + this.type);
    this.node.appendChild(container);
  }

  container = null;

  Bin.prototype.controllers = [];

  Bin.prototype.node = null;

  Bin.prototype.addControl = function(controller) {
    this.controllers.push(controller);
    return container.appendChild(controller.node);
  };

  return Bin;

})();

Controller = (function() {
  function Controller(type, title, value, opts) {
    this.type = type;
    this.title = title;
    this.value = value;
    this.node = document.createElement("label");
    this.node.classList.add("");
  }

  Controller.prototype.node = null;

  return Controller;

})();

TextController = (function(_super) {
  __extends(TextController, _super);

  function TextController() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    TextController.__super__.constructor.call(this, "text", args);
  }

  return TextController;

})(Controller);

InfoController = (function(_super) {
  __extends(InfoController, _super);

  function InfoController() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    InfoController.__super__.constructor.call(this, "info", args);
  }

  InfoController.prototype.addText = function(text) {
    return this.node.innerHTML = text;
  };

  return InfoController;

})(Controller);

Gui = (function() {
  function Gui(container, settings) {
    this.width = 256;
    this.node = document.createElement("DIV");
    this.node.classList.add("gui");
    container.appendChild(this.node);
  }

  Gui.prototype.node = null;

  Gui.prototype.bins = [];

  Gui.prototype.addBin = function(bin) {
    this.bins.push(bin);
    return this.node.appendChild(bin.node);
  };

  return Gui;

})();
