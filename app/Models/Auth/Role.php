<?php
namespace App\Models\Auth;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'roles';

    protected $fillable = ['name', 'title_ar', 'title_en', 'permissions', 'is_system'];
    protected $casts = ['permissions' => 'array', 'is_system' => 'boolean'];

    public function users() {
        return $this->hasMany(User::class);
    }
}
