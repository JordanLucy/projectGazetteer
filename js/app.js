let countryBorder;
let selectedCountryBorder;

let currentCountryIso;
let currentCountryIso3;
let currentCapitalLatitude;
let currentCapitalLongitude;
let currentCapital;

let currentCurrency;
let currencyName;
let currencyCode;
let currencySymbol;
let currencyExchangeRate;
let exchangeRatesList;
let latitude = 51.5074;
let longitude = -0.1278;

let popup = L.popup();

// const urlPath = "";
const urlPath = "http://localhost/projectGazetteer";

//Loading Spinner
$(".modal").on("show.bs.modal", function () {
  $("#spinnerContainer").show();
});

// Hide the spinner when a modal is hidden
$(".modal").on("hidden.bs.modal", function () {
  $("#spinnerContainer").hide();
});

// Map Setup and Overlays ------------------------------------------------------------------------------------------------------------------------------
let map = L.map("map").setView([0, 0], 13);

const mapTile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const topographyMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);

const googleHybrid = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

const googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

const Esri_NatGeoWorldMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",
    maxZoom: 16,
  }
);

//Layer Controller
let baseMaps = {
  "Normal MapTile": mapTile,
  "Topography Map": topographyMap,
  "Google Hybrid Map": googleHybrid,
  "Google Sat Map": googleSat,
  "Nat Geo Map": Esri_NatGeoWorldMap,
};

let layerControl = L.control.layers(baseMaps).addTo(map);

var markers = new L.MarkerClusterGroup();

//Marker location On Click

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

//Document Ready Call -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
$(document).ready(() => {
  try {
    fetchAndSetUserLocation();
    fetchAndPopulateCountryList();
    // fetchAndSetBorderData();

    $("#countryList").select2({
      width: "50%",
      height: "40px",
    });
    $("#countryList").on("change", () => {
      fetchAndSetBorderData();
    });
  } catch {
    alert("The document information hasn't loaded.");
  }
});

//Country Dropdown List -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
const fetchCountryList = () => {
  return $.ajax({
    url: `${urlPath}/php/countryController.php`,
    method: "GET",
    dataType: "json",
  });
};

const fetchAndPopulateCountryList = () => {
  fetchCountryList()
    .then((data) => {
      console.log("Fetch Country List Result: ", data);
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
      return `<option value="${feature.iso_a2}" ${
        feature.iso_a2 == "GB" ? "selected" : ""
      } id="countryListOption-${i}">${feature.countryName}</option>`;
    })
  );
};

// Create and target Country Border -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

function fetchAndSetBorderData() {
  const selectedIso = $("#countryList").val();
  if (selectedIso) {
    currentCountryIso = selectedIso;
    clearMarkers();

    $.ajax({
      url: `${urlPath}/php/countryBorder.php?iso=${selectedIso}`,
      method: "GET",
      dataType: "json",
      success: function (borderData) {
        console.log("Fetch Country Border Result: ", borderData);
        if (borderData) {
          currentCountryIso3 = borderData.iso_a3;
          console.log("current iso a3: ", currentCountryIso3);
          // Calculate the center of the country's border
          const countryBorder = L.geoJSON(borderData.geometry);
          let countryCenter = countryBorder.getBounds().getCenter();

          // Clear previous country border if exists
          clearSelectedCountryBorder();

          // Set the map's view to the country's center as defined above.
          map.setView(countryCenter, 5);

          // Display the country border on the map as a layer
          selectedCountryBorder = L.geoJSON(borderData.geometry, {
            style: {
              color: "black",
              fillColor: "#E83151",
              weight: 2,
            },
          }).addTo(map);
        }
      },
      error: function (error) {
        console.error("Error fetching country border data:", error);
      },
    });
    getCapitalFromIsoCode(currentCountryIso); // this func needs to return the capital
  } else {
    clearSelectedCountryBorder();
  }
}

