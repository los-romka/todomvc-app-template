<?php

namespace App;

use App\Component\HttpFoundation\Response;
use App\Component\HttpFoundation\Route;
use App\Component\HttpFoundation\SimpleContainer;
use App\Component\Interfaces\IRequest;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Tools as ORMTools;

class Kernel {
    private $isDevMode;
    private $srcPath;
    private $controllersNamespace;

    /** @var EntityManager $em  */
    private $em;

    /** @var SimpleContainer $em  */
    private $controllers;

    /** @var SimpleContainer $em  */
    private $routes;

    /**
     * @param string $env
     *
     * @throws \Exception
     */
    public function __construct($env) {
        $this->isDevMode = $env === 'dev';
        $this->srcPath =  __DIR__."/../src/";
        $this->controllersNamespace = __NAMESPACE__.'\\Controller';

        $this->routes = new SimpleContainer();
        $this->controllers = new SimpleContainer();

        $this->registerServices();
        $this->registerRoutes();
    }

    protected function registerRoutes() {
        if (!($json = file_get_contents(__DIR__."/routing.json"))) {
            throw new \Exception("routing.json not found!");
        }

        if (!is_array($routes = json_decode($json, true))) {
            throw new \Exception("routing.json should be json!");
        }

        foreach( $routes as $key => $value ) {
            $parts = explode(':', $value);
            $ctrlName = $parts[0];
            $action = $parts[1];

            if (!$this->controllers->has($ctrlName)) {
                $constructor = sprintf("%s\\%sController", $this->controllersNamespace, $ctrlName);
                $this->controllers->set($ctrlName, new $constructor($this->em));
            }

            $controller = $this->controllers->get($ctrlName);
            $route = new Route($controller, $action);

            $this->routes->set($key, $route);
        }
    }

    protected function registerServices() {
        /* register Doctrine2 EntityManager */
        if (!($json = file_get_contents(__DIR__."/parameters.json"))) {
            throw new \Exception("parameters.json not found!");
        }

        if (!is_array($params = json_decode($json, true))) {
            throw new \Exception("parameters.json should be json!");
        }

        $modelPaths = array(sprintf("%s/Model", $this->srcPath));
        $config = ORMTools\Setup::createAnnotationMetadataConfiguration($modelPaths, $this->isDevMode, null, null, false);

        $this->em = EntityManager::create($params, $config);
    }

    /**
     * @param IRequest $request
     *
     * @return Response
     *
     * @throws Component\Exception\InvalidArgumentException
     * @throws \Exception
     */
    public function handleRequest(IRequest $request) {
        $action = $request->getQuery()->get('action', 'home');

        if (!$this->routes->has($action)) {
            throw new \Exception("Routing error!");
        }

        /** @var Route $route */
        $route = $this->routes->get($action);

        return $route->execute($request);;
    }

    /**
     * @return EntityManager
     */
    public function getEntityManager() {
        return $this->em;
    }
}