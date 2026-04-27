<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\MosquePortalInvite;
use App\Models\Tenant\Mosque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MosquePortalController extends Controller
{
    /**
     * GET /api/v1/admin/mosque-portals/mosques
     * جلب المساجد المتاحة عشان المستخدم يختار منها
     */
    public function getMosques()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $mosques = Mosque::where('center_id', $user->center_id)
            ->select('id', 'name', 'center_id')
            ->get()
            ->map(fn($m) => [
                'id'        => $m->id,
                'name'      => $m->name,
                'center_id' => $m->center_id,
            ]);

        return response()->json(['success' => true, 'data' => $mosques]);
    }

    /**
     * POST /api/v1/admin/mosque-portals
     * إنشاء رابط portal لمسجد موجود
     */
    public function create(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $request->validate([
            'mosque_id' => 'required|exists:mosques,id',
        ]);

        // تأكد إن المسجد تابع لنفس الـ center
        $mosque = Mosque::where('id', $request->mosque_id)
            ->where('center_id', $user->center_id)
            ->first();

        if (!$mosque) {
            return response()->json([
                'success' => false,
                'message' => 'المسجد غير موجود أو لا ينتمي لمركزك',
            ], 403);
        }

        // إنشاء token
        $token = Str::uuid()->toString();

        $invite = MosquePortalInvite::create([
            'token'      => $token,
            'mosque_id'  => $mosque->id,
            'center_id'  => $mosque->center_id,
            'created_by' => $user->id,
            'expires_at' => now()->addDays(30),
        ]);

        $portalUrl = config('app.url') . '/portal/' . $token;

        Log::info('✅ Mosque portal created', [
            'mosque_id' => $mosque->id,
            'token'     => $token,
            'by'        => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء رابط البوابة بنجاح',
            'data'    => [
                'invite_id'   => $invite->id,
                'mosque_id'   => $mosque->id,
                'mosque_name' => $mosque->name,
                'center_id'   => $mosque->center_id,
                'portal_url'  => $portalUrl,
                'token'       => $token,
                'expires_at'  => now()->addDays(30)->format('Y-m-d'),
            ],
        ], 201);
    }

    /**
     * GET /api/v1/admin/mosque-portals
     * جلب كل الروابط المنشأة
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $portals = MosquePortalInvite::with(['mosque', 'center'])
            ->where('center_id', $user->center_id)
            ->latest()
            ->get()
            ->map(fn($invite) => [
                'id'          => $invite->id,
                'mosque_id'   => $invite->mosque_id,
                'mosque_name' => $invite->mosque?->name ?? '-',
                'center_id'   => $invite->center_id,
                'portal_url'  => config('app.url') . '/portal/' . $invite->token,
                'token'       => $invite->token,
                'expires_at'  => $invite->expires_at?->format('Y-m-d'),
                'used_at'     => $invite->used_at?->format('Y-m-d H:i'),
                'is_used'     => !is_null($invite->used_at),
                'is_expired'  => $invite->expires_at < now(),
                'created_at'  => $invite->created_at?->format('Y-m-d'),
            ]);

        return response()->json(['success' => true, 'data' => $portals]);
    }

    /**
     * GET /api/v1/portal/validate/{token}
     * التحقق من الـ token وإرجاع بيانات المسجد
     * لا يحتاج authentication
     */
public function validateToken(string $token)
{
    $invite = MosquePortalInvite::where('token', $token)
        ->with(['mosque', 'center'])
        ->first();

    if (!$invite) {
        return response()->json(['success' => false, 'message' => 'الرابط غير صحيح'], 404);
    }

    if ($invite->expires_at < now()) {
        return response()->json(['success' => false, 'message' => 'انتهت صلاحية الرابط'], 410);
    }

    if (is_null($invite->used_at)) {
        $invite->update(['used_at' => now()]);
    }

    return response()->json([
        'success' => true,
        'data'    => [
            'mosque_id'   => $invite->mosque_id,
            'mosque_name' => $invite->mosque?->name,
            'center_id'   => $invite->center_id,
            'center_name' => $invite->center?->name,
        ],
    ]);
}

    /**
     * DELETE /api/v1/admin/mosque-portals/{id}
     */
    public function destroy(int $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $invite = MosquePortalInvite::where('id', $id)
            ->where('center_id', $user->center_id)
            ->firstOrFail();

        $invite->delete();

        return response()->json(['success' => true, 'message' => 'تم الحذف بنجاح']);
    }
}