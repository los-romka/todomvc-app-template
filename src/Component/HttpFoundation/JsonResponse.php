<?php

namespace App\Component\HttpFoundation;

use App\Component\Interfaces\IArrayable;
use \HttpResponse as HttpResponse;

class JsonResponse extends \HttpResponse {
    public function __construct($data, $status = 200) {
        $this->setContentType('application/json');

        if ($data instanceof IArrayable) {
            $this->setData(json_encode($data->asArray()));
        } else {
            $this->setData(json_encode($data));
        }
    }
}