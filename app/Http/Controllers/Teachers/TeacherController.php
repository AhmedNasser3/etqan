<?php

namespace App\Http\Controllers\Teachers;

use App\Models\Auth\Teacher;
use App\Models\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['teacher'])
            ->whereHas('teacher'); // ✅ فقط المستخدمين اللي عندهم سجل في teachers

        // فلترة حسب status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 🔥 فلترة حسب teacher role (من جدول teachers فقط)
        if ($request->filled('teacher_role')) {
            $query->whereHas('teacher', function ($q) use ($request) {
                $q->where('role', $request->teacher_role);
            });
        }

        // 🔥 فلترة حسب role name (من عمود role في teachers)
        if ($request->filled('role')) {
            $query->whereHas('teacher', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        // بحث بالاسم أو الإيميل أو الـ teacher role
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

        $teachers = $query
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
                'from' => $teachers->firstItem(),
                'to' => $teachers->lastItem(),
            ]
        ]);
    }

    /**
     * جلب المعلمين المعلقين فقط ✅
     */
    public function pending()
    {
        $teachers = User::with(['teacher'])
            ->whereHas('teacher')
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
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $teacher = User::with(['teacher'])
            ->whereHas('teacher')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $teacher
        ]);
    }

    /**
     * قبول معلم (تفعيل الحساب) ✅
     */
    public function accept(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::with('teacher')->findOrFail($id);

            // ✅ التحقق من وجود teacher record فقط
            if (!$user->teacher) {
                return response()->json([
                    'success' => false,
                    'message' => 'معلم غير صالح'
                ], 404);
            }

            if ($user->status === 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'المعلم مفعل بالفعل'
                ], 400);
            }

            $user->update([
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم قبول المعلم وتفعيل الحساب بنجاح'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Accept Teacher Error: ' . $e->getMessage(), ['user_id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول المعلم'
            ], 500);
        }
    }

    /**
     * رفض معلم (حذف الحساب) ✅
     */
    public function reject(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);
            $user->delete(); // ✅ cascade يحذف الـ teacher تلقائياً

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم رفض طلب المعلم وحذف الحساب'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reject Teacher Error: ' . $e->getMessage(), ['user_id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء رفض المعلم'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::with('teacher')->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255|min:3',
            'email' => ['sometimes', 'required', 'email:rfc,dns', 'max:255',
                       'unique:users,email,' . $id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20',
                       'unique:users,phone,' . $id],
            'center_id' => 'sometimes|nullable|exists:centers,id',
            'status' => 'sometimes|in:pending,active,inactive,suspended',
            'notes' => 'sometimes|nullable|string|max:1000',
            // ✅ teacher role من جدول teachers
            'teacher_role' => ['sometimes', 'nullable', 'in:teacher,supervisor,motivator,student_affairs,financial'],
            'session_time' => ['sometimes', 'nullable', 'in:asr,maghrib'],
        ], [
            'name.required' => 'الاسم مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد مستخدم من مستخدم آخر',
            'phone.unique' => 'هذا الرقم مستخدم من مستخدم آخر',
            'teacher_role.in' => 'دور المعلم غير صحيح',
        ]);

        DB::beginTransaction();
        try {
            $user->update($request->only(['name', 'email', 'phone', 'center_id', 'status']));

            // ✅ تحديث بيانات الـ teacher
            if ($user->teacher) {
                $teacherData = [];
                if ($request->filled('notes')) {
                    $teacherData['notes'] = $request->notes;
                }
                if ($request->filled('teacher_role')) {
                    $teacherData['role'] = $request->teacher_role;
                }
                if ($request->filled('session_time')) {
                    $teacherData['session_time'] = $request->session_time;
                }

                if (!empty($teacherData)) {
                    $user->teacher->update($teacherData);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تعديل بيانات المعلم بنجاح',
                'data' => $user->fresh(['teacher'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update Teacher Error: ' . $e->getMessage(), ['user_id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التعديل'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);
            $user->update(['status' => 'suspended']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تعليق حساب المعلم بنجاح'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete Teacher Error: ' . $e->getMessage(), ['user_id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحذف'
            ], 500);
        }
    }
}