<?php

class httpHelper
{

    public function curlRequest(string $url)
    {

        $curl = curl_init($url);

        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_URL, $url);

        curl_setopt($curl, CURLOPT_USERAGENT, 'projectGazetteer/1.0');

        $result = curl_exec($curl);

        curl_close($curl);

        return ['code' => curl_getinfo($curl, CURLINFO_HTTP_CODE), 'response' => $result ?? null];
    }

    public function generateResponse(array $curlResultData, string $executionStartTime): string
    {
        header('Content-Type: application/json; charset=UTF-8');
        header("Access-Control-Allow-Origin: *");
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['status']['code'] = $curlResultData['responseCode'];
        switch ($curlResultData['responseCode']) {
            case 200:
                $output['status']['name'] = "ok";
                $output['status']['description'] = "success";
                $output['data'] = $curlResultData['data'];
                return json_encode($output);
                break;
            case 401:
                $output['status']['name'] = "unauthorised";
                $output['status']['description'] = "Unauthed request to api.";
                $output['status']['data'] = $curlResultData['data'] ?? null;
                return json_encode($output);
                break;
            case 404:
                $output['status']['name'] = "not found";
                $output['status']['description'] = "Api request made to invalid url.";
                $output['status']['data'] = $curlResultData['data'] ?? null;
                return json_encode($output);
                break;
            case 500:
                $output['status']['name'] = "error";
                $output['status']['description'] = "An error has occurred.";
                $output['status']['errorMessage'] = $curlResultData['message'];
                $output['status']['data'] = $curlResultData['data'] ?? null;
                return json_encode($output);
                break;
            default:
                return json_encode($curlResultData);
                break;
        }
    }
}
