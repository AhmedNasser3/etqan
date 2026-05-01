<?php

use App\Http\Middleware\ImpersonateCenter;
use App\Http\Middleware\LoadAdminRelation;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
->withMiddleware(function (Middleware $middleware) {

    // ✅ أضف student/register وباقي الـ routes
    $middleware->validateCsrfTokens(except: [
        'api/*',
        'student/register',
        'teacher/register',
        'email/*',
        'logout',
        'v1/*',
        'super/*',
    ]);

    $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

    $middleware->alias([
        'impersonate' => ImpersonateCenter::class,
    ]);

    $middleware->appendToGroup('api', [
        ImpersonateCenter::class,
        LoadAdminRelation::class,
    ]);

})
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
