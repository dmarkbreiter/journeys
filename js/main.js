var map;
var mouseOver; //used for feature hover
var mouseOut; //used for feature hover

const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const route = urlParams.get('route');

const routesObject = {
    "tehran-athens": {
        "center": [36.8, 36.8],
        "zoom": 7
    },
    "aleppo-turkishBorder":  {
        "center": [36.8, 36.8],
        "zoom": 9
    },
}


/*Replace with your own view lines!*/
var viewLines = "https://services3.arcgis.com/iuNbZYJOrAYBrPyC/arcgis/rest/services/linkages/FeatureServer/0"


require([
    "esri/renderers/SimpleRenderer",
    "esri/symbols/SimpleLineSymbol",
    "esri/map",
    "esri/layers/FeatureLayer",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/on",
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/dijit/HomeButton",
    "dojo/domReady!"

], function(
    SimpleRenderer,
    SimpleLineSymbol,
    Map,
    FeatureLayer,
    domClass,
    domConstruct,
    on,
    ArcGISTiledMapServiceLayer,
    HomeButton
) {



    // ---------- CREATE MAP AND LOAD LAYERS ------------

    //create map
    map = new Map("map", {
        center: routesObject[route].center,
        zoom: 9,
        //minZoom: 2,
    });


    //load custom tiled basemap
    var tiled = new ArcGISTiledMapServiceLayer("http://tiles.arcgis.com/tiles/WQ9KVmV6xGGMnCiQ/arcgis/rest/services/CoastalViewsBasemap/MapServer");
    map.addLayer(tiled);

        // Given a polygon/polyline, create intermediary points along the
    // "straightaways" spaced no closer than `spacing` distance apart.
    // Intermediary points along each section are always evenly spaced.
    // Modifies the polygon/polyline in place.




    //load feature layer
    var featureLayer = new FeatureLayer(viewLines, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        className: "routes"
    });


    map.addLayer(featureLayer);
    featureLayer.setDefinitionExpression(`name = '${route}'`);

    //routesDiv.appendChild(arrowDiv);



    // ---------- EVENT LISTENER ------------	
/*
    //Only enable play button when feature service loaded
    featureLayer.on("update-end", function loaded(event) {
        console.log(featureLayer.graphics)
        $("#loader").hide();
        $("#play").addClass("show");
    });

    // ---------- DISABLE USER INTERACTION ON LOAD ------------
    map.on("load", function() {
        map.hideZoomSlider();
        map.disablePan();
        map.disableScrollWheelZoom();
        map.disableRubberBandZoom();
        map.disableDoubleClickZoom();
    });
*/
    // ---------- MOUSE EVENTS ------------	
    function enableMouseOver() {

        //on mouse over
        mouseOver = featureLayer.on("mouse-over", function mouseOver(event) {
            var svgNode = event.graphic.getNode();
            svgNode.setAttribute("stroke", "#FFFF00");
            svgNode.setAttribute("stroke-width", 2.5);
            svgNode.setAttribute("stroke-opacity", 1);
            var attributes = event.graphic.attributes;
            $("#destination").html(attributes.Country)
            $("#distance > em").html(attributes.distance_miles)
        });
        //on mouse out
        mouseOut = featureLayer.on("mouse-out", function mouseOut(event) {
            var svgNode = event.graphic.getNode();
            svgNode.setAttribute("stroke", "rgb(0, 255, 197)");
            svgNode.setAttribute("stroke-width", "2");
            svgNode.setAttribute("stroke-opacity", 0.27451);
            var attributes = event.graphic.attributes;
        });

    }

    

/*
    // ---------- INFO PANEL TOGGLE ------------
    $("#panel-toggle").on('click', function() {
        $("#panel").toggleClass("show");
        $("#panel-toggle").toggleClass("slide");
    });

    // ---------- MAP INTERACTION ------------
    // Prevents user interaction with the map
    function lockMap() {
        map.hideZoomSlider();
        map.disablePan();
        map.disableScrollWheelZoom();
        map.disableRubberBandZoom();
        map.infoWindow.hide();
        map.centerAndZoom(routesObject[route].center, routesObject[route].zoom);
        home.hide();
    }

    // Allows users to interact with the map
    function unlockMap() {
        map.showZoomSlider();
        map.enablePan();
        map.enableScrollWheelZoom();
        map.disableRubberBandZoom();
        map.graphics.clear();
        home.show();
    }

*/

    // ---------- BROWSER DETECTION------------		

    //detect IE
    //returns version of IE or false, if browser is not Internet Explorer

    function detectIE() {
        var ua = window.navigator.userAgent;

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }

    // ---------- ANNIMATION------------		


/*
    $(function() {
        //on load hide replay, pop-up(return) and info panel
        $("#replay, #return, #panel-toggle").hide();
        // detect browser
        var version = detectIE();

        //if not IE or Edge play svg annimation and display replay button at end
        if (version === false) {
            $("#play").on('click', function() {
                //when click reveal, remove play button, remove splash and annimate
                $("body").addClass("animate").removeClass('infoshown');
                $("#play, #splash").fadeOut('fast');
                setTimeout(function() {
                    //add replay button, pop-up (return), remove annimation, display svg, enable mouse over and unlock map
                    $("#replay, #panel-toggle, #return").fadeIn("slow");
                    $("body").removeClass("animate").addClass('infoshown');
                    $("body").addClass("end");
                    enableMouseOver();
                    unlockMap();
                }, 7000);
            });
            //replay function
            $("#replay").on('click', function() {
                //when click replay, remove ui, lock map and annimate
                lockMap();
                $('#replay, #return, #panel, #panel-toggle').fadeOut('fast');
                mouseOver.remove();
                mouseOut.remove();
                setTimeout(function() {
                    $("body").addClass("animate").removeClass('infoshown');
                }, 7);
                setTimeout(function() {
                    //add replay button, pop-up (return), remove annimation, display svg, enable mouse over and unlock map
                    unlockMap();
                    $('#replay, #return').fadeIn("slow");
                    $("body").removeClass("animate").addClass('infoshown');
                    $("body").addClass("end");
                    $("#panel, #panel-toggle").fadeIn('fast');
                    enableMouseOver();
                }, 7000);
            });
            //if IE or Edge  DO NOT play svg annimation. Instead just show the lines and don't present a replay button
        } else if (version >= 12) {
            $("#play").on('click', function() {
                $("#play, #splash").fadeOut('fast');
                $("#panel-toggle, #return").fadeIn("slow");
                $("body").addClass("end");
                enableMouseOver();
                unlockMap();
            });
            //if IE or Edge  DO NOT play svg annimation. Instead just show the lines and don't present a replay button
        } else {
            $("#play").on('click', function() {
                $("#play, #splash").fadeOut('fast');
                $("#panel-toggle, #return").fadeIn("slow");
                $("body").addClass("end");
                enableMouseOver();
                unlockMap();
            });
        }
    });
    */
});

// ---------- PREVENT SCROLLING ON MOBILE DEVICES ------------
document.ontouchmove = function(event) {
    event.preventDefault();
}





/*
window.onload = function() {
    var routesDiv = document.getElementsByClassName('routes');
    var svg = document.getElementsByTagName('svg')[0];
    midMarkers(svg, 6);

    function midMarkers(svg,spacing){
        let path = document.getElementsByTagName('path')[0];
        console.log(path)
        for (var pts=path.points,i=1;i<pts.numberOfItems;++i){
        var p0=pts.getItem(i-1), p1=pts.getItem(i);
        var dx=p1.x-p0.x, dy=p1.y-p0.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        var numPoints = Math.floor( d/spacing );
        dx /= numPoints;
        dy /= numPoints;
        for (var j=numPoints-1;j>0;--j){
            var pt = svg.createSVGPoint();
            pt.x = p0.x+dx*j;
            pt.y = p0.y+dy*j;
            pts.insertItemBefore(pt,i);
        }
        if (numPoints>0) i += numPoints-1;
        }
    }
}
*/
