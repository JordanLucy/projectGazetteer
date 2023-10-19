<?php

$executionStartTime = microtime(true);

$countryCode = $_REQUEST['country'];
$currentYear = date('Y');

$url = "https://date.nager.at/api/v3/publicholidays/$currentYear/$countryCode";
$curl = curl_init($url);

curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_URL, $url);

$result = curl_exec($curl);

if ($result === false) {
    $error = curl_error($curl);
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "cURL Error: " . $error;
} elseif (curl_getinfo($curl, CURLINFO_HTTP_CODE) == 200) {
    $countryModalInfo = json_decode($result, true);
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $countryModalInfo;
} else {
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $output['status']['code'] = $httpCode;
    $output['status']['name'] = "error";
    $output['status']['description'] = "API Error: HTTP Status $httpCode";
}

curl_close($curl);

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

echo json_encode($output);
