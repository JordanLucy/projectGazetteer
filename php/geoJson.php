<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'httpHelper.php';

class GeoJson extends httpHelper
{

    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        try {
            $executionStartTime = microtime(true);

            $result = file_get_contents('../data/countryBorders.geo.json');

            $data = json_decode($result['response'], true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Error("none valid json returned");
            }

            echo $this->generateResponse([
                'responseCode' => 200,
                'data'         => $data['features'],
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

new GeoJson();
