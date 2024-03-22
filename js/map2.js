//work flow for creating .geojson file: used file zilla to download PRISM data and used python notebook to loop through 
//zonal stats for each year (see ArcGIS pro project). Zonal stats to table --> join and relates to join table to polygon 
//shp --> export feature as shp into file --> mapshaper.org to convert to geojson. 

var map2 = L.map('map2').setView([43.88645, -120.5974], 7);

L.tileLayer('https://api.mapbox.com/styles/v1/hendrcou/clt269nv7007701ra8q0td3aw/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJjb3UiLCJhIjoiY2xzOWs5ZzI4MDcyZTJtbncwYmx4bmdpeSJ9.Lq9r97eWc4UxrF4j3SOrJA', {
    maxZoom: 18
}).addTo(map2);

//check geojson properties (inspect > properties)
// fetch('data/HUC10_norm.geojson')
//     .then(response => response.json())
//     .then(data => {
//         // Log the first feature's properties
//         console.log(data.features[0].properties);
//     });

fetch('data/HUC10_norm.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map2);
    });
// control that shows state info on hover
var info = L.control();

info.onAdd = function (map2) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>OR 30 YEAR PRECIP NORMS</h4>' +  (props ?
        '<b>' + props.Name + '</b><br />' + 'Precipitation: ' + Math.round(props.norm_meanP) + 'mm'
        : 'Hover over a watershed');
};

info.addTo(map2);

function getColor(d) {
    return d > 4000 ? '#0c2c84' :
           d > 2000  ? '#225ea8' :
           d > 1000  ? '#1d91c0' :
           d > 500  ? '#41b6c4':
           d > 250   ? '#7fcdbb' :
           d > 150   ? '#c7e9b4' :
           d >= 100   ? '#969696' : '#FFEDA0';
}


function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.norm_meanP)
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
    map2.fitBounds(e.target.getBounds());
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#fc4e2a',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(layer.feature.properties.norm_meanP)
    });
    info.update();
    
}

map2.attributionControl.addAttribution('Precipitation data &copy; <a href="https://prism.oregonstate.edu//">PRISM</a>');

// Add legend
const legend = L.control({position: 'bottomright'});

legend.onAdd = function (map2) {
    const div = L.DomUtil.create('div', 'legend'), // Changed 'info' to 'legend'
        grades = [0, 100, 150, 250, 500, 1000, 2000, 4000],
        labels = ['< 100', '100-150', '150-250', '250-500', '500-1000', '1000-2000', '2000-4000', '> 4000'],
        colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            labels[i] + '<br>';
    }

    return div;
};

legend.addTo(map2);



// var geojsonLayer;
// var selectedYear = 1981; // Initial selected year

// // Define getColor function
// function getColor(d) {
//     if (d > 4000) return '#800026';
//     if (d > 2000) return '#BD0026';
//     if (d > 1000) return '#E31A1C';
//     if (d > 500) return '#FC4E2A';
//     if (d > 250) return '#FD8D3C';
//     if (d > 150) return '#FEB24C';
//     if (d > 100) return '#FED976';
//     return '#FFEDA0';
// }

// function updateMap(year) {
//     fetch('data/HUC10_annPrecip.geojson')
//         .then(response => response.json())
//         .then(data => {
//             console.log("GeoJSON Data:", data); // Log the entire data object
            
//             if (geojsonLayer) {
//                 map.removeLayer(geojsonLayer);
//             }
//             geojsonLayer = L.geoJSON(data, {
//                 style: style,
//                 onEachFeature: onEachFeature
//             }).addTo(map);
//             updateSliderLabel(year);
//         });
// }

// var info = L.control();

// info.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'info');
//     this.update();
//     return this._div;
// };

// info.update = function (props) {
//     this._div.innerHTML = '<h4>OREGON HUC-10 WATERSHEDS</h4>' +  (props ?
//         '<b>' + props.Name + '</b><br />' + 
//         'Year: ' + selectedYear + '<br />' + 
//         'Mean Precipitation: <strong>' + Math.round(props[selectedYear + '_meanP']) + '</strong><strong>mm</strong>'
//         :'Hover Over a Watershed');
// };



// info.addTo(map);

// function style(feature) {
//     return {
//         weight: 1,
//         opacity: 1,
//         color: '#252525',
//         dashArray: '3',
//         fillOpacity: 0.7,
//         fillColor: getColor(feature.properties[selectedYear + '_meanP'])
//     };
// }

// function onEachFeature(feature, layer) {
//     layer.on({
//         mouseover: highlightFeature,
//         mouseout: resetHighlight
//     });
// }

// function highlightFeature(e) {
//     var layer = e.target;
//     layer.setStyle({
//         weight: 3,
//         color: '#666',
//         dashArray: '',
//         fillOpacity: 1
//     });
//     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//         layer.bringToFront();
//     }
//     info.update(layer.feature.properties);
// }

// function resetHighlight(e) {
//     geojsonLayer.resetStyle(e.target);
//     info.update();
// }

// //Slider functionality
// var slider = document.getElementById('year-slider');
// var sliderValue = document.getElementById('slider-value');

// slider.oninput = function() {
//     selectedYear = this.value;
//     sliderValue.textContent = selectedYear;
//     updateMap(selectedYear);
// };