function forwardGeoEncodePlaceName(place) {
  $.ajax({
    url: `${urlPath}/php/openCageAPI.php`,
    method: "GET",
    dataType: "json",
    data: { placeName: encodeURIComponent(place[0]) },
    success: function (result) {
      currentCapitalLatitude = result.data.results[0].geometry.lat;
      currentCapitalLongitude = result.data.results[0].geometry.lng;
      console.log("Open Cage api result: ", result);
      fetchAndUpdateMarkers();
    },
  });
  hideLoader();
}

function hideLoader() {
  setTimeout(() => {
    $("#preloaderContainer").fadeOut();
  }, 500);
}

function clearSelectedCountryBorder() {
  if (selectedCountryBorder) {
    map.removeLayer(selectedCountryBorder);
    selectedCountryBorder = null;
  }
}

function clearMarkers() {
  markers.clearLayers();
}

let currentCurrencyDetails;
function getCapitalFromIsoCode(isoCode) {
  $.ajax({
    url: `${urlPath}/php/restCountryInfo.php`, // Why are we doing this more than once when return wont change
    method: "GET",
    dataType: "json",
    success: function (result) {
      // console.log("Here is the restAPI output", result);
      if (result.data) {
        result.data.forEach((country) => {
          const capitalCode = country.cca2;
          if (isoCode === capitalCode) {
            currentCurrencyDetails = Object.entries(country.currencies)[0];
            console.log(
              "The current Currency Details: ",
              currentCurrencyDetails
            );
            currentCapital = country.capital[0];
            forwardGeoEncodePlaceName(country.capital);
          }
        });
      } else {
        console.log("Couldn't find the country code from rest API");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(
        "Couldn't find the restAPI data: ",
        jqXHR,
        textStatus,
        errorThrown
      );
    },
  });
}

//Geolocation of user -----------------------------------------------------------------------------------------------------------------------------
function fetchAndSetUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
  } else {
    console.log("Geolocation is not supported by this browser.");
    setDefaultLocation("GB");
  }
}

function successFunction(position) {
  latitude = position?.coords?.latitude ?? latitude;
  longitude = position?.coords?.longitude ?? longitude;

  console.log("users latlng", latitude, longitude);

  try {
    $.ajax({
      url: `${urlPath}/php/openCageAPI.php`,
      method: "GET",
      dataType: "json",
      data: { placeName: encodeURIComponent(`${latitude},${longitude}`) },
      success: function (result) {
        console.log("User Location Data: ", result);

        let countryIso =
          result.data.results[0].components["ISO_3166-1_alpha-2"];
        console.log("This is the countryISO", countryIso);

        // Update currentCountryIso
        currentCountryIso = countryIso;
        console.log("This is the current Country ISO: ", currentCountryIso);

        //Change the Select2 container to update on the users country.
        $("#countryList").val(currentCountryIso).trigger("change.select2");

        //Set the map view to user's location
        map.setView([latitude, longitude], 5);
        fetchAndSetBorderData();
        //Create LatLng object
        let userLatLng = L.latLng(latitude, longitude);

        //Add marker and circle for user's location
        let radius = position?.coords?.accuracy ?? 1000;
        L.marker([latitude, longitude]).addTo(map);

        L.circle(userLatLng, { radius: radius }).addTo(map);
      },
      error: function (error) {
        console.log("Error fetching reverse geocoding data", error);
        setDefaultLocation("GB");
      },
    });
  } catch (error) {
    console.log("Error fetching reverse geocoding data", error);
    setDefaultLocation("GB");
  }
}

function errorFunction() {
  alert("Unable to retrieve your location, using default location instead.");
  //Set default location to UK
  setDefaultLocation("GB");
  successFunction();
}

function setDefaultLocation(countryIso) {
  if (!countryIso) {
    countryIso = "GB"; // Set the default to GB
  }
  currentCountryIso = countryIso;
  $("#countryList").val(currentCountryIso);

  map.setView([latitude, longitude], 5);
}

function addCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// General Country Info API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-info fa-lg" style="color: #000000;"></i>',
  () => {
    try {
      $.ajax({
        url: `${urlPath}/php/generalCountryInfo.php`,
        method: "GET",
        dataType: "json",
        data: {
          //TODO: finish setting the data up.
          country: currentCountryIso,
        },
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          console.log(result);

          // Check if the 'geonames' array exists and is not empty
          if (
            result.data &&
            result.data.geonames &&
            result.data.geonames.length > 0
          ) {
            // Access the first country object in the 'geonames' array
            let countryInfo = result.data.geonames[0];

            // Access and display country information
            $("#countryName").html(countryInfo.countryName);
            $("#countryCapital").html(countryInfo.capital);
            $("#countryCode").html(countryInfo.countryCode);
            $("#countryISO3").html(countryInfo.isoAlpha3);
            $("#countryContinent").html(countryInfo.continentName);

            if (countryInfo.population >= 1000000) {
              let populationMillions =
                (countryInfo.population / 1000000).toFixed(2) + "M";
              $("#countryPopulation").html(populationMillions);
            } else {
              $("#countryPopulation").html(countryInfo.population);
            }
            let area = Math.floor(countryInfo.areaInSqKm);
            $("#countryArea").html(addCommas(area) + `SqKm`);

            // Show the modal
            $("#countryModal").modal("show");
          } else {
            console.log("No country info found in the response.");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(
            "Couldn't get general country info: ",
            jqXHR,
            textStatus,
            errorThrown
          );
        },
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert(
        "An Error has occured when trying to fetch the country information!"
      );
      $("#spinner").hide();
    }
  }
).addTo(map);

// News modal ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-newspaper fa-lg" style="color: #000000"></i>',
  () => {
    try {
      $.ajax({
        url: `${urlPath}/php/countryNews.php`,
        method: "GET",
        dataType: "json",
        data: {
          //TODO: finish setting the data up.
          country: currentCountryIso,
        },
        beforeSend: function () {
          $("#spinner").show();
          console.log(currentCountryIso);
        },
        success: function (result) {
          console.log(result);

          if (!result?.data?.articles?.length > 0 ?? false) {
            console.log("No articles found");
            alert("there is no articles found for this country");
            return;
          }
          $("#news-tbody").html("");

          for (let i = 0; i < result.data.articles.length; i++) {
            $("#news-tbody").append(
              `<tr>
                <td><img style="height:100px;object-fit:cover;width:150px;" src="${result.data.articles[i].image}"></td>
                <td id="newsTitle"><a target="_blank" href="${result.data.articles[i].url}">${result.data.articles[i].title}</a></td>
            </tr>`
            );
          }

          $("#newsModal").modal("show");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(
            "Couldn't find any news information: ",
            jqXHR,
            textStatus,
            errorThrown
          );
        },
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert("An Error has occured when trying to fetch the news!");
      $("#spinner").hide();
    }
  }
).addTo(map);

// Weather API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-cloud fa-lg" style="color: #000000;"></i>',
  () => {
    if (!currentCapitalLatitude || !currentCapitalLongitude) {
      alert("Neither capital latitude or longitude is available!");
      return;
    }
    try {
      $.ajax({
        url: `${urlPath}/php/weatherAPI.php`,
        method: "GET",
        dataType: "json",
        data: {
          lat: currentCapitalLatitude,
          lon: currentCapitalLongitude,
        },
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          console.log("Weather API Call Result: ", result);

          const sunriseTime = new Date(
            result.data.weather.sys.sunrise * 1000
          ).toLocaleTimeString();
          const sunsetTime = new Date(
            result.data.weather.sys.sunset * 1000
          ).toLocaleTimeString();

          $("#weatherIcon").attr(
            "src",
            "http://openweathermap.org/img/w/" +
              result.data.weather.weather[0].icon +
              ".png"
          );

          $("#tempInfo").html(
            Math.round(result.data.weather.main.temp) + "&deg;"
          );
          $("#tempFeel").html(
            Math.round(result.data.weather.main.feels_like) + "&deg;"
          );
          $("#cloudCover").html(result.data.weather.clouds.all + "%");
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
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert(
        "An Error has occured when trying to fetch the weather information!"
      );
      $("#spinner").hide();
    }
  }
).addTo(map);

// Currency API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-coins fa-lg" style="color: #000000;"></i>',
  () => {
    try {
      $.ajax({
        url: `${urlPath}/php/currencyAPI.php`, // TODO: only look up once as will never change
        method: "GET",
        dataType: "json",
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          if (result.status.code === "200" && result.data) {
            exchangeRatesList = result.data.exchangeRates;

            console.log("This is the currency api result: ", result); // contains result.data.exchangeRates -> lookup via currency code i.e. GBP

            currencyExchangeRate = exchangeRatesList[currentCurrencyDetails[0]];

            $("#currencyName").html(currentCurrencyDetails[1].name);
            $("#currencySymbol").html(currentCurrencyDetails[1].symbol);
            $("#exchangeRate").html(
              `$1 USD  = ${currentCurrencyDetails[1].symbol}${currencyExchangeRate}`
            );
          } else {
            console.error("Failed to fetch currency information");
          }

          $("#currencyModal").modal("show");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(
            "Couldn't get currency information: ",
            jqXHR,
            textStatus,
            errorThrown
          );
        },
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert(
        "An Error has occured when trying to fetch the country information!"
      );
      $("#spinner").hide();
    }
  }
).addTo(map);

// Wikipedia API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-brands fa-wikipedia-w fa-lg" style="color: #000000;"></i>',
  () => {
    if (!currentCountryIso || !currentCapital) {
      alert("No country ISO or capital has been set.");
    }
    try {
      console.log("currentCountryIso", currentCountryIso);
      console.log("currentCapital", currentCapital);
      $.ajax({
        url: `${urlPath}/php/countryWiki.php`,
        method: "GET",
        dataType: "json",
        data: {
          country: currentCountryIso,
          countryCapital: currentCapital,
        },
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          console.log("Wiki api call result: ", result);

          let countryWikiResults = result.data.geonames[0];

          //Create img element for thumbnail
          let thumbnailImg = document.createElement("img");
          thumbnailImg.src = countryWikiResults.thumbnailImg;

          $("#wikiThumbnail").html(thumbnailImg);
          $("#countryWiki").html(countryWikiResults.title);
          $("#wikiSummary").html(countryWikiResults.summary);
          $("#wikiFeature").html(countryWikiResults.feature);

          //Create element for the wiki link
          let wikiLink = document.createElement("a");
          wikiLink.href = `https://${countryWikiResults.wikipediaUrl}`;
          wikiLink.target = "_blank";
          wikiLink.textContent = "Click this link to load the Wikipedia Page";

          $("#wikiUrl").html(wikiLink);

          $("#wikiModal").modal("show");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(
            "Couldn't get country wiki information: ",
            jqXHR,
            textStatus,
            errorThrown
          );
        },
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert("An Error has occured when trying to fetch Wikipedia information!");
      $("#spinner").hide();
    }
  }
).addTo(map);

/* Create Map markers based on location*/

function fetchAndUpdateMarkers() {
  $.ajax({
    url: `${urlPath}/php/infoMarkers.php`,
    method: "GET",
    dataType: "json",
    data: {
      latitude: currentCapitalLatitude,
      longitude: currentCapitalLongitude,
    },
    beforeSend: function (jqXHR, settings) {
      console.log(settings.url);
    },
    success: function (result) {
      console.log("all the landmarks", result);
      result.data.results.forEach((entry) => {
        let hotelIcon = L.ExtraMarkers.icon({
          icon: "fa-hotel",
          prefix: "fa",
          iconColor: "blue",
          markerColor: "white",
        });

        let marker = L.marker(
          [entry.geometry.location.lat, entry.geometry.location.lng],
          { icon: hotelIcon }
        ).bindPopup(entry.name);
        markers.addLayer(marker);
      });

      // Add the marker cluster group to the map
      map.addLayer(markers);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(
        "Couldn't retrieve wiki Markers:",
        jqXHR,
        textStatus,
        errorThrown
      );
    },
  });
}
