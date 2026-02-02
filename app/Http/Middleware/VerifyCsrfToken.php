<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        // ✅ كل الـ v1 routes (مهم جداً)
        'v1/*',

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