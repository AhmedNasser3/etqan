<?php
// app/Http/Controllers/Student/CenterRewardController.php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Students\CenterReward;
use App\Models\Students\StudentRewardPurchase;
use App\Models\Student\StudentAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CenterRewardController extends Controller
{
    private function calcTotalPoints(int $userId): int
    {
        $added    = StudentAchievement::where('user_id', $userId)
                        ->where('points_action', 'added')->sum('points');
        $deducted = StudentAchievement::where('user_id', $userId)
                        ->where('points_action', 'deducted')->sum('points');
        return $added - $deducted;
    }

    // ──────────────────────────────────────────────────
    // جلب كل جوائز المجمع (للداشبورد)
    // ──────────────────────────────────────────────────
    public function index(Request $request)
    {
        $centerId = Auth::user()->center_id;

        $rewards = CenterReward::where('center_id', $centerId)
            ->orderBy('points_cost')
            ->get();

        return response()->json(['data' => $rewards]);
    }

    // ──────────────────────────────────────────────────
    // إضافة جائزة جديدة (من داشبورد المجمع)
    // ──────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'points_cost' => 'required|integer|min:1|max:99999',
            'is_active'   => 'boolean',
        ]);

        $reward = CenterReward::create([
            'center_id'   => Auth::user()->center_id,
            'name'        => $request->name,
            'description' => $request->description,
            'points_cost' => $request->points_cost,
            'is_active'   => $request->get('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة الجائزة بنجاح',
            'data'    => $reward,
        ], 201);
    }

    // ──────────────────────────────────────────────────
    // تعديل جائزة
    // ──────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $reward = CenterReward::where('center_id', Auth::user()->center_id)
            ->findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'nullable|string|max:500',
            'points_cost' => 'sometimes|integer|min:1|max:99999',
            'is_active'   => 'boolean',
        ]);

        $reward->update($request->only(['name', 'description', 'points_cost', 'is_active']));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الجائزة',
            'data'    => $reward,
        ]);
    }

    // ──────────────────────────────────────────────────
    // حذف جائزة
    // ──────────────────────────────────────────────────
    public function destroy($id)
    {
        $reward = CenterReward::where('center_id', Auth::user()->center_id)
            ->findOrFail($id);

        $reward->delete();

        return response()->json(['success' => true, 'message' => 'تم حذف الجائزة']);
    }

    // ──────────────────────────────────────────────────
    // لوحة الطالب: جلب الجوائز المتاحة + نقاطه
    // ──────────────────────────────────────────────────
    public function studentShop()
    {
        $user     = Auth::user();
        $centerId = $user->center_id;
        $userId   = $user->id;

        $rewards = CenterReward::where('center_id', $centerId)
            ->where('is_active', true)
            ->orderBy('points_cost')
            ->get();

        $totalPoints = $this->calcTotalPoints($userId);

        // الجوائز اللي اشتراها الطالب قبل كده
        $purchased = StudentRewardPurchase::where('user_id', $userId)
            ->with('reward:id,name,points_cost')
            ->latest()
            ->get()
            ->map(fn($p) => [
                'reward_name'  => $p->reward?->name,
                'points_spent' => $p->points_spent,
                'purchased_at' => $p->created_at->format('Y-m-d H:i'),
            ]);

        return response()->json([
            'total_points' => $totalPoints,
            'rewards'      => $rewards,
            'purchases'    => $purchased,
        ]);
    }

    // ──────────────────────────────────────────────────
    // لوحة الطالب: شراء جائزة
    // ──────────────────────────────────────────────────
    public function purchase(Request $request)
    {
        $user     = Auth::user();
        $userId   = $user->id;
        $centerId = $user->center_id;

        $request->validate([
            'reward_id' => 'required|integer',
        ]);

        $reward = CenterReward::where('center_id', $centerId)
            ->where('is_active', true)
            ->findOrFail($request->reward_id);

        $totalPoints = $this->calcTotalPoints($userId);

        if ($totalPoints < $reward->points_cost) {
            return response()->json([
                'success' => false,
                'message' => 'نقاطك غير كافية. تحتاج ' . $reward->points_cost . ' نقطة ولديك ' . $totalPoints,
            ], 422);
        }

        DB::transaction(function () use ($userId, $reward) {
            // خصم النقاط
            StudentAchievement::create([
                'user_id'       => $userId,
                'points'        => $reward->points_cost,
                'points_action' => 'deducted',
                'reason'        => 'شراء جائزة: ' . $reward->name,
            ]);

            // تسجيل عملية الشراء
            StudentRewardPurchase::create([
                'user_id'      => $userId,
                'reward_id'    => $reward->id,
                'points_spent' => $reward->points_cost,
            ]);
        });

        return response()->json([
            'success'      => true,
            'message'      => 'تم استبدال الجائزة بنجاح 🎁',
            'reward'       => $reward->name,
            'total_points' => $this->calcTotalPoints($userId),
        ]);
    }
}