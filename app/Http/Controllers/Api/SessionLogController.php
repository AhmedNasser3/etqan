<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SessionLogController extends Controller
{
    public function join(Request $request): JsonResponse
    {
        Log::info('🟢 [JOIN] hit', [
            'user'        => Auth::id(),
            'schedule_id' => $request->schedule_id,
            'auth_check'  => Auth::check(),
        ]);

        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'غير مصادق'], 401);
        }

        $request->validate([
            'schedule_id' => 'required|integer',
            'circle_name' => 'nullable|string|max:255',
        ]);

        $now = Carbon::now();

        // إغلاق أي سجل مفتوح لنفس الجلسة
        SessionLog::where('user_id', Auth::id())
            ->where('schedule_id', $request->schedule_id)
            ->whereNull('left_at')
            ->each(function (SessionLog $log) use ($now) {
                $log->left_at          = $now;
                $log->duration_minutes = (int) Carbon::parse($log->joined_at)->diffInMinutes($now);
                $log->save();
            });

        // استخدم DB::table مباشرة عشان نتجاوز أي validation في الـ Model
        $id = DB::table('session_logs')->insertGetId([
            'user_id'      => Auth::id(),
            'schedule_id'  => (int) $request->schedule_id,
            'circle_name'  => $request->circle_name ?? null,
            'joined_at'    => $now->toDateTimeString(),
            'left_at'      => null,
            'session_date' => $now->toDateString(),
            'created_at'   => $now->toDateTimeString(),
            'updated_at'   => $now->toDateTimeString(),
        ]);

        Log::info('✅ [JOIN] created via DB::table', ['log_id' => $id]);

        return response()->json([
            'success'   => true,
            'log_id'    => $id,
            'joined_at' => $now->toDateTimeString(),
        ], 201);
    }

    public function leave(Request $request): JsonResponse
    {
        Log::info('🔴 [LEAVE] hit', ['user' => Auth::id(), 'log_id' => $request->log_id]);

        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'غير مصادق'], 401);
        }

        $request->validate(['log_id' => 'required|integer|exists:session_logs,id']);

        $now = Carbon::now();

        $log = DB::table('session_logs')
            ->where('id', $request->log_id)
            ->where('user_id', Auth::id())
            ->whereNull('left_at')
            ->first();

        if (!$log) {
            return response()->json(['success' => false, 'message' => 'السجل غير موجود'], 404);
        }

        $duration = (int) Carbon::parse($log->joined_at)->diffInMinutes($now);

        DB::table('session_logs')
            ->where('id', $request->log_id)
            ->update([
                'left_at'          => $now->toDateTimeString(),
                'duration_minutes' => $duration,
                'updated_at'       => $now->toDateTimeString(),
            ]);

        Log::info('✅ [LEAVE] saved', ['log_id' => $request->log_id, 'duration' => $duration]);

        return response()->json([
            'success'          => true,
            'duration_minutes' => $duration,
        ]);
    }

    public function forceLeave(Request $request): JsonResponse
    {
        Log::info('⚡ [FORCE-LEAVE] hit', ['user' => Auth::id(), 'schedule_id' => $request->schedule_id]);

        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'غير مصادق'], 401);
        }

        $request->validate(['schedule_id' => 'required|integer']);

        $now   = Carbon::now();
        $count = 0;

        $openLogs = DB::table('session_logs')
            ->where('user_id', Auth::id())
            ->where('schedule_id', $request->schedule_id)
            ->whereNull('left_at')
            ->get();

        foreach ($openLogs as $log) {
            $duration = (int) Carbon::parse($log->joined_at)->diffInMinutes($now);
            DB::table('session_logs')
                ->where('id', $log->id)
                ->update([
                    'left_at'          => $now->toDateTimeString(),
                    'duration_minutes' => $duration,
                    'updated_at'       => $now->toDateTimeString(),
                ]);
            $count++;
        }

        Log::info('✅ [FORCE-LEAVE] closed', ['count' => $count]);

        return response()->json(['success' => true, 'closed' => $count]);
    }

    public function daily(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'غير مصادق'], 401);
        }

        $date = $request->date ? Carbon::parse($request->date) : Carbon::today();

        $logs = DB::table('session_logs')
            ->where('user_id', Auth::id())
            ->where('session_date', $date->toDateString())
            ->orderBy('joined_at')
            ->get()
            ->map(function ($log) {
                $joined  = Carbon::parse($log->joined_at);
                $left    = $log->left_at ? Carbon::parse($log->left_at) : Carbon::now();
                $minutes = $log->duration_minutes ?? (int) $joined->diffInMinutes($left);
                return [
                    'log_id'           => $log->id,
                    'schedule_id'      => $log->schedule_id,
                    'circle_name'      => $log->circle_name,
                    'joined_at'        => $joined->format('H:i:s'),
                    'left_at'          => $log->left_at ? Carbon::parse($log->left_at)->format('H:i:s') : null,
                    'is_open'          => is_null($log->left_at),
                    'duration_minutes' => $minutes,
                    'duration_label'   => $this->fmt($minutes),
                ];
            });

        $total = $logs->sum('duration_minutes');

        return response()->json([
            'success'  => true,
            'date'     => $date->toDateString(),
            'day_name' => $date->locale('ar')->isoFormat('dddd'),
            'sessions' => $logs,
            'summary'  => [
                'total_sessions'    => $logs->count(),
                'total_minutes'     => $total,
                'total_hours_label' => $this->fmt($total),
            ],
        ]);
    }

    private function fmt(int $m): string
    {
        if ($m <= 0) return '0 دقيقة';
        $h = intdiv($m, 60);
        $r = $m % 60;
        return implode(' و ', array_filter([
            $h ? "{$h} ساعة" : '',
            $r ? "{$r} دقيقة" : '',
        ]));
    }
}