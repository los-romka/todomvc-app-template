<?php
use Doctrine\ORM\Tools\Console\ConsoleRunner;

require_once __DIR__."/app/bootstrap.php";

$kernel = new AppKernel(true);

return ConsoleRunner::createHelperSet($kernel->getEntityManager());