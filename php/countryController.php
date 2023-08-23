<?php

// need to load the file
// if no get request we return all country names + iso 
// if $_GET['iso'] then we return all border points for that country after searching through file data.

class CountryController
{
    private array $data;

    function __construct()
    {
        $this->data = $this->fetchFileData();

        if (!empty($_GET['iso'])) {
            $returnData = $this->fetchCountryBorderOnIso($_GET['iso']);
        } else {
            $returnData = $this->fetchAllCountryCodes();
        }
        $this->returnData($returnData);
    }

    private function fetchFileData()
    {
        $data = file_get_contents('../data/countryBorders.geo.json');
        $jsonData = json_decode($data, true);
        return json_decode($data, true);
    }

    private function fetchCountryBorderOnIso($isoCode)
    {
        $isoCode = $_GET['iso']; // Get the ISO code from the query parameter
        $jsonData = $this->data;

        foreach ($jsonData['features'] as $feature) {
            if ($feature['properties']['iso_a2'] === $isoCode) {
                $border = $feature['geometry'];
                echo json_encode($border);
                break;
            }
        }
        return null; // Return Null if no matching ISO code is found
    }

    private function fetchAllCountryCodes()
    {
        $outputData = array();

        foreach ($this->data['features'] as $feature) {
            $countryName = $feature['properties']['name'];
            $isoCode = $feature['properties']['iso_a2'];
            $outputData[] = array('countryName' => $countryName, 'iso_a2' => $isoCode);
        }
        return $outputData; // Return the list of country codes
    }

    private function returnData($data)
    {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['data'] = $data;

        header('Content-Type: application/json; charset=UTF-8');
        header("Access-Control-Allow-Origin: *");

        echo json_encode($output);
    }
}

new CountryController();
