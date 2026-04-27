<?php

namespace App\Http\Controllers\Student;

use App\Models\Auth\User;
use Illuminate\Http\Request;
use App\Models\Tenant\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentAffairsController extends Controller
{
    // ── helper: يجيب center_id من auth أو من الـ portal header ──────────────
    private function resolveCenterId(Request $request): ?int
    {
        if (Auth::check() && Auth::user()->center_id) {
            return (int) Auth::user()->center_id;
        }
        $id = $request->header('X-Center-Id') ?? $request->query('center_id');
        return ($id && is_numeric($id)) ? (int) $id : null;
    }

    public function index(Request $request)
    {
        $centerId = $this->resolveCenterId($request);

        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $query = Student::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId);
        });

        // ── فلتر المسجد لو portal ────────────────────────────────────────
        $mosqueId = $request->header('X-Mosque-Id') ?? $request->query('mosque_id');
        if ($mosqueId && is_numeric($mosqueId)) {
            // الطلاب المرتبطين بحلقات في هذا المسجد
            $query->whereHas('circle', function ($q) use ($mosqueId) {
                $q->where('mosque_id', (int) $mosqueId);
            });
        }

        // ── فلتر المرحلة ─────────────────────────────────────────────────
        if ($request->grade && $request->grade !== 'الكل') {
            $query->where('grade_level', $request->grade);
        }

        // ── فلتر البحث ───────────────────────────────────────────────────
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('id_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function ($q2) use ($request) {
                      $q2->where('name', 'like', "%{$request->search}%")
                         ->orWhere('phone', 'like', "%{$request->search}%");
                  });
            });
        }

        $query->with(['user:id,name,email,phone,birth_date,avatar', 'guardian:id,name,phone']);
        $students = $query->orderBy('id_number', 'asc')->paginate(15);

        $mappedData = $students->getCollection()->map(function ($student) use ($centerId) {
            return [
                'id'                      => $student->id,
                'name'                    => $student->user->name    ?? 'غير محدد',
                'idNumber'                => $student->id_number,
                'age'                     => $student->user->birth_date
                    ? $this->calculateAge($student->user->birth_date) . ' سنوات'
                    : 'غير محدد',
                'grade'                   => $student->grade_level   ?? 'غير محدد',
                'circle'                  => $student->circle         ?? 'غير محدد',
                'guardianName'            => $student->guardian->name ?? 'غير محدد',
                'guardianPhone'           => $student->guardian->phone ?? $student->user->phone ?? 'غير محدد',
                'attendanceRate'          => $this->getAttendanceRate($student->id, $centerId),
                'balance'                 => $this->getBalance($student->id),
                'status'                  => 'نشط',
                'img'                     => $student->user->avatar   ?? '',
                'guardian_phone_formatted'=> $this->formatPhone($student->guardian->phone ?? $student->user->phone ?? ''),
            ];
        });

        return response()->json([
            'data'         => $mappedData,
            'current_page' => $students->currentPage(),
            'last_page'    => $students->lastPage(),
            'per_page'     => $students->perPage(),
            'total'        => $students->total(),
            'stats'        => $this->getStats($centerId),
            'grades'       => Student::distinct()->pluck('grade_level')->filter(),
        ]);
    }

    public function show($id)
    {
        try {
            $centerId = $this->resolveCenterId(request());

            $student = Student::whereHas('user', function ($q) use ($centerId) {
                $q->where('center_id', $centerId);
            })->with(['user:id,name,email,phone,birth_date,avatar', 'guardian:id,name,phone'])
              ->find($id);

            if (!$student) {
                return response()->json(['success' => false, 'message' => 'الطالب غير موجود'], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'id'            => $student->id,
                    'id_number'     => $student->id_number     ?? '',
                    'grade_level'   => $student->grade_level   ?? '',
                    'circle'        => $student->circle        ?? '',
                    'status'        => $student->status        ?? 'نشط',
                    'health_status' => $student->health_status ?? '',
                    'reading_level' => $student->reading_level ?? '',
                    'session_time'  => $student->session_time  ?? '',
                    'notes'         => $student->notes         ?? '',
                    'name'          => $student->user->name    ?? 'غير محدد',
                    'guardian_name' => $student->guardian->name  ?? 'غير محدد',
                    'guardian_phone'=> $student->guardian->phone ?? $student->user->phone ?? '',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('❌ خطأ في جلب بيانات الطالب: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'خطأ في جلب البيانات'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $centerId = $this->resolveCenterId($request);

        $request->validate([
            'id_number'     => 'required|string|max:20',
            'grade_level'   => 'required|string|max:50',
            'circle'        => 'nullable|string|max:100',
            'status'        => ['nullable', Rule::in(['نشط', 'معلق', 'موقوف'])],
            'health_status' => 'nullable|string|max:50',
            'reading_level' => 'nullable|string|max:50',
            'session_time'  => 'nullable|string|max:50',
            'notes'         => 'nullable|string',
        ]);

        $student = Student::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId);
        })->findOrFail($id);

        $updateData = $request->only([
            'id_number', 'grade_level', 'circle',
            'health_status', 'reading_level', 'session_time', 'notes',
        ]);

        if ($request->status) $updateData['status'] = $request->status;

        $student->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الطالب بنجاح',
            'student' => $student->fresh(['user', 'guardian']),
        ]);
    }

    public function whatsappReminder($id)
    {
        $centerId = $this->resolveCenterId(request());

        $student = Student::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId);
        })->with(['user', 'guardian'])->findOrFail($id);

        $phone       = $student->guardian->phone ?? $student->user->phone ?? '';
        $studentName = $student->user->name ?? '';
        $balance     = $this->getBalance($student->id);

        $url = "https://wa.me/{$this->formatPhone($phone)}?text=" .
            urlencode("مرحباً، طالبك {$studentName} لديه رصيد مستحق: {$balance}. يرجى التفضل بالتسديد 📚");

        return response()->json(['success' => true, 'whatsapp_url' => $url]);
    }

    public function printCard($id)
    {
        $centerId = $this->resolveCenterId(request());

        $student = Student::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId);
        })->with(['user', 'guardian'])->findOrFail($id);

        $pdf      = Pdf::loadView('pdf.student-card', compact('student'));
        $filename = 'بطاقة_الطالب_' . ($student->user->name ?? '') . '.pdf';

        return $pdf->download($filename);
    }

    private function getBalance($studentId)
    {
        return 'ر.0';
    }

    private function getAttendanceRate($studentId, $centerId)
    {
        return '95%';
    }

    private function formatPhone($phone)
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }

    private function getStats($centerId)
    {
        $total = Student::whereHas('user', function ($q) use ($centerId) {
            $q->where('center_id', $centerId);
        })->count();

        return [
            'totalStudents'  => $total,
            'activeStudents' => $total,
            'pendingStudents'=> 0,
            'totalBalance'   => 0,
            'paymentRate'    => $total ? 95 : 0,
        ];
    }

    private function calculateAge($birthDate)
    {
        return now()->diffInYears($birthDate);
    }
}
