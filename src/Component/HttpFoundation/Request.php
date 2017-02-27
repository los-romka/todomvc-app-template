<?php

namespace App\Component\HttpFoundation;

use App\Component\Interfaces\IRequest;

class Request implements IRequest {
    protected $request;
    protected $query;

    public function __construct(mixed $GET, mixed $POST) {
        $this->request = new ParameterBag($POST);
        $this->query = new ParameterBag($GET);
    }

    /**
     * @param $key
     * @param null $default
     *
     * @return mixed
     *
     * @throws \Exception
     */
    public function get($key, $default = null) {
        return $this->request->get($key, $default);
    }

    /**
     * @return ParameterBag
     */
    public function getQuery() {
        return $this->query;
    }

    /**
     * @return ParameterBag
     */
    public function getRequest() {
        return $this->request;
    }

    /**
     * @return Request
     */
    public static function createFromGlobals() {
        return new Request(
            $_GET,
            $_POST
        );
    }
}