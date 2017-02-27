<?php

namespace App\Component\HttpFoundation;

use \HttpResponse as ResponseBase;

class Response extends ResponseBase {
    public function __construct($data, $status = 200) {
        $this->setContentType('text/html');
        $this->setData($data);
    }
}