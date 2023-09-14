var countryBorder;
var selectedCountryBorder;

let currentCountryIso;
let currentCapitalLatitude;
let currentCapitalLongitude;
let currentCapital;

var popup = L.popup();

//Loading Spinner
$(".modal").on("show.bs.modal", function () {
  $("#spinnerContainer").show();
});

// Hide the spinner when a modal is hidden
$(".modal").on("hidden.bs.modal", function () {
  $("#spinnerContainer").hide();
});

// Map Setup and Overlays ------------------------------------------------------------------------------------------------------------------------------
const map = L.map("map").setView([53.4084, -2.9916], 13);

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

//Layer Controller
var baseMaps = {
  "Normal MapTile": mapTile,
  "Topography Map": topographyMap,
  "Google Hybrid Map": googleHybrid,
  "Google Sat Map": googleSat,
  "Nat Geo Map": Esri_NatGeoWorldMap,
};

var layerControl = L.control.layers(baseMaps).addTo(map);

//Markers On Click

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

map.on("click", onMapClick);

//Country Dropdown List -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

/*
What we want to do is, whenever the country is changed 
 we need to find the capital (getCapitalFromIsoCode) -> currentCapital = getCapitalFromIsoCode(currentIsoCode)
 then find its co-ords (getCoOrdsFromPlaceName) -> currentCoords = getCoOrdsFromPlaceName(currentCapital) (shoudl return an array/obj of long: bla, lat: bla)
 then update our currentCapitalLatitude & currentCapitalLongitude: currentCapitalLatitude = currentCoords.long; currentCapitalLongitude = currentCoords.lat;
*/
$(document).ready(() => {
  try {
    fetchAndSetUserLocation();
    fetchAndPopulateCountryList();
    fetchAndSetBorderData();
    $("#countryList").select2({
      width: "50%",
      height: "40px",
    });
    $("#countryList").on("change", () => {
      fetchAndSetBorderData();
    });
  } catch {
    alert("Raggy, where is my datacles");
  }
  // TODO: dont have more than 1 on document ready function.
});

