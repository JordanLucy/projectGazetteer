<?php

$executionStartTime = microtime(true);

// $selectedCountryIso = $_REQUEST['iso'];

$url = 'https://restcountries.com/v3.1/all';
/*  $url = 'https://restcountries.com/v3.1/all/  . $selectedCountryIso'; */

$curl = curl_init($url);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $url);

$result = curl_exec($curl);

curl_close($curl);

$restCountries = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $restCountries;

header('Content-Type: application/json; charset=UTF-8');

header("Access-Control-Allow-Origin: *");

echo json_encode($output);
