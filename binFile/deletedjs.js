//Weather easybutton using fetch
L.easyButton("<span>🌤</span>", async function () {
  try {
    const $url = "../php/weatherAPI.php";
    const response = await fetch($url);
    //console.log(response);
    const result = await response.json();

    console.log(result);

    // const celcius = Math.round(parseFloat(result.data.weather.main.temp));
    const sunriseTime = new Date(
      result.data.weather.sys.sunrise * 1000
    ).toLocaleTimeString();
    const sunsetTime = new Date(
      result.data.weather.sys.sunset * 1000
    ).toLocaleTimeString();

    document.getElementById("tempInfo").innerHTML =
      result.data.weather.main.temp + "&deg;";
    document.getElementById("sunriseInfo").innerHTML = sunriseTime;
    document.getElementById("sunsetInfo").innerHTML = sunsetTime;
    document.getElementById("windspeedInfo").innerHTML =
      result.data.weather.wind.speed;
    document.getElementById("currentWeatherConditions").innerHTML =
      result.data.weather.weather[0].description;

    $("#weatherModal").modal("show");
  } catch (error) {
    console.log("Couldn't fetch weather information: ", error);
  }
}).addTo(map);

//Currency easy button js
L.easyButton("<span>$</span>", async function () {
  // const selectedCountryIso = $("#countryList").val();

  // if (selectedCountryIso) {
  try {
    const $url = "http://localhost/projectGazetteer/php/currencyAPI.php";
    const response = await fetch($url);
    const result = await response.json();
    console.log(result);
    const currentRate = result.data.rates;
    // const currencyName = selectedCountryIso;

    document.getElementById("base").innerHTML = result.data.base;
    document.getElementById("currencyName").innerHTML = result.data.rates;
    document.getElementById("currencySymbol").innerHTML = "$";
    document.getElementById("exchangeRate").innerHTML = isNaN(currentRate)
      ? "Exchange Rate Not Found"
      : currentRate.toFixed(2);
    $("#currencyModal").modal("show");
  } catch (error) {
    console.log("Currency Error: ", error);
  }
  // }
}).addTo(map);
