<?php

namespace App\Http\Controllers\Center;

use App\Models\Center\IdeaDomainRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class IdeaDomainRequestController extends Controller
{
    /**
     * Display user's center domain requests
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $centerId = $user->center_id ?? $user->center?->id;
        if (!$centerId) {
            return response()->json(['message' => 'لا يوجد مركز مرتبط بحسابك'], 403);
        }

        $requests = IdeaDomainRequest::where('center_id', $centerId)->latest()->get();
        return response()->json($requests);
    }

    /**
     * Store new domain request for center
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $centerId = $user->center_id ?? $user->center?->id;
        if (!$centerId) {
            return response()->json(['message' => 'لا يوجد مركز مرتبط بحسابك'], 403);
        }

        // Prevent duplicate requests
        if (IdeaDomainRequest::where('center_id', $centerId)->exists()) {
            return response()->json(['message' => 'يوجد طلب سابق لهذا المركز'], 422);
        }

        $validated = $request->validate([
            'hosting_name' => 'required|string|max:255',
            'requested_domain' => 'required|string|max:255',
            'dns1' => 'required|string|max:255',
            'dns2' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['center_id'] = $centerId;
        $domainRequest = IdeaDomainRequest::create($validated);

        return response()->json($domainRequest, 201);
    }

    /**
     * Show specific domain request
     */
    public function show(IdeaDomainRequest $ideaDomainRequest)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $centerId = $user->center_id ?? $user->center?->id;
        if ($ideaDomainRequest->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        return response()->json($ideaDomainRequest);
    }

    /**
     * Update domain request - WORKS WITH FORMDATA + _method=PUT
     */
    public function update(Request $request, IdeaDomainRequest $ideaDomainRequest)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $centerId = $user->center_id ?? $user->center?->id;
        if ($ideaDomainRequest->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        // Extract form data fields
        $updateData = $request->only([
            'hosting_name',
            'requested_domain',
            'dns1',
            'dns2',
            'notes'
        ]);

        // Filter out empty values
        $updateData = array_filter($updateData, function($value) {
            return filled($value);
        });

        // Check if there's data to update
        if (empty($updateData)) {
            return response()->json(['message' => 'لا توجد بيانات للتحديث'], 422);
        }

        // Update and refresh model
        $ideaDomainRequest->update($updateData);
        $ideaDomainRequest->refresh();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث طلب الدومين بنجاح!',
            'data' => $ideaDomainRequest
        ]);
    }

    /**
     * Delete domain request
     */
    public function destroy(IdeaDomainRequest $ideaDomainRequest)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'غير مسجل الدخول'], 401);
        }

        $centerId = $user->center_id ?? $user->center?->id;
        if ($ideaDomainRequest->center_id != $centerId) {
            return response()->json(['message' => 'غير مصرح لك'], 403);
        }

        $ideaDomainRequest->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }
}