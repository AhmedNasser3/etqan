<?php

namespace App\Models;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Admin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'center_id',
    ];

    protected $guarded = [];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function center(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Tenant\Center::class);
    }

    public function scopeActive($query)
    {
        return $query->with('user');
    }

    public static function isAdmin($userId): bool
    {
        return self::where('user_id', $userId)->exists();
    }

    public function scopeWithUserData($query)
    {
        return $query->with(['user' => function ($query) {
            $query->select('id', 'name', 'email', 'phone', 'avatar');
        }]);
    }

    public static function makeAdmin($userId, $centerId = null): self
    {
        return self::updateOrCreate(
            ['user_id' => $userId],
            ['user_id' => $userId, 'center_id' => $centerId]
        );
    }

    public static function removeAdmin($userId): bool
    {
        return self::where('user_id', $userId)->delete();
    }

    public static function getAdminsWithUsers()
    {
        return self::withUserData()->get();
    }
}
