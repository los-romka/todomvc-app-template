<?php

namespace App\Controller;

use App\Component\HttpFoundation\AController;
use App\Component\HttpFoundation\JsonResponse;
use App\Component\HttpFoundation\Request;

class TodoController extends AController {
    public function indexAction(Request $request) {

    }

    public function findAllAction(Request $request) {
        $entities = $this->getEntityManager()->getRepository('Todo')->findAll();

        $scalar = array_map(function($element) {$element->asArray();}, $entities);

        return new JsonResponse($scalar);
//        $em = $this->getEntityManager()->getRepository('Todo')->findBy(array('createdBy' => 1));
    }
    public function createAction(Request $request) {

    }
    public function changTitleAction(Request $request) {

    }
    public function changeCompletenessAction(Request $request) {

    }
    public function destroyAction(Request $request) {
//        $em = $this->getEntityManager()->getRepository('Todo');
    }
}