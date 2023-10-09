<?php

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

$isoCode = $_GET['iso']; // Get the ISO code from the query parameter

$jsonData = json_decode(file_get_contents('../data/countryBorders.geo.json'), true);

foreach ($jsonData['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $isoCode) {
        $feature['iso_a3'] = $feature['properties']['iso_a3'];
        echo json_encode($feature);
        break;
    }
}
