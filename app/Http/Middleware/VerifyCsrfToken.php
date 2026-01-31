<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        // ✅ كل الـ API routes - مهم جداً
        'api/*',

        // ✅ كل الـ super routes
        'super/*',

        // ✅ Auth routes
        'email/*',
        'student/register',
        'teacher/register',
        'logout',

        // ✅ Pending students
        'pending-students/*',
    ];
}