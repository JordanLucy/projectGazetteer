<?php

    $executionStartTime = microtime(true);

    $result = file_get_contents('../data/countryBorders.geo.json');

    $border      = json_decode($result,true);
    $countryInfo = json_decode($result,true);

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $output['data']['border'] = $border;
    $output['data']['countryInfo'] = $countryInfo;
    
    header('Content-Type: application/json; charset=URF-8');

    echo json_encode($output);
?>