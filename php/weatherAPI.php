<?php

$executionStartTime = microtime(true);

$countryLatitude = $_REQUEST['lat'];
$countryLongitude = $_REQUEST['lon'];

$url = 'https://api.openweathermap.org/data/2.5/onecall?lat=44.34&lon=10.99&exclude=minutely,alerts&units=metric&appid=78c766e3970675bb23047dc7723a57da';
$ch = curl_init($url);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$weather = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data']['weather'] = $weather;

header('Content-Type: application/json; charset=UTF-8');

header("Access-Control-Allow-Origin: *");

echo json_encode($output);
