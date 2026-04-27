<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Center;

class ImpersonateController extends Controller
{
    public function enter(string $centerId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $center = Center::findOrFail($centerId);

        // ✅ مش بنحتاج session - بنرجع البيانات والـ React تحفظها
        return response()->json([
            'success'     => true,
            'message'     => 'تم الدخول على مجمع ' . $center->name,
            'center_id'   => $center->id,
            'center_name' => $center->name,
        ]);
    }

    public function leave()
    {
        return response()->json([
            'success' => true,
            'message' => 'تم الخروج من المجمع',
        ]);
    }

    public function status()
    {
        // الـ status بييجي من الـ header اللي الـ React بتبعته
        $centerId   = request()->header('X-Center-Id');
        $centerName = null;

        if ($centerId) {
            $center     = Center::find($centerId);
            $centerName = $center?->name;
        }

        return response()->json([
            'success'       => true,
            'impersonating' => (bool) $centerId,
            'center_id'     => $centerId ? (int) $centerId : null,
            'center_name'   => $centerName,
        ]);
    }
}
