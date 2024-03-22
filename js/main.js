//work flow for creating .geojson file: used file zilla to download PRISM data and used python notebook to loop through 
//zonal stats for each year (see ArcGIS pro project). Zonal stats to table --> join and relates to join table to polygon 
//shp --> export feature as shp into file --> mapshaper.org to convert to geojson. 

var map = L.map('map').setView([43.88645, -120.5974], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/hendrcou/clt269nv7007701ra8q0td3aw/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJjb3UiLCJhIjoiY2xzOWs5ZzI4MDcyZTJtbncwYmx4bmdpeSJ9.Lq9r97eWc4UxrF4j3SOrJA', {
    maxZoom: 18
}).addTo(map);

var geojsonLayer;
var selectedYear = 1981; // Initial selected year

// Define getColor function
function getColor(d) {
    return d > 4000 ? '#0c2c84' :
           d > 2000  ? '#225ea8' :
           d > 1000  ? '#1d91c0' :
           d > 500  ? '#41b6c4':
           d > 250   ? '#7fcdbb' :
           d > 150   ? '#c7e9b4' :
           d >= 100   ? '#FFEDA0' : '#969696';
}

function updateMap(year) {
    fetch('data/HUC10_annPrecip.geojson')
        .then(response => response.json())
        .then(data => {
            console.log("GeoJSON Data:", data); // Log the entire data object
            
            if (geojsonLayer) {
                map.removeLayer(geojsonLayer);
            }
            geojsonLayer = L.geoJSON(data, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
            updateSliderLabel(year);
        });
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>ANNUAL MEAN PRECIPITATION IN MM</h4>' +  (props ?
        '<b>' + props.Name + '</b><br />' + 
        'Year: ' + selectedYear + '<br />' + 
        'Mean Precipitation: <strong>' + Math.round(props[selectedYear + '_meanP']) + '</strong><strong>mm</strong>'
        :'Hover Over a Watershed');
};



info.addTo(map);

function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: '#252525',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties[selectedYear + '_meanP'])
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight, 
        click: zoomToFeature
    });
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#fc4e2a',
        dashArray: '',
        fillOpacity: 1
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
}

map.attributionControl.addAttribution('Precipitation data &copy; <a href="https://prism.oregonstate.edu//">PRISM</a>');

//Slider functionality
var slider = document.getElementById('year-slider');
var sliderValue = document.getElementById('slider-value');

slider.oninput = function() {
    selectedYear = this.value;
    sliderValue.textContent = selectedYear;
    updateMap(selectedYear);
};

// Add legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'), // Changed 'info' to 'legend'
        grades = [0, 100, 150, 250, 500, 1000, 2000, 4000],
        labels = ['< 100', '100-150', '150-250', '250-500', '500-1000', '1000-2000', '2000-4000', '> 4000'],
        colors = ['#969696', '#FFEDA0', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            labels[i] + '<br>';
    }

    return div;
};

legend.addTo(map);


// Initial map load
updateMap(selectedYear);


// Map 2 - norms

var map2 = L.map('map2').setView([43.88645, -120.5974], 6);

L.tileLayer('https://api.mapbox.com/styles/v1/hendrcou/clt269nv7007701ra8q0td3aw/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJjb3UiLCJhIjoiY2xzOWs5ZzI4MDcyZTJtbncwYmx4bmdpeSJ9.Lq9r97eWc4UxrF4j3SOrJA', {
    maxZoom: 18
}).addTo(map2);

function getColor2(d) {
    return d > 4000 ? '#0c2c84' :
           d > 2000  ? '#225ea8' :
           d > 1000  ? '#1d91c0' :
           d > 500  ? '#41b6c4':
           d > 250   ? '#7fcdbb' :
           d > 150   ? '#c7e9b4' :
           d >= 100   ? '#FFEDA0' : '#969696';
}

fetch('data/HUC10_norm.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: style2,
            onEachFeature: onEachFeature2
        }).addTo(map2);
    });

var info2 = L.control();

info2.onAdd = function (map2) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info2.update = function (props) {
    this._div.innerHTML = '<h4>OR 30 YEAR PRECIP NORMS</h4>' +  (props ?
        '<b>' + props.Name + '</b><br />' + 'Precipitation: ' + Math.round(props.norm_meanP) + 'mm'
        : 'Hover over a watershed');
};

info2.addTo(map2);
    

function style2(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor2(feature.properties.norm_meanP)
    };
}

function onEachFeature2(feature, layer) {
    layer.on({
        mouseover: function (e) {
            highlightFeature2(e);
            info2.update(e.target.feature.properties);
        },
        mouseout: resetHighlight2,
        click: zoomToFeature2
    });
}

function zoomToFeature2(e) {
    map2.fitBounds(e.target.getBounds());
}

function highlightFeature2(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#fc4e2a',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetHighlight2(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor2(layer.feature.properties.norm_meanP)
    });
}

map2.attributionControl.addAttribution('Precipitation data &copy; <a href="https://prism.oregonstate.edu//">PRISM</a>');

const legend2 = L.control({position: 'bottomright'});

legend2.onAdd = function (map2) {
    const div = L.DomUtil.create('div', 'legend'),
        grades = [0, 100, 150, 250, 500, 1000, 2000, 4000],
        labels = ['< 100', '100-150', '150-250', '250-500', '500-1000', '1000-2000', '2000-4000', '> 4000'],
        colors = ['#969696', '#FFEDA0', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'];

    // Loop through density intervals and generate a label with a colored square for each interval
    for (let j = 0; j < grades.length; j++) {
        div.innerHTML +=
            '<j style="background:' + colors[j] + '"></j> ' +
            labels[j] + '<br>';
    }

    return div;
};

legend2.addTo(map2);

//sync map and map2 
map.on('zoomend', syncMap2);
map.on('click', syncMap2);

// Define syncMap2 function to update 'map2' based on 'map'
function syncMap2() {
    // Get the zoom level and bounds of 'map'
    const zoomLevel = map.getZoom();
    const mapBounds = map.getBounds();

    // Set the zoom level and bounds of 'map2' to match 'map'
    map2.setView(map.getCenter(), zoomLevel);
    map2.fitBounds(mapBounds);
}

// Initial synchronization when the page loads
syncMap2();