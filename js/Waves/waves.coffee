###
Copyright (c) 2010-2011 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
###

# (note: recompile in-place with 'coffee -cwo . .')

WIDTH = 400
HEIGHT = 400
_z = []
_dz = []
_dot = []
N = 40
DRV_I = N/2
DRV_J = N/2
_dot = []

_timer1 = null
_paper = null

_z0 = 0
_dz0 = 0.1
_driving = true
_tickCount = 0


# every 100ms -- animate
onTimer1 = ->
  onTick()

rnd = (x) ->
  Math.floor(Math.random() * x)



recolor = (i,j) ->
  z = _z[i][j]
  z = 0 if isNaN(z)
  z = Math.min(z, 1.0);
  z = Math.max(z, -1.0);
  _dot[i][j].attr("opacity", (z + 1)/2.0)


initDot = (w,i,j) ->
  z = _paper.rect( i*w, j*w, w, w)
  z.attr("fill", "#00f")
  z.attr("stroke-width", "0")
  z.attr("opacity", "0.50")
  _dot[i][j] = z
  _z[i][j] = 0
  _dz[i][j] = 0
  recolor(i,j)


initData = ->

  _paper = Raphael("TheCanvas", WIDTH, HEIGHT);

  w = 400/N

  for i in [0...N]
    _z.push []
    _dz.push []
    _dot.push []
    for j in [0...N]
      initDot(w, i, j)



$(document).ready ->
  initData()
  _timer1 = setInterval(onTimer1, 100)


$(document).load ->


$(document).unload ->
  clearInterval( _timer1 ) unless _timer1==null
  _timer1 = null



inMovingRegion = (i,j) ->
  (i > 0 && i < N - 1 && j > 0 && j < N - 1)

isDriverCell = (i,j) ->
  (i == DRV_I && j == DRV_J)


update = (i,j) ->
  return if !inMovingRegion(i,j)

  _dz[i][j] = 0 if isNaN(_dz[i][j])

  # reduce velocity for friction
  friction = if _driving then 100.0 else 25.0
  _dz[i][j] -= _dz[i][j] / friction

  # update position from velocity
  _z[i][j] -= _dz[i][j] / N

  recolor(i,j)



computeForces = (i,j) ->
  return if ( isDriverCell(i,j) || !inMovingRegion(i, j))

  f = 0.0
  z = _z[i][j]
  z = 0 if isNaN(z)
  n = 0
  _dz[i][j] = 0 if isNaN(_dz[i][j])

  # acceleration due to neighbors
  for x in [-1 .. 1]
    for y in [-1 .. 1]
      i2 = i + x
      j2 = j + y

      if(inMovingRegion(i2, j2) || isDriverCell(i2, j2))
        f += (_z[i2][j2] - z)
        n++
      else
        f += (0 - z)
        n++

  # update velocity from acceleration
  _dz[i][j] -= (f / n)




onTick = ->
  delay = if _driving then 400 else 100
  _tickCount = (_tickCount + 1) % delay
  if (_tickCount == 0)
    _driving = !_driving

  # update the driver cell
  if (_driving)
    _z0 += _dz0
    if (_z0 >= 1.0 || _z0 <= -1.0)
      _dz0 *= -1
    _z[DRV_I][DRV_J] = 2*_z0
    recolor(DRV_I, DRV_J)
  else
    _z[DRV_I][DRV_J] = 0
    recolor(DRV_I, DRV_J)

  # compute forces on each cell
  for q in [0 ... 5]
    for i in [1 ... N-1]
      for j in [1 ... N-1]
        computeForces( rnd(N), rnd(N) )

  # update velocity and position of each cell
  for i in [0 ... N]
    for j in [0 ... N]
      update(i,j)


