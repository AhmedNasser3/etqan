<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ImpersonateCenter
{
    public function handle(Request $request, Closure $next)
    {
        if (session()->has('impersonated_center_id') && auth()->check()) {
            $centerId = session('impersonated_center_id');
            auth()->user()->forceFill(['center_id' => $centerId]);
        }

        return $next($request);
    }
}
