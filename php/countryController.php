<?php

// if no get request we return all country names + iso 
// if $_GET['iso'] then we return all border points for that country after searching through file data.

require 'httpHelper.php';

class CountryController extends httpHelper
{

    private array $data;

    function __construct()
    {
        $executionStartTime = microtime(true);
        try {
            $this->data = $this->fetchFileData();

            if (!empty($_GET['iso'])) {
                $returnData = $this->fetchCountryBorderOnIso($_GET['iso']);
            } else {
                $returnData = $this->fetchAllCountryCodes();
            }
            echo $this->generateResponse(['responseCode' => 200, 'data' => $returnData], $executionStartTime);
        } catch (Exception $e) {
            echo $this->generateResponse([
                'responseCode' => 500,
                'data'         => null,
                'message'      => $e->getMessage(),
            ], $executionStartTime);
        }
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
            $isoCode3 = $feature['properties']['iso_a3'];
            $outputData[] = array('countryName' => $countryName, 'iso_a2' => $isoCode, 'iso_a3' => $isoCode3);
        }
        return $outputData; // Return the list of country codes
    }
}

new CountryController();
