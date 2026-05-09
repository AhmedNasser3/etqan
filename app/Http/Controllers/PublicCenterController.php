<?php

namespace App\Http\Controllers;

use App\Models\Tenant\Center;
use Illuminate\Http\JsonResponse;

class PublicCenterController extends Controller
{
    public function index(): JsonResponse
    {
        $centers = Center::where('is_active', true)
            ->select('id', 'name', 'subdomain', 'logo')
            ->orderBy('name')
            ->get()
            ->map(fn($c) => [
                'id'        => $c->id,
                'name'      => $c->name,
                'subdomain' => $c->subdomain,
                'logo'      => $c->logo ? asset('storage/' . $c->logo) : null,
            ]);

        return response()->json(['data' => $centers]);
    }
}