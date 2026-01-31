<?php
// app/Http/Controllers/RouteCustomizationController.php

namespace App\Http\Controllers\Routes;

use Illuminate\Http\Request;
use App\Models\Tenant\Center;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Routes\RouteCustomization;

class RouteCustomizationController extends Controller
{
    public function index()
    {
        $customizations = RouteCustomization::with(['center:id,name,subdomain'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $customizations
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'center_id' => 'required|exists:centers,id',
            'teacher_register_path' => 'required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'student_register_path' => 'required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'center_register_path' => 'required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'is_active' => 'boolean'
        ]);

        RouteCustomization::firstOrCreate(
            ['center_id' => $request->center_id],
            $request->only(['teacher_register_path', 'student_register_path', 'center_register_path', 'is_active'])
        );

        $custom = RouteCustomization::with('center')->where('center_id', $request->center_id)->first();

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ إعدادات المسارات بنجاح',
            'data' => $custom
        ], 201);
    }

    public function show($centerId)
    {
        $paths = RouteCustomization::getPathsForCenter($centerId);

        return response()->json([
            'success' => true,
            'data' => $paths
        ]);
    }

    public function getPathsBySubdomain($subdomain): JsonResponse
    {
        $center = Center::where('subdomain', $subdomain)->first();

        if (!$center) {
            return response()->json([
                'success' => false,
                'message' => 'المجمع غير موجود'
            ], 404);
        }

        $paths = RouteCustomization::where('center_id', $center->id)
            ->where('is_active', true)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $paths ?: null
        ]);
    }

    public function update(Request $request, $centerId)
    {
        $request->validate([
            'teacher_register_path' => 'sometimes|required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'student_register_path' => 'sometimes|required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'center_register_path' => 'sometimes|required|string|max:100|regex:/^[a-z0-9\-]+$/',
            'is_active' => 'boolean'
        ]);

        $custom = RouteCustomization::firstOrCreate(
            ['center_id' => $centerId],
            ['is_active' => true]
        );

        $custom->update($request->only([
            'teacher_register_path',
            'student_register_path',
            'center_register_path',
            'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المسارات بنجاح',
            'data' => $custom->load('center')
        ]);
    }

    public function destroy($centerId)
    {
        RouteCustomization::where('center_id', $centerId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف إعدادات المسارات'
        ]);
    }
}
