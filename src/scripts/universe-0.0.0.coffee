# UNIVERSE
# Max Ciotti

class Entity

	constructor: (x, y, vx, vy) ->
		@position = new Vec2(x, y)
		@lastPosition = new Vec2(x - vx, y - vy)
		@velocity = new Vec2(vx, vy)
		@acceleration = new Vec2(0, 0)
		@angle = 0
		@angularVelocity = 0
		@angularAcceleration = 0
		@radius = 10
		@ignoreCollisions = false

	remove: () ->
		# @entities.splice @entities.indexOf(@), 1

	inRegion: (x, y, w, h) ->
		e_x = @position.x
		e_y = @position.y

		[x, w] = [Math.min(x, w), Math.max(x, w)]
		[y, h] = [Math.min(y, h), Math.max(y, h)]

		withinX = x - @radius < e_x and e_x < x + w + @radius
		withinY = y - @radius < e_y and e_y < y + h + @radius

		withinX and withinY

	enableCollisions: =>
		@ignoreCollisions = false
		@

	disableCollisions: =>
		@ignoreCollisions = true
		@

class Star extends Entity
	constructor: (x, y, @mass, vx, vy, @fixed = false) ->
		super x, y, vx, vy
		@type = "star"
		@trailX = []
		@trailY = []
		@restitution = 1
		@radius = Math.sqrt @mass
		@strength = 0

	explode: (velocity, n, spreadAngle, ent) =>
		n ?= 2
		imass = @mass / n
		vimag = velocity.magnitude()
		increment = spreadAngle / (n + 1)
		refAngle = velocity.angle() - spreadAngle / 2

		# Distance to start collisions (avoid overlap collisions)
		d = Math.sqrt(imass) / Math.sin(increment / 2)
		# time delay to start collsions
		# Not sure why we need this constant
		# 10 seems to give the correct exact time
		# but we need a small buffer, so I use 11
		t = 11 * d / vimag

		for i in [1..n]
			iv = new Vec2().setPolar(vimag, refAngle + i * increment)
			s = new Star(@position.x, @position.y, imass, iv.x, iv.y, false).disableCollisions()
			ent.push s
			window.setTimeout s.enableCollisions, t
		
		ent.splice(ent.indexOf(@), 1)

