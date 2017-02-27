<?php

namespace App\Component\Interfaces;

use App\Component\HttpFoundation\AController;
use App\Component\HttpFoundation\Response;

interface IRoute {
    /**
     * @param AController $controller
     * @param string $action
     */
    public function __construct(AController $controller, $action);

    /**
     * @param IRequest $request
     *
     * @return Response
     */
    public function execute(IRequest $request = null);
}