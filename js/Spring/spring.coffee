###
Copyright (c) 2010-2011 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
###

# (note: recompile in-place with 'coffee -cwo . .')

WIDTH = 400
timer1 = null
paper = null
midLineYellow = null
midLineGreen = null
NUM = 16
x = []
y = []
dx = []
dy = []





initData = ->
  paper = Raphael("TheCanvas", WIDTH, WIDTH)
  @manager = new ShapeManager(paper, WIDTH)

  for i in [0..NUM]

    x0 = (i+1) * WIDTH / (NUM+2);
    y0 = WIDTH / 2;
    atEnd = (i==0 || i==NUM)

    @manager.add( x0, y0, atEnd)

    x.push(x0)
    y.push(y0)
    dx.push(0)
    dy.push(0)



updatePositions = ->
  # gravity
  f1 = 2.0
  f2x = 1.0

  # spring constant
  f2y = 1.0
  f3x = 0.05

  # time slice
  f3y = 0.05

  # friction
  f4x = 0.1
  f4y = 0.1


  # compute current velocities, using acceleration due to gravity and spring
  for i in [0..NUM]
    if (i == 0 || i == NUM)
      continue

    if (@manager.isTracked(i))
      continue

    ax = 0
    ay = 0

    ay = f1
    ax = 0

    ax += f2x * (x[i - 1] - x[i])
    ay += f2y * (y[i - 1] - y[i] )

    ax += f2x * (x[i + 1] - x[i] );
    ay += f2y * (y[i + 1] - y[i] );

    ax -= f4x * dx[i];
    ay -= f4y * dy[i];

    dx[i] += f3x * ax;
    dy[i] += f3y * ay;


  # compute current positions, using velocity
  for i in [0..NUM]
    if @manager.isTracked(i)
      x[i] = @manager.getX(i)
      y[i] = @manager.getY(i)
    else
      x[i] += dx[i]
      y[i] += dy[i]
      @manager.setXY( i, x[i], y[i] )




# every 1000 ms -- animate
onTimer1 = ->
  updatePositions()


$(document).ready ->
  initData()
  timer1 = setInterval(onTimer1, 100)



$(document).unload ->
  clearInterval( timer1 ) unless timer1==null
  timer1 = null

