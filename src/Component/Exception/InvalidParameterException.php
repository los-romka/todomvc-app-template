<?php

namespace App\Component\Exception;

class InvalidArgumentException extends \Exception {
    protected $message = "Invalid parameter!";
}