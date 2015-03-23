# Vector Processor
class Vec3
    constructor: (@x, @y, @z) ->

    cross: (v) ->
        new Vec3(@y * v.z - @z * v.y, @x * v.z - @z * v.x, @x * v.y - @y * v.x)

class Vec2
    constructor: (@x, @y) ->

    set: (@x, @y) -> @

    transform: (fn, args) ->
        new Vec2(fn.apply(null, [@x].concat(args)),
            fn.apply(null, [@y].concat(args)))

    transformSelf: (fn, args) ->
        @x = fn.apply(null, [@x].concat(args))
        @y = fn.apply(null, [@y].concat(arge))
        @

    setPolar: (r, theta) ->
        @x = r * Math.cos theta
        @y = r * Math.sin theta
        @

    add: (v) -> new Vec2(@x + v.x, @y + v.y)

    subtract: (v) -> new Vec2(@x - v.x, @y - v.y)

    scale: (v) -> new Vec2(@x * v, @y * v)

    magnitude: () -> Math.sqrt(@x * @x + @y * @y)

    magnitudeSq: () -> @x * @x + @y * @y

    midpoint: (v) ->
        # new Vec2(0.5 * (@x + v.x), 0.5 * (@y + v.y));
        @add(v).scale(0.5)

    normalize: () ->
        iMag = 1 / @magnitude()
        new Vec2(@x * iMag, @y * iMag)

    # Dot product
    dot: (v) -> @x * v.x + @y * v.y

    # Magnitude of cross product
    crossMag: (v) ->
        # (@magnitude() * v.magnitude()) * Math.sin(@angleFrom(v))
        @x * v.y - @y * v.x

    angle: () ->
        Math.atan2 @y, @x

    angleFrom: (v) ->
        Math.acos(@dot(v) / (@magnitude() * v.magnitude()))

    copy: (v) -> new Vec2(v.x, v.y)

    dist: (v) ->
        dx = v.x - @x
        dy = v.y - @y
        Math.sqrt(dx*dx + dy*dy)

    distSq: (v) ->
        dx = v.x - @x
        dy = v.y - @y
        dx*dx + dy*dy

    addSelf: (v) ->
        @x += v.x
        @y += v.y
        @

    subtractSelf: (v) ->
        @x -= v.x
        @y -= v.y
        @

    scaleSelf: (k) ->
        @x *= k
        @y *= k
        @

    zero: () ->
        @x = 0
        @y = 0
        @

    normalizeSelf: () ->
        iMag = 1 / @magnitude()
        @x *= iMag
        @y *= iMag
        @

    inspect: (n = 2) ->
        "(" + @x.toFixed(n) + ", " + @y.toFixed(n) + ")"

Vec2.add = (a, b) -> new Vec2(a.x + b.x, a.y + b.y)
Vec2.subtract = (a, b) -> new Vec2(a.x - b.x, a.y - b.y)
Vec2.scale = (a, k) -> new Vec2(k * a.x, k * a.y)
Vec2.normalize = (a) -> new Vec2(k * a.x, k * a.y)
