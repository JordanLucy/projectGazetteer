<?php

$executionStartTime = microtime(true);

$selectedCountryIso = $_REQUEST['iso'];

$url = 'https://restcountries.com/v3.1/alpha/' . $selectedCountryIso;

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$restCountries = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

header("Access-Control-Allow-Origin: *");

echo json_encode($output);
