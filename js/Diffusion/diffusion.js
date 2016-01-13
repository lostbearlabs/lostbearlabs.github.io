
/*
Copyright (c) 2010-2011 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
*/

(function() {
  var collision2Ds, inContact, initData, isAtEdge, isLeft, isOnOwnSide, midLineGreen, midLineYellow, onTimer1, onTimer2, paper, rnd, switchMembrane, updatePositions, _HEIGHT, _WIDTH, _diffuse, _dot, _dotOnItsOwnSide, _dx, _dy, _green, _num, _rDot, _timer1, _timer2, _x, _xMax, _xMid, _xMin, _y, _yMax, _yMin, _yellow;

  _WIDTH = 400;

  _HEIGHT = 400;

  _x = [];

  _y = [];

  _dx = [];

  _dy = [];

  _num = 20;

  _dot = [];

  _dotOnItsOwnSide = [];

  _xMin = _xMax = _yMin = _yMax = 0;

  _xMid = 0;

  _rDot = 10;

  _diffuse = false;

  _timer1 = null;

  _timer2 = null;

  paper = null;

  midLineYellow = null;

  midLineGreen = null;

  _green = "#0f0";

  _yellow = "#ff0";

  isOnOwnSide = function(i) {
    if (isLeft(i)) {
      return _x[i] < (_xMid - _rDot);
    } else {
      return _x[i] > (_xMid + _rDot);
    }
  };

  isAtEdge = function(i) {
    var isBeyondMax, isBeyondMid, isBeyondMin;
    isBeyondMin = _x[i] <= _xMin + _rDot;
    isBeyondMid = !isOnOwnSide(i);
    isBeyondMax = _x[i] >= (_xMax - _rDot);
    if (_diffuse) {
      if (!isBeyondMid) _dotOnItsOwnSide[i] = true;
      if (_dotOnItsOwnSide[i]) return isBeyondMid;
    }
    return false;
  };

  updatePositions = function() {
    var i, j, tmpA, tmpB, tmpC, tmpD, _ref, _results;
    for (i = 0; 0 <= _num ? i < _num : i > _num; 0 <= _num ? i++ : i--) {
      for (j = 0; 0 <= _num ? j < _num : j > _num; 0 <= _num ? j++ : j--) {
        if (inContact(i, j)) {
          _ref = collision2Ds(1.0, 1.0, 1.0, _x[i] + _rDot, _y[i] + _rDot, _x[j] + _rDot, _y[j] + _rDot, _dx[i], _dy[i], _dx[j], _dy[j]), tmpA = _ref[0], tmpB = _ref[1], tmpC = _ref[2], tmpD = _ref[3];
          _dx[i] = tmpA;
          _dy[i] = tmpB;
          _dx[j] = tmpC;
          _dy[j] = tmpD;
        }
      }
    }
    _results = [];
    for (i = 0; 0 <= _num ? i < _num : i > _num; 0 <= _num ? i++ : i--) {
      _x[i] += _dx[i];
      _y[i] += _dy[i];
      _dot[i].attr({
        cx: _x[i],
        cy: _y[i]
      });
      if (_y[i] <= _yMin + _rDot) {
        _dy[i] = Math.abs(_dy[i]);
      } else if (_y[i] >= (_yMax - _rDot)) {
        _dy[i] = -Math.abs(_dy[i]);
      }
      if (isAtEdge(i)) {
        if (isLeft(i)) {
          _dx[i] = -Math.abs(_dx[i]);
        } else {
          _dx[i] = Math.abs(_dx[i]);
        }
      }
      if (_x[i] <= _xMin + _rDot) {
        _results.push(_dx[i] = Math.abs(_dx[i]));
      } else if (_x[i] >= (_xMax - _rDot)) {
        _results.push(_dx[i] = -Math.abs(_dx[i]));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  onTimer2 = function() {
    return updatePositions();
  };

  onTimer1 = function() {
    var allOwnSide, i;
    allOwnSide = true;
    for (i = 0; 0 <= _num ? i < _num : i > _num; 0 <= _num ? i++ : i--) {
      if (!isOnOwnSide(i)) allOwnSide = false;
    }
    if (allOwnSide === true || !_diffuse) return switchMembrane();
  };

  isLeft = function(i) {
    return i < (_num / 2);
  };

  rnd = function(x) {
    return Math.floor(Math.random() * x);
  };

  initData = function() {
    var color, i, midLineWidth, vFactor, x, y, z, _results;
    paper = Raphael("TheCanvas", _WIDTH, _HEIGHT);
    _xMin = 0;
    _xMax = 0;
    _xMax = _WIDTH;
    _yMax = _HEIGHT;
    _xMid = _xMax / 2;
    midLineWidth = 5;
    midLineYellow = paper.rect(_xMid - midLineWidth, 0, midLineWidth, _yMax);
    midLineGreen = paper.rect(_xMid, 0, midLineWidth, _yMax);
    midLineYellow.attr("fill", _yellow);
    midLineGreen.attr("fill", _green);
    midLineYellow.attr("stroke-width", "0");
    midLineGreen.attr("stroke-width", "0");
    midLineYellow.attr("fill-opacity", "0");
    midLineGreen.attr("fill-opacity", "0");
    _results = [];
    for (i = 0; 0 <= _num ? i < _num : i > _num; 0 <= _num ? i++ : i--) {
      x = _rDot + rnd(_xMax - 2 * _rDot);
      y = _rDot + rnd(_yMax - 2 * _rDot);
      _x[i] = x;
      _y[i] = y;
      z = paper.circle(x, y, _rDot);
      color = isLeft(i) ? _green : _yellow;
      z.attr("fill", color);
      z.attr("stroke-width", "0");
      _dot[i] = z;
      vFactor = 10.0;
      _dx[i] = (rnd(100) - 50) / vFactor;
      _results.push(_dy[i] = (rnd(100) - 50) / vFactor);
    }
    return _results;
  };

  $(document).ready(function() {
    initData();
    _timer1 = setInterval(onTimer1, 30 * 1000);
    return _timer2 = setInterval(onTimer2, 100);
  });

  $(document).load(function() {});

  $(document).unload(function() {
    if (_timer1 !== null) clearInterval(_timer1);
    _timer1 = null;
    if (_timer2 !== null) clearInterval(_timer2);
    return _timer2 = null;
  });

  switchMembrane = function() {
    var i, _results;
    if (!_diffuse) {
      _diffuse = true;
      midLineYellow.attr("fill-opacity", "1");
      midLineGreen.attr("fill-opacity", "1");
      _results = [];
      for (i = 0; 0 <= _num ? i <= _num : i >= _num; 0 <= _num ? i++ : i--) {
        _results.push(_dotOnItsOwnSide[i] = isOnOwnSide(i));
      }
      return _results;
    } else {
      _diffuse = false;
      midLineYellow.attr("fill-opacity", "0");
      return midLineGreen.attr("fill-opacity", "0");
    }
  };

  inContact = function(i, j) {
    var dx, dy;
    if (i === j) return false;
    dx = _x[i] - _x[j];
    dy = _y[i] - _y[j];
    return (dx * dx + dy * dy) <= (_rDot * _rDot);
  };

  collision2Ds = function(m1, m2, R, x1, y1, x2, y2, vx1, vy1, vx2, vy2) {
    var a, dvx2, fy21, m21, sign, vx21, vx_cm, vy21, vy_cm, x21, y21;
    m21 = m2 / m1;
    x21 = x2 - x1;
    y21 = y2 - y1;
    vx21 = vx2 - vx1;
    vy21 = vy2 - vy1;
    vx_cm = (m1 * vx1 + m2 * vx2) / (m1 + m2);
    vy_cm = (m1 * vy1 + m2 * vy2) / (m1 + m2);
    if ((vx21 * x21 + vy21 * y21) >= 0) return [vx1, vy1, vx2, vy2];
    fy21 = 0.000000000001 * Math.abs(y21);
    if (Math.abs(x21) < fy21) {
      sign = x21 < 0 ? -1 : 1;
      x21 = fy21 * sign;
    }
    a = y21 / x21;
    dvx2 = -2 * (vx21 + a * vy21) / ((1 + a * a) * (1 + m21));
    vx2 = vx2 + dvx2;
    vy2 = vy2 + a * dvx2;
    vx1 = vx1 - m21 * dvx2;
    vy1 = vy1 - a * m21 * dvx2;
    vx1 = (vx1 - vx_cm) * R + vx_cm;
    vy1 = (vy1 - vy_cm) * R + vy_cm;
    vx2 = (vx2 - vx_cm) * R + vx_cm;
    vy2 = (vy2 - vy_cm) * R + vy_cm;
    return [vx1, vy1, vx2, vy2];
  };

}).call(this);
