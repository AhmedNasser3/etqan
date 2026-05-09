<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminRegisterController extends Controller
{
    /**
     * تسجيل إداري جديد
     */
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255|min:3',
            'email' => 'required|email:rfc,dns|max:255|unique:users,email',
            'phone' => 'nullable|string|min:10|max:15',
            'notes' => 'nullable|string|max:1000',
            'gender' => 'nullable|in:male,female',
            'center_slug' => 'nullable|string|exists:centers,subdomain',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
        ], [
            'full_name.required' => 'الاسم الكامل مطلوب',
            'full_name.min' => 'الاسم يجب أن يكون 3 أحرف على الأقل',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد الإلكتروني مسجل مسبقاً',
            'center_slug.exists' => 'المجمع غير موجود',
        ]);

        try {
            DB::beginTransaction();

            $center = $request->filled('center_slug')
                ? Center::where('subdomain', $request->center_slug)->first()
                : null;

            $randomPassword = Str::random(16);

            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($randomPassword),
                'status' => 'pending',
                'gender' => $request->gender,
                'phone' => $request->phone,
                'center_id' => $center?->id,
            ]);

            $adminInfo = [];
            if ($center) {
                $adminInfo[] = "المجمع: {$center->name}";
            }
            if ($request->filled('department')) {
                $adminInfo[] = "القسم: {$request->department}";
            }
            if ($request->filled('position')) {
                $adminInfo[] = "المنصب: {$request->position}";
            }

            $combinedInfo = implode(' | ', $adminInfo);
            $finalNotes = $request->filled('notes')
                ? "{$request->notes} | {$combinedInfo}"
                : ($combinedInfo ?: null);

            Admin::create([
                'user_id' => $user->id,
                'position' => $request->position,
                'department' => $request->department,
                'notes' => $finalNotes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلب تسجيل الإداري بنجاح! سيتم مراجعته من الإدارة العليا',
                'data' => [
                    'user_id' => $user->id,
                    'email' => $request->email,
                    'center_name' => $center?->name ?? 'النظام العام',
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin Registration Error: ' . $e->getMessage(), [
                'email' => $request->email,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء معالجة طلب التسجيل. يرجى المحاولة مرة أخرى.'
            ], 500);
        }
    }

    /**
     * جلب قائمة المجامع مع اسم المدير (center_owner)
     */
   /**
 * جلب قائمة المجامع مع اسم المدير (center_owner) - بدون تكرار
 *//**
 * جلب قائمة المجامع مع اسم المدير الصحيح (role_id = 1)
 */
public function getCenters()
{
    try {
        \Log::info('getCenters called');

        $centers = Center::select([
            'centers.id',
            'centers.name',
            'centers.subdomain',
            'centers.email',
            'centers.phone',
            'centers.address'
        ])
        ->leftJoin('users', function($join) {
            $join->on('users.center_id', '=', 'centers.id')
                 ->where('users.role_id', '=', 1); // center_owner
        })
        ->selectRaw('
            centers.id,
            centers.name,
            centers.subdomain,
            centers.email,
            centers.phone,
            centers.address,
            GROUP_CONCAT(DISTINCT users.name) as manager_name
        ')
        ->groupBy(
            'centers.id',
            'centers.name',
            'centers.subdomain',
            'centers.email',
            'centers.phone',
            'centers.address'
        )
        ->orderBy('centers.name', 'asc')
        ->get();

        return response()->json([
            'success' => true,
            'centers' => $centers->toArray(),
            'total' => $centers->count()
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'debug_error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * جلب تفاصيل مجمع معين مع اسم المدير
     */
    public function getCenterDetails($centerSlug)
    {
        try {
            $center = Center::select([
                'centers.id',
                'centers.name',
                'centers.subdomain',
                'centers.email',
                'centers.phone',
                'centers.address'
            ])
            ->leftJoin('users', function($join) {
                $join->on('users.center_id', '=', 'centers.id')
                     ->where('users.role_id', '=', 2); //  center_owner role_id = 2
            })
            ->addSelect('users.name as manager_name')
            ->where('centers.subdomain', $centerSlug)
            ->firstOrFail();

            return response()->json([
                'success' => true,
                'center' => $center
            ]);
        } catch (\Exception $e) {
            Log::error('Get Center Details Error: ' . $e->getMessage(), ['slug' => $centerSlug]);
            return response()->json([
                'success' => false,
                'message' => 'المجمع غير موجود'
            ], 404);
        }
    }
}
