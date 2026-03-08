<?php

namespace App\Http\Controllers\Centers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class PendingCentersController extends Controller
{
    /**
     * جلب المجامع اللي اليوزر بتاعها (role_id=1) معطل أو pending
     */
    public function index(Request $request)
    {
        try {
            $centers = DB::table('centers as c')
                ->leftJoin('users as u', function($join) {
                    $join->on('u.center_id', '=', 'c.id')
                         ->where('u.role_id', 1); //  صاحب المجمع role_id = 1
                })
                ->select(
                    'c.id',
                    'c.name',
                    'c.subdomain',
                    'c.email as center_email',
                    'c.phone',
                    'c.logo',
                    'c.is_active',
                    'c.address',
                    'c.created_at',
                    'u.id as user_id',
                    'u.name as user_name',
                    'u.email as user_email',
                    'u.status as user_status'
                )
                ->where(function($query) {
                    //  يوزر معطل/pending أو مافيش يوزر
                    $query->whereIn('u.status', ['inactive', 'pending'])
                          ->orWhereNull('u.id');
                })
                ->orderBy('c.created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $centers->map(function ($center) {
                    return [
                        'id' => (int)$center->id,
                        'name' => $center->name,
                        'subdomain' => $center->subdomain,
                        'domain' => $center->subdomain . '.localhost',
                        'center_url' => URL::to('/center-dashboard/' . $center->subdomain),
                        'email' => $center->center_email ?? 'غير محدد',
                        'phone' => $center->phone ?? 'غير محدد',
                        'logo' => $center->logo ? URL::to('storage/' . $center->logo) : null,
                        'is_active' => (bool)$center->is_active,
                        'address' => $center->address ?? 'غير محدد',
                        'created_at' => $center->created_at ? date('Y-m-d H:i', strtotime($center->created_at)) : null,
                        'user_name' => $center->user_name ?? 'غير محدد',
                        'user_email' => $center->user_email ?? 'غير محدد',
                        'user_status' => $center->user_status ?? 'pending',
                        'students_count' => 0,
                    ];
                }),
                'total' => $centers->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Fetch Pending Centers Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض تفاصيل مجمع واحد
     */
    public function show($id)
    {
        try {
            $center = DB::table('centers as c')
                ->leftJoin('users as u', function($join) {
                    $join->on('u.center_id', '=', 'c.id')
                         ->where('u.role_id', 1);
                })
                ->where('c.id', $id)
                ->select(
                    'c.id',
                    'c.name',
                    'c.subdomain',
                    'c.email as center_email',
                    'c.phone',
                    'c.logo',
                    'c.is_active',
                    'c.address',
                    'c.created_at',
                    'u.id as user_id',
                    'u.name as user_name',
                    'u.email as user_email',
                    'u.status as user_status'
                )
                ->first();

            if (!$center) {
                return response()->json(['success' => false, 'message' => 'المجمع غير موجود'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (int)$center->id,
                    'name' => $center->name,
                    'subdomain' => $center->subdomain,
                    'domain' => $center->subdomain . '.localhost',
                    'center_url' => URL::to('/center-dashboard/' . $center->subdomain),
                    'email' => $center->center_email ?? 'غير محدد',
                    'phone' => $center->phone ?? 'غير محدد',
                    'logo' => $center->logo ? URL::to('storage/' . $center->logo) : null,
                    'is_active' => (bool)$center->is_active,
                    'address' => $center->address ?? 'غير محدد',
                    'created_at' => $center->created_at ? date('Y-m-d H:i', strtotime($center->created_at)) : null,
                    'user_name' => $center->user_name ?? 'غير محدد',
                    'user_email' => $center->user_email ?? 'غير محدد',
                    'user_status' => $center->user_status ?? 'pending',
                    'students_count' => 0,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'المجمع غير موجود: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * تفعيل المجمع + اليوزر صاحب المجمع (role_id=1)
     */
    public function confirm($id)
    {
        DB::beginTransaction();
        try {
            // جلب اليوزر صاحب المجمع
            $owner = DB::table('users')
                ->where('center_id', $id)
                ->where('role_id', 1)
                ->select('id', 'name')
                ->first();

            $center = DB::table('centers')->where('id', $id)->first();

            if (!$center) {
                return response()->json(['success' => false, 'message' => 'المجمع غير موجود'], 404);
            }

            // تفعيل المجمع
            DB::table('centers')->where('id', $id)->update(['is_active' => true]);

            // تفعيل اليوزر صاحب المجمع
            if ($owner) {
                DB::table('users')->where('id', $owner->id)->update(['status' => 'active']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تفعيل المجمع والمستخدم بنجاح',
                'data' => [
                    'center_id' => $id,
                    'center_name' => $center->name,
                    'user_id' => $owner->id ?? null,
                    'status' => 'active'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Confirm Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التفعيل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * رفض المجمع + اليوزر صاحب المجمع
     */
    public function reject($id)
    {
        DB::beginTransaction();
        try {
            // جلب اليوزر صاحب المجمع
            $owner = DB::table('users')
                ->where('center_id', $id)
                ->where('role_id', 1)
                ->select('id', 'name')
                ->first();

            $center = DB::table('centers')->where('id', $id)->first();

            if (!$center) {
                return response()->json(['success' => false, 'message' => 'المجمع غير موجود'], 404);
            }

            // تعطيل المجمع
            DB::table('centers')->where('id', $id)->update(['is_active' => false]);

            // تعطيل اليوزر صاحب المجمع
            if ($owner) {
                DB::table('users')->where('id', $owner->id)->update(['status' => 'inactive']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تعطيل المجمع والمستخدم بنجاح',
                'data' => [
                    'center_id' => $id,
                    'center_name' => $center->name,
                    'user_id' => $owner->id ?? null,
                    'status' => 'inactive'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reject Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الرفض: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف المجمع نهائياً
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $center = DB::table('centers')->where('id', $id)->first();

            if (!$center) {
                return response()->json(['success' => false, 'message' => 'المجمع غير موجود'], 404);
            }

            $centerName = $center->name;

            // حذف اللوجو
            if ($center->logo) {
                $logoPath = str_replace('storage/', '', $center->logo);
                if (Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
            }

            // حذف اليوزر صاحب المجمع
            DB::table('users')->where('center_id', $id)->where('role_id', 1)->delete();

            DB::table('centers')->where('id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "تم حذف مجمع {$centerName} نهائياً"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Destroy Center Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحذف: ' . $e->getMessage()
            ], 500);
        }
    }
}