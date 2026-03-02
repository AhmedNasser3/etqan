<?php

namespace App\Http\Controllers\Permissions;

use App\Models\Auth\User;
use Illuminate\Http\Request;
use App\Models\Tenant\Center;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class UserPermissionsController extends Controller
{
    public function getPermissions(Request $request)
    {
        Log::info('🔍 Permissions API called', [
            'user_id' => Auth::id(),
            'request_user_id' => $request->user()?->id
        ]);

        $user = Auth::user() ?? $request->user();

        Log::info('🔍 User found', [
            'user_id' => $user?->id,
            'email' => $user?->email ?? 'no email'
        ]);

        // 1. تحقق صاحب المجمع (Center Owner) - الأولوية الأولى
        if ($user && $this->isCenterOwner($user)) {
            Log::info('👑 CENTER OWNER detected', ['user_id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'success' => true,
                'permissions' => $this->getFullAdminPermissions(),
                'role' => 'center_owner',
                'is_center_owner' => true,
                'message' => 'Center owner - full access granted'
            ]);
        }

        // 2. تحقق teacher role العادي
        if (!$user || !$user->teacher) {
            Log::warning('⚠️ No teacher role found', ['user_id' => $user?->id]);

            return response()->json([
                'success' => true,
                'permissions' => $this->getDefaultPermissions(),
                'role' => null,
                'is_center_owner' => false,
                'message' => 'No teacher role assigned - default permissions'
            ]);
        }

        // 3. Teacher permissions حسب الـ role
        $role = $user->teacher->role;
        $permissions = $this->getRolePermissions($role);

        Log::info(' Teacher permissions loaded', [
            'user_id' => $user->id,
            'role' => $role,
            'permissions_count' => count($permissions)
        ]);

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
            'role' => $role,
            'is_center_owner' => false,
            'teacher' => [
                'role' => $user->teacher->role,
                'session_time' => $user->teacher->session_time ?? null
            ]
        ]);
    }

    /**
     * تحقق إذا كان الـ user صاحب مجمع (email موجود في centers table)
     */
    private function isCenterOwner($user): bool
    {
        if (!$user || !$user->email) {
            return false;
        }

        $isOwner = Center::where('email', $user->email)->exists();

        Log::info('🔍 Center owner check', [
            'user_email' => $user->email,
            'is_owner' => $isOwner
        ]);

        return $isOwner;
    }

    /**
     * صلاحيات كاملة لصاحب المجمع (كل القوائم تظهر)
     */
    private function getFullAdminPermissions(): array
    {
        return [
            'dashboard' => true,
            'mosque' => true,
            'staff' => true,
            'financial' => true,
            'domain' => true,
            'education' => true,
            'attendance' => true,
            'reports' => true,
            'certificates' => true,
            'messages' => true
        ];
    }

    /**
     * Default permissions لما مفيش teacher role (Dashboard بس)
     */
    private function getDefaultPermissions(): array
    {
        return [
            'dashboard' => true,
            'mosque' => false,
            'staff' => false,
            'financial' => false,
            'domain' => false,
            'education' => false,
            'attendance' => false,
            'reports' => false,
            'certificates' => false,
            'messages' => false
        ];
    }

    /**
     * Role-based permissions مُحدثة ومُصححة لكل الـ roles حسب المتطلبات
     */
    private function getRolePermissions(string $role): array
    {
        $permissions = [
            'teacher' => [
                'dashboard' => true,
                'mosque' => false,
                'staff' => false,
                'financial' => false,
                'domain' => false,
                'education' => false,
                'attendance' => false,
                'reports' => false,
                'certificates' => false,
                'messages' => false
            ],

            'supervisor' => [
                'dashboard' => true,
                // mosque submenu
                'mosque' => [
                    'students/approval',
                    'booking-manegment'
                ],
                // staff
                'staff' => false,
                // financial
                'financial' => false,
                // domain
                'domain' => false,
                // education pages
                'education' => [
                    'education-supervisor',
                    'special-request-manegment',
                    'students/approval',
                    'plan-transfer-management'
                ],
                // attendance
                'attendance' => true,
                // reports - إدارة الطلاب
                'reports' => true,
                'certificates' => false,
                'messages' => false
            ],

            'motivator' => [
                'dashboard' => true,
                'mosque' => false,
                'staff' => false,
                'financial' => false,
                'domain' => false,
                'education' => false,
                // إدارة التحفيزات + إدارة الطلاب
                'attendance' => true,
                'reports' => true,
                'certificates' => false,
                'messages' => false
            ],

            'student_affairs' => [
                'dashboard' => true,
                // mosque submenu
                'mosque' => [
                    'students/approval',
                    'booking-manegment'
                ],
                'staff' => false,
                'financial' => false,
                'domain' => false,
                // education pages
                'education' => [
                    'students/approval',
                    'plan-transfer-management',
                    'special-request-manegment'
                ],
                // إدارة التحفيزات + إدارة الطلاب
                'attendance' => true,
                'reports' => true,
                'certificates' => false,
                'messages' => false
            ],

            'financial' => [
                'dashboard' => true,
                'mosque' => false,
                'staff' => false,
                // financial submenu only
                'financial' => [
                    'financial-dashboard',
                    'teaceher-salary-manegment',
                    'custom-salary-manegment'
                ],
                'domain' => false,
                'education' => false,
                'attendance' => false,
                'reports' => false,
                'certificates' => false,
                'messages' => false
            ]
        ];

        $result = $permissions[$role] ?? $this->getDefaultPermissions();

        Log::info('🔍 Role permissions assigned', [
            'role' => $role,
            'permissions_keys' => array_keys($result)
        ]);

        return $result;
    }
}