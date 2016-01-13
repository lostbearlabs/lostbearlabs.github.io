
/*
Copyright (c) 2010-2011 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
*/

(function() {
  var DRV_I, DRV_J, HEIGHT, N, WIDTH, computeForces, inMovingRegion, initData, initDot, isDriverCell, onTick, onTimer1, recolor, rnd, update, _dot, _driving, _dz, _dz0, _paper, _tickCount, _timer1, _z, _z0;

  WIDTH = 400;

  HEIGHT = 400;

  _z = [];

  _dz = [];

  _dot = [];

  N = 40;

  DRV_I = N / 2;

  DRV_J = N / 2;

  _dot = [];

  _timer1 = null;

  _paper = null;

  _z0 = 0;

  _dz0 = 0.1;

  _driving = true;

  _tickCount = 0;

  onTimer1 = function() {
    return onTick();
  };

  rnd = function(x) {
    return Math.floor(Math.random() * x);
  };

  recolor = function(i, j) {
    var z;
    z = _z[i][j];
    if (isNaN(z)) z = 0;
    z = Math.min(z, 1.0);
    z = Math.max(z, -1.0);
    return _dot[i][j].attr("opacity", (z + 1) / 2.0);
  };

  initDot = function(w, i, j) {
    var z;
    z = _paper.rect(i * w, j * w, w, w);
    z.attr("fill", "#00f");
    z.attr("stroke-width", "0");
    z.attr("opacity", "0.50");
    _dot[i][j] = z;
    _z[i][j] = 0;
    _dz[i][j] = 0;
    return recolor(i, j);
  };

  initData = function() {
    var i, j, w, _results;
    _paper = Raphael("TheCanvas", WIDTH, HEIGHT);
    w = 400 / N;
    _results = [];
    for (i = 0; 0 <= N ? i < N : i > N; 0 <= N ? i++ : i--) {
      _z.push([]);
      _dz.push([]);
      _dot.push([]);
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (j = 0; 0 <= N ? j < N : j > N; 0 <= N ? j++ : j--) {
          _results2.push(initDot(w, i, j));
        }
        return _results2;
      })());
    }
    return _results;
  };

  $(document).ready(function() {
    initData();
    return _timer1 = setInterval(onTimer1, 100);
  });

  $(document).load(function() {});

  $(document).unload(function() {
    if (_timer1 !== null) clearInterval(_timer1);
    return _timer1 = null;
  });

  inMovingRegion = function(i, j) {
    return i > 0 && i < N - 1 && j > 0 && j < N - 1;
  };

  isDriverCell = function(i, j) {
    return i === DRV_I && j === DRV_J;
  };

  update = function(i, j) {
    var friction;
    if (!inMovingRegion(i, j)) return;
    if (isNaN(_dz[i][j])) _dz[i][j] = 0;
    friction = _driving ? 100.0 : 25.0;
    _dz[i][j] -= _dz[i][j] / friction;
    _z[i][j] -= _dz[i][j] / N;
    return recolor(i, j);
  };

  computeForces = function(i, j) {
    var f, i2, j2, n, x, y, z;
    if (isDriverCell(i, j) || !inMovingRegion(i, j)) return;
    f = 0.0;
    z = _z[i][j];
    if (isNaN(z)) z = 0;
    n = 0;
    if (isNaN(_dz[i][j])) _dz[i][j] = 0;
    for (x = -1; x <= 1; x++) {
      for (y = -1; y <= 1; y++) {
        i2 = i + x;
        j2 = j + y;
        if (inMovingRegion(i2, j2) || isDriverCell(i2, j2)) {
          f += _z[i2][j2] - z;
          n++;
        } else {
          f += 0 - z;
          n++;
        }
      }
    }
    return _dz[i][j] -= f / n;
  };

  onTick = function() {
    var delay, i, j, q, _ref, _ref2, _results;
    delay = _driving ? 400 : 100;
    _tickCount = (_tickCount + 1) % delay;
    if (_tickCount === 0) _driving = !_driving;
    if (_driving) {
      _z0 += _dz0;
      if (_z0 >= 1.0 || _z0 <= -1.0) _dz0 *= -1;
      _z[DRV_I][DRV_J] = 2 * _z0;
      recolor(DRV_I, DRV_J);
    } else {
      _z[DRV_I][DRV_J] = 0;
      recolor(DRV_I, DRV_J);
    }
    for (q = 0; q < 5; q++) {
      for (i = 1, _ref = N - 1; 1 <= _ref ? i < _ref : i > _ref; 1 <= _ref ? i++ : i--) {
        for (j = 1, _ref2 = N - 1; 1 <= _ref2 ? j < _ref2 : j > _ref2; 1 <= _ref2 ? j++ : j--) {
          computeForces(rnd(N), rnd(N));
        }
      }
    }
    _results = [];
    for (i = 0; 0 <= N ? i < N : i > N; 0 <= N ? i++ : i--) {
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (j = 0; 0 <= N ? j < N : j > N; 0 <= N ? j++ : j--) {
          _results2.push(update(i, j));
        }
        return _results2;
      })());
    }
    return _results;
  };

}).call(this);
