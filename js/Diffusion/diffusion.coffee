###
Copyright (c) 2010-2011 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
###

# (note: recompile in-place with 'coffee -cwo . .')

_WIDTH = 400
_HEIGHT = 400
_x = []
_y = []
_dx = []
_dy = []
_num = 20
_dot = []
_dotOnItsOwnSide = []

_xMin = _xMax = _yMin = _yMax = 0
_xMid = 0

_rDot = 10
_diffuse = false

_timer1 = null
_timer2 = null

paper = null
midLineYellow = null
midLineGreen = null

_green = "#0f0"
_yellow = "#ff0"


isOnOwnSide = (i) ->
  if (isLeft(i))
    return (_x[i] < (_xMid - _rDot));
  else
    return (_x[i] > (_xMid + _rDot));



isAtEdge = (i) ->
  isBeyondMin = (_x[i] <= _xMin+_rDot)
  isBeyondMid = !isOnOwnSide(i)
  isBeyondMax = (_x[i] >= (_xMax - _rDot))

  if (_diffuse)
    # record the first time when a dot crosses into its own region
    if (!isBeyondMid)
      _dotOnItsOwnSide[i] = true
    #if a dot has been in the correct side, then don't let it leave
    if (_dotOnItsOwnSide[i])
      return isBeyondMid

  false




updatePositions = ->
  for i in [0..._num]
    for j in [0..._num]
      if (inContact(i, j))
        [ tmpA, tmpB, tmpC, tmpD ] = collision2Ds(1.0, 1.0, 1.0, _x[i]+_rDot, _y[i]+_rDot, _x[j]+_rDot, _y[j]+_rDot, _dx[i], _dy[i], _dx[j], _dy[j])
        _dx[i] = tmpA
        _dy[i] = tmpB
        _dx[j] = tmpC
        _dy[j] = tmpD


  for i in [0..._num]
    _x[i] += _dx[i];
    _y[i] += _dy[i];

    _dot[i].attr( {cx: _x[i], cy: _y[i]} )

    if (_y[i] <= _yMin+_rDot )
      _dy[i] = Math.abs(_dy[i]);
    else if (_y[i] >= (_yMax - _rDot))
      _dy[i] = -Math.abs(_dy[i]);

    if (isAtEdge(i))
      if( isLeft(i) )
        _dx[i] = -Math.abs(_dx[i]);
      else
        _dx[i] = Math.abs(_dx[i]);

    if (_x[i] <= _xMin+_rDot)
      _dx[i] = Math.abs(_dx[i]);
    else if (_x[i] >= (_xMax - _rDot))
      _dx[i] = -Math.abs(_dx[i])




# every 100ms -- animate
onTimer2 = ->
  updatePositions()


# every 30 seconds -- enable barrier
onTimer1 = ->
  allOwnSide = true;
  for i in [0..._num]
    if (!isOnOwnSide(i))
      allOwnSide = false

  if( allOwnSide==true || !_diffuse )
    switchMembrane()


isLeft = (i) ->
  i < (_num / 2)


rnd = (x) ->
  Math.floor(Math.random() * x)


initData = ->

  paper = Raphael("TheCanvas", _WIDTH, _HEIGHT);

  _xMin = 0;
  _xMax = 0;
  _xMax = _WIDTH
  _yMax = _HEIGHT
  _xMid = _xMax / 2;

  midLineWidth = 5
  midLineYellow = paper.rect(_xMid-midLineWidth, 0, midLineWidth, _yMax)
  midLineGreen = paper.rect(_xMid, 0, midLineWidth, _yMax)
  midLineYellow.attr("fill", _yellow)
  midLineGreen.attr("fill", _green)
  midLineYellow.attr("stroke-width", "0")
  midLineGreen.attr("stroke-width", "0")
  midLineYellow.attr("fill-opacity", "0")
  midLineGreen.attr("fill-opacity", "0")

  for i in [0..._num]

    x = _rDot + rnd(_xMax - 2*_rDot)
    y = _rDot + rnd(_yMax - 2*_rDot)
    _x[i] = x
    _y[i] = y

    z = paper.circle(x, y, _rDot)
    color = if isLeft(i) then _green else _yellow
    z.attr("fill", color)
    z.attr("stroke-width", "0")
    _dot[i] = z


    vFactor = 10.0
    _dx[i] = (rnd(100) - 50) / vFactor
    _dy[i] = (rnd(100) - 50) / vFactor
  #end for i






$(document).ready ->
  initData()

  _timer1 = setInterval(onTimer1, 30*1000)
  _timer2 = setInterval(onTimer2, 100)



$(document).load ->


$(document).unload ->
  clearInterval( _timer1 ) unless _timer1==null
  _timer1 = null
  clearInterval( _timer2 ) unless _timer2==null
  _timer2 = null




switchMembrane = ->
    if (!_diffuse)
      _diffuse = true
      midLineYellow.attr("fill-opacity", "1")
      midLineGreen.attr("fill-opacity", "1")

      for i in [0.._num]
        _dotOnItsOwnSide[i] = isOnOwnSide(i)
    else

      _diffuse = false
      midLineYellow.attr("fill-opacity", "0")
      midLineGreen.attr("fill-opacity", "0")


inContact = (i,j) ->
  return false if i==j
  dx = _x[i] - _x[j];
  dy = _y[i] - _y[j];
  (dx * dx + dy * dy) <= (_rDot * _rDot)



# adapted from:
# http://www.plasmaphysics.org.uk/programs/coll2d_cpp.htm
collision2Ds = (m1, m2, R, x1, y1, x2, y2, vx1, vy1, vx2, vy2) ->

  #m21, dvx2, a, x21, y21, vx21, vy21, fy21, sign, vx_cm, vy_cm;


  m21 = m2 / m1
  x21 = x2 - x1
  y21 = y2 - y1
  vx21 = vx2 - vx1
  vy21 = vy2 - vy1

  vx_cm = (m1 * vx1 + m2 * vx2) / (m1 + m2)
  vy_cm = (m1 * vy1 + m2 * vy2) / (m1 + m2)


  #     *** return old velocities if balls are not approaching ***
  if ((vx21 * x21 + vy21 * y21) >= 0)
    return [vx1, vy1, vx2, vy2]


  #     *** I have inserted the following statements to avoid a zero divide;
  #         (for single precision calculations,
  #          1.0E-12 should be replaced by a larger value). **************

  fy21 = 0.000000000001 * Math.abs(y21)
  if (Math.abs(x21) < fy21)
    sign = if x21<0 then -1 else 1
    x21 = fy21 * sign

  #     ***  update velocities ***
  a = y21 / x21
  dvx2 = -2 * (vx21 + a * vy21) / ((1 + a * a) * (1 + m21))
  vx2 = vx2 + dvx2
  vy2 = vy2 + a * dvx2
  vx1 = vx1 - m21 * dvx2
  vy1 = vy1 - a * m21 * dvx2

  #     ***  velocity correction for inelastic collisions ***
  vx1 = (vx1 - vx_cm) * R + vx_cm
  vy1 = (vy1 - vy_cm) * R + vy_cm
  vx2 = (vx2 - vx_cm) * R + vx_cm
  vy2 = (vy2 - vy_cm) * R + vy_cm

  return [vx1, vy1, vx2, vy2]
