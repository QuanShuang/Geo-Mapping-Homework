// Store our API endpoint
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to above Earthquake and Fraxen url queries
d3.json(earthquakeUrl, function(data) {
  d3.json(platesUrl, function(data2) {
    // Send the data.features object to the createFeatures function
    createFeatures(data.features, data2.features);
  })
});

// Function to set color of the earthquakes based on their magnitudes
function getColor(d) {
  return d > 6 ? "red" :
         d > 5 ? "purple" :
         d > 4  ? "orange" :
         d > 3  ? "gold" :
         d > 2  ? "yellow" :
         d > 1  ? "greenyellow" :
                  "grey";
}

// Function to set circle size by earthquake magnitudes
function getRadius(magnitude) {
  return magnitude * 20000;
}

// Function to create and utilize features
function createFeatures(earthquakeData, plateData) {

  // Function to run once to render each feature in earthquake data
  // Give each earthquake a popup describing the occurance location and time
  function onEachEarthquake(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.place +
      "<br>Magnitude: " + feature.properties.mag + 
      "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Assign marker to each earthquake
  function onEachQuakeLayer (feature, latlng) {
    return new L.circle(latlng, {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.properties.mag),
      fillOpacity: 0.8,
      stroke: false,
    });
  }

  // Function to run once to render each feature in tectonic plates data
  // Give each tectonic plates a popup describing the name of the plate
  function onEachPlateLayer(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.Name + "</h4>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData & plateData object
  // Run the onEachFeature function once to loop through data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachEarthquake,
    pointToLayer: onEachQuakeLayer
  });

  var plates = L.geoJSON(plateData, {
    onEachFeature: onEachPlateLayer,
    color: "goldenrod"
    });

  // Send our earthquakes & plates layer to the createMap function
  createMap(earthquakes, plates);
}

// Function to create map
function createMap(earthquakes, plates) {

  // Define satellite, grayscale & outdoor layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.gray",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoor",
    accessToken: API_KEY
  });

  // Define baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": graymap,
    "Outdoors": outdoormap
  };

  // Create overlayMaps object to hold our overlay map layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": plates
  };

  // Create our map, giving it the satellitemap, earthquakes & plates layers to display on load
  var myMap = L.map("map", {
    center: [43.6529, -79.3849],
    zoom: 2.5,
    layers: [satellitemap, earthquakes, plates]
  });

  // Create a layer control to enable toggle among our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Adding legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5, 6],
        labels = [];

      // loop through magnitude intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);
}