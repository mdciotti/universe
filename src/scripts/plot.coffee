class Plot

	mapRange = (val, min, max, newMin, newMax) ->
		(val - min) / (max - min) * (newMax - newMin) + newMin

	series = []
	scroll = 0
	width = 300
	height = 100
	fillColor = "#000000"

	constructor: () ->
		canvas = document.createElement "CANVAS"
		@ctx = canvas.getContext "2d"
		@ctx.canvas.width = width
		@ctx.canvas.height = height
		@ctx.canvas.style.position = "absolute"
		@ctx.canvas.style.bottom = 0
		@ctx.canvas.style.left = 0
		document.body.appendChild canvas
		do @render
		# window.setTimeout @render, 100
		@ctx.scale 1, -1
		@ctx.translate 0, -height/2

		@ctx.fillStyle = fillColor
		@ctx.fillRect 0, -height/2, width, height

	addSeries: (desc, color, max, getter) ->
		series.push {
			description: desc,
			color: color,
			update: getter,
			maxValue: max
		}
		@

	render: () =>
		window.setTimeout @render, 100
		# Move entire plot one pixel left
		# @ctx.translate -2, 0
		imageData = @ctx.getImageData 0, 0, width, height
		@ctx.putImageData imageData, -1, 0

		x = width - 1

		@ctx.fillStyle = fillColor
		@ctx.fillRect x, -height/2, 1, height

		@ctx.fillStyle = "#333333"
		@ctx.fillRect x, 0, 1, 1

		# Draw each line
		series.forEach (s) =>
			val = mapRange s.update(), 0, s.maxValue, 0, height/2
			@ctx.fillStyle = s.color
			@ctx.fillRect x, val, 1, 1

		# scroll++
