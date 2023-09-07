<?php

$executionStartTime = microtime(true);

$url = 'https://openexchangerates.org/api/latest.json?app_id=2fe339a2d149470785e7b13471dd50d3';

$curl = curl_init($url);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $url);

$result = curl_exec($curl);

curl_close($curl);

$exchangeRates = json_decode($result, true);

$currentCurrency = isset($_GET['currentCurrency']) ? $_GET['currentCurrency'] : 'USD'; // Default to USD if currentCurrency is not provided

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

if (isset($exchangeRates['rates'][$currentCurrency])) {
    $output['data']['currentRate'] = $exchangeRates['rates'][$currentCurrency];
} else {
    $output['data']['currentRate'] = "Can't find that Currency Rate";
}

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);
