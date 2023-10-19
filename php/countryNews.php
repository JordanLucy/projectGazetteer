<?php

error_reporting(E_ALL);
ini_set('display_errors#', 1);

require 'httpHelper.php';

class NewsAPI extends httpHelper
{
    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        try {
            $executionStartTime = microtime(true);

            $countryNews = strtolower($_REQUEST['country']);

            $apikey = "c5649483f58911253e679c7798c466f4";

            $url = "https://gnews.io/api/v4/top-headlines?category=general&country=$countryNews&lang=en&apikey=$apikey";

            $result = $this->curlRequest($url);

            $data = json_decode($result['response'], true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Error("none valid json returned");
            }

            echo $this->generateResponse([
                'responseCode' => $result['code'],
                'data'         => $data,
                'message'     => '',
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

new NewsAPI();
