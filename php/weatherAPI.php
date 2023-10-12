<?php

$executionStartTime = microtime(true);
$latitude = $_REQUEST['lat'];
$longitude = $_REQUEST['lon'];
$key = "8adf76c6cca645df8dd120855231210";

$url = "https://api.weatherapi.com/v1/forecast.json?q=$latitude,$longitude&days=3&key=$key";

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

if ($result === false) {
    $error = curl_error($ch);
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "cURL Error: " . $error;
} elseif (curl_getinfo($ch, CURLINFO_HTTP_CODE) == 200) {
    $weather = json_decode($result, true);
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $weather;
} else {
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $output['status']['code'] = $httpCode;
    $output['status']['name'] = "error";
    $output['status']['description'] = "API Error: HTTP Status $httpCode";
}

curl_close($ch);

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);
