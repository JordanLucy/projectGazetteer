var countryBorder;
var selectedCountryBorder;
var currentCountryIso = null;

var popup = L.popup();

// Map Setup and Overlays ------------------------------------------------------------------------------------------------------------------------------
var map = L.map("map").setView([53.4084, -2.9916], 13);

var mapTile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

var topographyMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);

googleHybrid = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

googleSat = L.tileLayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  maxZoom: 20,
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

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

//Geolocation of user -----------------------------------------------------------------------------------------------------------------------------

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
} else {
  console.log("Gelocation is not supported by this browser.");
}

async function successFunction(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;

  try {
    // Using openCage API
    var apiKey = "be0aa5008ed74764a77721198258cbbb";
    var apiUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude},${longitude}&no_annotations=1`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    var countryIso = data.results[0].components["ISO_3166-1_apha-2"];

    // Update currentCountryIso
    currentCountryIso = countryIso;

    //Update the Select Dropdown
    var selectDropDown = document.getElementById("countryList");
    for (var i = 0; i < selectDropDown.options.length; i++) {
      if (selectDropDown.options[i].value === countryIso) {
        selectDropDown.selectedIndex = i;
        break;
      }
    }

    //Set the map view to user's location
    map.setView([latitude, longitude], 16);

    //Create LatLng object
    var userLatLng = L.latLng(latitude, longitude);

    //Add marker and circle for user's location
    var radius = position.coords.accuracy;
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(
        "You are within " + Math.floor(radius) + " meters from this point"
      )
      .openPopup();
    L.circle(userLatLng, { radius: radius }).addTo(map);
  } catch (error) {
    console.log("Error fetching reverse geocoding data", error);
  }
}

function errorFunction() {
  console.log("Unable to retrieve your location");
}

//Markers On Click

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

//Country Dropdown List -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

$(document).ready(() => {
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
      "http://localhost/projectGazetteer/php/countryController.php"
    );
    const data = await response.json();

    if (data.status.code === "200" && data.data) {
      return data.data;
    } else {
      throw new Error("Unable to fetch country list");
    }
  } catch (error) {
    console.error("Error fetching country list:", error);
    return [];
  }
};

const populateCountryList = (data) => {
  data.sort((a, b) => a.countryName.localeCompare(b.countryName));

  $("#countryList").html(
    $.map(data, (feature, i) => {
      return `<option value="${feature.iso_a2}" id="countryListOption-${i}">${feature.countryName}</option>`;
    })
  );
};

// Create and target Country Border -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

$(document).ready(() => {
  $("#countryList").on("change", async function () {
    const selectedCountryIso = $(this).val();
    if (selectedCountryIso) {
      //Fetch country border data and display on map
      const borderData = await fetchCountryBorder(selectedCountryIso);
      if (borderData) {
        //Calculate the center of the countrys border
        const countryBorder = L.geoJSON(borderData);
        const countryCenter = countryBorder.getBounds().getCenter();

        //Clear previous country border if exists
        clearSelectedCountryBorder();

        //Set the map's view to the country's center as defined above.
        map.setView(countryCenter, 5);

        //Display the country border on the map as a layer
        selectedCountryBorder = L.geoJSON(borderData, {
          style: {
            color: "green",
            weight: 2,
            opacity: 0.5,
          },
        }).addTo(map);
      }
      //Fetch weather data based on the selected country's lat and long
      const countryData = await fetchCountryBorder(selectedCountryIso);
      if (countryData) {
        //Display weather info in modal overlay
        displayWeatherInfo(countryData);
      }
    } else {
      clearSelectedCountryBorder();
    }
  });
});

//Function to fetch country border
async function fetchCountryBorder(isoCode) {
  try {
    const response = await fetch(
      `http://localhost/projectGazetteer/php/countryBorder.php?iso=${isoCode}`
    );
    const borderData = await response.json();
    return borderData;
  } catch (error) {
    console.log("Error fetching country border", error);
    return null;
  }
}

//Function to fetch weather data
async function fetchCountry(selectedCountryIso) {
  try {
    const response = await fetch(
      `http://localhost/projectGazetteer/php/countryInfo.php?iso=${selectedCountryIso}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching counrty data", error);
    return null;
  }
}

//function to display weather information

function clearSelectedCountryBorder() {
  if (selectedCountryBorder) {
    map.removeLayer(selectedCountryBorder);
    selectedCountryBorder = null;
  }
}

// Weather API ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton("<span>🌤</span>", async function () {
  const selectedCountryIso = $("#countryList").val();
  if (selectedCountryIso) {
    const countryData = await fetchCountry(selectedCountryIso);

    //Check if the countryData has the lat an long info
    if (countryData.latitude && countryData.longitude) {
      try {
        const response = await fetch(
          "http://localhost/projectGazetteer/php/weatherAPI.php?lat=${countryData.latitude}$lon=${countryData.longitude}"
        );
        const data = await response.json();
        displayWeatherInfo(data);
        console.log(data);
      } catch (error) {
        console.log("Error: ", error);
      }
    } else {
      console.log("Latitude and longitude not available for selected country");
    }
  }
}).addTo(map);

async function displayWeatherInfo(data) {
  try {
    const celcius = Math.round(parseFloat(data.current.temp) - 273.15);
    const sunriseTime = new Date(
      data.current.sunrise * 1000
    ).toLocaleTimeString();
    const sunsetTime = new Date(
      data.current.sunset * 1000
    ).toLocaleTimeString();

    document.getElementById("tempInfo").innerHTML = celcius + "&deg;";
    document.getElementById("sunriseInfo").innerHTML = sunriseTime;
    document.getElementById("sunsetInfo").innerHTML = sunsetTime;
    document.getElementById("windspeedInfo").innerHTML =
      data.current.wind_speed;
    document.getElementById("currentWeatherConditions").innerHTML =
      data.current.weather[0].description;

    $("#weatherModal").modal("show");
  } catch (error) {
    console.log("Error, weather API not working", error);
  }
}

// Exchange Rate Modal -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

L.easyButton("<span>$</span>", async function () {
  const selectedCountryIso = $("#countryList").val();

  if (selectedCountryIso) {
    try {
      const response = await fetch(
        "http://localhost/projectGazetteer/php/exchangeRates.php?currentCurrency=" +
          selectedCountryIso
      );
      const result = await response.json();
      const currentRate = result.data.rates;
      const currencyName = selectedCountryIso;

      document.getElementById("currencyName").innerHTML = currencyName;
      document.getElementById("currencySymbol").innerHTML = "$";
      document.getElementById("exchangeRate").innerHTML = isNaN(currentRate)
        ? "Exchange Rate Not Found"
        : currentRate.toFixed(2);
      $("#currencyModal").modal("show");
    } catch (error) {
      console.log("Currency Error: ", error);
    }
  }
}).addTo(map);
