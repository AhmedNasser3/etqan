<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_if(!$user, 401);

        $student = DB::table('students')->where('user_id', $user->id)->first();
        $circle  = null;

        if ($student) {
            $booking = DB::table('circle_student_bookings')
                ->where('user_id', $user->id)
                ->latest()
                ->first();

            if ($booking) {
                $circle = DB::table('circles as c')
                    ->join('teachers as t',  't.id',  '=', 'c.teacher_id')
                    ->join('users   as tu', 'tu.id',  '=', 't.user_id')
                    ->leftJoin('mosques as m', 'm.id', '=', 'c.mosque_id')
                    ->where('c.id', $booking->circle_id)
                    ->select('c.id', 'c.name as circle_name', 'tu.name as teacher_name', 'm.name as mosque_name')
                    ->first();
            }
        }

        return response()->json([
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'gender'     => $user->gender,
                'birth_date' => $user->birth_date,
                'avatar'     => $user->avatar ? asset('storage/'.$user->avatar) : null,
                'status'     => $user->status,
            ],
            'student' => $student,
            'circle'  => $circle,
        ]);
    }
}
