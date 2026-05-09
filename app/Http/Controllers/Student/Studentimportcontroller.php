<?php

namespace App\Http\Controllers\Student;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Plans\Plan;
use App\Models\Plans\PlanDetail;
use App\Models\Plans\PlanCircleSchedule;
use App\Models\Plans\CircleStudentBooking;
use App\Models\Student\StudentPlanDetail;
use App\Models\Tenant\Circle;
use App\Models\Tenant\Student;
use App\Models\Auth\Teacher;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StudentImportController extends Controller
{
    // ================================================================
    // ✅ importFromExcel — نقطة الدخول الرئيسية
    // ================================================================
   public function importFromExcel(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:xlsx,xls|max:10240',
    ]);

    try {
        $centerId = $this->getCenterId();
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 401);
    }

    $path        = $request->file('file')->getRealPath();
    $spreadsheet = IOFactory::load($path);

    $sheet = null;
    foreach ($spreadsheet->getAllSheets() as $s) {
        if ($s->getHighestRow() > 4) {
            $sheet = $s;
            break;
        }
    }

    if (!$sheet) {
        return response()->json(['success' => false, 'message' => 'الملف فارغ أو لا يحتوي على بيانات'], 422);
    }

    $highestRow = $sheet->getHighestRow();

    // ✅ FIX: نحوّل الحرف لرقم بدل ما نلف على أرقام
    $highestColLetter = $sheet->getHighestColumn();
    $highestColIndex  = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColLetter);

    // ✅ نحدد حد أقصى معقول للأعمدة (مثلاً 20 عمود)
    $maxCols = min($highestColIndex, 20);

    $headers = [];
    for ($col = 1; $col <= $maxCols; $col++) {
        $val = $sheet->getCellByColumnAndRow($col, 4)->getValue();
        $headers[$col] = trim((string) $val);
    }

    $colMap = $this->mapColumns($headers);

    $results = [
        'imported'        => [],
        'already_exists'  => [],
        'missing_circles' => [],
        'errors'          => [],
    ];

    for ($row = 5; $row <= $highestRow; $row++) {
        // ✅ تخطي الصفوف الفارغة تماماً
        $firstColVal = trim((string) $sheet->getCellByColumnAndRow($colMap['first_name'] ?? 1, $row)->getValue());
        if (empty($firstColVal)) continue;

        $firstName  = $firstColVal;
        $lastName   = trim((string) $sheet->getCellByColumnAndRow($colMap['last_name']   ?? 2, $row)->getValue());
        $idNumber   = trim((string) $sheet->getCellByColumnAndRow($colMap['id_number']   ?? 3, $row)->getValue());
        $circleName = trim((string) $sheet->getCellByColumnAndRow($colMap['circle_name'] ?? 4, $row)->getValue());

        $sessionTime  = ($colMap['session_time']  && $colMap['session_time']  <= $maxCols)
            ? trim((string) $sheet->getCellByColumnAndRow($colMap['session_time'],  $row)->getValue())
            : null;

        $scheduleDate = ($colMap['schedule_date'] && $colMap['schedule_date'] <= $maxCols)
            ? trim((string) $sheet->getCellByColumnAndRow($colMap['schedule_date'], $row)->getValue())
            : null;

        $planId = ($colMap['plan_id'] && $colMap['plan_id'] <= $maxCols)
            ? trim((string) $sheet->getCellByColumnAndRow($colMap['plan_id'], $row)->getValue())
            : null;

        if (empty($idNumber) || empty($circleName)) {
            $results['errors'][] = [
                'row'    => $row,
                'name'   => "{$firstName} {$lastName}",
                'reason' => 'رقم الهوية أو اسم الحلقة مفقود',
            ];
            continue;
        }

        try {
            $result = $this->processSingleStudent(
                centerId:     $centerId,
                firstName:    $firstName,
                lastName:     $lastName,
                idNumber:     $idNumber,
                circleName:   $circleName,
                sessionTime:  $sessionTime ?: null,
                scheduleDate: $scheduleDate ?: null,
                planId:       $planId ? (int) $planId : null,
            );

            $results[$result['status']][] = array_merge(
                ['row' => $row, 'name' => "{$firstName} {$lastName}"],
                $result
            );
        } catch (\Exception $e) {
            Log::error('Import row error', ['row' => $row, 'error' => $e->getMessage()]);
            $results['errors'][] = [
                'row'    => $row,
                'name'   => "{$firstName} {$lastName}",
                'reason' => $e->getMessage(),
            ];
        }
    }

    $totalImported = count($results['imported']);
    $totalExists   = count($results['already_exists']);
    $totalMissing  = count($results['missing_circles']);
    $totalErrors   = count($results['errors']);

    return response()->json([
        'success' => true,
        'summary' => [
            'imported'        => $totalImported,
            'already_exists'  => $totalExists,
            'missing_circles' => $totalMissing,
            'errors'          => $totalErrors,
            'total'           => $totalImported + $totalExists + $totalMissing + $totalErrors,
        ],
        'details' => $results,
    ]);
}

    // ================================================================
    // ✅ processSingleStudent — معالجة طالب واحد
    // ================================================================
   private function processSingleStudent(
    int     $centerId,
    string  $firstName,
    string  $lastName,
    string  $idNumber,
    string  $circleName,
    ?string $sessionTime,
    ?string $scheduleDate,
    ?int    $planId
): array {
    // ✅ FIX: preg_replace_callback بدل preg_replace مع Closure
    $idNumber = preg_replace_callback('/[٠-٩]/u', function ($m) {
        $map = ['٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9'];
        return $map[$m[0]] ?? $m[0];
    }, $idNumber);

    $student = Student::where('id_number', $idNumber)
        ->where('center_id', $centerId)
        ->with('user')
        ->first();

    if (!$student) {
        throw new \Exception("لم يُعثر على طالب بهوية: {$idNumber}");
    }

    // ✅ FIX: بحث ذكي عن الحلقة بالكلمات
    $circle = $this->findCircleByName($centerId, $circleName);

    if (!$circle) {
        return [
            'status'      => 'missing_circles',
            'circle_name' => $circleName,
            'reason'      => "حلقة غير موجودة: {$circleName}",
        ];
    }

    $plan = $planId
        ? Plan::where('id', $planId)->where('center_id', $centerId)->first()
        : Plan::where('center_id', $centerId)->orderBy('id')->first();

    if (!$plan) {
        throw new \Exception("لا توجد خطة متاحة للمجمع");
    }

    $schedule = $this->resolveSchedule($circle->id, $sessionTime, $scheduleDate);

    if (!$schedule) {
        throw new \Exception("لا يوجد موعد متاح في حلقة: {$circle->name}");
    }

    $existing = CircleStudentBooking::where('user_id', $student->user_id)
        ->where('plan_circle_schedule_id', $schedule->id)
        ->whereIn('status', ['pending', 'confirmed'])
        ->first();

    if ($existing) {
        return [
            'status'      => 'already_exists',
            'circle_name' => $circle->name,
            'reason'      => 'الطالب محجوز مسبقاً في هذه الحلقة',
        ];
    }

    $planDetail = PlanDetail::where('plan_id', $plan->id)->orderBy('day_number')->first();
    if (!$planDetail) {
        throw new \Exception("الخطة لا تحتوي على أيام دراسية");
    }

    DB::transaction(function () use ($student, $plan, $planDetail, $schedule) {
        $booking = CircleStudentBooking::create([
            'user_id'                 => $student->user_id,
            'plan_id'                 => $plan->id,
            'plan_details_id'         => $planDetail->id,
            'plan_circle_schedule_id' => $schedule->id,
            'status'                  => 'confirmed',
            'started_at'              => now(),
            'start_mode'              => 'normal',
            'start_day_number'        => null,
            'total_days'              => 0,
        ]);

        $schedule->increment('booked_students');
        $this->createStudentPlanDetails($booking, $schedule);
    });

    return [
        'status'      => 'imported',
        'circle_name' => $circle->name,
        'schedule_id' => $schedule->id,
        'reason'      => 'تم التسجيل بنجاح',
    ];
}

