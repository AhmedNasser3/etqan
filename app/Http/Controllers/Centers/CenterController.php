<?php

namespace App\Http\Controllers\Centers;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Http\Request;
use App\Models\Tenant\Center;
use App\Services\AuditLogService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class CenterController extends Controller
{
    public function index()
    {
        return response()->json(Center::where('is_active', true)->get());
    }

    public function showRegister()
    {
        return response()->json(['message' => 'Center registration form']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'subdomain' => 'required|string|max:50|unique:centers|alpha_dash',
            'name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_name' => 'required|string|max:255',
            'avatar' => 'nullable',
            'phone' => 'nullable|string|max:20'
        ]);

        $center = Center::create([
            'name' => $request->name,
            'subdomain' => $request->subdomain,
            'email' => $request->admin_email,
            'avatar' => $request->avatar,
            'phone' => $request->phone
        ]);

        $centerOwnerRole = Role::firstOrCreate(
            ['name' => 'center_owner'],
            [
                'title_ar' => 'صاحب المجمع',
                'title_en' => 'Center Owner',
                'permissions' => ['*'],
                'is_system' => true
            ]
        );

        $admin = User::create([
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'password' => Hash::make('12345678'),
            'center_id' => $center->id,
            'role_id' => $centerOwnerRole->id,
            'status' => 'pending',
            'phone' => $request->phone
        ]);

        AuditLogService::logUserCreate(null, $admin->id, $admin->toArray());
        AuditLogService::log(null, 'create_center', 'App\\Models\\Tenant\\Center', $center->id, null, $center->toArray());

        return response()->json([
            'success' => true,
            'center' => $center,
            'admin' => $admin,
            'center_url' => $request->subdomain . '.127.0.0.1:8000',
            'login_url' => $request->subdomain . '.127.0.0.1:8000/login',
            'temp_password' => '12345678',
            'status' => 'pending_approval'
        ], 201);
    }

    public function show(string $id)
    {
        $center = Center::with(['users' => function($query) {
            $query->where('status', 'active');
        }])->findOrFail($id);

        return response()->json($center);
    }

    public function update(Request $request, string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:centers,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'is_active' => 'sometimes|boolean'
        ]);

        if ($request->hasFile('logo')) {
            $center->logo = $request->file('logo')->store('centers', 'public');
        }

        $center->update($request->only(['name', 'email', 'phone', 'address', 'is_active']));

        AuditLogService::log(
            auth()->user(),
            'update_center',
            'App\\Models\\Tenant\\Center',
            $center->id,
            $oldData,
            $center->fresh()->toArray()
        );

        return response()->json($center->fresh());
    }

    public function destroy(string $id)
    {
        $center = Center::findOrFail($id);
        $oldData = $center->toArray();

        $center->delete();

        AuditLogService::log(
            auth()->user(),
            'delete_center',
            'App\\Models\\Tenant\\Center',
            $id,
            $oldData,
            null
        );

        return response()->json();
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

        return response()->json(['message' => 'تم تفعيل المجمع']);
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

        return response()->json(['message' => 'تم إيقاف المجمع']);
    }
}
