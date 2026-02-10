<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student\SpecialRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class SpecialRequestController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = SpecialRequest::latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'total' => $requests->total(),
                'per_page' => $requests->perPage(),
                'last_page' => $requests->lastPage()
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'whatsapp_number' => 'required|string|regex:/^01[0-9]{9}$/|unique:special_requests,whatsapp_number',
            'name' => 'required|string|max:100',
            'age' => 'nullable|integer|min:5|max:100',
            'available_schedule' => 'nullable|array|min:1',
            'memorized_parts' => 'nullable|array',
            'parts_to_memorize' => 'nullable|array',
            'daily_memorization' => ['nullable', Rule::in(['وجه', 'وجهين', 'أكثر'])],
        ]);

        $requestData = SpecialRequest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الطلب بنجاح',
            'data' => $requestData
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $request = SpecialRequest::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $request
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $specialRequest = SpecialRequest::findOrFail($id);

        $validated = $request->validate([
            'whatsapp_number' => 'sometimes|required|string|regex:/^01[0-9]{9}$/|unique:special_requests,whatsapp_number,' . $id,
            'name' => 'sometimes|required|string|max:100',
            'age' => 'sometimes|integer|min:5|max:100',
            'available_schedule' => 'sometimes|array|min:1',
            'memorized_parts' => 'sometimes|array',
            'parts_to_memorize' => 'sometimes|array',
            'daily_memorization' => ['sometimes', Rule::in(['وجه', 'وجهين', 'أكثر'])],
        ]);

        $specialRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الطلب بنجاح',
            'data' => $specialRequest->fresh()
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $specialRequest = SpecialRequest::findOrFail($id);
        $specialRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الطلب بنجاح'
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = SpecialRequest::query();

        if ($name = $request->input('name')) {
            $query->where('name', 'like', "%{$name}%");
        }

        if ($whatsapp = $request->input('whatsapp_number')) {
            $query->where('whatsapp_number', 'like', "%{$whatsapp}%");
        }

        if ($age = $request->input('age')) {
            $query->where('age', $age);
        }

        $requests = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'total' => $requests->total(),
                'per_page' => $requests->perPage(),
                'last_page' => $requests->lastPage()
            ]
        ]);
    }
}