function fetchAndSetBorderData() {
  const selectedIso = $("#countryList").val();
  if (selectedIso) {
    currentCountryIso = selectedIso;
    // try {
    // fetchAndSetBorderData();
    // fetchAndSetCurrentCapitalCoords();
    // } catch { alert('big poo poo') }

    // TODO: separate this into its own function
    // TODO: add call to run lookup for capital co-ords
    // Make an AJAX request to fetch country border data
    $.ajax({
      url: `http://localhost/projectGazetteer/php/countryBorder.php?iso=${selectedIso}`,
      method: "GET",
      dataType: "json",
      success: function (borderData) {
        console.log("Fetch Country Border Result: ", borderData);
        if (borderData) {
          // Calculate the center of the country's border
          const countryBorder = L.geoJSON(borderData);
          const countryCenter = countryBorder.getBounds().getCenter();

          // Clear previous country border if exists
          clearSelectedCountryBorder();

          // Set the map's view to the country's center as defined above.
          map.setView(countryCenter, 5);

          // Display the country border on the map as a layer
          selectedCountryBorder = L.geoJSON(borderData, {
            style: {
              color: "green",
              weight: 2,
              opacity: 0.5,
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
    url: "http://localhost/projectGazetteer/php/openCageAPI.php",
    method: "GET",
    dataType: "json",
    data: { placeName: encodeURIComponent(place[0]) },
    success: function (result) {
      currentCapitalLatitude = result.data.results[0].geometry.lat;
      currentCapitalLongitude = result.data.results[0].geometry.lng;
      console.log(result);
    },
  });
}

function clearSelectedCountryBorder() {
  if (selectedCountryBorder) {
    map.removeLayer(selectedCountryBorder);
    selectedCountryBorder = null;
  }
}

function getCapitalFromIsoCode(isoCode) {
  $.ajax({
    url: "http://localhost/projectGazetteer/php/restCountryInfo.php?",
    method: "GET",
    dataType: "json",
    success: function (result) {
      // console.log("Here is the restAPI output", result);
      if (result.data) {
        result.data.forEach((country) => {
          const capitalCode = country.cca2;
          if (isoCode === capitalCode) {
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
    console.log("Gelocation is not supported by this browser.");
  }

  async function successFunction(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    try {
      // Using openCage API
      var apiKey = "be0aa5008ed74764a77721198258cbbb";
      var url = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude},${longitude}&no_annotations=1`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("User Location Data: ", data);

      let countryIso = data.results[0].components["ISO_3166-1_apha-2"];

      // Update currentCountryIso
      currentCountryIso = countryIso;
      // console.log("This is the current Country ISO: ", currentCountryIso); TODO: Fix this to actually have a value so it can be reused.

      //Update the Select Dropdown
      var selectDropDown = document.getElementById("countryList");
      for (var i = 0; i < selectDropDown.options.length; i++) {
        if (selectDropDown.options[i].value === countryIso) {
          selectDropDown.selectedIndex = i;
          break;
        }
      }

      //Set the map view to user's location
      map.setView([latitude, longitude], 5);
      fetchAndSetBorderData();
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
}

// General Country Info API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-info fa-lg" style="color: #000000;"></i>',
  function () {
    $.ajax({
      url: "http://localhost/projectGazetteer/php/generalCountryInfo.php",
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
        $("#spinner").hide();
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
          jqXHR,
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
  () => {
    try {
      $.ajax({
        url: "http://localhost/projectGazetteer/php/countryNews.php",
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
            alert("WEE WOO WEE WOO BLYATTTTTT");
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
      });
    } catch {
      alert("an error has occured when trying to fetch the news oh no!");
    } finally {
      $("#spinner").hide();
    }
  }
).addTo(map);

// Weather API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-cloud fa-lg" style="color: #000000;"></i>',
  function () {
    if (!currentCapitalLatitude || !currentCapitalLongitude) {
      alert("you have been a big bonobo idiot loser get a job.");
      return;
    }

    $.ajax({
      url: "http://localhost/projectGazetteer/php/weatherAPI.php",
      method: "GET",
      dataType: "json",
      data: {
        lat: currentCapitalLatitude,
        lon: currentCapitalLongitude,
      },
      beforeSend: function () {
        $("#spinner").show(); // TODO: Fix spinner position
      },
      success: function (result) {
        $("#spinner").hide();
        console.log("Weather API Call Result: ", result);

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
      // data: { TODO: finish setting the data up.

      // },
      beforeSend: function () {
        $("#spinner").show();
      },
      success: function (result) {
        $("#spinner").hide();
        console.log(result);

        $("#base").html("USD"); //Base currency is USD  TODO: Change this to a proper currency converter
        $("#currencyName").html("GBP"); //Target is GBP
        $("#currencySymbol").html("£"); //Currency symbol for GBP
        // $("#exchangeRate").html(result.data.rates.GBP);

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
    });
  }
).addTo(map);

// Wikipedia API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-brands fa-wikipedia-w fa-lg" style="color: #000000;"></i>',
  () => {
    if (!currentCountryIso || !currentCapital) {
      alert("No cunt or cap set.");
    }
    try {
      console.log("currentCountryIso", currentCountryIso);
      console.log("currentCapital", currentCapital);
      $.ajax({
        url: "http://localhost/projectGazetteer/php/countryWiki.php",
        method: "GET",
        dataType: "json",
        data: {
          // TODO: finish setting the data up.
          country: currentCountryIso,
          countryCapital: currentCapital,
        },
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          console.log("Wiki api call result: ", result);

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
      });
    } catch {
      alert("wiki call failed. error was thrown.");
    } finally {
      $("#spinner").hide();
    }
  }
).addTo(map);
