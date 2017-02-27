<?php

namespace App\Component\HttpFoundation;
use App\Component\Exception\InvalidArgumentException;

/**
 * Class SimpleContainer
 *
 * @package App\HttpFoundation
 */
class SimpleContainer {
    private $container = array();

    /**
     * @param array $array
     */
    public function __construct(array $array = array()) {
        $this->container = $array;
    }

    /**
     * @param string $key
     * @param mixed|null $default
     *
     * @return mixed
     *
     * @throws \Exception
     */
    public function get($key, $default = null) {
        if (!is_string($key)) {
            throw new InvalidArgumentException();
        }

        return isset($this->container[$key]) ? $this->container[$key] : $default;
    }

    /**
     * @param $key
     * @param $value
     *
     * @return SimpleContainer
     *
     * @throws \Exception
     */
    public function set($key, $value) {
        if (!is_string($key)) {
            throw new InvalidArgumentException();
        }

        $this->container[$key] = $value;

        return $this;
    }

    /**
     * @param $key
     *
     * @return bool
     *
     * @throws \Exception
     */
    public function has($key) {
        if (!is_string($key)) {
            throw new InvalidArgumentException();
        }

        return isset($this->container[$key]);
    }
}