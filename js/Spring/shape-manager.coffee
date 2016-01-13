
class ShapeManager
  constructor: (@panel, @size) ->
    @shapes = []
    @rDot = 10


  isTracked: (i) => @shapes[i].tracked

  getX: (i) -> @shapes[i].attr("cx")
  getY: (i) -> @shapes[i].attr("cy")
  setXY: (i, x, y) -> @shapes[i].attr( {cx: x, cy: y})

  add: (x, y, atEnd) ->

    shape  = @panel.circle(x, y, @rDot)
    color = if atEnd then "#f00" else "#0f0"
    shape.attr("fill", color)
    shape.attr("stroke-width", "0")
    shape.attr( {cx: x, cy: y} )
 #   console.log("new shape: #{x},#{y}")
    minPos = @rDot
    maxPos = @size - @rDot

    @shapes.push shape

    onMove = (dx, dy, x, y, obj) ->
#      console.log "onMove: #{dx}, #{dy}, #{x}, #{y}"
      cx = @x0 + dx
      cy = @y0 + dy
      cx = Math.max(cx,minPos)
      cy = Math.max(cy,minPos)
      cx = Math.min(cx,maxPos)
      cy = Math.min(cy,maxPos)
      shape.attr( {cx: cx, cy: cy} )

    onStart = (x, y, obj) ->
      @x0 = shape.attr("cx")
      @y0 = shape.attr("cy")
      shape.attr("opacity", 0.5)
#      console.log "onStart: #{x}, #{y} -- #{@x0},#{@y0}"
      shape.tracked = true

    onEnd = (e, obj) ->
#      console.log "onEnd: #{e.x}, #{e.y}"
      shape.tracked = false
      shape.attr("opacity", 1.0)

    shape.drag onMove, onStart, onEnd




root = exports ? window
root.ShapeManager = ShapeManager
