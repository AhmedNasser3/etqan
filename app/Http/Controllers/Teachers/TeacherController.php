<?php

namespace App\Http\Controllers\Teachers;

use Carbon\Carbon;
use App\Models\Auth\User;
use App\Models\Auth\Teacher;
use Illuminate\Http\Request;
use App\Models\Tenant\Circle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Plans\PlanCircleSchedule;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['teacher'])->whereHas('teacher');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('teacher_role')) {
            $query->whereHas('teacher', function ($q) use ($request) {
                $q->where('role', $request->teacher_role);
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('teacher', function ($q) use ($request) {
                $q->where('role', $request->role);
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
            ]
        ]);
    }

    /**
     * جلب المعلمين المعلقين فقط
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
        $teacher = User::with(['teacher'])->whereHas('teacher')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $teacher
        ]);
    }

    /**
     * ✅ قبول معلم + توزيع تلقائي على الحلقة المطلوبة
     */
    public function accept(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::with('teacher')->findOrFail($id);

            // التحقق من وجود teacher record
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

            // ✅ 1. تفعيل المعلم
            $user->update([
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            // ✅ 2. البحث عن الحلقة بـ name (العمود الصحيح)
            $targetCircleTitle = "حلقة حفظ نصف وجه يوميا - الجزء 27";
            $targetCircle = Circle::where('name', 'like', '%' . $targetCircleTitle . '%')->first();

            $circleAssigned = false;
            $scheduleInfo = null;

            if ($targetCircle) {
                Log::info("✅ تم العثور على الحلقة", [
                    'circle_id' => $targetCircle->id,
                    'circle_name' => $targetCircle->name,
                    'teacher_id' => $user->id
                ]);

                // ✅ 3. البحث عن مواعيد متاحة مع بحث ساعات 07:18 و 22:22
                $timeKeywords = ['07:18', '7:18', '22:22'];

                $nextAvailableSchedule = PlanCircleSchedule::where('circle_id', $targetCircle->id)
                    ->whereNull('teacher_id')
                    ->where('is_available', true)
                    ->where('schedule_date', '>=', now()->format('Y-m-d'))
                    ->where(function($q) use ($timeKeywords) {
                        foreach ($timeKeywords as $time) {
                            $q->orWhere('start_time', 'like', '%' . $time . '%')
                              ->orWhere('end_time', 'like', '%' . $time . '%');
                        }
                    })
                    ->orderBy('schedule_date', 'asc')
                    ->orderBy('start_time', 'asc')
                    ->first();

                // ✅ Fallback: أي موعد متاح لو مفيش بالساعات المطلوبة
                if (!$nextAvailableSchedule) {
                    $nextAvailableSchedule = PlanCircleSchedule::where('circle_id', $targetCircle->id)
                        ->whereNull('teacher_id')
                        ->where('is_available', true)
                        ->where('schedule_date', '>=', now()->format('Y-m-d'))
                        ->orderBy('schedule_date', 'asc')
                        ->orderBy('start_time', 'asc')
                        ->first();
                }

                if ($nextAvailableSchedule) {
                    // ✅ 4. تعيين المعلم مع التأكد من التحديث
                    $result = $nextAvailableSchedule->update([
                        'teacher_id' => $user->id,
                        'is_available' => false
                    ]);

                    if ($result) {
                        $nextAvailableSchedule->refresh();

                        $circleAssigned = true;
                        $scheduleInfo = [
                            'id' => $nextAvailableSchedule->id,
                            'circle_id' => $targetCircle->id,
                            'circle_name' => $targetCircle->name,
                            'date' => $nextAvailableSchedule->schedule_date,
                            'start_time' => $nextAvailableSchedule->start_time,
                            'end_time' => $nextAvailableSchedule->end_time,
                            'duration_minutes' => $nextAvailableSchedule->duration_minutes ?? 0,
                            'teacher_id' => $nextAvailableSchedule->teacher_id,
                            'is_available' => $nextAvailableSchedule->is_available
                        ];

                        Log::info("✅ تم تعيين المعلم بنجاح", $scheduleInfo);
                    } else {
                        Log::error("❌ فشل في تحديث الجدولة", [
                            'schedule_id' => $nextAvailableSchedule->id
                        ]);
                    }
                } else {
                    Log::warning("⚠️ لا توجد مواعيد متاحة", ['circle_id' => $targetCircle->id]);
                }
            } else {
                Log::warning("⚠️ لم يتم العثور على الحلقة", [
                    'search_term' => $targetCircleTitle
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم قبول المعلم وتفعيل الحساب بنجاح',
                'circle_assigned' => $circleAssigned,
                'schedule_info' => $scheduleInfo,
                'circle_found' => $targetCircle ? true : false,
                'circle_name' => $targetCircle->name ?? 'غير محدد',
                'teacher_id' => $user->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Accept Teacher Error: ' . $e->getMessage(), [
                'user_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول المعلم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * رفض معلم (حذف الحساب)
     */
    public function reject(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);

            // ✅ إزالة المعلم من أي جدولة قبل الحذف
            PlanCircleSchedule::where('teacher_id', $id)->update([
                'teacher_id' => null,
                'is_available' => true
            ]);

            $user->delete();

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
            'email' => ['sometimes', 'required', 'email:rfc,dns', 'max:255', 'unique:users,email,' . $id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', 'unique:users,phone,' . $id],
            'center_id' => 'sometimes|nullable|exists:centers,id',
            'status' => 'sometimes|in:pending,active,inactive,suspended',
            'notes' => 'sometimes|nullable|string|max:1000',
            'teacher_role' => ['sometimes', 'nullable', 'in:teacher,supervisor,motivator,student_affairs,financial'],
            'session_time' => ['sometimes', 'nullable', 'in:asr,maghrib'],
        ]);

        DB::beginTransaction();
        try {
            $user->update($request->only(['name', 'email', 'phone', 'center_id', 'status']));

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

            PlanCircleSchedule::where('teacher_id', $id)->update([
                'teacher_id' => null,
                'is_available' => true
            ]);

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