// // // Slider functionality
// // var slider = document.getElementById('year-slider');
// // var sliderValue = document.getElementById('slider-value');
// // var yearList = document.getElementById('years');

// // // Populate the datalist with the range of years
// // for (var year = 1981; year <= 2020; year++) {
// //     var option = document.createElement('option');
// //     option.value = year;
// //     yearList.appendChild(option);
// // }

// // // Set the initial slider value
// // slider.value = selectedYear;

// // // Update the slider value and map when the slider is moved
// // slider.oninput = function() {
// //     selectedYear = this.value;
// //     sliderValue.textContent = selectedYear;
// //     updateMap(selectedYear);
// // };

// // // Function to update the slider label
// // function updateSliderLabel(year) {
// //     sliderValue.textContent = year;
// // }

// // Add legend
// var legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map) {
//     var div = L.DomUtil.create('div', 'legend'), // Changed 'info' to 'legend'
//         grades = [0, 100, 150, 250, 500, 1000, 2000, 4000],
//         labels = ['< 100', '100-150', '150-250', '250-500', '500-1000', '1000-2000', '2000-4000', '> 4000'],
//         colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

//     // loop through our density intervals and generate a label with a colored square for each interval
//     for (var i = 0; i < grades.length; i++) {
//         div.innerHTML +=
//             '<i style="background:' + colors[i] + '"></i> ' +
//             labels[i] + '<br>';
//     }

//     return div;
// };

// legend.addTo(map);


// // Initial map load
// updateMap(selectedYear);


// //Map of norms 
// // var map2 = L.map('map2').setView([43.88645, -120.5974], 7);

// // L.tileLayer('https://api.mapbox.com/styles/v1/hendrcou/clt269nv7007701ra8q0td3aw/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJjb3UiLCJhIjoiY2xzOWs5ZzI4MDcyZTJtbncwYmx4bmdpeSJ9.Lq9r97eWc4UxrF4j3SOrJA', {
// //     maxZoom: 18
// // }).addTo(map2);

// // fetch('data/HUC10_norm.geojson')
// //     .then(response => response.json())
// //     .then(data => {
// //         L.geoJSON(data, {
// //             style: style,
// //             onEachFeature: onEachFeature
// //         }).addTo(map2);
// //     });
// // // control that shows state info on hover
// // // control that shows state info on hover
// // var info2 = L.control();

// // info2.onAdd = function (map) {
// //     this._div = L.DomUtil.create('div', 'info');
// //     this.update();
// //     return this._div;
// // };

// // info2.update = function (props) {
// //     this._div.innerHTML = '<h4>OREGON HUC-10 WATERSHEDS</h4>' +  (props ?
// //         '<b>' + props.Name + '</b><br />' + 
// //         'Mean Precipitation: <strong>' + Math.round(props[selectedYear + '_meanP']) + '</strong><strong>mm</strong>'
// //         :'Hover Over a Watershed');
// // };

// // info2.addTo(map2);


// // function getColor(d) {
// //     if (d > 4000) return '#800026';
// //     if (d > 2000) return '#BD0026';
// //     if (d > 1000) return '#E31A1C';
// //     if (d > 500) return '#FC4E2A';
// //     if (d > 250) return '#FD8D3C';
// //     if (d > 150) return '#FEB24C';
// //     if (d > 100) return '#FED976';
// //     return '#FFEDA0';
// // }

// // function style(feature) {
// //     return {
// //         weight: 2,
// //         opacity: 1,
// //         color: 'white',
// //         dashArray: '3',
// //         fillOpacity: 0.7,
// //         fillColor: getColor(feature.properties.count)
// //     };
// // }

// // function onEachFeature(feature, layer) {
// //     layer.on({
// //         mouseover: highlightFeature,
// //         mouseout: resetHighlight,
// //         click: zoomToFeature
// //     });
// // }

// // function zoomToFeature(e) {
// //     map2.fitBounds(e.target.getBounds());
// // }

// // function highlightFeature(e) {
// //     var layer = e.target;

// //     layer.setStyle({
// //         weight: 5,
// //         color: '#fc4e2a',
// //         dashArray: '',
// //         fillOpacity: 0.7
// //     });

// //     layer.bringToFront();
// //     info.update(layer.feature.properties);
// // }

// // function resetHighlight(e) {
// //     var layer = e.target;
// //     layer.setStyle({
// //         weight: 2,
// //         opacity: 1,
// //         color: 'white',
// //         dashArray: '3',
// //         fillOpacity: 0.7,
// //         fillColor: getColor(layer.feature.properties.norm_meanP)
// //     });
// //     info.update();
    
// // }

// // map.attributionControl.addAttribution('Count data &copy; <a href="https://prism.oregonstate.edu///">PRISM</a>');

// // const legend2 = L.control({position: 'bottomright'});

// // legend2.onAdd = function (map2) {
// //     const div = L.DomUtil.create('div', 'info legend');
// //     const grades = [0, 100, 150, 250, 500, 1000, 2000, 4000];
// //     const labels = [];
// //     let from, to;

// //     for (let i = 0; i < grades.length; i++) {
// //         from = grades[i];
// //         to = grades[i + 1];

// //         labels.push(`<i style="background:${getColor(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
// //     }

// //     div.innerHTML = labels.join('<br>');
// //     return div;
// // };

// // legend2.addTo(map2);
