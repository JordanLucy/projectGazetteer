<?php

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");

$isoCode = $_GET['iso']; // Get the ISO code from the query parameter

$data = file_get_contents('../data/countryBorders.geo.json');
$jsonData = json_decode($data, true);

foreach ($jsonData['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $isoCode) {
        $border = $feature['geometry'];
        echo json_encode($border);
        break;
    }
}
?>