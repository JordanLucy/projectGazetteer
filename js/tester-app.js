
$(document).ready(function () {

})
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


var helloPopup = L.popup().setContent('Hello World!');

L.easyButton('fa fa-globe', function(btn, map){
    helloPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);


// Easy Button Weather API
L.easyButton('<img src="/icons/weather_icon.png">', function(btn, map) {
    $.ajax ({
        url: "/php/getWeather.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: country.lat,
            long: country.long
        },
        success: function(result) {
            if(result.status.name == "ok") {
                $('#tempInfo').html( Math.round(result.data.current.temp) -32 * 5 / 9);
                $('#sunriseInfo').html( result.data.current.sunrise);
                $('#sunsetInfo').html( result.data.current.sunset);
                $('#windspeedInfo').html( result.data.current.wind_speed);
                $('#currentWeatherConditions').html( result.data.current.weather[0].description);
            }
        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
    $('#weatherModal').modal('show');
}).addTo('#map');

// Fetch API for Weather
function currentWeather( cityID ) {
    var key = "78c766e3970675bb23047dc7723a57da";
    fetch('https://api.openweathermap.org/data/2.5/weather?id=' + cityID +  '&appid=' + key)
    .then(function(resp) { return resp.json()}) //convert data to json
    .then(function(data) {
        console.log(data);
    })
    .catch(function() {

    });
}

//Modal Javascript --------------------------------------------------------------------------------- <i class="fas fa-cloud-sun"></i> 

//Countries List ---------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    const selectDropdown = document.getElementById('countryList');

    fetch('https://restcountries.com/v3.1/all').then(res => {
        return res.json();
    }).then(countries => {
        let output = "";

            countries.forEach(country => {
                countries.sort(function (a, b) {
                    if (a.name.common < b.name.common) {
                        return -1;
                    }
                    if (a.name.common  > b.name.common) {
                        return 1;
                      }
                      return 0;
                });
                output += `<option value="${country.name}">${country.name.common}</option>`;
            })
            
        selectDropdown.innerHTML = output;

    }).catch(err => {
        console.log(err);
    })
});

