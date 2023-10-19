<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'httpHelper.php';

class CountryBorderInformation extends httpHelper
{

    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        $executionStartTime = microtime(true);
        try {
            $isoCode = $_GET['iso']; // Get the ISO code from the query parameter

            $jsonData = json_decode(file_get_contents('../data/countryBorders.geo.json'), true);

            $borderData = [];

            foreach ($jsonData['features'] as $feature) {
                if ($feature['properties']['iso_a2'] === $isoCode) {
                    $feature['iso_a3'] = $feature['properties']['iso_a3'];
                    $borderData = $feature;
                    break;
                }
            }

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Error("none valid json returned");
            }

            echo $this->generateResponse([
                'responseCode' => 200,
                'data'         => $borderData,
                'message'      => 'Success',
            ], $executionStartTime);
        } catch (Exception $e) {
            echo $this->generateResponse([
                'responseCode' => 500,
                'data'         => null,
                'message'      => $e->getMessage(),
            ], $executionStartTime);
        }
    }
}

new CountryBorderInformation();
