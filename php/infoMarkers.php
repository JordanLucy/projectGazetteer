<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'httpHelper.php';

class InfoMarkersAPI extends httpHelper
{

    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        try {

            $executionStartTime = microtime(true);

            $usernameKey = "flightltd&style=full";
            $countryCode = $_REQUEST['country'];

            $cityUrl = "http://api.geonames.org/searchJSON?country=$countryCode&cities=cities15000&username=$usernameKey";
            $airportUrl = "http://api.geonames.org/searchJSON?q=airport&country=$countryCode&username=$usernameKey";

            $cityResult = $this->curlRequest($cityUrl);
            $airportResult = $this->curlRequest($airportUrl);

            $cityData = json_decode($cityResult['response'], true);
            $airportData = json_decode($airportResult['response'], true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Error("none valid json returned");
            }

            echo $this->generateResponse([
                'responseCode' => $cityResult['code'],
                'data'         => ['cities' => $cityData, 'airports' => $airportData],
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

new InfoMarkersAPI();
