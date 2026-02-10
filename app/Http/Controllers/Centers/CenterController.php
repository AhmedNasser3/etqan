<?php

namespace App\Http\Controllers\Centers;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Http\Request;
use App\Models\Tenant\Center;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CenterController extends Controller
{
    /**
     * ✅ جلب جميع المجمعات النشطة
     */
    public function index()
    {
        $centers = Center::select([
                'id', 'name', 'subdomain', 'email', 'phone', 'logo',
                'is_active', 'created_at'
            ])
            ->where('is_active', 1)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $centers->map(function ($center) {
                return [
                    'id' => $center->id,
                    'circleName' => $center->name,
                    'managerEmail' => $center->email,
                    'managerPhone' => $center->phone ?? '',
                    'circleLink' => config('app.url') . '/' . $center->subdomain,
                    'domain' => $center->subdomain,
                    'logo' => $center->logo ? Storage::url($center->logo) : 'https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=C',
                    'countryCode' => '+966',
                    'is_active' => $center->is_active,
                    'created_at' => $center->created_at?->format('Y-m-d'),
                ];
            })
        ]);
    }

    /**
     * ✅ تسجيل مجمع جديد
     */
    public function register(Request $request)
    {
        $request->validate([
            'circle_name' => 'required|string|max:255',
            'manager_name' => 'required|string|max:255',
            'manager_email' => 'required|email|unique:users,email',
            'manager_phone' => 'required|string|max:20',
            'domain' => 'nullable|string|max:255|alpha_dash|unique:centers,subdomain',
            'logo' => 'nullable|image|max:2048',
        ], [
            'circle_name.required' => 'اسم المجمع مطلوب',
            'manager_name.required' => 'اسم المدير مطلوب',
            'manager_email.required' => 'البريد الإلكتروني مطلوب',
            'manager_email.email' => 'البريد الإلكتروني غير صالح',
            'manager_email.unique' => 'البريد الإلكتروني مسجل مسبقاً',
            'manager_phone.required' => 'رقم الجوال مطلوب',
            'domain.unique' => 'هذا النطاق مستخدم بالفعل',
            'logo.image' => 'الملف يجب أن يكون صورة',
            'logo.max' => 'حجم الصورة يجب ألا يتجاوز 2MB',
        ]);

        DB::beginTransaction();
        try {
            // ✅ إنشاء subdomain
            $subdomain = $request->domain ?: Str::slug($request->circle_name);

            // ✅ حفظ الصورة
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('centers', 'public');
            }

            // ✅ إنشاء المجمع
            $center = Center::create([
                'name' => $request->circle_name,
                'subdomain' => $subdomain,
                'email' => $request->manager_email,
                'phone' => $request->manager_phone,
                'logo' => $logoPath,
                'is_active' => true
            ]);

            // ✅ إنشاء أو جلب دور center_owner
            $centerOwnerRole = Role::firstOrCreate(
                ['name' => 'center_owner'],
                [
                    'title_ar' => 'صاحب المجمع',
                    'title_en' => 'Center Owner',
                    'permissions' => json_encode(['*']),
                    'is_system' => true
                ]
            );

            // ✅ إنشاء حساب المدير
            $admin = User::create([
                'name' => $request->manager_name,
                'email' => $request->manager_email,
                'password' => Hash::make('12345678'),
                'center_id' => $center->id,
                'role_id' => $centerOwnerRole->id,
                'status' => 'pending',
                'phone' => $request->manager_phone
            ]);

            // ✅ تسجيل في Audit Log
            AuditLogService::logUserCreate(null, $admin->id, $admin->toArray());
            AuditLogService::log(null, 'create_center', 'App\\Models\\Tenant\\Center', $center->id, null, $center->toArray());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المجمع بنجاح',
                'center' => $center,
                'center_url' => $subdomain . '.' . parse_url(config('app.url'), PHP_URL_HOST),
                'login_url' => $subdomain . '.' . parse_url(config('app.url'), PHP_URL_HOST) . '/login',
                'temp_password' => '12345678'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Center Registration Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في إنشاء المجمع: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * ✅ عرض تفاصيل مجمع
     */
    public function show(string $id)
    {
        $center = Center::select([
                'id', 'name', 'subdomain', 'email', 'phone', 'logo',
                'is_active', 'created_at'
            ])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $center->id,
                'circleName' => $center->name,
                'managerEmail' => $center->email,
                'managerPhone' => $center->phone ?? '',
                'circleLink' => config('app.url') . '/' . $center->subdomain,
                'domain' => $center->subdomain,
                'logo' => $center->logo ? Storage::url($center->logo) : null,
                'countryCode' => '+966',
                'is_active' => $center->is_active,
                'created_at' => $center->created_at?->format('Y-m-d H:i'),
            ]
        ]);
    }

    /**
     * ✅ تحديث بيانات مجمع
     */
    public function update(Request $request, string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $request->validate([
            'circle_name' => 'sometimes|required|string|max:255',
            'manager_email' => 'sometimes|required|email',
            'manager_phone' => 'sometimes|required|string|max:20',
            'domain' => 'sometimes|string|max:255|alpha_dash|unique:centers,subdomain,' . $id,
            'logo' => 'nullable|image|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // ✅ تحديث الصورة
            if ($request->hasFile('logo')) {
                if ($center->logo && Storage::disk('public')->exists($center->logo)) {
                    Storage::disk('public')->delete($center->logo);
                }
                $logoPath = $request->file('logo')->store('centers', 'public');
                $center->logo = $logoPath;
            }

            // ✅ تحديث البيانات
            $updateData = [];

            if ($request->has('circle_name')) {
                $updateData['name'] = $request->circle_name;
            }
            if ($request->has('manager_email')) {
                $updateData['email'] = $request->manager_email;
            }
            if ($request->has('manager_phone')) {
                $updateData['phone'] = $request->manager_phone;
            }
            if ($request->has('domain')) {
                $updateData['subdomain'] = $request->domain;
            }

            if (!empty($updateData)) {
                $center->update($updateData);
            }

            // ✅ Audit Log
            if (function_exists('auth') && auth()->check()) {
                AuditLogService::log(
                    auth()->user(),
                    'update_center',
                    'App\\Models\\Tenant\\Center',
                    $center->id,
                    $oldData,
                    $center->fresh()->toArray()
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم التحديث بنجاح',
                'data' => $center->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Center update failed: ' . $e->getMessage(), [
                'center_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'فشل في التحديث: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * ✅ حذف مجمع
     */
    public function destroy(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        DB::beginTransaction();
        try {
            if ($center->logo && Storage::disk('public')->exists($center->logo)) {
                Storage::disk('public')->delete($center->logo);
            }

            $center->delete();

            if (function_exists('auth') && auth()->check()) {
                AuditLogService::log(
                    auth()->user(),
                    'delete_center',
                    'App\\Models\\Tenant\\Center',
                    $id,
                    $oldData,
                    null
                );
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المجمع بنجاح'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Center deletion failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'فشل في حذف المجمع: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ تفعيل مجمع
     */
    public function activate(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $center->update(['is_active' => true]);

        if (function_exists('auth') && auth()->check()) {
            AuditLogService::log(
                auth()->user(),
                'activate_center',
                'App\\Models\\Tenant\\Center',
                $center->id,
                $oldData,
                $center->fresh()->toArray()
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل المجمع بنجاح'
        ]);
    }

    /**
     * ✅ إيقاف مجمع
     */
    public function deactivate(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $center->update(['is_active' => false]);

        if (function_exists('auth') && auth()->check()) {
            AuditLogService::log(
                auth()->user(),
                'deactivate_center',
                'App\\Models\\Tenant\\Center',
                $center->id,
                $oldData,
                $center->fresh()->toArray()
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إيقاف المجمع بنجاح'
        ]);
    }
}
