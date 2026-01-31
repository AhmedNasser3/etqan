<?php

namespace App\Models\Routes;

use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteCustomization extends Model
{
    protected $fillable = [
        'center_id',
        'teacher_register_path',
        'student_register_path',
        'center_register_path',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    // Helper methods للـ Frontend
    public static function getPathsForCenter($centerIdOrSlug): ?array
    {
        $custom = self::whereHas('center', function($q) use($centerIdOrSlug) {
            $q->where('id', $centerIdOrSlug)
              ->orWhere('subdomain', $centerIdOrSlug);
        })
        ->with('center:id,name,subdomain')
        ->first();

        if (!$custom) {
            return [
                'teacher_register_path' => 'teacher-register',
                'student_register_path' => 'student-register',
                'center_register_path' => 'center-register'
            ];
        }

        return [
            'teacher_register_path' => $custom->teacher_register_path,
            'student_register_path' => $custom->student_register_path,
            'center_register_path' => $custom->center_register_path,
            'center' => $custom->center,
            'is_active' => $custom->is_active
        ];
    }
}