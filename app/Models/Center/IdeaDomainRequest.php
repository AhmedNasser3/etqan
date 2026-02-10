<?php

namespace App\Models\Center;

use App\Models\Tenant\Center;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class IdeaDomainRequest extends Model
{
    use HasFactory;

    protected $table = 'idea_domain_requests';

    protected $fillable = [
        'center_id',
        'hosting_name',
        'requested_domain',
        'dns1',
        'dns2',
        'notes',  // ✅ أضف notes
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }
}