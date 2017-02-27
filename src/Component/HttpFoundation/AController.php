<?php

namespace App\Component\HttpFoundation;

use Doctrine\ORM\EntityManager;

abstract class AController {
    /**
     * @var EntityManager $em
     */
    private $em;

    /**
     * @param EntityManager $em
     */
    private final function __construct(EntityManager $em) {
        $this->em = $em;
    }

    /**
     * @return EntityManager
     */
    protected final function getEntityManager() {
        return $this->em;
    }
}