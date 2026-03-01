<?php

namespace App\Http\Controllers\Teachers;

use Illuminate\Http\Request;
use App\Models\Auth\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class MyTeachersController extends Controller
{
    /**
     * جلب المعلمين في مجمعي فقط
     */
    public function index(Request $request)
    {
        $currentUserCenterId = Auth::user()->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $query = User::with(['teacher'])
            ->whereHas('teacher')
            ->where('center_id', $currentUserCenterId);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('teacher_role')) {
            $query->whereHas('teacher', function ($q) use ($request) {
                $q->where('role', $request->teacher_role);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhereHas('teacher', function ($tq) use ($search) {
                      $tq->where('role', 'like', '%' . $search . '%')
                         ->orWhere('notes', 'like', '%' . $search . '%');
                  });
            });
        }

        $teachers = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $teachers->items(),
            'pagination' => [
                'current_page' => $teachers->currentPage(),
                'total' => $teachers->total(),
                'per_page' => $teachers->perPage(),
                'last_page' => $teachers->lastPage(),
                'from' => $teachers->firstItem(),
                'to' => $teachers->lastItem(),
            ],
            'center_id' => $currentUserCenterId,
            'center_filter_active' => true
        ]);
    }

    /**
     * جلب المعلمين المعلقين في مجمعي فقط
     */
    public function pending()
    {
        $currentUserCenterId = Auth::user()->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $teachers = User::with(['teacher'])
            ->whereHas('teacher')
            ->where('center_id', $currentUserCenterId)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $teachers->items(),
            'pagination' => [
                'current_page' => $teachers->currentPage(),
                'total' => $teachers->total(),
                'per_page' => $teachers->perPage(),
                'last_page' => $teachers->lastPage(),
            ],
            'center_id' => $currentUserCenterId
        ]);
    }

    /**
     * تعديل بيانات المعلم في مجمعي فقط
     */
    public function update(Request $request, $id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $user = User::with('teacher')
            ->where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:255|min:3',
            'email' => ['nullable', 'email:rfc,dns', 'max:255', 'unique:users,email,' . $id],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone,' . $id],
            'status' => 'nullable|in:pending,active,inactive,suspended',
            'notes' => 'nullable|string|max:1000',
            'teacher_role' => ['nullable', 'in:teacher,supervisor,motivator,student_affairs,financial'],
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'status']));

        if ($user->teacher) {
            $teacherData = [];
            if ($request->filled('notes')) {
                $teacherData['notes'] = $request->notes;
            }
            if ($request->filled('teacher_role')) {
                $teacherData['role'] = $request->teacher_role;
            }

            if (!empty($teacherData)) {
                $user->teacher->update($teacherData);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تعديل المعلم بنجاح',
            'data' => $user->fresh(['teacher'])
        ]);
    }

    /**
     * حذف / تعليق معلم في مجمعي فقط
     */
    public function destroy($id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $user = User::with('teacher')
            ->where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        // تعليق فقط (لا حذف فعلًا)
        $user->update(['status' => 'suspended']);

        return response()->json([
            'success' => true,
            'message' => 'تم تعليق حساب المعلم بنجاح'
        ]);
    }

    /**
     * تفعيل أو تعطيل معلم في مجمعي فقط (Toggle status)
     * - إذا كان Active: يُعلق
     * - إذا كان معلق: يُفعّل
     */
    public function toggleStatus(Request $request, $id)
    {
        $currentUser = Auth::user();
        $currentUserCenterId = $currentUser->center_id;

        if (!$currentUserCenterId) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد مجمع مرتبط بحسابك'
            ], 400);
        }

        $user = User::with('teacher')
            ->where('center_id', $currentUserCenterId)
            ->whereHas('teacher')
            ->findOrFail($id);

        // التبديل بين active و suspended
        $currentStatus = $user->status;
        $newStatus = $currentStatus === 'active' ? 'suspended' : 'active';

        $user->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'active'
                ? 'تم تفعيل المعلم في مجمعك بنجاح'
                : 'تم تعليق حساب المعلم في مجمعك بنجاح',
            'status' => $newStatus,
            'current_status' => $currentStatus,
            'data' => $user->fresh(['teacher'])
        ]);
    }
}
