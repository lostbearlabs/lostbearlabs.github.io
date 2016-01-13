// Copyright (c) 2007-2011 Eric R. Johnson, http://www.lostbearlabs.com
//
// All code on LostBearLabs.com is made available under the terms of the
// Artistic License 2.0, for details please see:
//    http://www.opensource.org/licenses/artistic-license-2.0.php

"use strict";

// BEGIN SCOPE CLOSURE
/*var POPCORN = */(function () {

    // *****************************************************
    // constants

    var LEFT_MARGIN = 4; // characters
    var CHAR_WIDTH = 10;
    var MAX_HEIGHT = 100;
    var BASE_HEIGHT = 350;
    var STATE_WAIT_TO_START = 1;
    var STATE_ENTERING = 2;
    var STATE_RUNNING = 3;
    var STATE_LEAVING = 4;
    var STATE_WAITING_TO_RESET = 5;
    var WAIT_TIME = 25;

    // *****************************************************
    // state variables

    var kernels = [];
    var canvas = null;
    var intervalID = null;
    var mode = STATE_WAIT_TO_START;
    var curWait = WAIT_TIME;


    // *****************************************************
    // resetAllKernels

    var resetAllKernels = function (setCaseToLower) {
        var i, krn;
        for (i = 0; i < kernels.length; i++) {
            krn = kernels[i];

            if (setCaseToLower) {
                krn.setCase(false);
            }
            krn.topped = false;
            krn.finished = false;
            krn.started = false;
        }
    };



    // *****************************************************
    // updateKernel -- update position and style of kernel during popping phase

    var updateKernel = function (krn) {
        var rem, speed, dist, y;

        if (krn.finished) { return false; }

        if (!krn.started) {
            if (Math.random() < 0.95) {
                return true;
            }
            krn.started = true;
        }


        y = krn.y;
        if (!krn.topped) {
            rem = y - krn.max;
            if (rem <= 0) {
                krn.topped = true;
                krn.setCase(true);
            }
            else {
                speed = rem / 10;
                if (speed < 1) { speed = 1; }
                y -= speed;
                if (y < krn.max) { y = krn.max; }
                krn.setY(y);
            }
        }
        else {
            dist = BASE_HEIGHT - y;
            rem = y - krn.max;
            if (dist > 0) {
                speed = rem / 10;
                if (speed < 1) { speed = 1; }
                y += speed;
                if (y > BASE_HEIGHT) { y = BASE_HEIGHT; }
                krn.setY(y);
            }
            else {
                krn.finished = true;
            }
        }

        return true;
    };

    // *****************************************************
    // exitKernel -- update position of kernel during exiting phase

    var exitKernel = function (krn) {
        var pos, delta;

        if (krn.finished) { return false; }

        if (!krn.started) {
            if (Math.random() < 0.95) {
                return true;
            }
            krn.started = true;
        }


        pos = krn.x;
        delta = Math.floor(Math.random() * 3);
        delta = Math.min(pos, delta);

        pos -= delta;
        krn.setX(pos);
        if (pos <= 0) {
            krn.finished = true;
            krn.para.style.visibility = "hidden";
        }

        return true;
    };



    // *****************************************************
    // enterKernel -- update position of kernel during entering phase

    var enterKernel = function (krn) {
        var pos, delta;

        if (krn.finished) { return false; }

        if (!krn.started) {
            if (Math.random() < 0.95) {
                return true;
            }
            krn.started = true;
            krn.x = 0;
            krn.para.style.visibility = "";
        }


        pos = krn.x;
        delta = Math.floor(Math.random() * 3);
        delta = Math.min(krn.pos - pos, delta);

        pos += delta;
        krn.setX(pos);
        if (pos >= krn.pos) {
            krn.finished = true;
        }

        return true;
    };




    // *****************************************************
    // onUpdate -- called every 100 ms by interval timer, update kernel state and position according to current state

    var onUpdate = function () {
        var i, bAnyLive;

        switch (mode) {
            case STATE_WAIT_TO_START:
                curWait--;
                if (curWait <= 0) {
                    mode = STATE_ENTERING;
                    resetAllKernels(true);
                }
                break;
            case STATE_ENTERING:
                bAnyLive = false;
                for (i = 0; i < kernels.length; i++) {
                    if (enterKernel(kernels[i])) {
                        bAnyLive = true;
                    }
                }
                if (!bAnyLive) {
                    mode = STATE_RUNNING;
                    resetAllKernels(false);
                }
                break;
            case STATE_RUNNING:
                bAnyLive = false;
                for (i = 0; i < kernels.length; i++) {
                    if (updateKernel(kernels[i])) {
                        bAnyLive = true;
                    }
                }
                if (!bAnyLive) {
                    mode = STATE_LEAVING;
                    resetAllKernels(false);
                }
                break;
            case STATE_LEAVING:
                bAnyLive = false;
                for (i = 0; i < kernels.length; i++) {
                    if (exitKernel(kernels[i])) {
                        bAnyLive = true;
                    }
                }
                if (!bAnyLive) {
                    mode = STATE_WAITING_TO_RESET;
                    curWait = WAIT_TIME;
                }
                break;
            case STATE_WAITING_TO_RESET:
                curWait--;
                if (curWait < 0) {
                    mode = STATE_WAIT_TO_START;
                    curWait = WAIT_TIME;
                }
                break;
        }
    };



    // *****************************************************
    // AddKernel

    var addKernel = function (st, pos) {
        // create the character and put it on the page
        var krn = {};

        krn.para = document.createElement("p");
        krn.para.style.position = "absolute";
        krn.para.style.color = "rgb(102, 102, 102)";
        krn.para.style.visibility = "hidden";
        krn.started = false;
        krn.topped = false;
        krn.finished = false;

        krn.node = document.createTextNode(st);
        krn.pos = pos;

        krn.max = BASE_HEIGHT - ((BASE_HEIGHT - MAX_HEIGHT) * Math.random());

        krn.para.parent = canvas;
        canvas.appendChild(krn.para);

        krn.para.appendChild(krn.node);


        krn.setCase = function (upper) {
            if (upper) {
                krn.para.firstChild.nodeValue = krn.para.firstChild.nodeValue.toUpperCase();
            }
            else {
                krn.para.firstChild.nodeValue = krn.para.firstChild.nodeValue.toLowerCase();
            }
        };

        krn.setX = function (charPos) {
            krn.x = charPos;
            krn.para.style.left = "" + (LEFT_MARGIN + charPos) * CHAR_WIDTH + "px";
        };

        krn.setY = function (pixelPos) {
            krn.y = pixelPos;
            krn.para.style.top = "" + krn.y + "px";
        };


        krn.setY(BASE_HEIGHT);
        krn.setX(pos);

        // add the character to our animation list
        kernels.push(krn);
    };

    // *****************************************************
    // AddKernels

    var addKernels = function () {
        var i, n;
        n = 3;
        for (i = 0; i < 4; i++) {
            addKernel("p", n++);
            addKernel("o", n++);
            addKernel("p", n++);
            addKernel("c", n++);
            addKernel("o", n++);
            addKernel("r", n++);
            addKernel("n", n++);
            n += 8;
        }
    };



    // *****************************************************
    // startPopping() --  when page is loaded, initialize kernel list and start timer

    var startPopping = function () {
        canvas = document.getElementById('TheCanvas');
        if (!canvas) {
            //alert( "Can't find the canvas" );
            return;
        }

        addKernels();

        intervalID = setInterval(onUpdate, 100);

    };

    // *****************************************************
    // stopPopping() -- when page is unloaded, stop timer

    var stopPopping = function () {
        if (intervalID) {
            clearInterval(intervalID);
            intervalID = null;
        }
    };




    // *****************************************************
    // addLoadEvent() and addUnloadEvent()

    // addLoadEvent from Jeremy Keith's "DOM Scripting", credited to Simon Willison (http://simon.incutio.com/)
    var addLoadEvent = function (func) {
        var oldonload = onload;
        if (typeof onload !== 'function') {
            onload = func;
        }
        else {
            onload = function () {
                oldonload();
                func();
            };
        }
    }; // end addLoadEvent

    var addUnloadEvent = function (func) {
        var oldonunload = onunload;
        if (typeof onunload !== 'function') {
            onunload = func;
        }
        else {
            onunload = function () {
                func();
                oldonunload();
            };
        }
    }; // end addLoadEvent


    // *****************************************************
    // page initialization
    addLoadEvent(startPopping);
    addUnloadEvent(stopPopping);

    // END SCOPE CLOSURE
} ());


