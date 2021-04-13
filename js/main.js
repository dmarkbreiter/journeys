var map;
var mouseOver; //used for feature hover
var mouseOut; //used for feature hover
var styles;
var featureLayer;
var citiesLayer
var css;
var cities;

const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const route = urlParams.get('route');

const routesObject = {
    "tehran-athens": {
        "zoom": 4,
        "labelPosition": "center-bottom"
    },
    "syria-turkey":  {
        "zoom": 4,
        "labelPosition": "auto"
    },
    "afghanistan-zahedan-greece": {
        "zoom": 3,
        "labelPosition": "center-bottom"

    },
    "nicaragua-costa rica-mexico": {
        "zoom": 4,
        "labelPosition": "auto"
    },
    "damascus-jordan": {
        zoom: 5,
        "labelPosition": "auto"
    },
    "yemen-jordan": {
        zoom: 3,
        "labelPosition": "auto"
    },
    "iraq-jordan-australia": {
        zoom: 2,
        "labelPosition": "auto"
    }
}


/*Replace with your own view lines!*/
var viewLines = "https://services3.arcgis.com/iuNbZYJOrAYBrPyC/arcgis/rest/services/Journeys_Linakages/FeatureServer/0";


require([
    "esri/symbols/TextSymbol",
    "esri/layers/LabelClass",
    "esri/Color",
    "esri/layers/VectorTileLayer",
    "esri/map",
    "esri/layers/FeatureLayer",
], function(
    TextSymbol,
    LabelClass,
    Color,
    VectorTileLayer,
    Map,
    FeatureLayer,
) {



    // ---------- CREATE MAP AND LOAD LAYERS ------------

    //create basemap vector tile layer
    const basemap = new VectorTileLayer("https://tuftsgis.maps.arcgis.com/sharing/rest/content/items/b76b0646a58b4ab181e8dc146964178c/resources/styles/root.json")
    
    //create map
    map = new Map("map", {
        //zoom: routesObject[route].zoom,
        slider: false,
        showLabels: true
        //minZoom: 2,
    });

    map.addLayer(basemap);

    map.on("load", () => {
        map.disableMapNavigation();
    })

    //load feature layer
    featureLayer = new FeatureLayer(viewLines, {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        className: "routes"
        
    });

    citiesLayer = new FeatureLayer('https://services3.arcgis.com/iuNbZYJOrAYBrPyC/arcgis/rest/services/Journeys_Stops_(view)/FeatureServer/0', {
        mode: FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"],
        className: "cities",
        styling: false
    });

    labelColor = new Color('white');
    var citiesLabel = new TextSymbol().setColor(labelColor);
    citiesLabel.font.setSize("0pt");
    citiesLabel.font.setFamily("avenir");

    var labelJson = {
        "labelExpressionInfo": {"value": "{Name}"},
        "labelPlacement": "left-center"
      };

    var labelClass = new LabelClass(labelJson);
    labelClass.symbol = citiesLabel; // symbol also can be set in LabelClass' json
    citiesLayer.setLabelingInfo([ labelClass ]);


    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }

    cities = route.split("-")
    featureLayer.setDefinitionExpression(`name = '${route}'`);
    const citiesDefinition = (cities) => {
        var definition = `Name = '${cities[0]}' OR Name = '${cities[1]}'`
        if (cities.length === 2) {
            return definition
        } else if (cities.length > 2) {
            var i = 2;
            while (i < cities.length) {
                definition += `OR Name = '${cities[i]}'`
                i++
            }
            return definition
        }
    }
    citiesLayer.setDefinitionExpression(citiesDefinition(cities));
    map.addLayer(citiesLayer);
    map.addLayer(featureLayer);
    

    



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

});

// ---------- PREVENT SCROLLING ON MOBILE DEVICES ------------
document.ontouchmove = function(event) {
    event.preventDefault();
}


