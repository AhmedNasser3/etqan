<?php

namespace App\Models\Certificate;

use App\Models\Auth\User;
use App\Models\Tenant\Center;
use App\Models\Tenant\Student;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'center_id',
        'user_id',
        'certificate_image'
    ];

    protected $casts = [
        'center_id' => 'integer',
    ];

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function student(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Student::class, 'user_id', 'user_id');
    }
}
