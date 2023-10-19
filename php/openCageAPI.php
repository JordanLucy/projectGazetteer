<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'httpHelper.php';

class OpenCageAPI extends httpHelper
{

    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        try {
            $executionStartTime = microtime(true);

            $placeName = $_REQUEST["placeName"];

            $apiKey = "be0aa5008ed74764a77721198258cbbb";

            $url = "https://api.opencagedata.com/geocode/v1/json?q=$placeName&key=$apiKey";

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

new OpenCageAPI();
