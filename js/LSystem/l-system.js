// Copyright (c) 2011-2012 Eric R. Johnson, http://www.lostbearlabs.com
//
// All code on LostBearLabs.com is made available under the terms of the
// Artistic License 2.0, for details please see:
//    http://www.opensource.org/licenses/artistic-license-2.0.php


//// BEGIN SCOPE CLOSURE
/*var LS =*/ (function () {
    var paper;
    var WIDTH = 400;
    var HEIGHT = 400;

    // list of pre-defined grammars
    var grammars = [
        { id:"Example1.6",
            value:"Example 1.6 - Quadratic Koch Island",
            x:"F-F-F-F",
            f:"F-F+F+FF-F-F+F",
            phi:90
        },
        { id:"Example1.7B",
            value:"Example 1.7 B - Quadratic Snowflake Curve",
            x:"-F",
            f:"F+F-F-F+F",
            phi:90
        },
        { id:"Example1.9A",
            value:"Example 1.9A",
            x:"F-F-F-F",
            f:"FF-F-F-F-F-F+F",
            phi:90
        },
        { id:"Example1.9B",
            value:"Example 1.9B",
            x:"F-F-F-F",
            f:"FF-F-F-F-FF",
            phi:90
        }
    ];

    // handler to update grammar definition boxes when pre-defined grammar is selected
    var onGrammarSelect = function () {
        var selected = $("#selectGrammar option:selected");
        var val = selected.val();
        var g = { x:"", f:"" };
        var i;
        if (val != 0) {
            for (i = 0; i < grammars.length; i++) {
                if (grammars[i].id === val)
                    g = grammars[i];
            }
            $("#grammarTextX").val(g.x);
            $("#grammarTextF").val(g.f);
            $("#grammarTextPhi").val(g.phi);
        }
        $("#drawingDepth").val(2);
        onRedraw();
    };

    // code to actually draw the curve
    var drawShape = function (txt, phi) {
        var x = 0;
        var y = 0;
        var c;
        var theta = 0.0;
        var i;
        var n = txt.length;
        var dx = 10;
        var maxX = x;
        var minX = x;
        var maxY = y;
        var minY = y;
        var scale;
        var path = "M" + x + " " + y;
        var tmp;
        paper.clear();
        //console.log("--------------------")
        //console.log("drawShape: phi=" + phi + " " + typeof(phi) );
        for (i = 0; i < n; i++) {
            c = txt.charAt(i);
            switch (c) {
                case '+':
                    theta += phi;
                    //console.log( "+: theta = " + phi);
                    break;
                case '-':
                    theta -= phi;
                    //console.log( "-: theta = " + phi);
                    break;
                case 'F':
                    x = x + dx * Math.cos(theta * Math.PI / 180);
                    y = y + dx * Math.sin(theta * Math.PI / 180);
                    //console.log( "f: x = " + x + ", y = " + y);
                    path = path + " L" + x + " " + y;
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    break;
            }
        }
        tmp = paper.path(path);
        //console.log( "minX = " + minX + ", minY = " + minY);

        dX = maxX - minX;
        dY = maxY - minY;

        midX = (minX + maxX)/2
        midY = (minY + maxY)/2

        offX = WIDTH/2 - midX
        offY = HEIGHT/2 - midY

        //console.log( "midX = " + midX + ", midY = " + midY)
        tmp.translate( offX, offY )

        var size = Math.max( dX, dY )
        if ( size >= WIDTH )
        {
            scale = (WIDTH-5) / size;
            //console.log( "scale by " + scale )
            tmp.scale( scale )
        }

        tmp.show();
    };

    // handler to invoke drawShape whenever something changes
    var onRedraw = function () {
        var x = $('#grammarTextX').val();
        var f = $('#grammarTextF').val();
        var n = $('#drawingDepth').val();
        var phi = parseFloat($('#grammarTextPhi').val());
        var txt;
        var i;
        txt = x;
        for (i = 0; i < n; i++) {
            txt = txt.replace(/F/g, f);
        }
        //$('#expandedText').val( txt );
        drawShape(txt, phi);
    };

    // handler to fill in the grammar list and setup event handlers on startup
    var setupPage = function () {
        paper = Raphael("TheCanvas", WIDTH, HEIGHT);
        var value = "ITEMVALUE";
        var i, g;
        for (i = 0; i < grammars.length; i++) {
            g = grammars[i];
            $('#selectGrammar').append('<option value="' + g.id + '">' + g.value + '</option>');
        }
        $('#drawingDepth').change(onRedraw);
        $('#grammarTextX').change(onRedraw);
        $('#grammarTextF').change(onRedraw);
        $('#grammarTextPhi').change(onRedraw);
        $('#selectGrammar').change(onGrammarSelect);
        onGrammarSelect();
    };

    // *****************************************************
    // page initialization
    $(document).ready(function () {
        setupPage();
    });
//// END SCOPE CLOSURE
})();


