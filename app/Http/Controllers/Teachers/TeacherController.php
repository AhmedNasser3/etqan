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
     *  قبول معلم + توزيع تلقائي على الحلقة من teacher.notes
     */
    public function accept(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::with('teacher')->findOrFail($id);

            if (!$user->teacher) {
                return response()->json(['success' => false, 'message' => 'معلم غير صالح'], 404);
            }

            if ($user->status === 'active') {
                return response()->json(['success' => false, 'message' => 'المعلم مفعل بالفعل'], 400);
            }

            //  1. تفعيل المعلم
            $user->update(['status' => 'active', 'email_verified_at' => now()]);

            $circleAssigned = false;
            $scheduleInfo = null;
            $targetCircle = null;
            $extractedData = null;

            // 🆕 Debug: طباعة الـ notes الأصلية
            Log::info("🔍 RAW NOTES", ['teacher_id' => $user->id, 'notes' => $user->teacher->notes]);

            if ($user->teacher->notes) {
                // 🆕 Regex محسّن لكل الحالات + تحليل الوقت
                $patterns = [
                    // Pattern 1: صباحا/مساءا
                    '/حلقة:\s*([^\(]+?)\s*\(ID:\s*(\d+)\)\s*\|\s*من\s*(صباحا|مساءا)/iu',
                    // Pattern 2: وقت محدد "10:00 ص"
                    '/حلقة:\s*([^\(]+?)\s*\(ID:\s*(\d+)\)\s*\|\s*من\s*([\d:]+\s*(?:ص|م))/iu',
                    // Pattern 3: بدون وقت محدد
                    '/حلقة:\s*([^\(]+?)\s*\(ID:\s*(\d+)\)/iu',
                ];

                foreach ($patterns as $i => $pattern) {
                    if (preg_match($pattern, $user->teacher->notes, $matches)) {
                        $circleName = trim($matches[1]);
                        $circleId = (int) $matches[2];
                        $timeIndicator = $matches[3] ?? null;

                        // 🆕 تحويل "10:00 ص" لـ "صباحا"
                        if ($timeIndicator && preg_match('/\d+:\d+\s*ص/', $timeIndicator)) {
                            $timeIndicator = 'صباحا';
                        } elseif ($timeIndicator && preg_match('/\d+:\d+\s*م/', $timeIndicator)) {
                            $timeIndicator = 'مساءا';
                        }

                        $extractedData = [
                            'circle_name' => $circleName,
                            'circle_id' => $circleId,
                            'time_indicator' => $timeIndicator,
                            'pattern_used' => $i + 1
                        ];

                        Log::info(" تم استخراج البيانات", array_merge($extractedData, [
                            'teacher_id' => $user->id,
                            'raw_notes' => $user->teacher->notes
                        ]));

                        break;
                    }
                }

                if (!$extractedData) {
                    Log::warning("⚠️ فشل استخراج البيانات", [
                        'teacher_id' => $user->id,
                        'notes' => $user->teacher->notes
                    ]);
                } else {
                    // 🆕 جلب الحلقة
                    $targetCircle = Circle::find($circleId);

                    if (!$targetCircle) {
                        $targetCircle = Circle::where('name', 'like', '%' . $extractedData['circle_name'] . '%')->first();
                        Log::info("🔍 بحث بالاسم كـ fallback", [
                            'search_name' => $extractedData['circle_name'],
                            'found' => $targetCircle ? true : false
                        ]);
                    }

                    Log::info("🏢 حالة الحلقة", [
                        'circle_id_searched' => $extractedData['circle_id'],
                        'circle_found' => $targetCircle ? true : false,
                        'circle_exists_in_db' => Circle::where('id', $extractedData['circle_id'])->exists(),
                        'circle_name_in_db' => $targetCircle->name ?? 'غير موجود'
                    ]);

                    if ($targetCircle) {
                        $nextAvailableSchedule = $this->findAvailableSchedule($targetCircle->id, $extractedData['time_indicator']);

                        if ($nextAvailableSchedule) {
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
                                ];
                                Log::info(" تم تعيين المعلم للموعد", $scheduleInfo);
                            }
                        } else {
                            Log::warning("⚠️ لا توجد مواعيد متاحة", [
                                'circle_id' => $targetCircle->id,
                                'time_indicator' => $extractedData['time_indicator']
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم قبول المعلم وتفعيل الحساب بنجاح',
                'circle_assigned' => $circleAssigned,
                'schedule_info' => $scheduleInfo,
                'circle_found' => $targetCircle ? true : false,
                'circle_name' => $targetCircle->name ?? 'غير محدد',
                'teacher_id' => $user->id,
                'notes_parsed' => !empty($extractedData),
                'extracted_data' => $extractedData,
                'debug' => [
                    'notes_raw' => $user->teacher->notes,
                    'circle_exists_in_db' => $extractedData ? Circle::where('id', $extractedData['circle_id'])->exists() : false,
                    'schedules_available' => $extractedData ? PlanCircleSchedule::where('circle_id', $extractedData['circle_id'])->where('is_available', true)->count() : 0
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Accept Teacher Error', ['user_id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     *  البحث عن أي موعد متاح في الحلقة (بدون قيود تاريخ)
     */
    private function findAvailableSchedule($circleId, $timeIndicator = null)
    {
        Log::info("🔍 البحث عن مواعيد متاحة", [
            'circle_id' => $circleId,
            'time_indicator' => $timeIndicator
        ]);

        // 1️⃣ جلب كل المواعيد المتاحة في الحلقة (بدون قيود تاريخ)
        $availableSchedules = PlanCircleSchedule::where('circle_id', $circleId)
            ->whereNull('teacher_id')
            ->where('is_available', true)
            ->orderBy('schedule_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        Log::info("📊 المواعيد المتاحة الكلية", [
            'total_available' => $availableSchedules->count(),
            'schedules_count' => $availableSchedules->count()
        ]);

        if ($availableSchedules->isEmpty()) {
            Log::warning("⚠️ لا توجد مواعيد متاحة خالص");
            return null;
        }

        // 2️⃣ فلترة حسب الوقت (صباحا/مساءا)
        $filteredSchedules = $availableSchedules;

        if ($timeIndicator === 'صباحا') {
            $filteredSchedules = $availableSchedules->filter(function ($schedule) {
                return strtotime($schedule->start_time) <= strtotime('12:00:00');
            });
        } elseif ($timeIndicator === 'مساءا') {
            $filteredSchedules = $availableSchedules->filter(function ($schedule) {
                return strtotime($schedule->start_time) >= strtotime('12:00:00');
            });
        }

        Log::info("⏰ بعد فلترة الوقت", [
            'time_indicator' => $timeIndicator,
            'filtered_count' => $filteredSchedules->count()
        ]);

        // 3️⃣ أول موعد متاح
        if ($filteredSchedules->isNotEmpty()) {
            $schedule = $filteredSchedules->first();
            Log::info(" وجد موعد مناسب", [
                'schedule_id' => $schedule->id,
                'date' => $schedule->schedule_date,
                'start_time' => $schedule->start_time
            ]);
            return $schedule;
        }

        // 4️⃣ Fallback: أول موعد متاح خالص
        $schedule = $availableSchedules->first();
        Log::info("🏁 Fallback - أول موعد متاح", [
            'schedule_id' => $schedule->id,
            'date' => $schedule->schedule_date,
            'start_time' => $schedule->start_time
        ]);

        return $schedule;
    }

    /**
     * رفض معلم (حذف الحساب)
     */
    public function reject(string $id)
    {
        DB::beginTransaction();
        try {
            $user = User::findOrFail($id);

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