// ================================================================
// ✅ findCircleByName — بحث ذكي بالاسم
// ================================================================
private function findCircleByName(int $centerId, string $circleName): ?Circle
{
    // 1. بحث مباشر بالاسم كاملاً
    $circle = Circle::where('center_id', $centerId)
        ->where('name', 'like', "%{$circleName}%")
        ->first();

    if ($circle) return $circle;

    // 2. بحث بكل كلمة من الاسم — نرتب النتائج بعدد الكلمات المتطابقة
    $words = array_filter(explode(' ', $circleName), fn($w) => mb_strlen($w) > 1);

    if (empty($words)) return null;

    $circles = Circle::where('center_id', $centerId)->get();

    $best      = null;
    $bestScore = 0;

    foreach ($circles as $c) {
        $score = 0;
        foreach ($words as $word) {
            if (mb_stripos($c->name, $word) !== false) {
                $score++;
            }
        }
        if ($score > $bestScore) {
            $bestScore = $score;
            $best      = $c;
        }
    }

    // نقبل النتيجة لو تطابق نص على الأقل كلمة واحدة
    return $bestScore > 0 ? $best : null;
}

    // ================================================================
    // ✅ resolveSchedule — حل الموعد (بوقت أو بدون وقت)
    // ================================================================
    private function resolveSchedule(int $circleId, ?string $sessionTime, ?string $scheduleDate): ?PlanCircleSchedule
    {
        $query = PlanCircleSchedule::where('circle_id', $circleId)
            ->where('is_available', true)
            ->whereNotNull('teacher_id');

        // لو مفيش max_students أو لسه فيه مكان
        $query->where(function ($q) {
            $q->whereNull('max_students')
              ->orWhereColumn('booked_students', '<', 'max_students');
        });

        // لو في وقت محدد — نبحث بيه
        if ($sessionTime) {
            $normalizedTime = $this->normalizeTime($sessionTime);
            if ($normalizedTime) {
                $query->where('start_time', $normalizedTime);
            }
        }

        // لو في تاريخ محدد
        if ($scheduleDate) {
            try {
                $date = \Carbon\Carbon::parse($scheduleDate)->toDateString();
                $query->whereDate('schedule_date', $date);
            } catch (\Exception) {
                // تجاهل التاريخ غير الصالح
            }
        } else {
            // أقرب موعد قادم أو أول موعد موجود
            $query->orderBy('schedule_date')->orderBy('start_time');
        }

        return $query->first();
    }

    // ================================================================
    // ✅ createStudentPlanDetails
    // ================================================================
    private function createStudentPlanDetails(
        CircleStudentBooking $booking,
        PlanCircleSchedule   $schedule
    ): void {
        $planDetails = PlanDetail::where('plan_id', $booking->plan_id)
            ->orderBy('day_number')
            ->get();

        $realTeacher = $schedule->teacher_id
            ? Teacher::where('user_id', $schedule->teacher_id)->first()
            : null;

        if (!$realTeacher) {
            throw new \Exception("لا يوجد معلم مرتبط بهذا الموعد (schedule_id: {$schedule->id})");
        }

        StudentPlanDetail::where('circle_student_booking_id', $booking->id)->delete();

        foreach ($planDetails as $index => $detail) {
            StudentPlanDetail::create([
                'circle_student_booking_id' => $booking->id,
                'plan_id'                   => $booking->plan_id,
                'teacher_id'                => $realTeacher->id,
                'circle_id'                 => $schedule->circle_id,
                'plan_circle_schedule_id'   => $schedule->id,
                'day_number'                => $index + 1,
                'plan_day_number'           => $detail->day_number,
                'new_memorization'          => $detail->new_memorization,
                'review_memorization'       => $detail->review_memorization,
                'session_time'              => $schedule->start_time,
                'status'                    => 'قيد الانتظار',
            ]);
        }
    }

    // ================================================================
    // helpers
    // ================================================================
    private function getCenterId(): int
    {
        $user = Auth::user();
        if (!$user)           throw new \Exception('غير مسجل الدخول', 401);
        if (!$user->center_id) throw new \Exception('لا يوجد مجمع مرتبط بحسابك', 400);
        return $user->center_id;
    }

    private function normalizeTime(string $time): ?string
    {
        $time = trim($time);
        if (preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $time)) {
            $parts = explode(':', $time);
            return sprintf('%02d:%02d:00', (int)$parts[0], (int)$parts[1]);
        }
        return null;
    }

    /**
     * يربط أعمدة الـ Excel بالـ keys المطلوبة
     * يدعم كلا الشيتين (مع وقت / بدون وقت)
     */
    private function mapColumns(array $headers): array
    {
        $map = [
            'first_name'    => null,
            'last_name'     => null,
            'id_number'     => null,
            'circle_name'   => null,
            'session_time'  => null,
            'schedule_date' => null,
            'plan_id'       => null,
        ];

        $keywords = [
            'first_name'    => ['الاسم الأول', 'first_name', 'الاسم'],
            'last_name'     => ['اسم العائلة', 'last_name', 'اللقب'],
            'id_number'     => ['رقم الهوية', 'id_number', 'الهوية'],
            'circle_name'   => ['اسم الحلقة', 'circle_name', 'الحلقة'],
            'session_time'  => ['وقت الحلقة', 'session_time', 'وقت الجلسة', 'الوقت'],
            'schedule_date' => ['تاريخ الجلسة', 'schedule_date', 'التاريخ'],
            'plan_id'       => ['رقم المعرف', 'plan_id', 'plan id'],
        ];

        foreach ($headers as $col => $header) {
            $header = trim($header);
            foreach ($keywords as $key => $terms) {
                foreach ($terms as $term) {
                    if (mb_stripos($header, $term) !== false) {
                        $map[$key] = $col;
                        break 2;
                    }
                }
            }
        }

        // fallback بالترتيب لو العناوين غير واضحة
        $map['first_name']  = $map['first_name']  ?? 1;
        $map['last_name']   = $map['last_name']   ?? 2;
        $map['id_number']   = $map['id_number']   ?? 3;
        $map['circle_name'] = $map['circle_name'] ?? 4;

        return $map;
    }

    // ================================================================
    // ✅ downloadTemplate — تنزيل قالب الاكسيل
    // ================================================================
