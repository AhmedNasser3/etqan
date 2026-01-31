<?php
// app/Http/Middleware/CustomRouteResolver.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Routes\RouteCustomization;

class CustomRouteResolver
{
    public function handle(Request $request, Closure $next)
    {
        $centerSlug = $request->segment(1); // gomaa من gomaa/teacher-register

        if ($centerSlug) {
            $customization = RouteCustomization::where('center_subdomain', $centerSlug)
                                             ->where('is_active', true)
                                             ->first();

            if ($customization) {
                // ضيف الـ custom paths للـ request
                $request->merge([
                    'custom_routes' => [
                        'teacher_register' => $customization->teacher_register_path,
                        'student_register' => $customization->student_register_path,
                        'center_register' => $customization->center_register_path,
                    ]
                ]);
            }
        }

        return $next($request);
    }
}