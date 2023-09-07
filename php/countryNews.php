<?php

$executionStartTime = microtime(true);

$url = "https://newsapi.org/v2/top-headlines?country=gb&pageSize=11&apiKey=0306d407a42548e393fd5d2a6e7fcdf3";

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
