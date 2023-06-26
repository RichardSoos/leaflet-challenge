// Creating the map object
let myMap = L.map("map", {
  center: [6, 40],
  zoom: 2
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Use this link to get the GeoJSON data.
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Define the marker size function
function markerSize(mag) {
  return mag * 1.5;
}

// Define the color scale function
const colorScale = d3.scaleSequential()
  .domain([1, 620].reverse()) // Reverse the domain of the color scale
  .interpolator(d3.interpolateViridis) // Use the Viridis color scheme
  .clamp(true); // Ensure values outside the domain are mapped to the range

// Getting our GeoJSON data
d3.json(link).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
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
  }).addTo(myMap);

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







