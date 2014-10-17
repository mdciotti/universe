# GRAPHICAL USER INTERFACE CONTROLLER

class Bin
	constructor: (@title, @type) ->
		@node = document.createElement "DETAILS"
		@node.classList.add "bin"
		titlebar = document.createElement "SUMMARY"
		titlebar.classList.add "bin-title-bar"
		titlebar.innerText = @title
		@node.appendChild titlebar
		container = document.createElement "DIV"
		container.classList.add "bin-container"
		container.classList.add "bin-#{@type}"
		@node.appendChild container

	container = null
	@::controllers = []
	@::node = null

	addControl: (controller) ->
		@controllers.push controller
		container.appendChild controller.node


class Controller
	constructor: (@type, @title, @value, opts) ->
		@node = document.createElement "label"
		@node.classList.add ""

	@::node = null

class TextController extends Controller
	constructor: (args...) ->
		super "text", args

class InfoController extends Controller
	constructor: (args...) ->
		super "info", args

	addText: (text) ->
		@node.innerHTML = text

class Gui
	constructor: (container, settings) ->
		@width = 256
		@node = document.createElement "DIV"
		@node.classList.add "gui"

		container.appendChild @node

	@::node = null
	@::bins = []

	addBin: (bin) ->
		@bins.push bin
		@node.appendChild bin.node