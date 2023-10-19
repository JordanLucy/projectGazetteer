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



// if ($result === false) {
//     $error = curl_error($curl);
//     $output['status']['code'] = "500";
//     $output['status']['name'] = "error";
//     $output['status']['description'] = "cURL Error: " . $error;
// } elseif (curl_getinfo($curl, CURLINFO_HTTP_CODE) == 200) {
//     $countryModalInfo = json_decode($result, true);
//     $output['status']['code'] = "200";
//     $output['status']['name'] = "ok";
//     $output['status']['description'] = "success";
//     $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
//     $output['data'] = $countryModalInfo;
// } else {
//     $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
//     $output['status']['code'] = $httpCode;
//     $output['status']['name'] = "error";
//     $output['status']['description'] = "API Error: HTTP Status $httpCode";
// }

// curl_close($curl);

// header('Content-Type: application/json; charset=UTF-8');
// header("Access-Control-Allow-Origin: *");

// echo json_encode($output);
