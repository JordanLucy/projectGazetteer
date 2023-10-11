<?php

$executionStartTime = microtime(true);

$usernameKey = "flightltd&style=full";
$countryCode = $_REQUEST['country'];

$cityUrl = "http://api.geonames.org/searchJSON?country=$countryCode&cities=cities15000&username=$usernameKey";
$airportUrl = "http://api.geonames.org/searchJSON?q=airport&country=$countryCode&username=$usernameKey";

$curlCity = curl_init($cityUrl);
$curlAirport = curl_init($airportUrl);

curl_setopt($curlCity, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curlCity, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curlCity, CURLOPT_URL, $cityUrl);

curl_setopt($curlAirport, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curlAirport, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curlAirport, CURLOPT_URL, $airportUrl);

$resultCity = curl_exec($curlCity);
$resultAiport = curl_exec($curlAirport);

curl_close($curlCity);
curl_close($curlAirport);

$cityData = json_decode($resultCity, true);
$airportData = json_decode($resultAiport, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = ['cities' => $cityData, 'airports' => $airportData];

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);
