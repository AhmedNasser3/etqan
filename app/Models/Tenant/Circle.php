<?php

namespace App\Models\Tenant;

use App\Models\Auth\Teacher;
use App\Models\Tenant\Center;
use App\Models\Tenant\Mosque;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Circle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'teacher_id',
        'center_id',
        'mosque_id'
    ];

    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function mosque()
    {
        return $this->belongsTo(Mosque::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    // ❌ امسح students() خالص - مفيش pivot table دلوقتي
    /*
    public function students()
    {
        return $this->belongsToMany(Student::class);
    }
    */

    public function scopeForCurrentUser($query)
    {
        return $query;
    }
}