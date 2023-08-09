var countryBorder;

// Map JavasScript ------------------------------------------------------------------------------------------------------------------------------
//Map Initialization
var map = L.map("map").setView([53.4084, -2.9916], 13);

//Map tileLayer
var mapTile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

//Map Topography layer
var topographyMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);

//Map Google Hybrid
googleHybrid = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

//Map Google Sat
googleSat = L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  maxZoom: 20,
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

//Map Nat Geo
var Esri_NatGeoWorldMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    maxZoom: 16,
  }
);

var singleMarker = L.marker([53.4084, -2.9916]).addTo(map);

//Layer Controller
var baseMaps = {
  "Normal MapTile": mapTile,
  "Topography Map": topographyMap,
  "Google Hybrid Map": googleHybrid,
  "Google Sat Map": googleSat,
  "Nat Geo Map": Esri_NatGeoWorldMap,
};

var overlayMaps = {
  Marker: singleMarker,
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

//Geolocation of user -----------------------------------------------------------------

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
} else {
  console.log("Gelocation is not supported by this browser.");
}
function successFunction(position) {
  console.log(position);
  map.locate({ setView: true, maxZoom: 16 });

  function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng)
      .addTo(map)
      .bindPopup(
        "You are within " + Math.floor(radius) + " meters from this point"
      )
      .openPopup();

    L.circle(e.latlng, radius).addTo(map);
  }

  map.on("locationfound", onLocationFound);
}
function errorFunction() {
  console.log("Unable to retrieve your location");
}

// Create Country Border

//Markers On Click

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

//Multiple markers
/*
var markers = new L.MarkerClusterGroup();

markers.addLayer(L.marker([175.3107, -37.7784]));

map.addLayer(markers);*/

//Countries List ---------------------------------------------------------------------------------------------------------------------------------------

$(() => {
  // this will run when page loads
  fetchAndPopulateCountryList();
});

const fetchAndPopulateCountryList = async () => {
  // async call to new controller
  const countryListData = await fetchCountryList();
  console.log(countryListData);
  populateCountryList(countryListData);
  // loop data into select via id target
};

const fetchCountryList = async () => {
  try {
    const response = await fetch(
      "C:/xampp/htdocs/projectGazetteer/php/countryController.php"
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    return { countryName: "Could not find countries" };
    console.log("Error: ", error);
  }
};

const populateCountryList = (data) => {
  $("#countryList").innerHTML = $.map(data, (el, i) => {
    return `<option value="${el.iso_a2}" id="countryListOption-${i}">${el.countryName}}</option>`;
  });
};

// Weather API ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton('<img src="./icons/weather_icon.png">', function () {
  async function returnWeatherInfo() {
    try {
      const key = "78c766e3970675bb23047dc7723a57da";
      const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=Liverpool,UK&appid=" +
          key
      );
      const data = await response.json();
      displayWeatherInfo(data);
      console.log(data);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  function displayWeatherInfo(data) {
    console.log(data);
    const celcius = Math.round(parseFloat(data.main.temp) - 273.15);
    const fehrenheit = Math.round(
      (parseFloat(data.main.temp) - 273.15) * 1.8 + 32
    );

    document.getElementById("tempInfo").innerHTML = celcius + "&deg;";
    document.getElementById("sunriseInfo").innerHTML = data.sys.sunrise;
    document.getElementById("sunsetInfo").innerHTML = data.sys.sunset;
    document.getElementById("windspeedInfo").innerHTML = data.wind.speed;
    document.getElementById("currentWeatherConditions").innerHTML =
      data.weather[0].description;
  }

  returnWeatherInfo();

  $("#weatherModal").modal("show");
}).addTo(map);
