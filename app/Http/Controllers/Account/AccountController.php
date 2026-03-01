<?php

namespace App\Http\Controllers\Account;

use App\Models\Auth\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AccountController extends Controller
{
    /**
     * عرض بيانات الحساب للتعديل
     */
    public function edit(): JsonResponse
    {
        $user = Auth::user();

        Log::info('Edit Account - User Data:', $user->toArray());

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name ?? '',
                'email' => $user->email ?? '',
                'phone' => $user->phone ?? '',
                'birth_date' => $user->birth_date ? $user->birth_date->format('Y-m-d') : null,
                'gender' => $user->gender ?? null,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            ]
        ]);
    }

    /**
     * تحديث بيانات الحساب
     */
    public function update(Request $request): JsonResponse
    {
        Log::info('=== UPDATE ACCOUNT START ===');
        Log::info('Method: ' . $request->method());
        Log::info('Content-Type: ' . $request->header('Content-Type'));
        Log::info('All Request Data: ', $request->all());
        Log::info('Raw Files: ', $request->allFiles());

        $user = Auth::user();

        //  الحل الجذري: إصلاح FormData مع PUT + web middleware
        if (str_contains($request->header('Content-Type', ''), 'multipart/form-data')) {
            Log::info('🔧 Multipart FormData detected - fixing parsing...');

            // اجبار Laravel يقرأ FormData من PUT/PATCH
            $request->mergeIfMissing([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'birth_date' => $request->input('birth_date'),
                'gender' => $request->input('gender'),
                'current_password' => $request->input('current_password'),
                'password' => $request->input('password'),
                'password_confirmation' => $request->input('password_confirmation'),
            ]);

            Log::info(' After FormData Fix: ', $request->all());
        }

        //  Validation مباشر وشامل
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|min:2',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'current_password' => 'nullable|string|min:6',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'name.required' => 'اسم المستخدم مطلوب.',
            'name.min' => 'الاسم يجب أن يكون 2 أحرف على الأقل.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صحيح.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
        ]);

        if ($validator->fails()) {
            Log::error('❌ Validation Failed: ', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()->messages()
            ], 422);
        }

        $name = trim($request->input('name'));
        $email = trim($request->input('email'));
        $phone = $request->input('phone');
        $birth_date = $request->input('birth_date');
        $gender = $request->input('gender');
        $current_password = $request->input('current_password');
        $password = $request->input('password');

        Log::info(' Final Parsed Data:', [
            'name' => $name,
            'email' => $email,
            'phone' => $phone
        ]);

        //  التحقق من التكرار
        if (User::where('email', $email)->where('id', '!=', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'هذا البريد الإلكتروني مستخدم بالفعل.',
                'errors' => ['email' => ['هذا البريد الإلكتروني مستخدم بالفعل.']]
            ], 422);
        }

        if ($phone && User::where('phone', $phone)->where('id', '!=', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الرقم مستخدم بالفعل.',
                'errors' => ['phone' => ['هذا الرقم مستخدم بالفعل.']]
            ], 422);
        }

        //  تحديث كلمة المرور
        if (!empty($password)) {
            if (empty($current_password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'كلمة المرور الحالية مطلوبة.',
                    'errors' => ['current_password' => ['كلمة المرور الحالية مطلوبة.']]
                ], 422);
            }

            if (!Hash::check($current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'كلمة المرور الحالية غير صحيحة.',
                    'errors' => ['current_password' => ['كلمة المرور الحالية غير صحيحة.']]
                ], 422);
            }

            $user->password = Hash::make($password);
        }

        //  تحديث البيانات الأساسية
        $user->update([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'birth_date' => $birth_date,
            'gender' => $gender,
        ]);

        //  تحديث الصورة
        if ($request->hasFile('avatar')) {
            Log::info('🖼️ Processing new avatar...');

            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $avatarPath]);

            Log::info(' New avatar saved: ' . $avatarPath);
        }

        $user->fresh(); // Refresh model
        Log::info(' Account Updated Successfully:', $user->toArray());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الحساب بنجاح.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                ]
            ]
        ]);
    }

    /**
     * حذف الحساب نهائياً
     */
    public function destroy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
            'confirm_deletion' => 'accepted'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()->messages()
            ], 422);
        }

        $user = Auth::user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور غير صحيحة.',
                'errors' => ['password' => ['كلمة المرور غير صحيحة.']]
            ], 422);
        }

        // حذف الصورة
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // حذف الحساب
        $user->delete();
        Auth::logout();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الحساب نهائياً بنجاح.'
        ]);
    }
}
