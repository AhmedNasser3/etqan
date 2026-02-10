<?php

namespace App\Http\Controllers\Centers;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Models\Auth\Role;
use App\Models\Tenant\Center;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PendingCentersController extends Controller
{
    /**
     * ✅ جلب جميع المجمعات المعلقة (pending)
     */
    public function index(Request $request)
    {
        try {
            // ✅ جلب دور center_owner
            $centerOwnerRole = Role::where('name', 'center_owner')->first();

            if (!$centerOwnerRole) {
                return response()->json([
                    'success' => false,
                    'message' => 'دور صاحب المجمع غير موجود في النظام'
                ], 404);
            }

            // ✅ جلب المستخدمين اللي role_id = center_owner و status = pending
            $pendingCenters = User::where('role_id', $centerOwnerRole->id)
                ->where('status', 'pending')
                ->with(['center' => function($query) {
                    // ✅ بدون select محدد - جلب كل الحقول
                    $query->select('id', 'name', 'subdomain', 'email', 'phone', 'logo', 'is_active',  'created_at');
                }])
                ->select('id', 'name', 'email', 'phone', 'status', 'center_id', 'created_at', 'updated_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $pendingCenters->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone ?? 'غير محدد',
                        'status' => $user->status,
                        'created_at' => $user->created_at?->format('Y-m-d H:i'),
                        'center' => $user->center ? [
                            'id' => $user->center->id,
                            'name' => $user->center->name,
                            'subdomain' => $user->center->subdomain,
                            'email' => $user->center->email,
                            'phone' => $user->center->phone ?? 'غير محدد',
                            'logo' => $user->center->logo ? asset('storage/' . $user->center->logo) : null,
                            'is_active' => $user->center->is_active ?? false,
                            'center_url' => $user->center->subdomain . '.' . parse_url(config('app.url'), PHP_URL_HOST),
                        ] : null,
                    ];
                }),
                'total' => $pendingCenters->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Fetch Pending Centers Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب البيانات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ عرض تفاصيل مجمع معين
     */
    public function show($id)
    {
        try {
            $centerOwnerRole = Role::where('name', 'center_owner')->first();

            if (!$centerOwnerRole) {
                return response()->json([
                    'success' => false,
                    'message' => 'دور صاحب المجمع غير موجود'
                ], 404);
            }

            $user = User::where('id', $id)
                ->where('role_id', $centerOwnerRole->id)
                ->where('status', 'pending')
                ->with(['center' => function($query) {
                    $query->select('id', 'name', 'subdomain', 'email', 'phone', 'logo', 'is_active',  'created_at');
                }])
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجمع المطلوب غير موجود أو تم قبوله بالفعل'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'created_at' => $user->created_at?->format('Y-m-d H:i'),
                    'center' => $user->center ? [
                        'id' => $user->center->id,
                        'name' => $user->center->name,
                        'subdomain' => $user->center->subdomain,
                        'email' => $user->center->email,
                        'phone' => $user->center->phone,
                        'logo' => $user->center->logo ? asset('storage/' . $user->center->logo) : null,
                        'is_active' => $user->center->is_active ?? false,
                        'center_url' => $user->center->subdomain . '.' . parse_url(config('app.url'), PHP_URL_HOST),
                    ] : null,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Show Pending Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب البيانات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ قبول المجمع (تفعيل)
     */
    public function confirm($id)
    {
        DB::beginTransaction();
        try {
            $centerOwnerRole = Role::where('name', 'center_owner')->first();

            if (!$centerOwnerRole) {
                return response()->json([
                    'success' => false,
                    'message' => 'دور صاحب المجمع غير موجود'
                ], 404);
            }

            $user = User::where('id', $id)
                ->where('role_id', $centerOwnerRole->id)
                ->where('status', 'pending')
                ->with('center')
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجمع المطلوب غير موجود أو تم قبوله بالفعل'
                ], 404);
            }

            // ✅ تفعيل حساب المدير
            $user->update(['status' => 'active']);

            // ✅ تفعيل المجمع نفسه
            if ($user->center) {
                $user->center->update(['is_active' => true]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم قبول وتفعيل المجمع بنجاح',
                'data' => [
                    'user_id' => $user->id,
                    'status' => $user->status,
                    'center_name' => $user->center?->name,
                    'center_url' => $user->center ? $user->center->subdomain . '.' . parse_url(config('app.url'), PHP_URL_HOST) : null,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Confirm Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء قبول المجمع: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ رفض المجمع (تعطيل)
     */
    public function reject($id)
    {
        DB::beginTransaction();
        try {
            $centerOwnerRole = Role::where('name', 'center_owner')->first();

            if (!$centerOwnerRole) {
                return response()->json([
                    'success' => false,
                    'message' => 'دور صاحب المجمع غير موجود'
                ], 404);
            }

            $user = User::where('id', $id)
                ->where('role_id', $centerOwnerRole->id)
                ->where('status', 'pending')
                ->with('center')
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجمع المطلوب غير موجود'
                ], 404);
            }

            // ✅ تعطيل حساب المدير
            $user->update(['status' => 'inactive']);

            // ✅ تعطيل المجمع نفسه
            if ($user->center) {
                $user->center->update(['is_active' => false]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم رفض المجمع بنجاح'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reject Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء رفض المجمع: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ حذف المجمع نهائياً
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $centerOwnerRole = Role::where('name', 'center_owner')->first();

            if (!$centerOwnerRole) {
                return response()->json([
                    'success' => false,
                    'message' => 'دور صاحب المجمع غير موجود'
                ], 404);
            }

            $user = User::where('id', $id)
                ->where('role_id', $centerOwnerRole->id)
                ->with('center')
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجمع المطلوب غير موجود'
                ], 404);
            }

            $centerName = $user->center?->name ?? 'المجمع';

            if ($user->center) {
                if ($user->center->logo && Storage::disk('public')->exists($user->center->logo)) {
                    Storage::disk('public')->delete($user->center->logo);
                }
                $user->center->delete();
            }

            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "تم حذف {$centerName} نهائياً"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حذف المجمع: ' . $e->getMessage()
            ], 500);
        }
    }
}