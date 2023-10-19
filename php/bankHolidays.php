<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'httpHelper.php';

class BankHolidayAPI extends httpHelper
{

    public function __construct()
    {
        $this->respond();
    }

    private function respond()
    {
        try {
            $executionStartTime = microtime(true);

            $countryCode = $_REQUEST['country'];

            $currentYear = date('Y');

            $url = "https://date.nager.at/api/v3/publicholidays/$currentYear/$countryCode";

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

new BankHolidayAPI();
