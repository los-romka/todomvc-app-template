<?php

require_once __DIR__."/../vendor/autoload.php";
require_once __DIR__.'/Kernel.php';

require_once __DIR__.'/../src/Component/Exception/InvalidParameterException.php';
require_once __DIR__.'/../src/Component/HttpFoundation/AController.php';
require_once __DIR__.'/../src/Component/HttpFoundation/JsonResponse.php';
require_once __DIR__.'/../src/Component/HttpFoundation/ParameterBag.php';
require_once __DIR__.'/../src/Component/HttpFoundation/Request.php';
require_once __DIR__.'/../src/Component/HttpFoundation/Response.php';
require_once __DIR__.'/../src/Component/HttpFoundation/Route.php';
require_once __DIR__.'/../src/Component/HttpFoundation/SimpleContainer.php';
require_once __DIR__.'/../src/Component/Interfaces/IArrayable.php';
require_once __DIR__.'/../src/Component/Interfaces/IRequest.php';
require_once __DIR__.'/../src/Component/Interfaces/IRoute.php';
require_once __DIR__.'/../src/Controller/TodoController.php';
require_once __DIR__.'/../src/Controller/UserController.php';
require_once __DIR__.'/../src/Model/Todo.php';
require_once __DIR__.'/../src/Model/User.php';