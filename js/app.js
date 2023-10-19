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
let selectedCityLat;
let selectedCityLng;
let currencyList = [];

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
let map = L.map("map");

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

//Marker Layer Controller

let airports = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "blue",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

let cities = L.markerClusterGroup({
  polygonOptions: {
    fillColor: "blue",
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  },
}).addTo(map);

let markerOverlay = {
  Airports: airports,
  Cities: cities,
};

let layerControl = L.control.layers(baseMaps, markerOverlay).addTo(map);

let markers = new L.MarkerClusterGroup();

/* Create Map markers based on location*/
function fetchAndUpdateMarkers() {
  try {
    $.ajax({
      url: `${urlPath}/php/infoMarkers.php`,
      method: "GET",
      dataType: "json",
      data: {
        country: currentCountryIso,
      },
      beforeSend: function () {
        $("#spinner").show();
      },
      success: function (result) {
        // console.log("all the landmarks", result);

        cities.clearLayers();
        airports.clearLayers();

        const filteredCities = result.data.cities.geonames.filter(
          (city) => city.population > 150000
        );
        filteredCities.sort((a, b) => a.name.localeCompare(b.name));

        // console.log("These are the filtered cities", filteredCities);
        const citySelect = document.getElementById("citySelect");
        citySelect.innerHTML = "";

        filteredCities.forEach((entry) => {
          const option = document.createElement("option");
          option.value = `${entry.lat},${entry.lng}`;
          option.textContent = entry.name;
          citySelect.appendChild(option);
        });

        $("#citySelect option")
          .filter(function () {
            return $(this).text() == currentCapital;
          })
          .prop("selected", true);

        filteredCities.forEach((entry) => {
          let cityIcon = L.ExtraMarkers.icon({
            prefix: "fa",
            icon: "fa-city",
            iconColor: "blue",
            markerColor: "white",
            shape: "square",
          });

          L.marker([entry.lat, entry.lng], {
            icon: cityIcon,
            lat: entry.lat,
            lng: entry.lng,
          })
            .bindTooltip(
              "<div class='col text-center' style='margin: 1px;'><strong>" +
                entry.name +
                "</strong><br><i>(" +
                numeral(entry.population).format("0,0") +
                ")</i></div>",
              { direction: "top", sticky: true }
            )
            .addTo(cities);
        });

        result.data.airports.geonames.forEach((entry) => {
          let airportIcon = L.ExtraMarkers.icon({
            prefix: "fa",
            icon: "fa-plane",
            iconColor: "white",
            markerColor: "green",
          });

          L.marker([entry.lat, entry.lng], {
            icon: airportIcon,
          })
            .bindTooltip(
              "<div class='col text-center' style='margin: 1px;'><strong>" +
                entry.name +
                "</stong></div>",
              { direction: "top", sticky: true }
            )
            .addTo(airports);
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(
          "Couldn't retrieve wiki Markers: ",
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
    alert("An Error has occured when trying to fetch Map Marker information!");
    $("#spinner").hide();
  }
}

//Document Ready Call -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
$(document).ready(() => {
  try {
    fetchAndSetUserLocation();
    fetchAndPopulateCountryList();

    $("#countryList").select2({
      width: "50%",
      height: "40px",
    });
    $("#countryList").on("change", () => {
      fetchAndSetBorderData();
    });
    $("#citySelect").on("change", () => {
      const [lat, lng] = $("#citySelect").val().split(",");
      fetchWeather(lat, lng);
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
      // console.log("Fetch Country List Result: ", data);
      if (data.status.code === "200" && data.data) {
        populateCountryList(data.data); // Loop data into select via ID target
      } else {
        throw new Error("Unable to fetch country list");
      }
    })
    .catch((error) => {
      console.error("Error fetching and populating country list:", error);
    });
};

//Sort through country list and populate
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

    $.ajax({
      url: `${urlPath}/php/countryBorder.php?iso=${selectedIso}`,
      method: "GET",
      dataType: "json",
      success: function (feature) {
        // console.log("Fetch Country Border Result: ", feature);
        if (feature) {
          currentCountryIso3 = feature.properties.iso_a3;
          // console.log("current iso a3: ", currentCountryIso3);

          // Clear previous country border if exists
          clearSelectedCountryBorder();

          // Display the country border on the map as a layer
          selectedCountryBorder = L.geoJSON(feature, {
            style: {
              color: "black",
              fillColor: "#E83151",
              weight: 2,
            },
          }).addTo(map);
          // Set the map's view to the country's boundary.
          map.fitBounds(selectedCountryBorder.getBounds());
        }
      },
      error: function (error) {
        console.error("Error fetching country border data:", error);
      },
    });
    getCapitalFromIsoCode(currentCountryIso);
    getNewsArticlesFromIsoCode(currentCountryIso);
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
      // console.log("Open Cage api result: ", result);
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

function getNewsArticlesFromIsoCode(isoCode) {
  try {
    $.ajax({
      url: `${urlPath}/php/countryNews.php`,
      method: "GET",
      dataType: "json",
      data: {
        country: isoCode,
      },
      beforeSend: function () {
        $("#spinner").show();
        // console.log(currentCountryIso);
      },
      success: function (result) {
        // console.log("This is the new article result: ", result);

        if (!result?.data?.articles?.length > 0 ?? false) {
          console.log("No articles found");
          alert("there was no news articles found for this country");
          return;
        }
        $("#news-tbody").html("");

        function limitWords(text, maxWords) {
          return (
            text.split(/\s+/).slice(0, maxWords).join(" ") +
            (text.split(/\s+/).length > maxWords ? "..." : "")
          );
        }

        for (let i = 0; i < result.data.articles.length; i++) {
          let title = result.data.articles[i].title;
          let maxWords = 10; // Set the maximum number of words

          let truncatedTitle = limitWords(title, maxWords);

          $("#news-tbody").append(
            `<tr>
            <td><img style="height:100px;object-fit:cover;width:150px;" src="${result.data.articles[i].image}"></td>
            <td id="newsTitle"><a target="_blank" href="${result.data.articles[i].url}">${truncatedTitle}</a>
            <br>
            <br><em>
            ${result.data.articles[i].source.name}</em>
            </td> 
        </tr>`
          );
          const img = new Image();
          img.src = result.data.articles[i].image;
          // console.log("Image preloaded:", img.src);
        }
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
  } catch (error) {
    console.log("News Error: ", error);
    alert("An Error has occured when trying to fetch the news!");
    $("#spinner").hide();
  }
}

let currentCurrencyDetails;
function getCapitalFromIsoCode(isoCode) {
  $.ajax({
    url: `${urlPath}/php/restCountryInfo.php`,
    method: "GET",
    dataType: "json",
    success: function (result) {
      // console.log("Here is the restAPI output", result);
      if (result.data) {
        result.data.forEach((country) => {
          const capitalCode = country.cca2;
          if (country.currencies) {
            currencyList.push.apply(
              currencyList,
              Object.entries(country.currencies)
            );
          }
          if (isoCode === capitalCode) {
            currentCurrencyDetails = Object.entries(country.currencies)[0];
            // console.log(
            //   "The current Currency Details: ",
            //   currentCurrencyDetails
            // );
            currentCapital = country.capital[0];

            forwardGeoEncodePlaceName(country.capital);
            // console.log("Im setting the capital to", country.capital[0]);
          }
        });
        // console.log("currencyList", currencyList);
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

  // console.log("users latlng", latitude, longitude);

  try {
    $.ajax({
      url: `${urlPath}/php/openCageAPI.php`,
      method: "GET",
      dataType: "json",
      data: { placeName: encodeURIComponent(`${latitude},${longitude}`) },
      success: function (result) {
        // console.log("User Location Data: ", result);

        let countryIso =
          result.data.results[0].components["ISO_3166-1_alpha-2"];
        // console.log("This is the countryISO", countryIso);

        // Update currentCountryIso
        currentCountryIso = countryIso;
        // console.log("This is the current Country ISO: ", currentCountryIso);

        //Change the Select2 container to update on the users country.
        $("#countryList").val(currentCountryIso).trigger("change.select2");

        //Set the map view
        fetchAndSetBorderData();
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
  '<i class="fa-solid fa-info fa-lg" style="color: #000;"></i>',
  () => {
    try {
      $.ajax({
        url: `${urlPath}/php/generalCountryInfo.php`,
        method: "GET",
        dataType: "json",
        data: {
          country: currentCountryIso,
        },
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          // console.log("General Country Info : ", result);

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
            $("#countryContinent").html(countryInfo.continentName);
            $("#countryCode").html(countryInfo.countryCode);
            $("#countryISO3").html(countryInfo.isoAlpha3);
            $("#countryPostCode").html(countryInfo.postalCodeFormat);
            $("#countryLanguages").html(countryInfo.languages);

            $("#countryPopulation").html(
              numeral(countryInfo.population).format("0.0a")
            );
            let area = Math.floor(countryInfo.areaInSqKm);
            $("#countryArea").html(numeral(area).format("0,0") + `SqKm`);

            // Show the modal
            $("#countryModal").modal("show");
          } else {
            console.log("No country info found in the response.");
            alert(
              "Failed to retrieve data from the API, Error Code: " +
                results.status.code
            );
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
  '<i class="fa-solid fa-newspaper fa-lg" style="color: #000"></i>',
  () => {
    $("#newsModal").modal("show");
  }
).addTo(map);

// Weather API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-cloud fa-lg" style="color: #000;"></i>',
  () => {
    if (!currentCapitalLatitude || !currentCapitalLongitude) {
      alert("Neither capital latitude or longitude is available!");
      return;
    }
    try {
      fetchWeather(currentCapitalLatitude, currentCapitalLongitude);
    } catch {
      alert(
        "An Error has occured when trying to fetch the weather information!"
      );
      $("#spinner").hide();
    }
  }
).addTo(map);

function fetchWeather(lat, lng) {
  $.ajax({
    url: `${urlPath}/php/weatherAPI.php`,
    method: "GET",
    dataType: "json",
    data: {
      lat: lat,
      lon: lng,
    },
    beforeSend: function () {
      $("#spinner").show();
    },
    success: function (result) {
      //console.log("Weather API Call Result: ", result);

      const weatherData = result.data.forecast.forecastday;

      $("#currentWeatherConditions").html(result.data.current.condition.text);
      $("#weatherIcon").attr("src", weatherData[0].day.condition.icon);
      $("#todayMaxtemp").html(
        Math.round(weatherData[0].day.maxtemp_c) + "&deg;"
      );
      $("#todayMinTemp").html(
        Math.round(weatherData[0].day.mintemp_c) + "&deg;"
      );
      // Forecastday1
      $("#day1Date").html(Date.parse(weatherData[1].date).toString("ddd dS"));
      $("#day1Icon").attr("src", weatherData[1].day.condition.icon);
      $("#day1Maxtemp").html(
        Math.round(weatherData[1].day.maxtemp_c) + "&deg;"
      );
      $("#day1Mintemp").html(
        Math.round(weatherData[1].day.mintemp_c) + "&deg;"
      );
      // Forecastday2
      $("#day2Date").html(Date.parse(weatherData[2].date).toString("ddd dS"));
      $("#day2Icon").attr("src", weatherData[2].day.condition.icon);
      $("#day2Maxtemp").html(
        Math.round(weatherData[2].day.maxtemp_c) + "&deg;"
      );
      $("#day2Mintemp").html(
        Math.round(weatherData[2].day.mintemp_c) + "&deg;"
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
      console.error("Failed to fetch currency information");
      console.log(result.status.code);
      console.log(result);
      alert(
        "Failed to get the currency data from the api - Error Code: " +
          result.status.code
      );
    },
    complete: function () {
      $("#spinner").hide();
    },
  });
}

// Currency API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-solid fa-coins fa-lg" style="color: #000;"></i>',
  () => {
    try {
      $.ajax({
        url: `${urlPath}/php/currencyAPI.php`,
        method: "GET",
        dataType: "json",
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          exchangeRatesList = result.data.exchangeRates;
          // console.log("This is the currency api result: ", result);
          // console.log(
          //   "This is the exchangeRatesList result: ",
          //   exchangeRatesList
          // );
          currencyExchangeRate = exchangeRatesList[currentCurrencyDetails[0]];

          $("#currencyName").html(currentCurrencyDetails[1].name);
          // $("#currencySymbol").html(currentCurrencyDetails[1].symbol);

          let selectElement = $("#exchangeRate");
          selectElement.empty();
          for (let currencyCode in exchangeRatesList) {
            if (exchangeRatesList.hasOwnProperty(currencyCode)) {
              let exchangeRate = exchangeRatesList[currencyCode];
              let currentCurrencyWithName = currencyList.find(
                (o) => o[0] == currencyCode
              );

              if (!currentCurrencyWithName) continue;

              let currencyName = `${currencyCode} - ${currentCurrencyWithName[1].name}`;

              let option = $("<option></option>")
                .attr("value", exchangeRate)
                .text(currencyName);
              selectElement.append(option);
            }
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
          console.error("Failed to fetch currency information");
          console.log(result.status.code);
          console.log(result);
          alert(
            "Failed to get the currency data from the api - Error Code: " +
              result.status.code
          );
        },
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert(
        "An Error has occured when trying to fetch the currency information!"
      );
      $("#spinner").hide();
    }
  }
).addTo(map);

function calcResult() {
  $("#toAmount").val(
    numeral($("#fromAmount").val() * $("#exchangeRate").val()).format("0,0.00")
  );
}
$("#fromAmount").on("keyup", function () {
  calcResult();
});

$("#fromAmount").on("change", function () {
  calcResult();
});

$("#exchangeRate").on("change", function () {
  calcResult();
});

$("#currencyModal").on("show.bs.modal", function () {
  calcResult();
});

// Wikipedia API call ----------------------------------------------------------------------------------------------------------------------------------------------
L.easyButton(
  '<i class="fa-brands fa-wikipedia-w fa-lg" style="color: #000;"></i>',
  () => {
    if (!currentCountryIso || !currentCapital) {
      alert("No country ISO or capital has been set.");
    }
    try {
      // console.log("currentCountryIso", currentCountryIso);
      // console.log("currentCapital", currentCapital);
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
          // console.log("Wiki api call result: ", result);

          if (result.status.code === "200" && result.data) {
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
          } else {
            console.log(result.status.code);
            alert(
              "Couldn't get Wikipedia information from the API, Error Code: " +
                result.status.code
            );
          }
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

//Bank Holidays EasyButton Modal
L.easyButton(
  '<i class="fa-solid fa-calendar fa-lg" style="color: #000" ></i>',
  () => {
    try {
      $.ajax({
        url: `${urlPath}/php/bankHolidays.php`,
        method: "GET",
        dataType: "json",
        data: {
          country: currentCountryIso,
        },
        beforeSend: function () {
          $("#spinner").show();
        },
        success: function (result) {
          console.log("Bank Holiday Modal Information", result);
          const bankHolidayData = result.data;
          $("#holidays-tbody").html("");

          for (let i = 0; i < bankHolidayData.length; i++) {
            const holiday = bankHolidayData[i];
            const formattedDate = new Date(holiday.date).toString(
              "ddd dS MMM yyyy"
            );

            $("#holidays-tbody").append(
              `<tr class="text-left mb-2">
              <td>${formattedDate}</td>
              <td>${holiday.name}</td>
              </tr>`
            );
          }

          // Set the modal content after the loop has finished
          $("#bankHolidayModal").modal("show");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(
            "Couldn't get Modal information: ",
            jqXHR,
            textStatus,
            errorThrown
          );
          console.log(result);
          console.log(result.status.code);
          alert(
            "Couldn't get Bank Holiday information from the API, Error Code: " +
              result.status.code
          );
        },
        complete: function () {
          $("#spinner").hide();
        },
      });
    } catch {
      alert(
        "An Error has occured when trying to fetch bank holiday information!"
      );
      $("#spinner").hide();
    }
  }
).addTo(map);

const timeElement = document.getElementById("currentTime");

function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Format the string with leading zeroes
  const clockStr = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  timeElement.innerText = clockStr;
}

updateTime();
setInterval(updateTime, 1000);
