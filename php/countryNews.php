<?php

$executionStartTime = microtime(true);

$countryNews = strtolower($_REQUEST['country']);

$apikey = "c5649483f58911253e679c7798c466f4";

$url = "https://gnews.io/api/v4/top-headlines?category=general&country=$countryNews&lang=en&apikey=$apikey";

$curl = curl_init($url);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $url);

//Set the User-Agent Header
curl_setopt($curl, CURLOPT_USERAGENT, 'projectGazetteer/1.0');

$result = curl_exec($curl);

curl_close($curl);

$newsResults = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $newsResults;


header('Content-Type: application/json; charset=UTF-8');

header("Access-Control-Allow-Origin: *");

echo json_encode($output);
