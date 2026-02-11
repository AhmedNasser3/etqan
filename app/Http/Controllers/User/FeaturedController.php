<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Center;
use Illuminate\Http\Request;

class FeaturedController extends Controller
{
    public function show(Request $request)
    {
        $subdomain = $request->query('slug');

        if (!$subdomain) {
            return response()->json(['error' => 'الـ slug مطلوب'], 400);
        }

        $center = Center::where('subdomain', $subdomain)->first();

        if (!$center) {
            return response()->json(['error' => 'المجمع غير موجود'], 404);
        }

        return response()->json([
            'center' => [
                'id' => $center->id,
                'name' => $center->name,
            ]
        ]);
    }
}