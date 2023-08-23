<?php

$executionStartTime = microtime(true);

$url = 'https://openexchangerates.org/api/latest.json?app_id=2fe339a2d149470785e7b13471dd50d3';

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$exchangeRates = json_decode($result, true);

$currentCurrency = $_GET['currentCurrency'];

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

if (isset($exchangeRates['rates'][$currentCurrency])) {
    $output['data']['currentRate'] = $exchangeRates['rates'][$currentCurrency];
} else {
    $output['data']['currentRate'] = "Can't find that Currency Rate";
}

header('Content-Type: application/json; charset=URF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);