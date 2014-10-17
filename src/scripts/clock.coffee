# TIMING CLOCK

class Clock
	constructor: () ->
		@_last = 0
		@time = Number.MIN_VALUE
		@timeScale = 100
		@max_dt = 1 / 60
		@callbacks = []
		@dt = @max_dt

	register: (cb, context) ->
		@callbacks.push cb.bind(context)
		@

	delta: () ->
		# 0.001 * (Date.now() - @_last)
		@time - @_last

	tick: () ->
		@dt = @timeScale * Math.min Date.now() - @_last, @max_dt
		@_last = @time
		@time += @dt
		do cb for cb in @callbacks
		@
