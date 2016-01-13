// Generated by CoffeeScript 1.4.0

/*
Copyright (c) 2010-2011 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
*/


(function() {
  var NUM, WIDTH, drawTriangle, dx, dy, initData, midLineGreen, midLineYellow, onTimer1, paper, tgl, timer1, x, x1, x2, x3, x4, y, y1, y2, y3, y4;

  WIDTH = 400;

  timer1 = null;

  paper = null;

  midLineYellow = null;

  midLineGreen = null;

  NUM = 16;

  x = [];

  y = [];

  dx = [];

  dy = [];

  paper = null;

  x1 = x2 = x3 = x4 = 0;

  y1 = y2 = y3 = y4 = 0;

  tgl = null;

  drawTriangle = function() {
    var path;
    path = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
    tgl = paper.path(path);
    tgl.attr("fill", "#0f0");
    return tgl.attr("stroke-width", "2");
  };

  initData = function() {
    var dot1, dot2, dot3, dot4;
    paper = Raphael("TheCanvas", WIDTH, WIDTH);
    x = WIDTH / 3;
    y = 2 * WIDTH / 3;
    dot1 = paper.circle(x, x, 10);
    dot2 = paper.circle(y, x, 10);
    dot3 = paper.circle(y, y, 10);
    dot4 = paper.circle(x, y, 10);
    x1 = 10;
    y1 = 20;
    x2 = 90;
    y2 = 40;
    return drawTriangle();
  };

  onTimer1 = function() {
    if (tgl !== null) {
      tgl.remove();
      tgl = null;
    }
    x1 = x1 + 1;
    y1 = y1 + 2;
    return drawTriangle();
  };

  $(document).ready(function() {
    initData();
    return timer1 = setInterval(onTimer1, 100);
  });

  $(document).unload(function() {
    if (timer1 !== null) {
      clearInterval(timer1);
    }
    return timer1 = null;
  });

}).call(this);
