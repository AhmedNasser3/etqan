<?php
namespace App\Http\Controllers\Centers;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Http\Request;
use App\Models\Tenant\Mosque;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class MosqueController extends Controller
{
    public function index()
    {
        $mosques = Mosque::with(['center:name,id,subdomain', 'supervisorUser:id,name,email'])
            ->select([
                'id', 'name', 'center_id', 'supervisor_id',
                'logo', 'is_active', 'created_at'
            ])
            ->latest()
            ->get();

        $users = User::select('id', 'name', 'email')->get();
        $centers = Center::select('id', 'name', 'subdomain')->get();

        return response()->json([
            'success' => true,
            'data' => $mosques->map(function ($mosque) {
                return [
                    'id' => $mosque->id,
                    'name' => $mosque->name,
                    'circle' => $mosque->center ? $mosque->center->name : 'غير محدد',
                    'circleId' => $mosque->center_id,
                    'supervisor' => $mosque->supervisorUser ? $mosque->supervisorUser->name : 'غير محدد',
                    'supervisorId' => $mosque->supervisorUser ? $mosque->supervisorUser->id : null,
                    'logo' => $mosque->logo ? Storage::url($mosque->logo) : null,
                    'is_active' => $mosque->is_active,
                    'created_at' => $mosque->created_at?->format('Y-m-d'),
                ];
            }),
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ];
            }),
            'centers' => $centers->map(function ($center) {
                return [
                    'id' => $center->id,
                    'name' => $center->name,
                    'subdomain' => $center->subdomain
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'mosque_name' => 'required|string|max:255',
            'center_id' => 'required|exists:centers,id',
            'supervisor_id' => 'required|exists:users,id',
            'logo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('mosques', 'public');
            }

            $mosque = Mosque::create([
                'name' => $request->mosque_name,
                'center_id' => $request->center_id,
                'supervisor_id' => $request->supervisor_id,
                'logo' => $logoPath,
                'notes' => $request->notes,
                'is_active' => true
            ]);

            AuditLogService::log(
                null,
                'create_mosque',
                'App\\Models\\Tenant\\Mosque',
                $mosque->id,
                null,
                $mosque->toArray()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة المسجد بنجاح',
                'data' => $mosque
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'فشل في إضافة المسجد: ' . $e->getMessage()
            ], 422);
        }
    }

    public function show($id)
    {
        $mosque = Mosque::with(['center:name', 'supervisorUser:id,name,email'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $mosque->id,
                'name' => $mosque->name,
                'center' => $mosque->center ? $mosque->center->name : 'غير محدد',
                'centerId' => $mosque->center_id,
                'supervisor' => $mosque->supervisorUser ? $mosque->supervisorUser->name : 'غير محدد',
                'supervisorId' => $mosque->supervisorUser ? $mosque->supervisorUser->id : null,
                'logo' => $mosque->logo ? Storage::url($mosque->logo) : null,
                'notes' => $mosque->notes,
                'is_active' => $mosque->is_active,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $mosque = Mosque::findOrFail($id);
        $oldData = $mosque->toArray();

        $request->validate([
            'mosque_name' => 'sometimes|required|string|max:255',
            'center_id' => 'sometimes|required|exists:centers,id',
            'supervisor_id' => 'sometimes|required|exists:users,id',
            'logo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            if ($request->hasFile('logo')) {
                if ($mosque->logo && Storage::disk('public')->exists($mosque->logo)) {
                    Storage::disk('public')->delete($mosque->logo);
                }
                $logoPath = $request->file('logo')->store('mosques', 'public');
                $mosque->logo = $logoPath;
            }

            $updateData = [
                'name' => $request->mosque_name ?? $mosque->name,
                'center_id' => $request->center_id ?? $mosque->center_id,
                'supervisor_id' => $request->supervisor_id ?? $mosque->supervisor_id,
                'notes' => $request->notes ?? $mosque->notes,
            ];

            $mosque->update($updateData);

            AuditLogService::log(
                auth()->user(),
                'update_mosque',
                'App\\Models\\Tenant\\Mosque',
                $mosque->id,
                $oldData,
                $mosque->fresh()->toArray()
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم التحديث بنجاح',
                'data' => $mosque->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'فشل في التحديث: ' . $e->getMessage()
            ], 422);
        }
    }

    public function destroy($id)
    {
        $mosque = Mosque::findOrFail($id);
        $oldData = $mosque->toArray();

        if ($mosque->logo && Storage::disk('public')->exists($mosque->logo)) {
            Storage::disk('public')->delete($mosque->logo);
        }

        $mosque->delete();

        AuditLogService::log(
            auth()->user(),
            'delete_mosque',
            'App\\Models\\Tenant\\Mosque',
            $id,
            $oldData,
            null
        );

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المسجد بنجاح'
        ]);
    }
}