<?php

    $executionStartTime = microtime(true);

    $url = 'https://api.openweathermap.org/data/2.5/weather?lat=' . $_REQUEST['capitalLat'] . '&lon=' . $_REQUEST['capitalLon'] . '&exclude=minutely,alerts&units=metric&appid=78c766e3970675bb23047dc7723a57da';

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result, true);

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode;

    header('Content-Type: application/json; charset=UTF-8');

    header("Access-Control-Allow-Origin: *");

    echo json_encode($output);

?>