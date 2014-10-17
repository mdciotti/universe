# MISCELLANEOUS FUNCTIONS AND UTILITIES

wrapAround = (value, modulus) ->
	if value > 0 then value % modulus else value + modulus

constrain = (value, min, max) ->
	Math.min max, Math.max(min, value)
