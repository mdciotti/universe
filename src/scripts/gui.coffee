# GRAPHICAL USER INTERFACE CONTROLLER

class Bin

	@::container = null
	@::controllers = []
	@::node = null

	constructor: (@title, @type, open = true) ->
		@node = document.createElement "details"
		@node.classList.add "bin"
		titlebar = document.createElement "summary"
		titlebar.classList.add "bin-title-bar"
		title = document.createElement "span"
		title.classList.add "bin-title"
		title.innerText = @title
		titlebar.appendChild title
		@node.appendChild titlebar
		@container = document.createElement "div"
		@container.classList.add "bin-container"
		@container.classList.add "bin-#{@type}"
		@node.appendChild @container
		@open() if open

	isOpen: () -> @node.hasAttribute("open")
	open: () -> @node.setAttribute("open", "")
	close: () -> @node.removeAttribute("open")
	toggle: () -> if @isOpen() then @close() else @open()


	addControl: (controller) ->
		@controllers.push controller
		item = document.createElement("div")
		item.classList.add("bin-item")
		item.appendChild(controller.node)
		@container.appendChild item


class Controller
	constructor: (@type, @title, @value, opts) ->
		@node = document.createElement "div"
		@node.classList.add ""

	@::node = null

class TextController extends Controller
	constructor: (args...) ->
		# super "text", args
		@node = document.createElement "label"

class ToggleController extends Controller
	constructor: (args...) ->
		# super "text", args
		@node = document.createElement "label"

class HTMLController extends Controller
	constructor: (args...) ->
		# super "html", args
		@node = document.createElement "div"
		# @node.classList.add "html"

	getHTML: () -> @node.innerHTML
	setHTML: (content) -> @node.innerHTML = content
	# append: (text) ->

class GridController extends Controller
	constructor: (args...) ->
		@node = document.createDocumentFragment()
		# @size = 

	createItems: (list) ->
		list.forEach (item) =>
			itemNode = document.createElement
			@node.appendChild()

class Gui
	constructor: (container, settings) ->
		@width = 256
		@node = document.createElement "div"
		@node.classList.add "gui"

		container.appendChild @node

	@::node = null
	@::bins = []

	addBin: (bin) ->
		@bins.push bin
		@node.appendChild bin.node
