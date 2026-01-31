<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckCenterRole
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || Auth::user()->role_id != 1) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        return $next($request);
    }
}
