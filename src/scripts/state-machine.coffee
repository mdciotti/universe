# STATE MACHINE

class StateMachine

	@::currentState = 0
	@::states = []

	constructor: (states) ->
		states.forEach (s, i) =>
			@states[s] = Math.pow(2, i)

	isEnabled: (state...) ->
		(state.reduce ((s1, s2) -> s1 & s2), @state) isnt 0

	enable: (state) ->
		@state |= @states[state]
		@

	disable: (state) ->
		@state &= ~@states[state]
		@

	toggle: (state) ->
		@state ^= @states[state]
		@
