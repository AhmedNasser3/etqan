<?php

namespace App\Models;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Admin extends Model
{
    use HasFactory;
    //  شيلنا SoftDeletes عشان الـ Migration مافيهاش deleted_at

    protected $fillable = [
        'user_id',
    ];

    protected $guarded = [];

    /**
     *  علاقة مع User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     *  Scope للأدمنز النشطين (بدون SoftDeletes)
     */
    public function scopeActive($query)
    {
        return $query->with('user');
    }

    /**
     *  فحص إذا كان يوزر معين أدمن (محسن بدون SoftDeletes)
     */
    public static function isAdmin($userId): bool
    {
        return self::where('user_id', $userId)->exists();
    }

    /**
     *  الحصول على بيانات الأدمن مع اليوزر
     */
    public function scopeWithUserData($query)
    {
        return $query->with(['user' => function ($query) {
            $query->select('id', 'name', 'email', 'phone', 'avatar');
        }]);
    }

    /**
     *  جعل يوزر أدمن
     */
    public static function makeAdmin($userId): self
    {
        return self::updateOrCreate(
            ['user_id' => $userId],
            ['user_id' => $userId]
        );
    }

    /**
     *  إزالة صلاحية الأدمن
     */
    public static function removeAdmin($userId): bool
    {
        return self::where('user_id', $userId)->delete();
    }

    /**
     *  جلب كل الأدمنز مع بياناتهم
     */
    public static function getAdminsWithUsers()
    {
        return self::withUserData()->get();
    }
}
