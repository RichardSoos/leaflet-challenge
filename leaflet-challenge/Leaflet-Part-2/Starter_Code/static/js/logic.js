// Creating the map object
let myMap = L.map("map", {
  center: [6, 40],
  zoom: 2
});

// Create the base layers
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Use this link to get the GeoJSON data for tectonic plates
let platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Use this link to get the GeoJSON data for earthquakes
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Create a baseMaps object
let baseMaps = {
  "Street Map": street,
  "Topographic Map": topo
};

// Set the "Street Map" as the default base layer
street.addTo(myMap);

// Define the overlay layers
let overlayMaps = {};

// Add the tectonic plates layer to the overlay
d3.json(platesLink).then(function(platesData) {
  let platesLayer = L.geoJSON(platesData, {
    style: function(feature) {
      return {
        color: "#FFFF00", // Yellow color for the plates
        weight: 2, // Thickness of the plates' boundaries
        fill: false // Disable the fill color
      };
    }
  });

  // Add the tectonic plates layer to the overlay
  overlayMaps["Tectonic Plates"] = platesLayer;

  // Create the layer control and add it to the map
  let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  // Add the earthquake layer to the map
  function addEarthquakeLayer() {
    d3.json(link).then(function(data) {
      // Creating a GeoJSON layer with the retrieved data
      let earthquakeLayer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
          // Extract the depth value from the coordinates array
          const depth = feature.geometry.coordinates[2];
          const place = feature.properties.place;
          const mag = feature.properties.mag;

          // Calculate the marker size based on the magnitude using the markerSize function
          const markerOptions = {
            radius: markerSize(mag),
            fillColor: colorScale(depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          };

          // Combine depth, place, and mag into a single popup content
          const popupContent = `Place: ${place}<br>Depth: ${depth} meters<br>Magnitude: ${mag}`;

          // Add the popup to the marker
          const marker = L.circleMarker(latlng, markerOptions);
          marker.bindPopup(popupContent);

          return marker;
        }
      });

      // Add the earthquake layer to the overlay
      overlayMaps["Earthquakes"] = earthquakeLayer;

      // Add the earthquake layer to the layer control
      layerControl.addOverlay(earthquakeLayer, "Earthquakes");
    });
  }

  // Call the functions to add the earthquake layer
  addEarthquakeLayer();

  // Generate the legend colors dynamically
  const legendColors = [];
  const numSteps = 10; // Number of color steps in the legend
  for (let i = 0; i < numSteps; i++) {
    const depth = (620 / numSteps) * (i + 1);
    const color = colorScale(depth);
    legendColors.push(color);
  }

  // Define legend content
  var legendContent = '<h4>Legend metres depth</h4>';
  for (let i = 0; i < numSteps; i++) {
    const depth = (620 / numSteps) * (i + 1);
    legendContent += `<i style="background: ${legendColors[i]}"></i> ${depth}<br>`;
  }

  // Create custom control for the legend
  var legendControl = L.control({ position: 'bottomright' });

  // Define the onAdd method for the legend control
  legendControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML = legendContent;
    return div;
  };

  // Add the legend control to the map
  legendControl.addTo(myMap);

  // Add CSS styles for the legend swatches
  var legendStyle = document.createElement('style');
  legendStyle.innerHTML = '.legend i { width: 18px; height: 18px; float: left; margin-right: 8px; }';
  legendStyle.innerHTML += '.legend { line-height: 18px; }';
  document.getElementsByTagName('head')[0].appendChild(legendStyle);
});

// Define the marker size function
function markerSize(mag) {
  return mag * 1.5;
}

// Define the color scale function
const colorScale = d3.scaleSequential()
  .domain([1, 620].reverse()) // Reverse the domain of the color scale
  .interpolator(d3.interpolateViridis) // Use the Viridis color scheme
  .clamp(true); // Ensure values outside the domain are mapped to the range
