<?php

namespace App\Http\Controllers\Centers;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use Illuminate\Http\Request;
use App\Models\Tenant\Mosque;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class MosqueController extends Controller
{
    // ── helper: يجيب center_id من auth أو من الـ portal header ──────────────
    public function resolveCenterId(Request $request): ?int
    {
        if (Auth::check() && Auth::user()->center_id) {
            return (int) Auth::user()->center_id;
        }

        $id = $request->header('X-Center-Id') ?? $request->query('center_id');
        return ($id && is_numeric($id)) ? (int) $id : null;
    }

    public function index()
    {
        $request  = request();
        $centerId = $this->resolveCenterId($request);

        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $mosques = Mosque::with(['center:name,id,subdomain', 'supervisorUser:id,name,email'])
            ->where('center_id', $centerId)
            ->select(['id', 'name', 'center_id', 'supervisor_id', 'logo', 'is_active', 'created_at'])
            ->latest()
            ->get();

        $users = User::select('id', 'name', 'email')
            ->where('center_id', $centerId)
            ->get();

        $centers = Center::where('id', $centerId)
            ->select('id', 'name', 'subdomain')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $mosques->map(fn($mosque) => [
                'id'           => $mosque->id,
                'name'         => $mosque->name,
                'circle'       => $mosque->center?->name ?? 'غير محدد',
                'circleId'     => $mosque->center_id,
                'supervisor'   => $mosque->supervisorUser?->name ?? 'غير محدد',
                'supervisorId' => $mosque->supervisorUser?->id,
                'logo'         => $mosque->logo ? Storage::url($mosque->logo) : null,
                'is_active'    => $mosque->is_active,
                'created_at'   => $mosque->created_at?->format('Y-m-d'),
            ]),
            'users'   => $users->map(fn($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]),
            'centers' => $centers->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'subdomain' => $c->subdomain]),
        ]);
    }

    public function store(Request $request)
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $request->validate([
            'mosque_name'   => 'required|string|max:255',
            'center_id'     => 'required|exists:centers,id',
            'supervisor_id' => 'required|exists:users,id',
            'logo'          => 'nullable|image|max:2048',
            'notes'         => 'nullable|string',
        ]);

        if ($request->center_id != $centerId) {
            return response()->json(['success' => false, 'message' => 'غير مسموح'], 403);
        }

        $supervisor = User::where('id', $request->supervisor_id)
            ->where('center_id', $centerId)
            ->first();
        if (!$supervisor) {
            return response()->json(['success' => false, 'message' => 'المشرف لا ينتمي لمركزك'], 422);
        }

        DB::beginTransaction();
        try {
            $logoPath = $request->hasFile('logo')
                ? $request->file('logo')->store('mosques', 'public')
                : null;

            $mosque = Mosque::create([
                'name'          => $request->mosque_name,
                'center_id'     => $centerId,
                'supervisor_id' => $request->supervisor_id,
                'logo'          => $logoPath,
                'notes'         => $request->notes,
                'is_active'     => true,
            ]);

            AuditLogService::log(Auth::user(), 'create_mosque', Mosque::class, $mosque->id, null, $mosque->toArray());
            DB::commit();

            return response()->json(['success' => true, 'message' => 'تم إضافة المسجد بنجاح', 'data' => $mosque], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'فشل: ' . $e->getMessage()], 422);
        }
    }

    public function show($id)
    {
        $centerId = $this->resolveCenterId(request());
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $mosque = Mosque::with(['center:name,id', 'supervisorUser:id,name,email'])
            ->where('id', $id)
            ->where('center_id', $centerId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => [
                'id'           => $mosque->id,
                'name'         => $mosque->name,
                'center'       => $mosque->center?->name ?? 'غير محدد',
                'centerId'     => $mosque->center_id,
                'supervisor'   => $mosque->supervisorUser?->name ?? 'غير محدد',
                'supervisorId' => $mosque->supervisorUser?->id,
                'logo'         => $mosque->logo ? Storage::url($mosque->logo) : null,
                'notes'        => $mosque->notes,
                'is_active'    => $mosque->is_active,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $mosque  = Mosque::where('id', $id)->where('center_id', $centerId)->firstOrFail();
        $oldData = $mosque->toArray();

        $request->validate([
            'mosque_name'   => 'sometimes|required|string|max:255',
            'center_id'     => 'sometimes|required|exists:centers,id',
            'supervisor_id' => 'sometimes|required|exists:users,id',
            'logo'          => 'nullable|image|max:2048',
            'notes'         => 'nullable|string',
        ]);

        if ($request->filled('center_id') && $request->center_id != $centerId) {
            return response()->json(['success' => false, 'message' => 'غير مسموح بتغيير المركز'], 403);
        }

        if ($request->filled('supervisor_id')) {
            $supervisor = User::where('id', $request->supervisor_id)
                ->where('center_id', $centerId)
                ->first();
            if (!$supervisor) {
                return response()->json(['success' => false, 'message' => 'المشرف لا ينتمي لمركزك'], 422);
            }
        }

        DB::beginTransaction();
        try {
            if ($request->hasFile('logo')) {
                if ($mosque->logo && Storage::disk('public')->exists($mosque->logo)) {
                    Storage::disk('public')->delete($mosque->logo);
                }
                $mosque->logo = $request->file('logo')->store('mosques', 'public');
            }

            $mosque->update([
                'name'          => $request->mosque_name  ?? $mosque->name,
                'center_id'     => $centerId,
                'supervisor_id' => $request->supervisor_id ?? $mosque->supervisor_id,
                'notes'         => $request->notes         ?? $mosque->notes,
            ]);

            AuditLogService::log(Auth::user(), 'update_mosque', Mosque::class, $mosque->id, $oldData, $mosque->fresh()->toArray());
            DB::commit();

            return response()->json(['success' => true, 'message' => 'تم التحديث بنجاح', 'data' => $mosque->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'فشل: ' . $e->getMessage()], 422);
        }
    }

    public function destroy($id)
    {
        $centerId = $this->resolveCenterId(request());
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $mosque  = Mosque::where('id', $id)->where('center_id', $centerId)->firstOrFail();
        $oldData = $mosque->toArray();

        if ($mosque->logo && Storage::disk('public')->exists($mosque->logo)) {
            Storage::disk('public')->delete($mosque->logo);
        }

        $mosque->delete();
        AuditLogService::log(Auth::user(), 'delete_mosque', Mosque::class, $id, $oldData, null);

        return response()->json(['success' => true, 'message' => 'تم حذف المسجد بنجاح']);
    }

    public function importRow(Request $request)
    {
        $centerId = $this->resolveCenterId($request);
        if (!$centerId) {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 401);
        }

        $center = Center::find($centerId);
        if (!$center) {
            return response()->json(['success' => false, 'message' => 'المركز غير موجود'], 422);
        }

        $supervisorName = trim($request->input('supervisor_name', ''));
        $supervisor = $supervisorName
            ? User::where('name', 'like', "%{$supervisorName}%")
                  ->where('center_id', $centerId)
                  ->first()
            : null;

        $errors = [];
        if (empty(trim($request->input('mosque_name', '')))) $errors[] = 'اسم المسجد مطلوب';
        if (!$supervisor) $errors[] = "لم يُعثر على المشرف: {$supervisorName}";
        if (!empty($errors)) {
            return response()->json(['success' => false, 'message' => implode(' | ', $errors)], 422);
        }

        DB::beginTransaction();
        try {
            $mosque = Mosque::create([
                'name'          => trim($request->input('mosque_name')),
                'center_id'     => $centerId,
                'supervisor_id' => $supervisor->id,
                'notes'         => trim($request->input('notes', '')),
                'is_active'     => $request->input('is_active', '1') === '1',
            ]);

            AuditLogService::log(Auth::user(), 'import_mosque', Mosque::class, $mosque->id, null, $mosque->toArray());
            DB::commit();

            return response()->json(['success' => true, 'message' => 'تم إضافة المسجد', 'data' => $mosque], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'خطأ: ' . $e->getMessage()], 422);
        }
    }
}