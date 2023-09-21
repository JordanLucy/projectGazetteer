<?php

$executionStartTime = microtime(true);

$usernameKey = "AIzaSyDfW8evZLS97j5MTBFII7Ves0AfN_n_dFI";
$capitalLat = $_REQUEST['latitude'];
$capitalLng = $_REQUEST['longitude'];

$url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=$capitalLat%2C$capitalLng&radius=50000&key=$usernameKey";

$curl = curl_init($url);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $url);

$result = curl_exec($curl);

curl_close($curl);

$informationMarkers = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $informationMarkers;

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);
