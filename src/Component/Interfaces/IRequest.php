<?php

namespace App\Component\Interfaces;

use App\Component\HttpFoundation\ParameterBag;

/**
 * Interface IRequest
 *
 * @package App\Interfaces
 */
interface IRequest {
    /**
     * @param $key
     * @param null $default
     *
     * @return mixed
     */
    public function get($key, $default = null);

    /**
     * @return ParameterBag
     */
    public function getQuery();

    /**
     * @return ParameterBag
     */
    public function getRequest();
}