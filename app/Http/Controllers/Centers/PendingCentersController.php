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
     *  جلب كل المجامع من centers table (الأعمدة الحقيقية)
     */
    public function index(Request $request)
    {
        try {
            $centers = DB::table('centers')
                ->select(
                    'id',
                    'name',
                    'subdomain',
                    'email',
                    'phone',
                    'logo',
                    'is_active',
                    'address',
                    'created_at'
                )
                ->orderBy('created_at', 'desc')
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
                        'email' => $center->email ?? 'غير محدد',
                        'phone' => $center->phone ?? 'غير محدد',
                        'logo' => $center->logo ? URL::to('storage/' . $center->logo) : null,
                        'is_active' => (bool)$center->is_active,
                        'address' => $center->address ?? 'غير محدد',
                        'created_at' => $center->created_at ? date('Y-m-d H:i', strtotime($center->created_at)) : null,
                        'students_count' => 0, //  مؤقت - هتحسبه بعدين
                    ];
                }),
                'total' => $centers->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Fetch Centers Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المجامع: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     *  عرض تفاصيل مجمع واحد
     */
    public function show($id)
    {
        try {
            $center = DB::table('centers')
                ->where('id', $id)
                ->select('id', 'name', 'subdomain', 'email', 'phone', 'logo', 'is_active', 'address', 'created_at')
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
                    'email' => $center->email ?? 'غير محدد',
                    'phone' => $center->phone ?? 'غير محدد',
                    'logo' => $center->logo ? URL::to('storage/' . $center->logo) : null,
                    'is_active' => (bool)$center->is_active,
                    'address' => $center->address ?? 'غير محدد',
                    'created_at' => $center->created_at ? date('Y-m-d H:i', strtotime($center->created_at)) : null,
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
     *  تفعيل المجمع
     */
    public function confirm($id)
    {
        DB::beginTransaction();
        try {
            $center = DB::table('centers')->where('id', $id)->first();

            if (!$center) {
                return response()->json(['success' => false, 'message' => 'المجمع غير موجود'], 404);
            }

            DB::table('centers')->where('id', $id)->update(['is_active' => true]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تفعيل المجمع بنجاح',
                'data' => [
                    'id' => $id,
                    'name' => $center->name,
                    'status' => 'active'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التفعيل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     *  تعطيل المجمع
     */
    public function reject($id)
    {
        DB::beginTransaction();
        try {
            $center = DB::table('centers')->where('id', $id)->first();

            if (!$center) {
                return response()->json(['success' => false, 'message' => 'المجمع غير موجود'], 404);
            }

            DB::table('centers')->where('id', $id)->update(['is_active' => false]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تعطيل المجمع بنجاح',
                'data' => [
                    'id' => $id,
                    'name' => $center->name,
                    'status' => 'inactive'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التعطيل: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     *  حذف المجمع نهائياً
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

            //  حذف اللوجو
            if ($center->logo) {
                $logoPath = str_replace('storage/', '', $center->logo);
                if (Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
            }

            DB::table('centers')->where('id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "تم حذف مجمع {$centerName} نهائياً"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحذف: ' . $e->getMessage()
            ], 500);
        }
    }
}