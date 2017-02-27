<?php

namespace App\Component\HttpFoundation;

use App\Component\Interfaces\IRequest;
use App\Component\Interfaces\IRoute;
use InvalidArgumentException;

class Route implements IRoute {
    private $controller;
    private $method;

    /**
     * @param AController $controller
     * @param string $action
     */
    public function __construct(AController $controller, $action) {
        $this->controller = $controller;

        if (!is_string($action)) {
            throw new InvalidArgumentException();
        }

        $methodAction = sprintf('%sAction', ucwords( $action ));

        if (!method_exists($this->controller, $methodAction)) {
            throw new InvalidArgumentException();
        }

        $this->method = $methodAction;
    }

    /**
     * @param IRequest $request
     *
     * @return mixed
     */
    public function execute(IRequest $request = null)
    {
        $methodAction = $this->method;
        return $this->controller->$methodAction($request);
    }
}