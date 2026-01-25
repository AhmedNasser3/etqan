<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant\Center;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $segments = explode('.', $host);
        $subdomain = count($segments) > 2 && $segments[0] !== 'www' ? $segments[0] : null;

        $center = $subdomain
            ? Center::where('subdomain', $subdomain)->first()
            : null;

        if ($subdomain && !$center) {
            abort(404, 'المجمع غير موجود');
        }

        if ($center && !$center->is_active) {
            abort(403, 'المجمع غير مفعّل');
        }

        session(['center_id' => $center?->id]);
        app()->instance('current_center', $center);

        return $next($request);
    }
}