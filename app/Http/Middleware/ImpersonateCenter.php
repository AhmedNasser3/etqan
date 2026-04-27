<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ImpersonateCenter
{
public function handle(Request $request, Closure $next)
{
    $centerId = $request->header('X-Center-Id')
             ?? $request->query('_cid');

    \Log::info('🔍 Middleware', [
        'header'    => $centerId,
        'user_cid'  => auth()->user()?->center_id,
    ]);

    if ($centerId && is_numeric($centerId) && auth()->check()) {
        auth()->user()->center_id = (int) $centerId;
        \Log::info('✅ center_id overridden to: ' . $centerId);
    }

    return $next($request);
}
}