window.onload = function() {

    function waitForEl(selector, callback) {
        try {
        
        if (jQuery(selector)[0]) {
            callback();
        }
        else {
            setTimeout(function() {
                waitForEl(selector, callback);
            }, 100);
        }
        } catch(error) {
            console.log(error);
            setTimeout(function() {
                waitForEl(selector, callback);
            }, 100);
        }
    }


    waitForEl('.routes', () => {
        var routes = document.getElementsByClassName('routes')[0];
        map.centerAndZoom(featureLayer.graphics[0]._extent.getCenter(), routesObject[route].zoom);
        var routesParent = routes.parentElement;
        console.log(routes)
        var routesPath = routes.getElementsByTagName('path')[0];
        routesPath.id = 'routePath';
        var defs = routesParent.getElementsByTagName('defs')[0];
        
        
        var marker =  document.createElementNS("http://www.w3.org/2000/svg", 'marker');
        var markerPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        markerPath.setAttribute('d', 'm 426.71429,539.79074 1.95349,-1.875 4.29767,-4.125 0.13024,0.125 0.39069,0.375 0.22791,0.21875 -4.29768,4.125 -1.23721,1.15625 1.23721,1.15625 4.29768,4.125 -0.74884,0.71875 -4.29767,-4.125 -1.95349,-1.875 z');
        markerPath.classList.add('marker-arrow-path');
        marker.id = ('arrow');
        marker.appendChild(markerPath);
        //marker.setAttribute('viewBox', "0 0 160 160");
        marker.setAttribute('markerWidth', "6");
        marker.setAttribute('markerHeight', "6");

        defs.appendChild(marker);
        routesPath.setAttribute('marker-pattern', 'url(#arrow)');

        // Add styles to svg
        styles = document.createElementNS("http://www.w3.org/2000/svg", 'style');
        routesParent.appendChild(styles);

        setAnimationPath(routes.getElementsByTagName('path')[0].getAttribute('d'));


        map.on("extent-change", function(e){
            waitForEl(('.routes'), () => {
                const path = routes.getElementsByTagName('path')[0].getAttribute('d')
                setAnimationPath(path);
                if (e.levelChange) {
                    if (jQuery('.arrow').length > 0) {
                        document.querySelectorAll('.arrow').forEach(e => e.remove());
                    }
                    createArrow(routes);
                    
                }
                waitForEl(('text'), ()=> {
                    createLabels(routesParent, routesObject[route].labelPosition);
                });
                createArrow(routes);
            });
            
        });


    function createLabels(parent, position) {
        const textCollection = jQuery('text');
        if (jQuery('.cities-labels').length < cities.length) {
            for (var text of textCollection) {
                matrices = {
                    "center-right" : 'matrix(1, 0, 0, 1, 0, 0)',
                    "center-top": {
                        'x': parseInt(text.getAttribute('x')) - 40,
                        'y': parseInt(text.getAttribute('y')) - 20
                    },
                    "center-bottom": {
                        'x': parseInt(text.getAttribute('x')) - 40,
                        'y': parseInt(text.getAttribute('y')) + 40
                    },
                    "auto" : {
                        'x': parseInt(text.getAttribute('x')),
                        'y': parseInt(text.getAttribute('y'))
                    }
                }
                const [x, y] = Object.values(matrices[position])
                //y = y.toString();
                //console.log(y)
                var label = document.createElementNS("http://www.w3.org/2000/svg", 'text');
                setAttributes(label, {
                    'x': x.toString(),
                    'y': y.toString(), //text.getAttribute('y'), //`${text.getAttribute('y') + 1}` ,
                    'baseline': 'alphabetic',
                    'class': 'cities-labels'
                    
                })
                label.innerHTML = text.innerHTML;
                parent.appendChild(label);
            }
        }
    }

    // Helper function to set multiple attributes on a DOM element with object
    function setAttributes(el, attrs) {
        for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
        }
    }

var element = document.createElement('style');

// Append style element to head
document.head.appendChild(element);

// Reference to the stylesheet
css = element.sheet;


function createArrow(parent) {
    const path = jQuery('.routes > path')[0]
    const length = path.getTotalLength();
    const numberArrows = Math.round(length/25);
    clearCssSheet(css);
    for (var i = 0; i < numberArrows; i++) {
        const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        setAttributes(arrowPath, {
            'd' : "M0 0 10 0 20 10 10 20 0 20 10 10Z",
            'viewBox' : "0 0 20 20",
            'refX' : "10",
            'refY' : '10', 
            //"fill" : "#49f",
            "id" : `arrow${i}`,
            "class": 'arrow',
            "style": `animation: move${i} 50s forwards linear infinite`
        });
        //arrowPath.style.animation = `move${i} 50s forwards linear infinite`
        parent.appendChild(arrowPath);
        
        createArrowAnimation(i, numberArrows);
    }
    
}

function createArrowAnimation(i, number) {
    const rate = 100/number;
    const start = i * rate;
    const end = 100 - start;
    if (i === 0) {
        var animationRule = `
        @keyframes move0 {
            0% {
              offset-distance: 0%;
            }
           
             95% {
              opacity:1;
              
            }
             100% {
              offset-distance: 100%;
              opacity:0;
            }
        }`

    } else {
        var animationRule = `
        @keyframes move${i} {
            0% {
                offset-distance: ${start}%;
            }
            ${end-10}% {
                opacity: 1;
            }
            ${end-5}% {
                opacity: 0;
            }
            ${end}% {
                offset-distance: 100%;
                opacity: 0;
            }
            ${end+1}% {
                offset-distance: 0%;
                opacity: 0;
            }
            ${end+5}% {
                opacity: 1
            }
            100% {
                offset-distance: ${start}%;
            }
        }`  
    }

    css.insertRule(animationRule, i);  
  }
 
  
    });
}

function addTextBuffer() {
    const labels= document.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'text');
    for (const label of labels) {
        label.setAttribute('y', `${parseInt(label.getAttribute('y')) + 50}`);
    }
}

function setAnimationPath(path) {
    styles.innerHTML = '';
    styles.innerHTML = `.arrow {
        offset-path: path('${path}');
        animation-iteration-count: infinite;
        transform-origin: 0% 2.5%;
        -webkit-animation-iteration-count: infinite;
        fill: #D45D04;
    }`
    
}

function clearCssSheet(css) {
    if (css.cssRules) { // all browsers, except IE before version 9
        for (let i=0; i<css.cssRules.length; i++) {
            css.deleteRule(i);
        }  
    }
}
