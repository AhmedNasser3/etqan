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

class CenterController extends Controller
{
    public function index()
    {
        $centers = Center::select([
                'id', 'name', 'subdomain', 'email', 'phone', 'logo',
                'is_active', 'address', 'created_at'
            ])
            ->latest()->where('is_active', 1)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $centers->map(function ($center) {
                return [
                    'id' => $center->id,
                    'circleName' => $center->name,
                    'managerName' => $center->email,
                    'managerEmail' => $center->email,
                    'managerPhone' => $center->phone ?? '',
                    'circleLink' => config('app.url') . '/' . $center->subdomain,
                    'domain' => $center->subdomain,
                    'logo' => $center->logo ? Storage::url($center->logo) : 'https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=C',
                    'countryCode' => '966+',
                    'hosting_provider' => $center->hosting_provider ?? '',
                    'is_active' => $center->is_active,
                    'students_count' => 0,
                    'address' => $center->address,
                    'created_at' => $center->created_at?->format('Y-m-d'),
                ];
            })
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'circle_name' => 'required|string|max:255',
            'manager_name' => 'required|string|max:255',
            'manager_email' => 'required|email|unique:users,email',
            'manager_phone' => 'required|string|max:20',
            'hosting_provider' => 'string|max:255',
            'country_code' => 'required|string|max:5',
            'domain' => 'nullable|string|max:255|alpha_dash|unique:centers,subdomain',
            'circle_link' => 'nullable|url',
            'logo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $subdomain = $request->domain ?: Str::slug($request->circle_name);

            // ✅ حفظ الصورة مع اسم فريد
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('centers', 'public');
            }

            // ✅ ✅ تغيير هنا - مجمعات السوبر أدمن = is_active = true
            $center = Center::create([
                'name' => $request->circle_name,
                'subdomain' => $subdomain,
                'email' => $request->manager_email,
                'phone' => $request->manager_phone,
                'logo' => $logoPath,
                'hosting_provider' => $request->hosting_provider,
                'notes' => $request->notes,
                'country_code' => $request->country_code, // ✅ أضف country_code
                'is_active' => true  // ← التعديل الوحيد المطلوب
            ]);

            $centerOwnerRole = Role::firstOrCreate(
                ['name' => 'center_owner'],
                [
                    'title_ar' => 'صاحب المجمع',
                    'title_en' => 'Center Owner',
                    'permissions' => json_encode(['*']),
                    'is_system' => true
                ]
            );

            $admin = User::create([
                'name' => $request->manager_name,
                'email' => $request->manager_email,
                'password' => Hash::make('12345678'),
                'center_id' => $center->id,
                'role_id' => $centerOwnerRole->id,
                'status' => 'pending',
                'phone' => $request->manager_phone
            ]);

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
            return response()->json([
                'success' => false,
                'message' => 'فشل في إنشاء المجمع: ' . $e->getMessage()
            ], 422);
        }
    }

    public function show(string $id)
    {
        $center = Center::select('id', 'name', 'subdomain', 'email', 'phone', 'logo', 'hosting_provider', 'notes', 'is_active', 'address')
                       ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $center->id,
                'circleName' => $center->name,
                'managerName' => $center->email,
                'managerEmail' => $center->email,
                'managerPhone' => $center->phone ?? '',
                'circleLink' => config('app.url') . '/' . $center->subdomain,
                'domain' => $center->subdomain,
                'logo' => $center->logo ? Storage::url($center->logo) : null,
                'countryCode' => '966+',
                'hosting_provider' => $center->hosting_provider ?? '',
                'notes' => $center->notes ?? '',
                'is_active' => $center->is_active,
                'students_count' => 0,
                'address' => $center->address,
            ]
        ]);
    }

    public function update(Request $request, string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $request->validate([
            'circle_name' => 'sometimes|required|string|max:255',
            'manager_name' => 'sometimes|required|string|max:255',
            'manager_email' => 'sometimes|required|email',
            'manager_phone' => 'sometimes|required|string|max:20',
            'hosting_provider' => 'sometimes|required|string|max:255',
            'country_code' => 'sometimes|required|string|max:5',
            'domain' => 'sometimes|string|max:255|alpha_dash|unique:centers,subdomain,' . $id,
            'circle_link' => 'sometimes|url',
            'logo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // ✅ تحديث الصورة بشكل صحيح
            if ($request->hasFile('logo')) {
                // حذف الصورة القديمة إذا كانت موجودة
                if ($center->logo && Storage::disk('public')->exists($center->logo)) {
                    Storage::disk('public')->delete($center->logo);
                }

                // حفظ الصورة الجديدة باسم فريد
                $logoPath = $request->file('logo')->store('centers', 'public');
                $center->logo = $logoPath;
            }

            // ✅ تحديث جميع الحقول المطلوبة
            $updateData = [
                'name' => $request->circle_name ?? $center->name,
                'email' => $request->manager_email ?? $center->email,
                'phone' => $request->manager_phone ?? $center->phone,
                'hosting_provider' => $request->hosting_provider ?? $center->hosting_provider,
                'notes' => $request->notes ?? $center->notes,
                'subdomain' => $request->domain ?? $center->subdomain,
            ];

            $center->update($updateData);

            AuditLogService::log(
                auth()->user(),
                'update_center',
                'App\\Models\\Tenant\\Center',
                $center->id,
                $oldData,
                $center->fresh()->toArray()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم التحديث بنجاح',
                'data' => $center->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Center update failed: ' . $e->getMessage(), [
                'center_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'فشل في التحديث: ' . $e->getMessage()
            ], 422);
        }
    }

    public function destroy(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        // ✅ حذف الصورة قبل حذف المجمع
        if ($center->logo && Storage::disk('public')->exists($center->logo)) {
            Storage::disk('public')->delete($center->logo);
        }

        DB::transaction(function () use ($center) {
            $center->delete();
        });

        AuditLogService::log(
            auth()->user(),
            'delete_center',
            'App\\Models\\Tenant\\Center',
            $id,
            $oldData,
            null
        );

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المجمع بنجاح'
        ]);
    }

    public function activate(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $center->update(['is_active' => true]);

        AuditLogService::log(
            auth()->user(),
            'activate_center',
            'App\\Models\\Tenant\\Center',
            $center->id,
            $oldData,
            $center->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل المجمع بنجاح'
        ]);
    }

    public function deactivate(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $center->update(['is_active' => false]);

        AuditLogService::log(
            auth()->user(),
            'deactivate_center',
            'App\\Models\\Tenant\\Center',
            $center->id,
            $oldData,
            $center->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'تم إيقاف المجمع بنجاح'
        ]);
    }
}