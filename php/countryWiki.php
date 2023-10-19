<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'httpHelper.php';

class WikiAPI extends httpHelper
{
    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        try {

            $executionStartTime = microtime(true);

            $countryCapital = $_REQUEST['countryCapital'];

            $countryCode = $_REQUEST['country'];

            $url = "http://api.geonames.org/wikipediaSearchJSON?q=$countryCapital&countryCode=$countryCode&maxRows=10&username=flightltd&style=full";

            $result = $this->curlRequest($url);

            $data = json_decode($result['response'], true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Error("none valid json returned");
            }

            echo $this->generateResponse([
                'responseCode' => $result['code'],
                'data'         => $data,
                'message'      => '',
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

new WikiAPI();


// $countryWikiInfo = json_decode($result, true);

// $output['status']['code'] = "200";
// $output['status']['name'] = "ok";
// $output['status']['description'] = "success";
// $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
// $output['data'] = $countryWikiInfo;

// header('Content-Type: application/json; charset=UTF-8');
// header("Access-Control-Allow-Origin: *");

// echo json_encode($output);
