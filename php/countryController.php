<?php

// need to load the file
// if no get request we return all country names + iso 
// if $_GET['iso'] then we return all border points for that country after searching through file data.

new CountryController;

class CountryController
{
    private array $data;

    function __construct()
    {
        $this->data = $this->fetchFileData();
        if (!empty($_GET['iso'])) {
            $returnData = $this->fetchCountryBorderOnIso($_GET['iso']);
        }
        $returnData = $this->fetchAllCountryCodes();
        $this->returnData($returnData);
    }

    private function fetchFileData()
    {
        $data = file_get_contents('../data/countryBorders.geo.json');
        return json_decode($data, true);
    }

    private function fetchCountryBorderOnIso($isoCode)
    {
        return $this->data;
    }

    private function fetchAllCountryCodes()
    {
        return $this->data;
    }

    private function returnData($data)
    {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['data'] = $data;
        
        header('Content-Type: application/json; charset=URF-8');

        echo json_encode($output);
    }

}
