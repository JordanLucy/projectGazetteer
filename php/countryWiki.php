<?php

$executionStartTime = microtime(true);

$countryCapital = $_REQUEST['countryCapital'];
$countryCode = $_REQUEST['country'];

$url = "http://api.geonames.org/wikipediaSearchJSON?q=$countryCapital&countryCode=$countryCode&maxRows=10&username=flightltd&style=full";
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $url);

$result = curl_exec($curl);

curl_close($curl);

$countryWikiInfo = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $countryWikiInfo;

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);
