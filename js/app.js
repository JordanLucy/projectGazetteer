var countryBorder;
var selectedCountryBorder;
var currentCountryIso = null;

let trafficLayer;

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
    console.log(data);

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
    map.setView([latitude, longitude], 8);

    //Create LatLng object
    var userLatLng = L.latLng(latitude, longitude);

    //Add marker and circle for user's location
    var radius = position.coords.accuracy;
    L.marker([latitude, longitude]).addTo(map);

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

const fetchCountryList = () => {
  return $.ajax({
    url: "http://localhost/projectGazetteer/php/countryController.php",
    method: "GET",
    dataType: "json",
  });
};

const fetchAndPopulateCountryList = () => {
  fetchCountryList()
    .then((data) => {
      if (data.status.code === "200" && data.data) {
        populateCountryList(data.data);
        // Loop data into select via ID target
      } else {
        throw new Error("Unable to fetch country list");
      }
    })
    .catch((error) => {
      console.error("Error fetching and populating country list:", error);
    });
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
    const selectedIso = $(this).val();
    if (selectedIso) {
      //Fetch country border data
      const borderData = await fetchCountryBorder(selectedIso);
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
    } else {
      clearSelectedCountryBorder();
    }
  });
});

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

function clearSelectedCountryBorder() {
  if (selectedCountryBorder) {
    map.removeLayer(selectedCountryBorder);
    selectedCountryBorder = null;
  }
}

// General Country Info API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-info fa-lg" style="color: #000000;"></i>',
  function () {
    $.ajax({
      url: "http://localhost/projectGazetteer/php/generalCountryInfo.php",
      method: "GET",
      dataType: "json",
      success: function (result) {
        console.log(result);

        // Check if the 'geonames' array exists and is not empty
        if (
          result.data &&
          result.data.geonames &&
          result.data.geonames.length > 0
        ) {
          // Access the first country object in the 'geonames' array
          var countryInfo = result.data.geonames[0];

          // Access and display country information
          $("#countryName").html(countryInfo.countryName);
          $("#countryCapital").html(countryInfo.capital);
          $("#countryCode").html(countryInfo.countryCode);
          $("#countryContinent").html(countryInfo.continentName);

          if (countryInfo.population >= 1000000) {
            var populationMillions =
              (countryInfo.population / 1000000).toFixed(2) + "M";
            $("#countryPopulation").html(populationMillions);
          } else {
            $("#countryPopulation").html(countryInfo.population);
          }
          $("#countryArea").html(countryInfo.areaInSqKm + `SqKm`);

          // Show the modal
          $("#countryModal").modal("show");
        } else {
          console.log("No country info found in the response.");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(
          "Couldn't get general country info: ",
          textStatus,
          errorThrown
        );
      },
    });
  }
).addTo(map);

// News modal ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-newspaper fa-lg" style="color: #000000"></i>',
  function () {
    $.ajax({
      url: "http://localhost/projectGazetteer/php/countryNews.php",
      method: "GET",
      dataType: "json",
      success: function (result) {
        console.log(result);

        if (result.data.articles && result.data.articles.length > 0) {
          for (let i = 0; i < result.data.articles.length; i++) {
            $("#newsImage").attr("src", result.data.articles[i].urlToImage);
            $("#newsTitle").html(result.data.articles[i].title);
            $("#newsAuthor").html(result.data.articles[i].author);
            $("#newsDesc").html(result.data.articles[i].description);
            $("#newsDate").html(result.data.articles[i].publishedAt);

            var newsUrl = document.createElement("a");
            newsUrl.href = result.data.articles[i].wikipediaUrl;
            newsUrl.target = "_blank";
            newsUrl.textContent = "Click this link to load the Wikipedia Page";

            $("#newsUrl").html(newsUrl);
          }

          $("#newsModal").modal("show");
        } else {
          console.log("No articles found");
        }
      },
      error: function (jqHXR, textStatus, errorThrown) {
        console.log(
          "Couldn't find any news information: ",
          jqHXR,
          textStatus,
          errorThrown
        );
      },
    });
  }
).addTo(map);

// Weather API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-cloud fa-lg" style="color: #000000;"></i>',
  function () {
    $.ajax({
      url: "http://localhost/projectGazetteer/php/weatherAPI.php",
      method: "GET",
      dataType: "json",
      success: function (result) {
        console.log(result);

        const sunriseTime = new Date(
          result.data.weather.sys.sunrise * 1000
        ).toLocaleTimeString();
        const sunsetTime = new Date(
          result.data.weather.sys.sunset * 1000
        ).toLocaleTimeString();

        $("#tempInfo").html(
          Math.round(result.data.weather.main.temp) + "&deg;"
        );
        $("#tempFeel").html(
          Math.round(result.data.weather.main.feels_like) + "&deg;"
        );
        $("#sunriseInfo").html(sunriseTime);
        $("#sunsetInfo").html(sunsetTime);
        $("#windspeedInfo").html(
          result.data.weather.wind.speed +
            "mph at " +
            result.data.weather.wind.deg +
            "°"
        );
        $("#currentWeatherConditions").html(
          result.data.weather.weather[0].description
        );

        $("#weatherModal").modal("show");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(
          "Couldn't fetch weather information: ",
          jqXHR,
          textStatus,
          errorThrown
        );
      },
    });
  }
).addTo(map);

// Currency API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-coins fa-lg" style="color: #000000;"></i>',
  function () {
    $.ajax({
      url: "http://localhost/projectGazetteer/php/currencyAPI.php?currentCurrency=GBP",
      method: "GET",
      dataType: "json",
      success: function (result) {
        console.log(result);

        $("#base").html("USD"); //Base currency is USD
        $("#currencyName").html("GBP"); //Target is GBP
        $("#currencySymbol").html("£"); //Currency symbol for GBP
        // $("#exchangeRate").html(result.data.rates.GBP);

        $("#currencyModal").modal("show");
      },
      error: function (jqHXR, textStatus, errorThrown) {
        console.log(
          "Couldn't get currency information: ",
          jqHXR,
          textStatus,
          errorThrown
        );
      },
    });
  }
).addTo(map);

// Wikipedia API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-brands fa-wikipedia-w fa-lg" style="color: #000000;"></i>',
  function () {
    $.ajax({
      url: "http://localhost/projectGazetteer/php/countryWiki.php",
      method: "GET",
      dataType: "json",
      success: function (result) {
        console.log(result);

        var countryWikiResults = result.data.geonames[0];

        //Create img element for thumbnail
        var thumbnailImg = document.createElement("img");
        thumbnailImg.src = countryWikiResults.thumbnailImg;

        $("#wikiThumbnail").html(thumbnailImg);
        $("#countryWiki").html(countryWikiResults.title);
        $("#wikiSummary").html(countryWikiResults.summary);
        $("#wikiFeature").html(countryWikiResults.feature);

        //Create element for the wiki link
        var wikiLink = document.createElement("a");
        wikiLink.href = countryWikiResults.wikipediaUrl;
        wikiLink.target = "_blank";
        wikiLink.textContent = "Click this link to load the Wikipedia Page";

        $("#wikiUrl").html(wikiLink);

        $("#wikiModal").modal("show");
      },
      error: function (jqHXR, textStatus, errorThrown) {
        console.log(
          "Couldn't get country wiki information: ",
          jqHXR,
          textStatus,
          errorThrown
        );
      },
    });
  }
).addTo(map);
