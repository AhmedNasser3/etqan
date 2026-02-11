<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Center;
use App\Models\Tenant\Student;
use App\Models\Tenant\Circle;
use App\Models\Auth\Teacher;
use Illuminate\Http\Request;

class FeaturedController extends Controller
{
    public function show(Request $request)
    {
        $subdomain = $request->query('slug');

        if (!$subdomain) {
            return response()->json(['error' => 'الـ slug مطلوب'], 400);
        }

        $center = Center::where('subdomain', $subdomain)->first();

        if (!$center) {
            return response()->json(['error' => 'المجمع غير موجود'], 404);
        }

        // جلب عدد الطلاب للمجمع ✅ نفس الكود القديم
        $studentsCount = Student::where('center_id', $center->id)->count();

        // جلب عدد الحلقات للمجمع من جدول circles ✅ نفس الكود القديم
        $episodesCount = Circle::where('center_id', $center->id)->count();

        // جلب أول 7 طلاب لعرض الـ testimonials ✅ نفس الكود القديم
        $students = Student::where('center_id', $center->id)
            ->with('user')
            ->limit(7)
            ->get();

        $testimonials = $students->map(function ($student) {
            return [
                'id' => $student->id,
                'img' => $student->avatar ?? 'https://via.placeholder.com/100',
                'name' => $student->user->name ?? $student->name ?? 'طالب مجهول',
                'title' => $student->level ?? 'طالب قرآن كريم',
            ];
        })->toArray();

        // ✅ جلب المعلمين من خلال user.center_id (الصحيح)
        $teachers = Teacher::whereHas('user', function ($query) use ($center) {
                $query->where('center_id', $center->id);
            })
            ->with('user')
            ->limit(7)
            ->get();

        $teacherTestimonials = $teachers->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'img' => $teacher->avatar ?? 'https://via.placeholder.com/100',
                'rating' => rand(35, 50) / 10, // 3.5 - 5.0
                'name' => $teacher->user->name ?? $teacher->name ?? 'معلم مجهول',
                'title' => $teacher->specialization ?? 'معلم قرآن كريم',
            ];
        })->toArray();

        return response()->json([
            'center' => [
                'id' => $center->id,
                'name' => $center->name,
            ],
            'stats' => [
                'students' => $studentsCount,
                'episodes' => $episodesCount,
                'progress' => 92,
            ],
            'testimonials' => $testimonials,           // ✅ الطلاب (نفس الاسم القديم)
            'teacher_testimonials' => $teacherTestimonials  // ✅ المعلمين الجدد
        ]);
    }
}