public function downloadTemplate(string $type = 'with_time')
{
    // ✅ بنولّد القالب on-the-fly بدل ما نعتمد على ملف ثابت
    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $withTime    = ($type !== 'without_time');

    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle($withTime ? 'مع وقت' : 'بدون وقت');
    $sheet->setRightToLeft(true);

    // ─── Headers ───
    if ($withTime) {
        $headers = [
            'A' => 'الاسم الأول *',
            'B' => 'اسم العائلة *',
            'C' => 'رقم الهوية *',
            'D' => 'اسم الحلقة *',
            'E' => 'وقت الحلقة (HH:MM)',
            'F' => 'تاريخ الجلسة',
            'G' => 'رقم المعرف (plan_id)',
            'H' => 'البريد الإلكتروني',
            'I' => 'هاتف ولي الأمر',
            'J' => 'ملاحظات',
        ];
        $exampleRows = [
            ['عمر',   'الهديان', '1169641881', 'حلقة الابتدائية الثالثة', '15:30', '2026-06-01', '',  '', '0557747461', ''],
            ['عرفات', 'دحان',    '13657168',   'حلقة المتوسط والثانوي',   '',      '',            '2', '', '0553212203', 'طالب جديد'],
        ];
    } else {
        $headers = [
            'A' => 'الاسم الأول *',
            'B' => 'اسم العائلة *',
            'C' => 'رقم الهوية *',
            'D' => 'اسم الحلقة *',
            'E' => 'رقم المعرف (plan_id)',
            'F' => 'البريد الإلكتروني',
            'G' => 'هاتف ولي الأمر',
            'H' => 'ملاحظات',
        ];
        $exampleRows = [
            ['عمر',   'الهديان', '1169641881', 'حلقة الابتدائية الثالثة', '',  '', '0557747461', ''],
            ['عرفات', 'دحان',    '13657168',   'حلقة المتوسط والثانوي',   '2', '', '0553212203', 'طالب جديد'],
        ];
    }

    // ─── كتابة العناوين في الصف 1 ───
    $headerFill = new \PhpOffice\PhpSpreadsheet\Style\Fill();

    $col = 1;
    foreach ($headers as $colLetter => $label) {
        $cell = $sheet->getCellByColumnAndRow($col, 1);
        $cell->setValue($label);
        $cell->getStyle()->getFont()->setBold(true)->setSize(11);
        $cell->getStyle()->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('1E293B');
        $cell->getStyle()->getFont()->getColor()->setRGB('FFFFFF');
        $cell->getStyle()->getAlignment()
            ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $sheet->getColumnDimensionByColumn($col)->setWidth(22);
        $col++;
    }

    // ─── صفوف الأمثلة ───
    foreach ($exampleRows as $rIdx => $rowData) {
        $row = $rIdx + 2;
        foreach ($rowData as $cIdx => $val) {
            $sheet->getCellByColumnAndRow($cIdx + 1, $row)->setValue($val);
        }
    }

    // ─── تجميد الصف الأول ───
    $sheet->freezePane('A2');

    // ─── إرجاع الملف ───
    $filename = $withTime ? 'قالب_مع_وقت.xlsx' : 'قالب_بدون_وقت.xlsx';

    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

    return response()->stream(
        function () use ($writer) { $writer->save('php://output'); },
        200,
        [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-cache',
        ]
    );
}
}