class Universe
	_container = null

	# keyListener = new window.keypress.Listener()

	@::entities = []
	@::selectedEntities = []

	# @::stateMachine = new StateMachine(["STOPPED", "PAUSED"])

	@::clock = new Clock()

	@::gui = new Gui(_container)

	@::tools =
		"select":
			cursor: "default"
		"create":
			cursor: "crosshair"
		"move":
			cursor: "grab"
			activeCursor: "grabbing"
		"zoom":
			cursor: "zoom-in"
			altCursor: "zoom-in"

	@::input =
		mouse:
			x: 0
			y: 0
			dx: 0
			dy: 0
			dragStartX: 0
			dragStartY: 0
			isDown: false
			tool: null
			lastTool: "create"
		# keyboard:


	@::events =
		contextmenu: (e) =>
			do e.preventDefault
			false

		resize: () ->
			@ctx.canvas.width = window.innerWidth - @gui.width
			@ctx.canvas.height = window.innerHeight

		mousedown: (e) ->
			@input.mouse.isDown = true
			@input.mouse.dragStartX = e.layerX
			@input.mouse.dragStartY = e.layerY
			@input.mouse.dx = 0
			@input.mouse.dy = 0

		mousemove: (e) ->
			@input.mouse.dx = e.layerX - @input.mouse.dragStartX
			@input.mouse.dy = e.layerY - @input.mouse.dragStartY
			@input.mouse.x = e.layerX
			@input.mouse.y = e.layerY

		mouseup: (e) ->
			@input.mouse.isDown = false
			@input.mouse.dx = e.layerX - @input.mouse.dragStartX
			@input.mouse.dy = e.layerY - @input.mouse.dragStartY
			switch @input.mouse.tool
				when "create"
					@entities.push new Star(@input.mouse.dragStartX, @input.mouse.dragStartY, 100, @input.mouse.dx / 50, @input.mouse.dy / 50)
				when "select"
					@selectRegion @input.mouse.dragStartX, @input.mouse.dragStartY, @input.mouse.dx, @input.mouse.dy


	constructor: (settings) ->
		@ctx = settings.context
		_container = settings.container
		_container.appendChild @ctx.canvas
		do @events.resize.bind @
		# _container.style.width = w + "px"
		# _container.style.height = h + "px"

		@integrator = settings.integrator ? "verlet"
		@collisions = settings.collisions ? "none"
		@G = 6.67e-2
		@totalKineticEnergy = 0

		@options =
			trail: settings.trail ? false
			trailLength: settings.trailLength ? 30
			trailFade: settings.trailFade ? true
			collisions: settings.collisions ? "none"
			integrator: settings.integrator ? "verlet"
			map: settings.map ? ""
			bounded: settings.bounded ? false
			friction: settings.friction ? 0
			gravity: settings.gravity ? false
			motionBlur: settings.motionBlur ? false
			inspector: true

		@animator = null
		@setTool "create"
		# @stateMachine.enable "STOPPED"

		# Attach event handlers
		window.addEventListener "resize", @events.resize.bind(@), false
		document.body.addEventListener "contextmenu", @events.contextmenu.bind(@), false
		@ctx.canvas.addEventListener "mousedown", @events.mousedown.bind(@), false
		@ctx.canvas.addEventListener "mousemove", @events.mousemove.bind(@), false
		@ctx.canvas.addEventListener "mouseup", @events.mouseup.bind(@), false

		# Create GUI
		infoBin = new Bin("Information")
		infoBin.addControl
		@gui.addBin infoBin

		@setup = settings.setup ? () -> @
		do @setup

	# Restarts the simulation
	reset: () ->
		@entities.length = 0
		do @setup
		@

	start: () ->
		@clock.register @calculate, @
		@clock.register @render, @
		do @loop
		@

	stop: () ->
		# TODO: set state
		cancelAnimationFrame @animator
		@

	loop: () ->
		# if @stateMachine.match 0x11
		@animator = requestAnimationFrame @loop.bind(@)
		do @clock.tick

	begin: () ->
		console.log "BEGIN SIMULATION"
		do @start

		@processMap @options.map

	selectRegion: (x, y, w, h) ->
		@selectedEntities.length = 0

		[x, w] = [Math.min(x, w), Math.max(x, w)]
		[y, h] = [Math.min(y, h), Math.max(y, h)]

		for e, i in @entities

			e_x = e.position.x
			e_y = e.position.y

			withinX = x - e.radius < e_x and e_x < x + w + e.radius
			withinY = y - e.radius < e_y and e_y < y + h + e.radius

			if withinX and withinY
				# console.log "selecting", i
				@selectedEntities.push e
			else
				idx = @selectedEntities.indexOf e
				@selectedEntities.splice idx, 1 if idx > 0
		@

	setTool: (tool) ->
		if tool isnt @input.mouse.tool
			@input.mouse.lastTool = @input.mouse.tool
			@input.mouse.tool = tool
			@ctx.canvas.style.cursor = @tools[tool].cursor
		@

	toggleTool: () ->
		@setTool @input.mouse.lastTool
		# [@input.mouse.tool, @input.mouse.lastTool] = [@input.mouse.lastTool, @input.mouse.tool]
		@

	processMap: (mapURI, callback) ->
		if typeof callback isnt "function" then callback = @populate
		img = new Image()
		img.width = 500
		img.height = 500
		img.src = mapURI

		img.addEventListener "load", () =>
			@ctx.drawImage img, 0, 0

			imgData = @ctx.getImageData 0, 0, @ctx.canvas.width, @ctx.canvas.height
			# Sample size:
			ss = 25
			mapData = []

			rows = Math.floor img.height / ss
			cols = Math.floor img.width / ss

			# Split image into square samples
			for row in [0...rows]
				dataRow = []
				for col in [0...cols]
					average = 0
					# Calculate average value for this sample
					# Averages every pixel in sample
					for i in [0...ss]
						for j in [0...ss]
							average += imgData.data[4 * ((row * ss + i) * img.width + (col * ss + j))]

					dataRow.push average / (ss * ss * 255)
				mapData.push dataRow

			# console.log mapData

			callback.call @, mapData
		, false

		@

	create: () ->
		# @entities.push new1

	populate: (mapData) ->
		rows = mapData.length
		cols = mapData[0].length
		sampleSize = 25
		MAX_MASS = 1
		offset = sampleSize / 2

		for i in [0...rows]
			for j in [0...cols]
				pos_x = j * sampleSize + offset
				pos_y = i * sampleSize + offset

				@entities.push new Star(pos_x, pos_y, MAX_MASS * mapData[i][j], 0, 0, false)

		@

	calculate: () ->

		@totalPotentialEnergy = 0

		# Calculate accelerations
		if @options.gravity
			for A, iA in @entities
				if !A.hasOwnProperty "mass" then continue
				for B, iB in @entities.slice iA+1
					if !B.hasOwnProperty "mass" then continue
					d = B.position.subtract(A.position)
					dist2 = A.position.distSq B.position
					dist = A.position.dist B.position

					temp = @G / (dist2 * dist)

					if !A.fixed
						A.acceleration.addSelf d.scale(temp * B.mass)

					if !B.fixed
						B.acceleration.addSelf d.scale(-temp * A.mass)

					@totalPotentialEnergy -= @G * A.mass * B.mass / dist
					# @totalPotentialEnergy -= @G * A.mass / dist

		for e in @entities
			switch @integrator
				when "euler"
					# Euler Integration
					e.velocity.addSelf e.acceleration.scale(@clock.dt)

					e.lastPosition = e.position

					e.position.addSelf e.velocity.scale(@clock.dt)

					do e.acceleration.zero

				when "verlet"
					# Verlet Integration
					# http://lonesock.net/article/verlet.html
					# x' = (2-f)*x - (1-f)*x_last + a*dt^2
					# f = @options.friction
					e.velocity = e.position.subtract e.lastPosition
					next = e.position.add(e.velocity).addSelf e.acceleration.scale(@clock.dt * @clock.dt)
					e.lastPosition = e.position
					e.position = next
					e.velocity = next.subtract e.lastPosition
					do e.acceleration.zero

				when "RK4"

				else
					do @stop

			if e instanceof Star
				while e.trailX.length > @options.trailLength then do e.trailX.shift
				while e.trailY.length > @options.trailLength then do e.trailY.shift
				e.trailX.push e.position.x
				e.trailY.push e.position.y

			if e.hasOwnProperty "mass"
				@totalKineticEnergy += e.mass * e.velocity.magnitudeSq()

		@totalKineticEnergy *= 0.5

		do @collider

		@


	collider: () ->
		# for A, iA in @entities
		@entities.forEach (A, iA) =>
			
			return if A.ignoreCollisions

			# Bound points within container
			if @options.bounded
				if A.position.x - A.radius < 0 || A.position.x + A.radius > @ctx.canvas.width
					A.velocity.x *= -1
				if A.position.y - A.radius < 0 || A.position.y + A.radius > @ctx.canvas.height
					A.velocity.y *= -1

			# for B, iB in @points.slice iA+1
			@entities.slice(iA+1).forEach (B, iB) =>

				return if B.ignoreCollisions

				dist = A.position.dist(B.position)
				overlap = A.radius + B.radius - dist
				absorbtionRate = overlap / 10

				if overlap > 0
					# console.log "collision", @collisions

					# Total mass
					M = A.mass + B.mass
					M_inverse = 1 / M

					switch @options.collisions
						when "merge"

							# Calculate new velocity from individual momentums
							A_momentum = A.velocity.scale A.mass
							B_momentum = B.velocity.scale B.mass
							C_momentum = A_momentum.add B_momentum
							C_velocity = C_momentum.scale M_inverse

							# Solve for center of mass
							R = A.position.scale(A.mass).add(B.position.scale(B.mass)).scale(M_inverse)

							# Create new star at center of mass
							@entities.push new Star(R.x, R.y, M, C_velocity.x, C_velocity.y, false)

							# Remove old points
							# TODO: sometimes removes incorrect points
							@entities.splice iA, 1
							@entities.splice iB, 1

						when "absorb"
							if A.mass > B.mass
								B.mass -= absorbtionRate
								A.mass += absorbtionRate
							else
								A.mass -= absorbtionRate
								B.mass += absorbtionRate

						when "elastic"
							# Stars bounce off of each other

							un = A.position.subtract(B.position).normalizeSelf()
							ut = new Vec2(-un.y, un.x)
							Avn = A.velocity.dot un
							Bvn = B.velocity.dot un

							temp = M_inverse * (Avn * (A.mass - B.mass) + 2 * B.mass * Bvn)
							Bvn = M_inverse * (Bvn * (B.mass - A.mass) + 2 * A.mass * Avn)
							Avn = temp

							A.velocity = un.scale(Avn).addSelf ut.scale(A.velocity.dot ut)
							B.velocity = un.scale(Bvn).addSelf ut.scale(B.velocity.dot ut)

						when "shatter"
							# Like elastic, but stars shatter if change
							# in momentum is too high (high impulse)

							un = A.position.subtract(B.position).normalizeSelf()
							ut = new Vec2(-un.y, un.x)
							Avn = A.velocity.dot un
							Bvn = B.velocity.dot un

							temp = M_inverse * (Avn * (A.mass - B.mass) + 2 * B.mass * Bvn)
							Bvn = M_inverse * (Bvn * (B.mass - A.mass) + 2 * A.mass * Avn)
							Avn = temp

							Av = un.scale(Avn).addSelf ut.scale(A.velocity.dot ut)
							Bv = un.scale(Bvn).addSelf ut.scale(B.velocity.dot ut)

							# Approximate force of collision
							# (same for A and B due to Newton's 3rd law)
							F = A.velocity.subtract(Av).magnitude() * A.mass

							if F > A.strength
								A.explode(Av, 3, Math.PI, @entities)
							else
								A.velocity = Av

							if F > B.strength
								B.explode(Bv, 3, Math.PI / 2, @entities)
							else
								A.velocity = Av

						when "explode"
							# Calculate new velocity from individual momentums
							A_momentum = A.velocity.scale A.mass
							B_momentum = B.velocity.scale B.mass
							C_momentum = A_momentum.add B_momentum
							C_velocity = C_momentum.scale M_inverse

							# Solve for center of mass
							R = A.position.scale(A.mass).add(B.position.scale(B.mass)).scale(M_inverse)

							# Create new star at center of mass
							s = new Star(R.x, R.y, M, C_velocity.x, C_velocity.y, false)
							@entities.push s
							s.explode(C_velocity, 5, 2 * Math.PI, @entities)

							# Remove old points
							# TODO: sometimes removes incorrect points
							@entities.splice @entities.indexOf(A), 1
							@entities.splice @entities.indexOf(B), 1

				return
			return
		@

	render: () ->

		if @options.motionBlur
			@ctx.fillStyle = "rgba(0,0,0,0.5)"
		else 
		 	@ctx.fillStyle = "black"

		@ctx.fillRect 0, 0, @ctx.canvas.width, @ctx.canvas.height

		@ctx.fillStyle = "rgba(255,255,255,0.5)"
		# @ctx.fillStyle = "#ffffff"
		# @ctx.setLineDash [0]

		for e, ei in @entities
			x = e.position.x
			y = e.position.y

			# Stars
			do @ctx.beginPath
			@ctx.arc x, y, e.radius, 0, 2 * Math.PI, false
			do @ctx.closePath

			# Mouse interaction
			if @input.mouse.tool is "select"
				m = new Vec2(@input.mouse.x, @input.mouse.y)
				willSelect = @input.mouse.isDown and e.inRegion(@input.mouse.dragStartX, @input.mouse.dragStartY, @input.mouse.dx, @input.mouse.dy)
				if m.dist(e.position) < e.radius or willSelect or @selectedEntities.indexOf(e) >= 0
					@ctx.strokeStyle = "#ffffff"
					@ctx.strokeWidth = 2
					do @ctx.stroke
				if @selectedEntities.indexOf(e) >= 0
					@ctx.fillStyle = "#00aced"
			do @ctx.fill

			# Trail Vectors
			if @options.trail and e instanceof Star
				@ctx.strokeWidth = 1
				@ctx.strokeStyle = "rgba(255,255,255,0.5)"
				do @ctx.save
				for i in [1...@options.trailLength]
					do @ctx.beginPath
					if @options.trailFade
						@ctx.globalAlpha = i / e.trailX.length
					@ctx.moveTo e.trailX[i-1], e.trailY[i-1]
					@ctx.lineTo e.trailX[i], e.trailY[i]
					do @ctx.stroke
				do @ctx.restore

			if @options.inspector
				# Acceleration Vectors
				@ctx.strokeStyle = "rgba(255,0,255,1)"
				do @ctx.beginPath
				@ctx.moveTo x, y
				@ctx.lineTo x + 1000 * e.position.ax, y + 1000 * e.position.ay
				do @ctx.stroke

				# Velocity Vectors
				@ctx.strokeStyle = "rgba(0,255,0,1)"
				do @ctx.beginPath
				@ctx.moveTo x, y
				@ctx.lineTo x + 10 * e.position.vx, y + 10 * e.position.vy
				do @ctx.stroke

		# Mouse drag
		if @input.mouse.isDown
			switch @input.mouse.tool
				when "select"
					# do @ctx.beginPath
					@ctx.lineDashOffset = (@ctx.lineDashOffset + 0.5) % 10;
					do @ctx.save
					@ctx.strokeStyle = "#00aced"
					@ctx.fillStyle = "#00aced"
					@ctx.lineWidth = 2
					@ctx.setLineDash [5]
					@ctx.strokeRect @input.mouse.dragStartX, @input.mouse.dragStartY, @input.mouse.dx, @input.mouse.dy
					@ctx.globalAlpha = 0.5
					@ctx.fillRect @input.mouse.dragStartX, @input.mouse.dragStartY, @input.mouse.dx, @input.mouse.dy
					do @ctx.restore

				when "create"
					v = new Vec2(@input.mouse.dx, @input.mouse.dy)
					uv = do v.normalize
					unv = new Vec2(-uv.y, uv.x)

					p1 = v.subtract uv.subtract(unv).scale(10)
					p2 = p1.subtract unv.scale(20)

					Xend = @input.mouse.dragStartX + @input.mouse.dx
					Yend = @input.mouse.dragStartY + @input.mouse.dy

					@ctx.strokeStyle = "rgba(255,0,0,1)"

					do @ctx.beginPath
					@ctx.moveTo @input.mouse.dragStartX, @input.mouse.dragStartY
					@ctx.lineTo Xend, Yend
					@ctx.lineTo @input.mouse.dragStartX + p1.x, @input.mouse.dragStartY + p1.y
					@ctx.moveTo @input.mouse.dragStartX + p2.x, @input.mouse.dragStartY + p2.y
					@ctx.lineTo Xend, Yend
					do @ctx.stroke

		if @options.inspector
			# Global values
			@ctx.fillStyle = "rgba(255,255,255,0.75)"
			@ctx.font = "12pt Courier New"
			KE = @totalKineticEnergy.toFixed(2)
			PE = @totalPotentialEnergy.toFixed(2)
			TE = (@totalKineticEnergy + @totalPotentialEnergy).toFixed(2)
			@ctx.fillText "Kinetic Energy: " + KE, 0, 16
			@ctx.fillText "Potential Energy: " + PE, 0, 32
			@ctx.fillText "Total Energy: " + TE, 0, 48
			# @ctx.fillText "KE-: " + TE, 0, 48
		@
